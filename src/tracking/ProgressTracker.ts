import { TFile } from 'obsidian';
import LearningProgressPlugin from '../main';

export class ProgressTracker {
    plugin: LearningProgressPlugin;

    constructor(plugin: LearningProgressPlugin) {
        this.plugin = plugin;
    }

    /**
     * Get all topic notes in the vault
     */
    async getAllTopics(): Promise<TFile[]> {
        const files = this.plugin.app.vault.getMarkdownFiles();
        return files.filter(file => {
            const metadata = this.plugin.app.metadataCache.getFileCache(file);
            return metadata?.frontmatter?.type === 'topic';
        });
    }

    /**
     * Get all subtopic notes for a specific topic
     */
    async getSubtopicsForTopic(topicFile: TFile): Promise<TFile[]> {
        const metadata = this.plugin.app.metadataCache.getFileCache(topicFile);
        if (!metadata?.frontmatter?.subtopics) return [];

        const subtopics = metadata.frontmatter.subtopics;
        const subtopicFiles: TFile[] = [];

        for (const subtopic of subtopics) {
            const subtopicName = subtopic.replace(/\[\[(.*?)\]\]/, '$1');
            const subtopicFile = this.plugin.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
            
            if (subtopicFile && subtopicFile instanceof TFile) {
                subtopicFiles.push(subtopicFile);
            }
        }

        return subtopicFiles;
    }

    /**
     * Get all incomplete subtopics for a specific topic
     */
    async getIncompleteSubtopics(topicFile: TFile): Promise<TFile[]> {
        const subtopics = await this.getSubtopicsForTopic(topicFile);
        return subtopics.filter(file => {
            const metadata = this.plugin.app.metadataCache.getFileCache(file);
            return metadata?.frontmatter?.completed !== true;
        });
    }

    /**
     * Get all topics with progress information
     */
    async getTopicsWithProgress(): Promise<{file: TFile, progress: number, completed: number, total: number}[]> {
        const topics = await this.getAllTopics();
        return topics.map(file => {
            const metadata = this.plugin.app.metadataCache.getFileCache(file);
            const progress = metadata?.frontmatter?.progress || 0;
            const completed = metadata?.frontmatter?.completed_subtopics || 0;
            const total = metadata?.frontmatter?.total_subtopics || 0;
            
            return {
                file,
                progress,
                completed,
                total
            };
        });
    }

    /**
     * Get overall learning progress across all topics
     */
    async getOverallProgress(): Promise<{progress: number, completedTopics: number, totalTopics: number, completedSubtopics: number, totalSubtopics: number}> {
        const topics = await this.getTopicsWithProgress();
        
        if (topics.length === 0) {
            return {
                progress: 0,
                completedTopics: 0,
                totalTopics: 0,
                completedSubtopics: 0,
                totalSubtopics: 0
            };
        }
        
        const completedTopics = topics.filter(t => t.progress === 1).length;
        const totalTopics = topics.length;
        
        let completedSubtopics = 0;
        let totalSubtopics = 0;
        
        topics.forEach(topic => {
            completedSubtopics += topic.completed;
            totalSubtopics += topic.total;
        });
        
        const progress = totalSubtopics > 0 ? completedSubtopics / totalSubtopics : 0;
        
        return {
            progress,
            completedTopics,
            totalTopics,
            completedSubtopics,
            totalSubtopics
        };
    }

    /**
     * Get topics grouped by progress status
     */
    async getTopicsByStatus(): Promise<{notStarted: TFile[], inProgress: TFile[], completed: TFile[]}> {
        const topics = await this.getAllTopics();
        
        const notStarted: TFile[] = [];
        const inProgress: TFile[] = [];
        const completed: TFile[] = [];
        
        for (const file of topics) {
            const metadata = this.plugin.app.metadataCache.getFileCache(file);
            const progress = metadata?.frontmatter?.progress || 0;
            
            if (progress === 0) {
                notStarted.push(file);
            } else if (progress === 1) {
                completed.push(file);
            } else {
                inProgress.push(file);
            }
        }
        
        return {
            notStarted,
            inProgress,
            completed
        };
    }

    /**
     * Get recommended topics to focus on (topics with some progress but not completed)
     */
    async getRecommendedTopics(limit: number = 5): Promise<TFile[]> {
        const topics = await this.getTopicsWithProgress();
        
        // Filter for in-progress topics
        const inProgress = topics.filter(t => t.progress > 0 && t.progress < 1);
        
        // Sort by progress (highest first)
        inProgress.sort((a, b) => b.progress - a.progress);
        
        return inProgress.slice(0, limit).map(t => t.file);
    }

    /**
     * Get topics with knowledge gaps (topics with low progress)
     */
    async getKnowledgeGaps(threshold: number = 0.3, limit: number = 5): Promise<TFile[]> {
        const topics = await this.getTopicsWithProgress();
        
        // Filter for topics with progress below threshold
        const gaps = topics.filter(t => t.progress < threshold);
        
        // Sort by progress (lowest first)
        gaps.sort((a, b) => a.progress - b.progress);
        
        return gaps.slice(0, limit).map(t => t.file);
    }

    /**
     * Check if a subtopic is completed
     */
    isSubtopicCompleted(file: TFile): boolean {
        const metadata = this.plugin.app.metadataCache.getFileCache(file);
        return metadata?.frontmatter?.completed === true;
    }

