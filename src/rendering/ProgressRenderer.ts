import { TFile } from 'obsidian';
import LearningProgressPlugin from '../main';

export class ProgressRenderer {
    plugin: LearningProgressPlugin;

    constructor(plugin: LearningProgressPlugin) {
        this.plugin = plugin;
    }

    /**
     * Render progress information in a topic note
     */
    async renderProgressInNote(file: TFile): Promise<void> {
        if (!this.plugin.settings.showProgressBar) return;

        const metadata = this.plugin.app.metadataCache.getFileCache(file);
        if (!metadata?.frontmatter?.type || metadata.frontmatter.type !== 'topic') return;

        try {
            // Read the file content
            const content = await this.plugin.app.vault.read(file);
            
            // Check if the progress section exists
            const progressSectionRegex = /## Progress\s*\n([\s\S]*?)(?=\n##|$)/;
            const match = content.match(progressSectionRegex);
            
            if (match) {
                // Get progress information
                const progress = metadata.frontmatter.progress || 0;
                const progressPercent = Math.round(progress * 100);
                const completedSubtopics = metadata.frontmatter.completed_subtopics || 0;
                const totalSubtopics = metadata.frontmatter.total_subtopics || 0;
                
                // Create progress visualization
                let progressContent = `\n${progressPercent}% complete (${completedSubtopics}/${totalSubtopics} subtopics)\n\n`;
                progressContent += this.createProgressBar(progress);
                
                // Replace the progress section content
                const updatedContent = content.replace(
                    progressSectionRegex, 
                    `## Progress\n${progressContent}`
                );
                
                // Update the file if content changed
                if (updatedContent !== content) {
                    await this.plugin.app.vault.modify(file, updatedContent);
                }
            }
        } catch (error) {
            console.error('Error rendering progress in note:', error);
        }
    }

    /**
     * Create an ASCII progress bar
     */
    createProgressBar(progress: number): string {
        const barLength = 20;
        const filledLength = Math.round(progress * barLength);
        const emptyLength = barLength - filledLength;
        
        let progressBar = '\n```progress\n[';
        progressBar += '█'.repeat(filledLength);
        progressBar += '░'.repeat(emptyLength);
        progressBar += ']\n```\n';
        
        return progressBar;
    }

    /**
     * Render completion status in a subtopic note
     */
    async renderCompletionStatus(file: TFile): Promise<void> {
        const metadata = this.plugin.app.metadataCache.getFileCache(file);
        if (!metadata?.frontmatter?.type || metadata.frontmatter.type !== 'subtopic') return;

        try {
            // Read the file content
            const content = await this.plugin.app.vault.read(file);
            
            // Check if the status line exists
            const statusRegex = /Status: (❌ Not completed|✅ Completed)/;
            const match = content.match(statusRegex);
            
            if (match) {
                const isCompleted = metadata.frontmatter.completed === true;
                const newStatusText = isCompleted ? '✅ Completed' : '❌ Not completed';
                
                // Only update if status has changed
                if (match[1] !== newStatusText) {
                    const updatedContent = content.replace(
                        statusRegex, 
                        `Status: ${newStatusText}`
                    );
                    
                    await this.plugin.app.vault.modify(file, updatedContent);
                }
            }
        } catch (error) {
            console.error('Error rendering completion status:', error);
        }
    }

    /**
     * Add a visual indicator to the note title in the file explorer
     * Note: This requires CSS styling to be effective
     */
    addVisualIndicatorToTitle(file: TFile): void {
        // This would typically be implemented using CSS classes
        // For example, adding a class to the file explorer item based on completion status
        // Since direct DOM manipulation of the file explorer is not recommended,
        // this would be better implemented using CSS selectors based on file attributes
    }

    /**
     * Create a detailed progress report for a topic
     */
    async createProgressReport(file: TFile): Promise<string> {
        const metadata = this.plugin.app.metadataCache.getFileCache(file);
        if (!metadata?.frontmatter) return "No metadata found for this topic.";
        
        const progress = metadata.frontmatter.progress || 0;
        const progressPercent = Math.round(progress * 100);
        const completedSubtopics = metadata.frontmatter.completed_subtopics || 0;
        const totalSubtopics = metadata.frontmatter.total_subtopics || 0;
        
        let report = `# Progress Report: ${file.basename}\n\n`;
        
        // Overall progress
        report += `## Overall Progress\n\n`;
        report += `${progressPercent}% complete (${completedSubtopics}/${totalSubtopics} subtopics)\n\n`;
        report += this.createProgressBar(progress);
        report += '\n';
        
        // Subtopics breakdown
        report += `## Subtopics\n\n`;
        
        if (metadata.frontmatter.subtopics && metadata.frontmatter.subtopics.length > 0) {
            for (const subtopic of metadata.frontmatter.subtopics) {
                const subtopicName = subtopic.replace(/\[\[(.*?)\]\]/, '$1');
                const subtopicFile = this.plugin.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                
                if (subtopicFile && subtopicFile instanceof TFile) {
                    const subtopicMetadata = this.plugin.app.metadataCache.getFileCache(subtopicFile);
                    const isCompleted = subtopicMetadata?.frontmatter?.completed === true;
                    const completionDate = subtopicMetadata?.frontmatter?.completion_date || '';
                    
                    report += `- ${isCompleted ? '✅' : '❌'} [[${subtopicName}]]`;
                    if (isCompleted && completionDate) {
                        report += ` (Completed: ${completionDate})`;
                    }
                    report += '\n';
                } else {
                    report += `- ❓ [[${subtopicName}]] (Missing)\n`;
                }
            }
        } else {
            report += "No subtopics found for this topic.\n";
        }
        
        // Recommendations
        report += `\n## Next Steps\n\n`;
        
        if (progress === 0) {
            report += "You haven't started learning this topic yet. Create some subtopics to begin tracking your progress.\n";
        } else if (progress === 1) {
            report += "Congratulations! You've completed all subtopics for this topic.\n";
        } else {
            report += `You're making progress on this topic. Focus on completing the remaining subtopics:\n\n`;
            
            // List incomplete subtopics
            if (metadata.frontmatter.subtopics && metadata.frontmatter.subtopics.length > 0) {
                for (const subtopic of metadata.frontmatter.subtopics) {
                    const subtopicName = subtopic.replace(/\[\[(.*?)\]\]/, '$1');
                    const subtopicFile = this.plugin.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                    
                    if (subtopicFile && subtopicFile instanceof TFile) {
                        const subtopicMetadata = this.plugin.app.metadataCache.getFileCache(subtopicFile);
                        const isCompleted = subtopicMetadata?.frontmatter?.completed === true;
                        
                        if (!isCompleted) {
                            report += `- [[${subtopicName}]]\n`;
                        }
                    }
                }
            }
        }
        
        return report;
    }
}
