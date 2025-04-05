import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, FrontMatterCache, MetadataCache, Vault, MarkdownFileInfo } from 'obsidian';
import { SubtopicTrackerView, SUBTOPIC_TRACKER_VIEW_TYPE } from './views/SubtopicTrackerView';
import { KnowledgeMapView, KNOWLEDGE_MAP_VIEW_TYPE } from './views/KnowledgeMapView';
import { ProgressRenderer } from './rendering/ProgressRenderer';
import { ProgressTracker } from './tracking/ProgressTracker';
import { LearningProgressSettingTab } from './settings/SettingsTab';

interface LearningProgressSettings {
	defaultTopicTemplate: string;
	defaultSubtopicTemplate: string;
	showProgressBar: boolean;
	showKnowledgeMap: boolean;
}

const DEFAULT_SETTINGS: LearningProgressSettings = {
	defaultTopicTemplate: "---\ntype: topic\nprogress: 0\nsubtopics: []\ntotal_subtopics: 0\ncompleted_subtopics: 0\n---\n\n# {{title}}\n\n## Progress\n\n0% complete\n\n## Subtopics\n\n",
	defaultSubtopicTemplate: "---\ntype: subtopic\nparent: \"[[{{parent}}]]\"\ncompleted: false\n---\n\n# {{title}}\n\nStatus: ❌ Not completed\n\n## Notes\n\n",
	showProgressBar: true,
	showKnowledgeMap: true
}

export default class LearningProgressPlugin extends Plugin {
	settings: LearningProgressSettings;
	progressRenderer: ProgressRenderer;
	progressTracker: ProgressTracker;
	
	// Add flags to prevent infinite loops
	private isUpdating: boolean = false;
	private updateQueue: Set<string> = new Set();
	private debounceTimeout: NodeJS.Timeout | null = null;

	async onload() {
		await this.loadSettings();

		// Initialize components
		this.progressRenderer = new ProgressRenderer(this);
		this.progressTracker = new ProgressTracker(this);

		// Register views
		this.registerView(
			SUBTOPIC_TRACKER_VIEW_TYPE,
			(leaf) => new SubtopicTrackerView(leaf, this)
		);

		this.registerView(
			KNOWLEDGE_MAP_VIEW_TYPE,
			(leaf) => new KnowledgeMapView(leaf, this)
		);

		// Register commands
		this.addCommand({
			id: 'create-topic-note',
			name: 'Create Topic Note',
			callback: () => {
				new TopicCreationModal(this.app, this).open();
			}
		});

		this.addCommand({
			id: 'create-subtopic-note',
			name: 'Create Subtopic Note',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const file = view.file;
				if (file) {
					const metadata = this.app.metadataCache.getFileCache(file);
					if (metadata?.frontmatter?.type === 'topic') {
						new SubtopicCreationModal(this.app, this, file.basename).open();
					} else {
						new Notice('Current note is not a topic note. Please open a topic note first.');
					}
				}
			}
		});

