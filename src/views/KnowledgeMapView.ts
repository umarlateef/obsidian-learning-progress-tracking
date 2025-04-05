import { ItemView, WorkspaceLeaf } from 'obsidian';
import LearningProgressPlugin from '../main';
import { ProgressTracker } from '../tracking/ProgressTracker';

export const KNOWLEDGE_MAP_VIEW_TYPE = 'knowledge-map-view';

export class KnowledgeMapView extends ItemView {
    plugin: LearningProgressPlugin;
    progressTracker: ProgressTracker;

    constructor(leaf: WorkspaceLeaf, plugin: LearningProgressPlugin) {
        super(leaf);
        this.plugin = plugin;
        this.progressTracker = new ProgressTracker(plugin);
    }

    getViewType(): string {
        return KNOWLEDGE_MAP_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'Knowledge Map';
    }

    async onOpen(): Promise<void> {
        await this.renderView();
    }

    async renderView(): Promise<void> {
        const container = this.containerEl.children[1];
        container.empty();
        
        container.createEl('h2', { text: 'Knowledge Map' });
        
        // Create a container for the knowledge map
        const mapContainer = container.createEl('div', { 
            cls: 'knowledge-map-container' 
        });
        
        // Create a container for the legend
        const legendContainer = container.createEl('div', { 
            cls: 'knowledge-map-legend' 
        });
        
        // Add legend items
        legendContainer.createEl('div', { 
            cls: 'legend-title',
            text: 'Legend'
        });
        
        const completedLegend = legendContainer.createEl('div', { cls: 'legend-item' });
        completedLegend.createEl('div', { cls: 'legend-color legend-completed' });
        completedLegend.createEl('div', { cls: 'legend-label', text: 'Completed' });
        
        const highProgressLegend = legendContainer.createEl('div', { cls: 'legend-item' });
        highProgressLegend.createEl('div', { cls: 'legend-color legend-high-progress' });
        highProgressLegend.createEl('div', { cls: 'legend-label', text: 'High Progress (70-99%)' });
        
        const mediumProgressLegend = legendContainer.createEl('div', { cls: 'legend-item' });
        mediumProgressLegend.createEl('div', { cls: 'legend-color legend-medium-progress' });
        mediumProgressLegend.createEl('div', { cls: 'legend-label', text: 'Medium Progress (30-69%)' });
        
        const lowProgressLegend = legendContainer.createEl('div', { cls: 'legend-item' });
        lowProgressLegend.createEl('div', { cls: 'legend-color legend-low-progress' });
        lowProgressLegend.createEl('div', { cls: 'legend-label', text: 'Low Progress (1-29%)' });
        
        const notStartedLegend = legendContainer.createEl('div', { cls: 'legend-item' });
        notStartedLegend.createEl('div', { cls: 'legend-color legend-not-started' });
        notStartedLegend.createEl('div', { cls: 'legend-label', text: 'Not Started' });
        
        // Get topics with progress information
        const topics = await this.progressTracker.getTopicsWithProgress();
        
        if (topics.length === 0) {
            mapContainer.createEl('p', { 
                text: 'No learning topics found. Create a topic using the "Create Topic Note" command.',
                cls: 'no-topics-message'
            });
            return;
        }
        
        // Create the knowledge map visualization
        await this.createKnowledgeMap(mapContainer, topics);
    }
    
    async createKnowledgeMap(container: HTMLElement, topics: {file: any, progress: number, completed: number, total: number}[]): Promise<void> {
        // Create a force-directed graph layout
        const mapSvg = container.createEl('div', { cls: 'knowledge-map-svg' });
        
        // For each topic, create a node in the graph
        for (const topic of topics) {
            const topicNode = mapSvg.createEl('div', { cls: 'topic-node' });
            
            // Set node size based on number of subtopics
            const nodeSize = Math.max(50, Math.min(100, 50 + topic.total * 5));
            topicNode.style.width = `${nodeSize}px`;
            topicNode.style.height = `${nodeSize}px`;
            
            // Set node color based on progress
            if (topic.progress === 0) {
                topicNode.addClass('node-not-started');
            } else if (topic.progress < 0.3) {
                topicNode.addClass('node-low-progress');
            } else if (topic.progress < 0.7) {
                topicNode.addClass('node-medium-progress');
            } else if (topic.progress < 1) {
                topicNode.addClass('node-high-progress');
            } else {
                topicNode.addClass('node-completed');
            }
            
            // Set node opacity based on progress (more progress = more opaque)
            topicNode.style.opacity = `${0.4 + topic.progress * 0.6}`;
            
            // Add topic name
            const topicName = topicNode.createEl('div', { 
                cls: 'topic-node-name',
                text: topic.file.basename
            });
            
            // Add progress indicator
            const progressPercent = Math.round(topic.progress * 100);
            const progressIndicator = topicNode.createEl('div', { 
                cls: 'topic-node-progress',
                text: `${progressPercent}%`
            });
            
            // Make node clickable to open the topic
            topicNode.addEventListener('click', () => {
                this.app.workspace.getLeaf().openFile(topic.file);
            });
            
            // Position nodes in a grid layout (simple visualization)
            // In a real implementation, this would use D3.js or a similar library for force-directed layout
            topicNode.style.position = 'relative';
            topicNode.style.display = 'inline-block';
            topicNode.style.margin = '10px';
        }
        
        // Add instructions
        const instructions = container.createEl('div', { 
            cls: 'knowledge-map-instructions',
            text: 'Click on a topic node to open it. Node size represents the number of subtopics, color represents progress level, and opacity increases with progress.'
        });
    }
}