    /**
     * Get the parent topic for a subtopic
     */
    async getParentTopic(subtopicFile: TFile): Promise<TFile | null> {
        const metadata = this.plugin.app.metadataCache.getFileCache(subtopicFile);
        if (!metadata?.frontmatter?.parent) return null;
        
        const parentName = metadata.frontmatter.parent.replace(/\[\[(.*?)\]\]/, '$1');
        const parentFile = this.plugin.app.vault.getAbstractFileByPath(`${parentName}.md`);
        
        if (parentFile && parentFile instanceof TFile) {
            return parentFile;
        }
        
        return null;
    }

    /**
     * Generate a progress report for a topic
     */
    async generateTopicReport(topicFile: TFile): Promise<string> {
        const metadata = this.plugin.app.metadataCache.getFileCache(topicFile);
        if (!metadata?.frontmatter) return "No metadata found for this topic.";
        
        const progress = metadata.frontmatter.progress || 0;
        const progressPercent = Math.round(progress * 100);
        const completedSubtopics = metadata.frontmatter.completed_subtopics || 0;
        const totalSubtopics = metadata.frontmatter.total_subtopics || 0;
        
        let report = `# Progress Report: ${topicFile.basename}\n\n`;
        report += `## Overview\n\n`;
        report += `- **Progress**: ${progressPercent}% complete\n`;
        report += `- **Completed Subtopics**: ${completedSubtopics}/${totalSubtopics}\n\n`;
        
        report += `## Subtopics\n\n`;
        
        if (metadata.frontmatter.subtopics && metadata.frontmatter.subtopics.length > 0) {
            for (const subtopic of metadata.frontmatter.subtopics) {
                const subtopicName = subtopic.replace(/\[\[(.*?)\]\]/, '$1');
                const subtopicFile = this.plugin.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                
                if (subtopicFile && subtopicFile instanceof TFile) {
                    const subtopicMetadata = this.plugin.app.metadataCache.getFileCache(subtopicFile);
                    const isCompleted = subtopicMetadata?.frontmatter?.completed === true;
                    const completionDate = subtopicMetadata?.frontmatter?.completion_date || 'N/A';
                    
                    report += `- ${isCompleted ? '✅' : '❌'} **${subtopicName}**`;
                    if (isCompleted) {
                        report += ` (Completed on: ${completionDate})`;
                    }
                    report += '\n';
                } else {
                    report += `- ❓ **${subtopicName}** (Missing)\n`;
                }
            }
        } else {
            report += "No subtopics found for this topic.\n";
        }
        
        report += `\n## Recommendations\n\n`;
        
        if (progress === 0) {
            report += "You haven't started learning this topic yet. Create some subtopics to begin tracking your progress.\n";
        } else if (progress === 1) {
            report += "Congratulations! You've completed all subtopics for this topic.\n";
        } else {
            report += `You're making progress on this topic. Focus on completing the remaining subtopics to fill your knowledge gaps.\n`;
        }
        
        return report;
    }

    /**
     * Generate an overall progress report
     */
    async generateOverallReport(): Promise<string> {
        const overall = await this.getOverallProgress();
        const topicsByStatus = await this.getTopicsByStatus();
        const recommendedTopics = await this.getRecommendedTopics(3);
        const knowledgeGaps = await this.getKnowledgeGaps(0.3, 3);
        
        const overallPercent = Math.round(overall.progress * 100);
        
        let report = `# Learning Progress Report\n\n`;
        report += `## Overall Progress\n\n`;
        report += `- **Overall Progress**: ${overallPercent}% complete\n`;
        report += `- **Topics**: ${overall.completedTopics}/${overall.totalTopics} completed\n`;
        report += `- **Subtopics**: ${overall.completedSubtopics}/${overall.totalSubtopics} completed\n\n`;
        
        report += `## Topics by Status\n\n`;
        report += `- **Not Started**: ${topicsByStatus.notStarted.length} topics\n`;
        report += `- **In Progress**: ${topicsByStatus.inProgress.length} topics\n`;
        report += `- **Completed**: ${topicsByStatus.completed.length} topics\n\n`;
        
        report += `## Recommended Focus Areas\n\n`;
        
        if (recommendedTopics.length > 0) {
            for (const topic of recommendedTopics) {
                const metadata = this.plugin.app.metadataCache.getFileCache(topic);
                const progress = metadata?.frontmatter?.progress || 0;
                const progressPercent = Math.round(progress * 100);
                
                report += `- [[${topic.basename}]] (${progressPercent}% complete)\n`;
            }
        } else {
            report += "No topics in progress. Start learning a topic to get recommendations.\n";
        }
        
        report += `\n## Knowledge Gaps\n\n`;
        
        if (knowledgeGaps.length > 0) {
            for (const topic of knowledgeGaps) {
                const metadata = this.plugin.app.metadataCache.getFileCache(topic);
                const progress = metadata?.frontmatter?.progress || 0;
                const progressPercent = Math.round(progress * 100);
                
                report += `- [[${topic.basename}]] (${progressPercent}% complete)\n`;
            }
        } else {
            report += "No significant knowledge gaps found.\n";
        }
        
        return report;
    }
}
