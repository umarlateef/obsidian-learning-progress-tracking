import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import LearningProgressPlugin from '../main';

export const SUBTOPIC_TRACKER_VIEW_TYPE = 'subtopic-tracker-view';

export class SubtopicTrackerView extends ItemView {
    plugin: LearningProgressPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: LearningProgressPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return SUBTOPIC_TRACKER_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'Subtopic Tracker';
    }

    async onOpen(): Promise<void> {
        this.renderView();
    }

    async renderView(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        
        container.createEl('h2', { text: 'Learning Progress Tracker' });
        
        // Create tabs for different views
        const tabsContainer = container.createEl('div', { cls: 'nav-buttons-container' });
        const allTopicsTab = tabsContainer.createEl('button', { 
            text: 'All Topics',
            cls: 'nav-button nav-button-active'
        });
        const inProgressTab = tabsContainer.createEl('button', { 
            text: 'In Progress',
            cls: 'nav-button'
        });
        const completedTab = tabsContainer.createEl('button', { 
            text: 'Completed',
            cls: 'nav-button'
        });
        
        // Content container
        const contentContainer = container.createEl('div', { cls: 'tracker-content' });
        
        // Initial render of all topics
        await this.renderAllTopics(contentContainer);
        
        // Tab click handlers
        allTopicsTab.addEventListener('click', async () => {
            this.setActiveTab(tabsContainer, allTopicsTab);
            await this.renderAllTopics(contentContainer);
        });
        
        inProgressTab.addEventListener('click', async () => {
            this.setActiveTab(tabsContainer, inProgressTab);
            await this.renderInProgressTopics(contentContainer);
        });
        
        completedTab.addEventListener('click', async () => {
            this.setActiveTab(tabsContainer, completedTab);
            await this.renderCompletedTopics(contentContainer);
        });
    }
    
    setActiveTab(tabsContainer: HTMLElement, activeTab: HTMLElement): void {
        // Remove active class from all tabs
        tabsContainer.querySelectorAll('.nav-button').forEach(el => {
            el.removeClass('nav-button-active');
        });
        
        // Add active class to clicked tab
        activeTab.addClass('nav-button-active');
    }
    
    async renderAllTopics(container: HTMLElement): Promise<void> {
        container.empty();
        
        const topicFiles = await this.getTopicFiles();
        
        if (topicFiles.length === 0) {
            container.createEl('p', { 
                text: 'No learning topics found. Create a topic using the "Create Topic Note" command.',
                cls: 'no-topics-message'
            });
            return;
        }
        
        // Sort topics by name
        topicFiles.sort((a, b) => a.basename.localeCompare(b.basename));
        
        // Create a list of topics
        const topicList = container.createEl('div', { cls: 'topic-list' });
        
        for (const file of topicFiles) {
            const metadata = this.app.metadataCache.getFileCache(file);
            if (!metadata?.frontmatter) continue;
            
            const progress = metadata.frontmatter.progress || 0;
            const progressPercent = Math.round(progress * 100);
            const completedSubtopics = metadata.frontmatter.completed_subtopics || 0;
            const totalSubtopics = metadata.frontmatter.total_subtopics || 0;
            
            const topicItem = topicList.createEl('div', { cls: 'topic-item' });
            
            // Topic header with name and progress
            const topicHeader = topicItem.createEl('div', { cls: 'topic-header' });
            
            // Topic name with link
            const topicName = topicHeader.createEl('div', { cls: 'topic-name' });
            topicName.createEl('a', { 
                text: file.basename,
                href: file.path,
                cls: 'topic-link'
            }).addEventListener('click', (event) => {
                event.preventDefault();
                this.app.workspace.getLeaf().openFile(file);
            });
            
            // Progress indicator
            const progressText = topicHeader.createEl('div', { 
                text: `${progressPercent}% (${completedSubtopics}/${totalSubtopics})`,
                cls: 'topic-progress-text'
            });
            
            // Progress bar
            const progressBarContainer = topicItem.createEl('div', { cls: 'progress-bar-container' });
            const progressBar = progressBarContainer.createEl('div', { cls: 'progress-bar' });
            progressBar.style.width = `${progressPercent}%`;
            
            // Color the progress bar based on completion
            if (progressPercent < 30) {
                progressBar.addClass('progress-low');
            } else if (progressPercent < 70) {
                progressBar.addClass('progress-medium');
            } else {
                progressBar.addClass('progress-high');
            }
            
            // Subtopics list if available
            if (metadata.frontmatter.subtopics && metadata.frontmatter.subtopics.length > 0) {
                const subtopicsContainer = topicItem.createEl('div', { cls: 'subtopics-container' });
                const subtopicsToggle = subtopicsContainer.createEl('div', { 
                    text: 'Show Subtopics',
                    cls: 'subtopics-toggle'
                });
                
                const subtopicsList = subtopicsContainer.createEl('div', { 
                    cls: 'subtopics-list hidden'
                });
                
                // Toggle subtopics visibility
                subtopicsToggle.addEventListener('click', () => {
                    subtopicsList.toggleClass('hidden', !subtopicsList.hasClass('hidden'));
                    subtopicsToggle.textContent = subtopicsList.hasClass('hidden') 
                        ? 'Show Subtopics' 
                        : 'Hide Subtopics';
                });
                
                // Render subtopics
                for (const subtopic of metadata.frontmatter.subtopics) {
                    const subtopicName = subtopic.replace(/\[\[(.*?)\]\]/, '$1');
                    const subtopicFile = this.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                    
                    const subtopicItem = subtopicsList.createEl('div', { cls: 'subtopic-item' });
                    
                    // Check if subtopic file exists and get completion status
                    let isCompleted = false;
                    if (subtopicFile && subtopicFile instanceof TFile) {
                        const subtopicMetadata = this.app.metadataCache.getFileCache(subtopicFile);
                        isCompleted = subtopicMetadata?.frontmatter?.completed === true;
                    }
                    
                    // Subtopic name with completion status
                    const subtopicNameEl = subtopicItem.createEl('div', { cls: 'subtopic-name' });
                    
                    // Status indicator
                    subtopicNameEl.createEl('span', { 
                        text: isCompleted ? '✅ ' : '❌ ',
                        cls: 'subtopic-status'
                    });
                    
                    // Subtopic link
                    if (subtopicFile && subtopicFile instanceof TFile) {
                        subtopicNameEl.createEl('a', { 
                            text: subtopicName,
                            href: subtopicFile.path,
                            cls: 'subtopic-link'
                        }).addEventListener('click', (event) => {
                            event.preventDefault();
                            this.app.workspace.getLeaf().openFile(subtopicFile);
                        });
                        
                        // Toggle completion button
                        const toggleButton = subtopicItem.createEl('button', { 
                            text: isCompleted ? 'Mark Incomplete' : 'Mark Complete',
                            cls: 'subtopic-toggle-button'
                        });
                        
                        toggleButton.addEventListener('click', async () => {
                            await this.plugin.toggleSubtopicCompletion(subtopicFile);
                            this.renderView();
                        });
                    } else {
                        // Subtopic file doesn't exist
                        subtopicNameEl.createEl('span', { 
                            text: subtopicName + ' (missing)',
                            cls: 'subtopic-missing'
                        });
                    }
                }
            }
        }
    }
    
    async renderInProgressTopics(container: HTMLElement): Promise<void> {
        container.empty();
        
        const topicFiles = await this.getTopicFiles();
        const inProgressTopics = topicFiles.filter(file => {
            const metadata = this.app.metadataCache.getFileCache(file);
            const progress = metadata?.frontmatter?.progress || 0;
            return progress > 0 && progress < 1;
        });
        
        if (inProgressTopics.length === 0) {
            container.createEl('p', { 
                text: 'No topics in progress. Start learning a topic to see it here.',
                cls: 'no-topics-message'
            });
            return;
        }
        
        // Sort by progress (ascending)
        inProgressTopics.sort((a, b) => {
            const metadataA = this.app.metadataCache.getFileCache(a);
            const metadataB = this.app.metadataCache.getFileCache(b);
            const progressA = metadataA?.frontmatter?.progress || 0;
            const progressB = metadataB?.frontmatter?.progress || 0;
            return progressA - progressB;
        });
        
        // Create a list of topics
        const topicList = container.createEl('div', { cls: 'topic-list' });
        
        for (const file of inProgressTopics) {
            // Similar rendering as renderAllTopics but for in-progress topics only
            const metadata = this.app.metadataCache.getFileCache(file);
            if (!metadata?.frontmatter) continue;
            
            const progress = metadata.frontmatter.progress || 0;
            const progressPercent = Math.round(progress * 100);
            const completedSubtopics = metadata.frontmatter.completed_subtopics || 0;
            const totalSubtopics = metadata.frontmatter.total_subtopics || 0;
            
            const topicItem = topicList.createEl('div', { cls: 'topic-item' });
            
            // Topic header with name and progress
            const topicHeader = topicItem.createEl('div', { cls: 'topic-header' });
            
            // Topic name with link
            const topicName = topicHeader.createEl('div', { cls: 'topic-name' });
            topicName.createEl('a', { 
                text: file.basename,
                href: file.path,
                cls: 'topic-link'
            }).addEventListener('click', (event) => {
                event.preventDefault();
                this.app.workspace.getLeaf().openFile(file);
            });
            
            // Progress indicator
            const progressText = topicHeader.createEl('div', { 
                text: `${progressPercent}% (${completedSubtopics}/${totalSubtopics})`,
                cls: 'topic-progress-text'
            });
            
            // Progress bar
            const progressBarContainer = topicItem.createEl('div', { cls: 'progress-bar-container' });
            const progressBar = progressBarContainer.createEl('div', { cls: 'progress-bar progress-medium' });
            progressBar.style.width = `${progressPercent}%`;
        }
    }
    
    async renderCompletedTopics(container: HTMLElement): Promise<void> {
        container.empty();
        
        const topicFiles = await this.getTopicFiles();
        const completedTopics = topicFiles.filter(file => {
            const metadata = this.app.metadataCache.getFileCache(file);
            const progress = metadata?.frontmatter?.progress || 0;
            return progress === 1;
        });
        
        if (completedTopics.length === 0) {
            container.createEl('p', { 
                text: 'No completed topics yet. Keep learning!',
                cls: 'no-topics-message'
            });
            return;
        }
        
        // Create a list of topics
        const topicList = container.createEl('div', { cls: 'topic-list' });
        
        for (const file of completedTopics) {
            // Similar rendering as renderAllTopics but for completed topics only
            const metadata = this.app.metadataCache.getFileCache(file);
            if (!metadata?.frontmatter) continue;
            
            const topicItem = topicList.createEl('div', { cls: 'topic-item' });
            
            // Topic header with name and completion indicator
            const topicHeader = topicItem.createEl('div', { cls: 'topic-header' });
            
            // Topic name with link
            const topicName = topicHeader.createEl('div', { cls: 'topic-name' });
            topicName.createEl('span', { 
                text: '✅ ',
                cls: 'topic-completed-indicator'
            });
            topicName.createEl('a', { 
                text: file.basename,
                href: file.path,
                cls: 'topic-link'
            }).addEventListener('click', (event) => {
                event.preventDefault();
                this.app.workspace.getLeaf().openFile(file);
            });
            
            // Completion text
            topicHeader.createEl('div', { 
                text: 'Completed',
                cls: 'topic-completed-text'
            });
        }
    }
    
    async getTopicFiles() {
        const files = this.app.vault.getMarkdownFiles();
        return files.filter(file => {
            const metadata = this.app.metadataCache.getFileCache(file);
            return metadata?.frontmatter?.type === 'topic';
        });
    }
}