		this.addCommand({
			id: 'toggle-subtopic-completion',
			name: 'Toggle Subtopic Completion',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const file = view.file;
				if (file) {
					const metadata = this.app.metadataCache.getFileCache(file);
					if (metadata?.frontmatter?.type === 'subtopic') {
						this.toggleSubtopicCompletion(file);
					} else {
						new Notice('Current note is not a subtopic note. Please open a subtopic note first.');
					}
				}
			}
		});

		this.addCommand({
			id: 'show-subtopic-tracker',
			name: 'Show Subtopic Tracker',
			callback: async () => {
				this.activateView(SUBTOPIC_TRACKER_VIEW_TYPE);
			}
		});

		this.addCommand({
			id: 'show-knowledge-map',
			name: 'Show Knowledge Map',
			callback: async () => {
				this.activateView(KNOWLEDGE_MAP_VIEW_TYPE);
			}
		});

		// Register event listeners
		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				if (leaf && leaf.view instanceof MarkdownView) {
					const file = leaf.view.file;
					if (file) {
						// Don't trigger updates when just viewing a file
						this.progressRenderer.renderProgressInNote(file);
						this.progressRenderer.renderCompletionStatus(file);
					}
				}
			})
		);

		this.registerEvent(
			this.app.metadataCache.on('changed', (file) => {
				// Use debounced update to prevent infinite loops
				this.debouncedUpdateProgress(file);
			})
		);

		// Add settings tab
		this.addSettingTab(new LearningProgressSettingTab(this.app, this));

		// Add ribbon icon
		this.addRibbonIcon('graduation-cap', 'Learning Progress', () => {
			this.activateView(SUBTOPIC_TRACKER_VIEW_TYPE);
		});
	}

	onunload() {
		console.log('Learning Progress Plugin unloaded');
		// Clear any pending timeouts
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView(viewType: string) {
		const { workspace } = this.app;
		
		// Check if view is already open
		let leaf = workspace.getLeavesOfType(viewType)[0];
		
		if (!leaf) {
			// Create new leaf in the right sidebar
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({ type: viewType });
			}
		}
		
		// Reveal the leaf
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async createTopicNote(title: string) {
		const content = this.settings.defaultTopicTemplate.replace('{{title}}', title);
		const fileName = `${title}.md`;
		
		try {
			const existingFile = this.app.vault.getAbstractFileByPath(fileName);
			if (existingFile) {
				new Notice(`Note "${fileName}" already exists`);
				return;
			}
			
			const file = await this.app.vault.create(fileName, content);
			new Notice(`Topic note "${title}" created`);
			
			// Open the newly created file
			this.app.workspace.getLeaf().openFile(file);
		} catch (error) {
			console.error('Error creating topic note:', error);
			new Notice('Error creating topic note');
		}
	}

	async createSubtopicNote(title: string, parentTopic: string) {
		const content = this.settings.defaultSubtopicTemplate
			.replace('{{title}}', title)
			.replace('{{parent}}', parentTopic);
		const fileName = `${title}.md`;
		
		try {
			const existingFile = this.app.vault.getAbstractFileByPath(fileName);
			if (existingFile) {
				new Notice(`Note "${fileName}" already exists`);
				return;
			}
			
			const file = await this.app.vault.create(fileName, content);
			new Notice(`Subtopic note "${title}" created`);
			
			// Update parent topic's subtopics list
			await this.addSubtopicToParent(parentTopic, title);
			
			// Open the newly created file
			this.app.workspace.getLeaf().openFile(file);
		} catch (error) {
			console.error('Error creating subtopic note:', error);
			new Notice('Error creating subtopic note');
		}
	}

	async addSubtopicToParent(parentTopic: string, subtopicTitle: string) {
		const parentFile = this.app.vault.getAbstractFileByPath(`${parentTopic}.md`);
		if (!parentFile || !(parentFile instanceof TFile)) {
			new Notice(`Parent topic "${parentTopic}" not found`);
			return;
		}
		
		try {
			// Set updating flag to prevent infinite loops
			this.isUpdating = true;
			
			// Read the parent file content
			const content = await this.app.vault.read(parentFile);
			
			// Parse frontmatter
			const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
			const match = content.match(frontmatterRegex);
			
			if (match) {
				let frontmatter = match[1];
				const subtopicLink = `[[${subtopicTitle}]]`;
				
				// Update subtopics array in frontmatter
				if (frontmatter.includes('subtopics:')) {
					// Check if it's an array format
					if (frontmatter.includes('subtopics: [')) {
						// Array format
						const arrayRegex = /subtopics: \[([\s\S]*?)\]/;
						const arrayMatch = frontmatter.match(arrayRegex);
						
						if (arrayMatch) {
							let subtopicsArray = arrayMatch[1].split(',').map(s => s.trim());
							if (!subtopicsArray.includes(`"${subtopicLink}"`)) {
								subtopicsArray.push(`"${subtopicLink}"`);
							}
							frontmatter = frontmatter.replace(arrayRegex, `subtopics: [${subtopicsArray.join(', ')}]`);
						}
					} else {
						// List format
						const listRegex = /subtopics:[\s\S]*?(?=\n\w|$)/;
						const listMatch = frontmatter.match(listRegex);
						
						if (listMatch) {
							let subtopicsList = listMatch[0];
							if (!subtopicsList.includes(subtopicLink)) {
								subtopicsList += `\n  - "${subtopicLink}"`;
							}
							frontmatter = frontmatter.replace(listRegex, subtopicsList);
						}
					}
				} else {
					// Add subtopics field if it doesn't exist
					frontmatter += `\nsubtopics:\n  - "${subtopicLink}"`;
				}
				
				// Update total_subtopics count
				const totalSubtopicsRegex = /total_subtopics: (\d+)/;
				const totalMatch = frontmatter.match(totalSubtopicsRegex);
				
				if (totalMatch) {
					const currentTotal = parseInt(totalMatch[1]);
					frontmatter = frontmatter.replace(totalSubtopicsRegex, `total_subtopics: ${currentTotal + 1}`);
				} else {
					frontmatter += `\ntotal_subtopics: 1`;
				}
				
				// Replace frontmatter in content
				const updatedContent = content.replace(frontmatterRegex, `---\n${frontmatter}\n---`);
				
				// Update the file
				await this.app.vault.modify(parentFile, updatedContent);
				
				// Also add to the subtopics list in the content if it exists
				await this.addSubtopicToContentList(parentFile);
				
				// Force update the topic progress
				await this.forceUpdateTopicProgress(parentFile);
			}
			
			// Reset updating flag
			this.isUpdating = false;
		} catch (error) {
			// Reset updating flag even if there's an error
			this.isUpdating = false;
			console.error('Error updating parent topic:', error);
			new Notice('Error updating parent topic');
		}
	}

	async addSubtopicToContentList(parentFile: TFile) {
		// Skip if already updating to prevent infinite loops
		if (this.isUpdating) return;
		
		try {
			// Set updating flag
			this.isUpdating = true;
			
			const content = await this.app.vault.read(parentFile);
			
			// Force refresh metadata cache to get the latest data
			// Use the correct method signature
			this.app.metadataCache.trigger('changed');
			
			// Wait a moment for the cache to update
			await new Promise(resolve => setTimeout(resolve, 100));
			
			const metadata = this.app.metadataCache.getFileCache(parentFile);
			
			if (metadata?.frontmatter?.subtopics) {
				const subtopics = metadata.frontmatter.subtopics;
				
				// Find the subtopics section in the content
				const subtopicsSectionRegex = /## Subtopics\s*\n([\s\S]*?)(?=\n##|$)/;
				const match = content.match(subtopicsSectionRegex);
				
				if (match) {
					let subtopicsSection = match[0];
					let subtopicsList = '';
					
					// Create a list of subtopics with completion status
					if (Array.isArray(subtopics)) {
						for (const subtopic of subtopics) {
							const subtopicName = this.extractLinkText(subtopic);
							const subtopicFile = this.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
							
							if (subtopicFile && subtopicFile instanceof TFile) {
								// Force refresh metadata cache for this subtopic
								this.app.metadataCache.trigger('changed');
								
								// Wait a moment for the cache to update
								await new Promise(resolve => setTimeout(resolve, 100));
								
								const subtopicMetadata = this.app.metadataCache.getFileCache(subtopicFile);
								const isCompleted = subtopicMetadata?.frontmatter?.completed === true;
								
								subtopicsList += `- ${subtopic} ${isCompleted ? '✅' : '❌'}\n`;
							} else {
								subtopicsList += `- ${subtopic} ❌\n`;
							}
						}
					}
					
					// Replace the subtopics section content
					const updatedSubtopicsSection = `## Subtopics\n\n${subtopicsList}`;
					const updatedContent = content.replace(subtopicsSectionRegex, updatedSubtopicsSection);
					
					await this.app.vault.modify(parentFile, updatedContent);
				}
			}
			
			// Reset updating flag
			this.isUpdating = false;
		} catch (error) {
			// Reset updating flag even if there's an error
			this.isUpdating = false;
			console.error('Error updating subtopics list in content:', error);
		}
	}

	async toggleSubtopicCompletion(file: TFile) {
		try {
			// Set updating flag
			this.isUpdating = true;
			
			// Force refresh metadata cache to get the latest data
			this.app.metadataCache.trigger('changed');
			
			// Wait a moment for the cache to update
			await new Promise(resolve => setTimeout(resolve, 100));
			
			const metadata = this.app.metadataCache.getFileCache(file);
			if (!metadata?.frontmatter) {
				this.isUpdating = false;
				return;
			}
			
			const isCompleted = metadata.frontmatter.completed === true;
			const newStatus = !isCompleted;
			
			// Read the file content
			const content = await this.app.vault.read(file);
			
			// Update frontmatter
			const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
			const match = content.match(frontmatterRegex);
			
			if (match) {
				let frontmatter = match[1];
				
				// Update completed status
				if (frontmatter.includes('completed:')) {
					frontmatter = frontmatter.replace(/completed: (true|false)/, `completed: ${newStatus}`);
				} else {
					frontmatter += `\ncompleted: ${newStatus}`;
				}
				
				// Add completion date if being marked as completed
				if (newStatus) {
					const today = new Date().toISOString().split('T')[0];
					if (frontmatter.includes('completion_date:')) {
						frontmatter = frontmatter.replace(/completion_date: .*/, `completion_date: ${today}`);
					} else {
						frontmatter += `\ncompletion_date: ${today}`;
					}
				}
				
				// Replace frontmatter in content
				let updatedContent = content.replace(frontmatterRegex, `---\n${frontmatter}\n---`);
				
				// Update status in content
				const statusRegex = /Status: (❌ Not completed|✅ Completed)/;
				const statusMatch = updatedContent.match(statusRegex);
				
				if (statusMatch) {
					const newStatusText = newStatus ? '✅ Completed' : '❌ Not completed';
					updatedContent = updatedContent.replace(statusRegex, `Status: ${newStatusText}`);
				}
				
				// Update the file
				await this.app.vault.modify(file, updatedContent);
				
				// Force refresh metadata cache
				this.app.metadataCache.trigger('changed');
				
				// Wait a moment for the cache to update
				await new Promise(resolve => setTimeout(resolve, 100));
				
				// Update parent topic progress
				if (metadata.frontmatter.parent) {
					const parentName = this.extractLinkText(metadata.frontmatter.parent);
					const parentFile = this.app.vault.getAbstractFileByPath(`${parentName}.md`);
					
					if (parentFile && parentFile instanceof TFile) {
						await this.forceUpdateTopicProgress(parentFile);
					}
				}
				
				new Notice(`Subtopic marked as ${newStatus ? 'completed' : 'not completed'}`);
			}
			
			// Reset updating flag
			this.isUpdating = false;
		} catch (error) {
			// Reset updating flag even if there's an error
			this.isUpdating = false;
			console.error('Error toggling subtopic completion:', error);
			new Notice('Error updating subtopic status');
		}
	}

	// Helper method to extract text from [[link]] format
	extractLinkText(link: string): string {
		const match = link.match(/\[\[(.*?)\]\]/);
		return match ? match[1] : link;
	}

	// Force update topic progress with direct file reading instead of relying on metadata cache
	async forceUpdateTopicProgress(file: TFile) {
		// Skip if already updating to prevent infinite loops
		if (this.isUpdating) return;
		
		try {
			// Set updating flag
			this.isUpdating = true;
			
			// Read the file content directly
			const content = await this.app.vault.read(file);
			
			// Parse frontmatter manually
			const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
			const match = content.match(frontmatterRegex);
			
			if (!match) {
				this.isUpdating = false;
				return;
			}
			
			const frontmatter = match[1];
			
			// Check if this is a topic note
			if (!frontmatter.includes('type: topic')) {
				this.isUpdating = false;
				return;
			}
			
			// Extract subtopics from frontmatter
			let subtopics: string[] = [];
			
			// Check if it's an array format
			const arrayRegex = /subtopics: \[([\s\S]*?)\]/;
			const arrayMatch = frontmatter.match(arrayRegex);
			
			if (arrayMatch) {
				// Array format
				subtopics = arrayMatch[1].split(',')
					.map(s => s.trim())
					.filter(s => s.length > 0)
					.map(s => s.replace(/"/g, ''));
			} else {
				// List format
				const listRegex = /subtopics:[\s\S]*?(?=\n\w|$)/;
				const listMatch = frontmatter.match(listRegex);
				
				if (listMatch) {
					const listContent = listMatch[0];
					const lines = listContent.split('\n');
					
					for (let i = 1; i < lines.length; i++) {
						const line = lines[i].trim();
						if (line.startsWith('-')) {
							const item = line.substring(1).trim().replace(/"/g, '');
							if (item) subtopics.push(item);
						}
					}
				}
			}
			
			if (subtopics.length === 0) {
				this.isUpdating = false;
				return;
			}
			
			// Count completed subtopics by directly reading each subtopic file
			let completedCount = 0;
			const totalCount = subtopics.length;
			
			for (const subtopic of subtopics) {
				const subtopicName = this.extractLinkText(subtopic);
				const subtopicFile = this.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
				
				if (subtopicFile && subtopicFile instanceof TFile) {
					// Read the subtopic file directly
					const subtopicContent = await this.app.vault.read(subtopicFile);
					const subtopicFrontmatterMatch = subtopicContent.match(frontmatterRegex);
					
					if (subtopicFrontmatterMatch) {
						const subtopicFrontmatter = subtopicFrontmatterMatch[1];
						if (subtopicFrontmatter.includes('completed: true')) {
							completedCount++;
						}
					}
				}
			}
			
			// Calculate progress
			const progress = totalCount > 0 ? completedCount / totalCount : 0;
			const progressPercent = Math.round(progress * 100);
			
			// Update frontmatter
			let updatedFrontmatter = frontmatter;
			
			// Update progress
			if (updatedFrontmatter.includes('progress:')) {
				updatedFrontmatter = updatedFrontmatter.replace(/progress: [\d\.]+/, `progress: ${progress.toFixed(2)}`);
			} else {
				updatedFrontmatter += `\nprogress: ${progress.toFixed(2)}`;
			}
			
			// Update completed_subtopics
			if (updatedFrontmatter.includes('completed_subtopics:')) {
				updatedFrontmatter = updatedFrontmatter.replace(/completed_subtopics: \d+/, `completed_subtopics: ${completedCount}`);
			} else {
				updatedFrontmatter += `\ncompleted_subtopics: ${completedCount}`;
			}
			
			// Update total_subtopics
			if (updatedFrontmatter.includes('total_subtopics:')) {
				updatedFrontmatter = updatedFrontmatter.replace(/total_subtopics: \d+/, `total_subtopics: ${totalCount}`);
			} else {
				updatedFrontmatter += `\ntotal_subtopics: ${totalCount}`;
			}
			
			// Replace frontmatter in content
			let updatedContent = content.replace(frontmatterRegex, `---\n${updatedFrontmatter}\n---`);
			
			// Update progress in content
			const progressRegex = /## Progress\s*\n\s*\d+% complete/;
			const progressMatch = updatedContent.match(progressRegex);
			
			if (progressMatch) {
				updatedContent = updatedContent.replace(progressRegex, `## Progress\n\n${progressPercent}% complete`);
			}
			
			// Update the file
			await this.app.vault.modify(file, updatedContent);
			
			// Update subtopics list with completion status
			const subtopicsSectionRegex = /## Subtopics\s*\n([\s\S]*?)(?=\n##|$)/;
			const subtopicsMatch = updatedContent.match(subtopicsSectionRegex);
			
			if (subtopicsMatch) {
				let subtopicsList = '';
				
				// Create a list of subtopics with completion status
				for (const subtopic of subtopics) {
					const subtopicName = this.extractLinkText(subtopic);
					const subtopicFile = this.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
					
					if (subtopicFile && subtopicFile instanceof TFile) {
						// Read the subtopic file directly
						const subtopicContent = await this.app.vault.read(subtopicFile);
						const subtopicFrontmatterMatch = subtopicContent.match(frontmatterRegex);
						
						let isCompleted = false;
						if (subtopicFrontmatterMatch) {
							const subtopicFrontmatter = subtopicFrontmatterMatch[1];
							isCompleted = subtopicFrontmatter.includes('completed: true');
						}
						
						subtopicsList += `- ${subtopic} ${isCompleted ? '✅' : '❌'}\n`;
					} else {
						subtopicsList += `- ${subtopic} ❌\n`;
					}
				}
				
				// Replace the subtopics section content
				const updatedSubtopicsSection = `## Subtopics\n\n${subtopicsList}`;
				updatedContent = updatedContent.replace(subtopicsSectionRegex, updatedSubtopicsSection);
				
				await this.app.vault.modify(file, updatedContent);
			}
			
			// Reset updating flag
			this.isUpdating = false;
		} catch (error) {
			// Reset updating flag even if there's an error
			this.isUpdating = false;
			console.error('Error updating topic progress:', error);
		}
	}

	async updateTopicProgress(file: TFile) {
		// Use the force update method instead
		await this.forceUpdateTopicProgress(file);
	}

	// Debounced update to prevent rapid successive updates
	debouncedUpdateProgress(file: TFile) {
		// Skip if already updating to prevent infinite loops
		if (this.isUpdating) return;
		
		// Add file path to update queue
		this.updateQueue.add(file.path);
		
		// Clear existing timeout
		if (this.debounceTimeout) {
			clearTimeout(this.debounceTimeout);
		}
		
		// Set new timeout
		this.debounceTimeout = setTimeout(() => {
			this.processUpdateQueue();
		}, 500); // 500ms debounce time
	}

	// Process all files in the update queue
	async processUpdateQueue() {
		// Skip if already updating
		if (this.isUpdating) return;
		
		// Set updating flag
		this.isUpdating = true;
		
		try {
			// Process each file in the queue
			for (const filePath of this.updateQueue) {
				const file = this.app.vault.getAbstractFileByPath(filePath);
				if (file && file instanceof TFile) {
					// Force refresh metadata cache
					this.app.metadataCache.trigger('changed');
					
					// Wait a moment for the cache to update
					await new Promise(resolve => setTimeout(resolve, 100));
					
					const metadata = this.app.metadataCache.getFileCache(file);
					
					if (metadata?.frontmatter?.type === 'subtopic') {
						// If a subtopic was modified, update its parent
						if (metadata.frontmatter.parent) {
							const parentName = this.extractLinkText(metadata.frontmatter.parent);
							const parentFile = this.app.vault.getAbstractFileByPath(`${parentName}.md`);
							
							if (parentFile && parentFile instanceof TFile) {
								await this.forceUpdateTopicProgress(parentFile);
							}
						}
					} else if (metadata?.frontmatter?.type === 'topic') {
						// If a topic was modified, update its progress
						await this.forceUpdateTopicProgress(file);
					}
				}
			}
			
			// Clear the queue
			this.updateQueue.clear();
		} catch (error) {
			console.error('Error processing update queue:', error);
		} finally {
			// Reset updating flag
			this.isUpdating = false;
		}
	}
}

class TopicCreationModal extends Modal {
	plugin: LearningProgressPlugin;
	topicName: string = '';

	constructor(app: App, plugin: LearningProgressPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.createEl('h2', { text: 'Create New Learning Topic' });
		
		new Setting(contentEl)
			.setName('Topic Name')
			.setDesc('Enter the name of your learning topic')
			.addText(text => text
				.setPlaceholder('e.g., AWS S3')
				.setValue(this.topicName)
				.onChange(value => {
					this.topicName = value;
				}));
		
		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Create')
				.setCta()
				.onClick(() => {
					if (this.topicName) {
						this.plugin.createTopicNote(this.topicName);
						this.close();
					} else {
						new Notice('Please enter a topic name');
					}
				}))
			.addButton(btn => btn
				.setButtonText('Cancel')
				.onClick(() => {
					this.close();
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class SubtopicCreationModal extends Modal {
	plugin: LearningProgressPlugin;
	parentTopic: string;
	subtopicName: string = '';

	constructor(app: App, plugin: LearningProgressPlugin, parentTopic: string) {
		super(app);
		this.plugin = plugin;
		this.parentTopic = parentTopic;
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.createEl('h2', { text: 'Create New Subtopic' });
		contentEl.createEl('p', { text: `Parent Topic: ${this.parentTopic}` });
		
		new Setting(contentEl)
			.setName('Subtopic Name')
			.setDesc('Enter the name of your subtopic')
			.addText(text => text
				.setPlaceholder('e.g., S3 Buckets')
				.setValue(this.subtopicName)
				.onChange(value => {
					this.subtopicName = value;
				}));
		
		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Create')
				.setCta()
				.onClick(() => {
					if (this.subtopicName) {
						this.plugin.createSubtopicNote(this.subtopicName, this.parentTopic);
						this.close();
					} else {
						new Notice('Please enter a subtopic name');
					}
				}))
			.addButton(btn => btn
				.setButtonText('Cancel')
				.onClick(() => {
					this.close();
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
