'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const SUBTOPIC_TRACKER_VIEW_TYPE = 'subtopic-tracker-view';
class SubtopicTrackerView extends obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }
    getViewType() {
        return SUBTOPIC_TRACKER_VIEW_TYPE;
    }
    getDisplayText() {
        return 'Subtopic Tracker';
    }
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            this.renderView();
        });
    }
    renderView() {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.renderAllTopics(contentContainer);
            // Tab click handlers
            allTopicsTab.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                this.setActiveTab(tabsContainer, allTopicsTab);
                yield this.renderAllTopics(contentContainer);
            }));
            inProgressTab.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                this.setActiveTab(tabsContainer, inProgressTab);
                yield this.renderInProgressTopics(contentContainer);
            }));
            completedTab.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                this.setActiveTab(tabsContainer, completedTab);
                yield this.renderCompletedTopics(contentContainer);
            }));
        });
    }
    setActiveTab(tabsContainer, activeTab) {
        // Remove active class from all tabs
        tabsContainer.querySelectorAll('.nav-button').forEach(el => {
            el.removeClass('nav-button-active');
        });
        // Add active class to clicked tab
        activeTab.addClass('nav-button-active');
    }
    renderAllTopics(container) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            container.empty();
            const topicFiles = yield this.getTopicFiles();
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
                if (!(metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter))
                    continue;
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
                topicHeader.createEl('div', {
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
                }
                else if (progressPercent < 70) {
                    progressBar.addClass('progress-medium');
                }
                else {
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
                        if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                            const subtopicMetadata = this.app.metadataCache.getFileCache(subtopicFile);
                            isCompleted = ((_a = subtopicMetadata === null || subtopicMetadata === void 0 ? void 0 : subtopicMetadata.frontmatter) === null || _a === void 0 ? void 0 : _a.completed) === true;
                        }
                        // Subtopic name with completion status
                        const subtopicNameEl = subtopicItem.createEl('div', { cls: 'subtopic-name' });
                        // Status indicator
                        subtopicNameEl.createEl('span', {
                            text: isCompleted ? '✅ ' : '❌ ',
                            cls: 'subtopic-status'
                        });
                        // Subtopic link
                        if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
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
                            toggleButton.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                                yield this.plugin.toggleSubtopicCompletion(subtopicFile);
                                this.renderView();
                            }));
                        }
                        else {
                            // Subtopic file doesn't exist
                            subtopicNameEl.createEl('span', {
                                text: subtopicName + ' (missing)',
                                cls: 'subtopic-missing'
                            });
                        }
                    }
                }
            }
        });
    }
    renderInProgressTopics(container) {
        return __awaiter(this, void 0, void 0, function* () {
            container.empty();
            const topicFiles = yield this.getTopicFiles();
            const inProgressTopics = topicFiles.filter(file => {
                var _a;
                const metadata = this.app.metadataCache.getFileCache(file);
                const progress = ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.progress) || 0;
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
                var _a, _b;
                const metadataA = this.app.metadataCache.getFileCache(a);
                const metadataB = this.app.metadataCache.getFileCache(b);
                const progressA = ((_a = metadataA === null || metadataA === void 0 ? void 0 : metadataA.frontmatter) === null || _a === void 0 ? void 0 : _a.progress) || 0;
                const progressB = ((_b = metadataB === null || metadataB === void 0 ? void 0 : metadataB.frontmatter) === null || _b === void 0 ? void 0 : _b.progress) || 0;
                return progressA - progressB;
            });
            // Create a list of topics
            const topicList = container.createEl('div', { cls: 'topic-list' });
            for (const file of inProgressTopics) {
                // Similar rendering as renderAllTopics but for in-progress topics only
                const metadata = this.app.metadataCache.getFileCache(file);
                if (!(metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter))
                    continue;
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
                topicHeader.createEl('div', {
                    text: `${progressPercent}% (${completedSubtopics}/${totalSubtopics})`,
                    cls: 'topic-progress-text'
                });
                // Progress bar
                const progressBarContainer = topicItem.createEl('div', { cls: 'progress-bar-container' });
                const progressBar = progressBarContainer.createEl('div', { cls: 'progress-bar progress-medium' });
                progressBar.style.width = `${progressPercent}%`;
            }
        });
    }
    renderCompletedTopics(container) {
        return __awaiter(this, void 0, void 0, function* () {
            container.empty();
            const topicFiles = yield this.getTopicFiles();
            const completedTopics = topicFiles.filter(file => {
                var _a;
                const metadata = this.app.metadataCache.getFileCache(file);
                const progress = ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.progress) || 0;
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
                if (!(metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter))
                    continue;
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
        });
    }
    getTopicFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = this.app.vault.getMarkdownFiles();
            return files.filter(file => {
                var _a;
                const metadata = this.app.metadataCache.getFileCache(file);
                return ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.type) === 'topic';
            });
        });
    }
}

class ProgressTracker {
    constructor(plugin) {
        this.plugin = plugin;
    }
    /**
     * Get all topic notes in the vault
     */
    getAllTopics() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = this.plugin.app.vault.getMarkdownFiles();
            return files.filter(file => {
                var _a;
                const metadata = this.plugin.app.metadataCache.getFileCache(file);
                return ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.type) === 'topic';
            });
        });
    }
    /**
     * Get all subtopic notes for a specific topic
     */
    getSubtopicsForTopic(topicFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const metadata = this.plugin.app.metadataCache.getFileCache(topicFile);
            if (!((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.subtopics))
                return [];
            const subtopics = metadata.frontmatter.subtopics;
            const subtopicFiles = [];
            for (const subtopic of subtopics) {
                const subtopicName = subtopic.replace(/\[\[(.*?)\]\]/, '$1');
                const subtopicFile = this.plugin.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                    subtopicFiles.push(subtopicFile);
                }
            }
            return subtopicFiles;
        });
    }
    /**
     * Get all incomplete subtopics for a specific topic
     */
    getIncompleteSubtopics(topicFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const subtopics = yield this.getSubtopicsForTopic(topicFile);
            return subtopics.filter(file => {
                var _a;
                const metadata = this.plugin.app.metadataCache.getFileCache(file);
                return ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.completed) !== true;
            });
        });
    }
    /**
     * Get all topics with progress information
     */
    getTopicsWithProgress() {
        return __awaiter(this, void 0, void 0, function* () {
            const topics = yield this.getAllTopics();
            return topics.map(file => {
                var _a, _b, _c;
                const metadata = this.plugin.app.metadataCache.getFileCache(file);
                const progress = ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.progress) || 0;
                const completed = ((_b = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _b === void 0 ? void 0 : _b.completed_subtopics) || 0;
                const total = ((_c = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _c === void 0 ? void 0 : _c.total_subtopics) || 0;
                return {
                    file,
                    progress,
                    completed,
                    total
                };
            });
        });
    }
    /**
     * Get overall learning progress across all topics
     */
    getOverallProgress() {
        return __awaiter(this, void 0, void 0, function* () {
            const topics = yield this.getTopicsWithProgress();
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
        });
    }
    /**
     * Get topics grouped by progress status
     */
    getTopicsByStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const topics = yield this.getAllTopics();
            const notStarted = [];
            const inProgress = [];
            const completed = [];
            for (const file of topics) {
                const metadata = this.plugin.app.metadataCache.getFileCache(file);
                const progress = ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.progress) || 0;
                if (progress === 0) {
                    notStarted.push(file);
                }
                else if (progress === 1) {
                    completed.push(file);
                }
                else {
                    inProgress.push(file);
                }
            }
            return {
                notStarted,
                inProgress,
                completed
            };
        });
    }
    /**
     * Get recommended topics to focus on (topics with some progress but not completed)
     */
    getRecommendedTopics() {
        return __awaiter(this, arguments, void 0, function* (limit = 5) {
            const topics = yield this.getTopicsWithProgress();
            // Filter for in-progress topics
            const inProgress = topics.filter(t => t.progress > 0 && t.progress < 1);
            // Sort by progress (highest first)
            inProgress.sort((a, b) => b.progress - a.progress);
            return inProgress.slice(0, limit).map(t => t.file);
        });
    }
    /**
     * Get topics with knowledge gaps (topics with low progress)
     */
    getKnowledgeGaps() {
        return __awaiter(this, arguments, void 0, function* (threshold = 0.3, limit = 5) {
            const topics = yield this.getTopicsWithProgress();
            // Filter for topics with progress below threshold
            const gaps = topics.filter(t => t.progress < threshold);
            // Sort by progress (lowest first)
            gaps.sort((a, b) => a.progress - b.progress);
            return gaps.slice(0, limit).map(t => t.file);
        });
    }
    /**
     * Check if a subtopic is completed
     */
    isSubtopicCompleted(file) {
        var _a;
        const metadata = this.plugin.app.metadataCache.getFileCache(file);
        return ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.completed) === true;
    }
    /**
     * Get the parent topic for a subtopic
     */
    getParentTopic(subtopicFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const metadata = this.plugin.app.metadataCache.getFileCache(subtopicFile);
            if (!((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.parent))
                return null;
            const parentName = metadata.frontmatter.parent.replace(/\[\[(.*?)\]\]/, '$1');
            const parentFile = this.plugin.app.vault.getAbstractFileByPath(`${parentName}.md`);
            if (parentFile && parentFile instanceof obsidian.TFile) {
                return parentFile;
            }
            return null;
        });
    }
    /**
     * Generate a progress report for a topic
     */
    generateTopicReport(topicFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const metadata = this.plugin.app.metadataCache.getFileCache(topicFile);
            if (!(metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter))
                return "No metadata found for this topic.";
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
                    if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                        const subtopicMetadata = this.plugin.app.metadataCache.getFileCache(subtopicFile);
                        const isCompleted = ((_a = subtopicMetadata === null || subtopicMetadata === void 0 ? void 0 : subtopicMetadata.frontmatter) === null || _a === void 0 ? void 0 : _a.completed) === true;
                        const completionDate = ((_b = subtopicMetadata === null || subtopicMetadata === void 0 ? void 0 : subtopicMetadata.frontmatter) === null || _b === void 0 ? void 0 : _b.completion_date) || 'N/A';
                        report += `- ${isCompleted ? '✅' : '❌'} **${subtopicName}**`;
                        if (isCompleted) {
                            report += ` (Completed on: ${completionDate})`;
                        }
                        report += '\n';
                    }
                    else {
                        report += `- ❓ **${subtopicName}** (Missing)\n`;
                    }
                }
            }
            else {
                report += "No subtopics found for this topic.\n";
            }
            report += `\n## Recommendations\n\n`;
            if (progress === 0) {
                report += "You haven't started learning this topic yet. Create some subtopics to begin tracking your progress.\n";
            }
            else if (progress === 1) {
                report += "Congratulations! You've completed all subtopics for this topic.\n";
            }
            else {
                report += `You're making progress on this topic. Focus on completing the remaining subtopics to fill your knowledge gaps.\n`;
            }
            return report;
        });
    }
    /**
     * Generate an overall progress report
     */
    generateOverallReport() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const overall = yield this.getOverallProgress();
            const topicsByStatus = yield this.getTopicsByStatus();
            const recommendedTopics = yield this.getRecommendedTopics(3);
            const knowledgeGaps = yield this.getKnowledgeGaps(0.3, 3);
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
                    const progress = ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.progress) || 0;
                    const progressPercent = Math.round(progress * 100);
                    report += `- [[${topic.basename}]] (${progressPercent}% complete)\n`;
                }
            }
            else {
                report += "No topics in progress. Start learning a topic to get recommendations.\n";
            }
            report += `\n## Knowledge Gaps\n\n`;
            if (knowledgeGaps.length > 0) {
                for (const topic of knowledgeGaps) {
                    const metadata = this.plugin.app.metadataCache.getFileCache(topic);
                    const progress = ((_b = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _b === void 0 ? void 0 : _b.progress) || 0;
                    const progressPercent = Math.round(progress * 100);
                    report += `- [[${topic.basename}]] (${progressPercent}% complete)\n`;
                }
            }
            else {
                report += "No significant knowledge gaps found.\n";
            }
            return report;
        });
    }
}

const KNOWLEDGE_MAP_VIEW_TYPE = 'knowledge-map-view';
class KnowledgeMapView extends obsidian.ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.progressTracker = new ProgressTracker(plugin);
    }
    getViewType() {
        return KNOWLEDGE_MAP_VIEW_TYPE;
    }
    getDisplayText() {
        return 'Knowledge Map';
    }
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.renderView();
        });
    }
    renderView() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const topics = yield this.progressTracker.getTopicsWithProgress();
            if (topics.length === 0) {
                mapContainer.createEl('p', {
                    text: 'No learning topics found. Create a topic using the "Create Topic Note" command.',
                    cls: 'no-topics-message'
                });
                return;
            }
            // Create the knowledge map visualization
            yield this.createKnowledgeMap(mapContainer, topics);
        });
    }
    createKnowledgeMap(container, topics) {
        return __awaiter(this, void 0, void 0, function* () {
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
                }
                else if (topic.progress < 0.3) {
                    topicNode.addClass('node-low-progress');
                }
                else if (topic.progress < 0.7) {
                    topicNode.addClass('node-medium-progress');
                }
                else if (topic.progress < 1) {
                    topicNode.addClass('node-high-progress');
                }
                else {
                    topicNode.addClass('node-completed');
                }
                // Set node opacity based on progress (more progress = more opaque)
                topicNode.style.opacity = `${0.4 + topic.progress * 0.6}`;
                // Add topic name
                topicNode.createEl('div', {
                    cls: 'topic-node-name',
                    text: topic.file.basename
                });
                // Add progress indicator
                const progressPercent = Math.round(topic.progress * 100);
                topicNode.createEl('div', {
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
            container.createEl('div', {
                cls: 'knowledge-map-instructions',
                text: 'Click on a topic node to open it. Node size represents the number of subtopics, color represents progress level, and opacity increases with progress.'
            });
        });
    }
}

class ProgressRenderer {
    constructor(plugin) {
        this.plugin = plugin;
    }
    /**
     * Render progress information in a topic note
     */
    renderProgressInNote(file) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.plugin.settings.showProgressBar)
                return;
            const metadata = this.plugin.app.metadataCache.getFileCache(file);
            if (!((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.type) || metadata.frontmatter.type !== 'topic')
                return;
            try {
                // Read the file content
                const content = yield this.plugin.app.vault.read(file);
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
                    const updatedContent = content.replace(progressSectionRegex, `## Progress\n${progressContent}`);
                    // Update the file if content changed
                    if (updatedContent !== content) {
                        yield this.plugin.app.vault.modify(file, updatedContent);
                    }
                }
            }
            catch (error) {
                console.error('Error rendering progress in note:', error);
            }
        });
    }
    /**
     * Create an ASCII progress bar
     */
    createProgressBar(progress) {
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
    renderCompletionStatus(file) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const metadata = this.plugin.app.metadataCache.getFileCache(file);
            if (!((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.type) || metadata.frontmatter.type !== 'subtopic')
                return;
            try {
                // Read the file content
                const content = yield this.plugin.app.vault.read(file);
                // Check if the status line exists
                const statusRegex = /Status: (❌ Not completed|✅ Completed)/;
                const match = content.match(statusRegex);
                if (match) {
                    const isCompleted = metadata.frontmatter.completed === true;
                    const newStatusText = isCompleted ? '✅ Completed' : '❌ Not completed';
                    // Only update if status has changed
                    if (match[1] !== newStatusText) {
                        const updatedContent = content.replace(statusRegex, `Status: ${newStatusText}`);
                        yield this.plugin.app.vault.modify(file, updatedContent);
                    }
                }
            }
            catch (error) {
                console.error('Error rendering completion status:', error);
            }
        });
    }
    /**
     * Add a visual indicator to the note title in the file explorer
     * Note: This requires CSS styling to be effective
     */
    addVisualIndicatorToTitle(file) {
        // This would typically be implemented using CSS classes
        // For example, adding a class to the file explorer item based on completion status
        // Since direct DOM manipulation of the file explorer is not recommended,
        // this would be better implemented using CSS selectors based on file attributes
    }
    /**
     * Create a detailed progress report for a topic
     */
    createProgressReport(file) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const metadata = this.plugin.app.metadataCache.getFileCache(file);
            if (!(metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter))
                return "No metadata found for this topic.";
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
                    if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                        const subtopicMetadata = this.plugin.app.metadataCache.getFileCache(subtopicFile);
                        const isCompleted = ((_a = subtopicMetadata === null || subtopicMetadata === void 0 ? void 0 : subtopicMetadata.frontmatter) === null || _a === void 0 ? void 0 : _a.completed) === true;
                        const completionDate = ((_b = subtopicMetadata === null || subtopicMetadata === void 0 ? void 0 : subtopicMetadata.frontmatter) === null || _b === void 0 ? void 0 : _b.completion_date) || '';
                        report += `- ${isCompleted ? '✅' : '❌'} [[${subtopicName}]]`;
                        if (isCompleted && completionDate) {
                            report += ` (Completed: ${completionDate})`;
                        }
                        report += '\n';
                    }
                    else {
                        report += `- ❓ [[${subtopicName}]] (Missing)\n`;
                    }
                }
            }
            else {
                report += "No subtopics found for this topic.\n";
            }
            // Recommendations
            report += `\n## Next Steps\n\n`;
            if (progress === 0) {
                report += "You haven't started learning this topic yet. Create some subtopics to begin tracking your progress.\n";
            }
            else if (progress === 1) {
                report += "Congratulations! You've completed all subtopics for this topic.\n";
            }
            else {
                report += `You're making progress on this topic. Focus on completing the remaining subtopics:\n\n`;
                // List incomplete subtopics
                if (metadata.frontmatter.subtopics && metadata.frontmatter.subtopics.length > 0) {
                    for (const subtopic of metadata.frontmatter.subtopics) {
                        const subtopicName = subtopic.replace(/\[\[(.*?)\]\]/, '$1');
                        const subtopicFile = this.plugin.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                        if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                            const subtopicMetadata = this.plugin.app.metadataCache.getFileCache(subtopicFile);
                            const isCompleted = ((_c = subtopicMetadata === null || subtopicMetadata === void 0 ? void 0 : subtopicMetadata.frontmatter) === null || _c === void 0 ? void 0 : _c.completed) === true;
                            if (!isCompleted) {
                                report += `- [[${subtopicName}]]\n`;
                            }
                        }
                    }
                }
            }
            return report;
        });
    }
}

class LearningProgressSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Learning Progress Settings' });
        new obsidian.Setting(containerEl)
            .setName('Show Progress Bar')
            .setDesc('Show progress bar in topic notes')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.showProgressBar)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.showProgressBar = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Show Knowledge Map')
            .setDesc('Show knowledge map in sidebar')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.showKnowledgeMap)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.showKnowledgeMap = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Topic Template')
            .setDesc('Template for new topic notes')
            .addTextArea(text => text
            .setValue(this.plugin.settings.defaultTopicTemplate)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.defaultTopicTemplate = value;
            yield this.plugin.saveSettings();
        })))
            .setClass('template-setting');
        new obsidian.Setting(containerEl)
            .setName('Subtopic Template')
            .setDesc('Template for new subtopic notes')
            .addTextArea(text => text
            .setValue(this.plugin.settings.defaultSubtopicTemplate)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.defaultSubtopicTemplate = value;
            yield this.plugin.saveSettings();
        })))
            .setClass('template-setting');
    }
}

const DEFAULT_SETTINGS = {
    defaultTopicTemplate: "---\ntype: topic\nprogress: 0\nsubtopics: []\ntotal_subtopics: 0\ncompleted_subtopics: 0\n---\n\n# {{title}}\n\n## Progress\n\n0% complete\n\n## Subtopics\n\n",
    defaultSubtopicTemplate: "---\ntype: subtopic\nparent: \"[[{{parent}}]]\"\ncompleted: false\n---\n\n# {{title}}\n\nStatus: ❌ Not completed\n\n## Notes\n\n",
    showProgressBar: true,
    showKnowledgeMap: true
};
class LearningProgressPlugin extends obsidian.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            // Initialize components
            this.progressRenderer = new ProgressRenderer(this);
            this.progressTracker = new ProgressTracker(this);
            // Register views
            this.registerView(SUBTOPIC_TRACKER_VIEW_TYPE, (leaf) => new SubtopicTrackerView(leaf, this));
            this.registerView(KNOWLEDGE_MAP_VIEW_TYPE, (leaf) => new KnowledgeMapView(leaf, this));
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
                editorCallback: (editor, view) => {
                    var _a;
                    const file = view.file;
                    if (file) {
                        const metadata = this.app.metadataCache.getFileCache(file);
                        if (((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.type) === 'topic') {
                            new SubtopicCreationModal(this.app, this, file.basename).open();
                        }
                        else {
                            new obsidian.Notice('Current note is not a topic note. Please open a topic note first.');
                        }
                    }
                }
            });
            this.addCommand({
                id: 'toggle-subtopic-completion',
                name: 'Toggle Subtopic Completion',
                editorCallback: (editor, view) => {
                    var _a;
                    const file = view.file;
                    if (file) {
                        const metadata = this.app.metadataCache.getFileCache(file);
                        if (((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.type) === 'subtopic') {
                            this.toggleSubtopicCompletion(file);
                        }
                        else {
                            new obsidian.Notice('Current note is not a subtopic note. Please open a subtopic note first.');
                        }
                    }
                }
            });
            this.addCommand({
                id: 'show-subtopic-tracker',
                name: 'Show Subtopic Tracker',
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    this.activateView(SUBTOPIC_TRACKER_VIEW_TYPE);
                })
            });
            this.addCommand({
                id: 'show-knowledge-map',
                name: 'Show Knowledge Map',
                callback: () => __awaiter(this, void 0, void 0, function* () {
                    this.activateView(KNOWLEDGE_MAP_VIEW_TYPE);
                })
            });
            // Register event listeners
            this.registerEvent(this.app.workspace.on('active-leaf-change', (leaf) => {
                if (leaf && leaf.view instanceof obsidian.MarkdownView) {
                    const file = leaf.view.file;
                    if (file) {
                        this.progressRenderer.renderProgressInNote(file);
                        this.progressRenderer.renderCompletionStatus(file);
                    }
                }
            }));
            this.registerEvent(this.app.metadataCache.on('changed', (file) => {
                this.updateProgressIfNeeded(file);
            }));
            // Add settings tab
            this.addSettingTab(new LearningProgressSettingTab(this.app, this));
            // Add ribbon icon
            this.addRibbonIcon('graduation-cap', 'Learning Progress', () => {
                this.activateView(SUBTOPIC_TRACKER_VIEW_TYPE);
            });
        });
    }
    onunload() {
        console.log('Learning Progress Plugin unloaded');
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    activateView(viewType) {
        return __awaiter(this, void 0, void 0, function* () {
            const { workspace } = this.app;
            // Check if view is already open
            let leaf = workspace.getLeavesOfType(viewType)[0];
            if (!leaf) {
                // Create new leaf in the right sidebar
                leaf = workspace.getRightLeaf(false);
                yield leaf.setViewState({ type: viewType });
            }
            // Reveal the leaf
            workspace.revealLeaf(leaf);
        });
    }
    createTopicNote(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = this.settings.defaultTopicTemplate.replace('{{title}}', title);
            const fileName = `${title}.md`;
            try {
                const existingFile = this.app.vault.getAbstractFileByPath(fileName);
                if (existingFile) {
                    new obsidian.Notice(`Note "${fileName}" already exists`);
                    return;
                }
                const file = yield this.app.vault.create(fileName, content);
                new obsidian.Notice(`Topic note "${title}" created`);
                // Open the newly created file
                this.app.workspace.getLeaf().openFile(file);
            }
            catch (error) {
                console.error('Error creating topic note:', error);
                new obsidian.Notice('Error creating topic note');
            }
        });
    }
    createSubtopicNote(title, parentTopic) {
        return __awaiter(this, void 0, void 0, function* () {
            const content = this.settings.defaultSubtopicTemplate
                .replace('{{title}}', title)
                .replace('{{parent}}', parentTopic);
            const fileName = `${title}.md`;
            try {
                const existingFile = this.app.vault.getAbstractFileByPath(fileName);
                if (existingFile) {
                    new obsidian.Notice(`Note "${fileName}" already exists`);
                    return;
                }
                const file = yield this.app.vault.create(fileName, content);
                new obsidian.Notice(`Subtopic note "${title}" created`);
                // Update parent topic's subtopics list
                yield this.addSubtopicToParent(parentTopic, title);
                // Open the newly created file
                this.app.workspace.getLeaf().openFile(file);
            }
            catch (error) {
                console.error('Error creating subtopic note:', error);
                new obsidian.Notice('Error creating subtopic note');
            }
        });
    }
    addSubtopicToParent(parentTopic, subtopicTitle) {
        return __awaiter(this, void 0, void 0, function* () {
            const parentFile = this.app.vault.getAbstractFileByPath(`${parentTopic}.md`);
            if (!parentFile || !(parentFile instanceof obsidian.TFile)) {
                new obsidian.Notice(`Parent topic "${parentTopic}" not found`);
                return;
            }
            try {
                // Read the parent file content
                const content = yield this.app.vault.read(parentFile);
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
                        }
                        else {
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
                    }
                    else {
                        // Add subtopics field if it doesn't exist
                        frontmatter += `\nsubtopics:\n  - "${subtopicLink}"`;
                    }
                    // Update total_subtopics count
                    const totalSubtopicsRegex = /total_subtopics: (\d+)/;
                    const totalMatch = frontmatter.match(totalSubtopicsRegex);
                    if (totalMatch) {
                        const currentTotal = parseInt(totalMatch[1]);
                        frontmatter = frontmatter.replace(totalSubtopicsRegex, `total_subtopics: ${currentTotal + 1}`);
                    }
                    else {
                        frontmatter += `\ntotal_subtopics: 1`;
                    }
                    // Replace frontmatter in content
                    const updatedContent = content.replace(frontmatterRegex, `---\n${frontmatter}\n---`);
                    // Update the file
                    yield this.app.vault.modify(parentFile, updatedContent);
                    // Also add to the subtopics list in the content if it exists
                    yield this.addSubtopicToContentList(parentFile);
                }
            }
            catch (error) {
                console.error('Error updating parent topic:', error);
                new obsidian.Notice('Error updating parent topic');
            }
        });
    }
    addSubtopicToContentList(parentFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const content = yield this.app.vault.read(parentFile);
                const metadata = this.app.metadataCache.getFileCache(parentFile);
                if ((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.subtopics) {
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
                                const subtopicName = subtopic.replace(/\[\[(.*?)\]\]/, '$1');
                                const subtopicFile = this.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                                if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                                    const subtopicMetadata = this.app.metadataCache.getFileCache(subtopicFile);
                                    const isCompleted = ((_b = subtopicMetadata === null || subtopicMetadata === void 0 ? void 0 : subtopicMetadata.frontmatter) === null || _b === void 0 ? void 0 : _b.completed) === true;
                                    subtopicsList += `- ${subtopic} ${isCompleted ? '✅' : '❌'}\n`;
                                }
                                else {
                                    subtopicsList += `- ${subtopic} ❌\n`;
                                }
                            }
                        }
                        // Replace the subtopics section content
                        const updatedSubtopicsSection = `## Subtopics\n\n${subtopicsList}`;
                        const updatedContent = content.replace(subtopicsSectionRegex, updatedSubtopicsSection);
                        yield this.app.vault.modify(parentFile, updatedContent);
                    }
                }
            }
            catch (error) {
                console.error('Error updating subtopics list in content:', error);
            }
        });
    }
    toggleSubtopicCompletion(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const metadata = this.app.metadataCache.getFileCache(file);
                if (!(metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter))
                    return;
                const isCompleted = metadata.frontmatter.completed === true;
                const newStatus = !isCompleted;
                // Read the file content
                const content = yield this.app.vault.read(file);
                // Update frontmatter
                const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
                const match = content.match(frontmatterRegex);
                if (match) {
                    let frontmatter = match[1];
                    // Update completed status
                    if (frontmatter.includes('completed:')) {
                        frontmatter = frontmatter.replace(/completed: (true|false)/, `completed: ${newStatus}`);
                    }
                    else {
                        frontmatter += `\ncompleted: ${newStatus}`;
                    }
                    // Add completion date if being marked as completed
                    if (newStatus) {
                        const today = new Date().toISOString().split('T')[0];
                        if (frontmatter.includes('completion_date:')) {
                            frontmatter = frontmatter.replace(/completion_date: .*/, `completion_date: ${today}`);
                        }
                        else {
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
                    yield this.app.vault.modify(file, updatedContent);
                    // Update parent topic progress
                    if (metadata.frontmatter.parent) {
                        const parentName = metadata.frontmatter.parent.replace(/\[\[(.*?)\]\]/, '$1');
                        const parentFile = this.app.vault.getAbstractFileByPath(`${parentName}.md`);
                        if (parentFile && parentFile instanceof obsidian.TFile) {
                            yield this.updateTopicProgress(parentFile);
                        }
                    }
                    new obsidian.Notice(`Subtopic marked as ${newStatus ? 'completed' : 'not completed'}`);
                }
            }
            catch (error) {
                console.error('Error toggling subtopic completion:', error);
                new obsidian.Notice('Error updating subtopic status');
            }
        });
    }
    updateTopicProgress(file) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const metadata = this.app.metadataCache.getFileCache(file);
                if (!((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.type) || metadata.frontmatter.type !== 'topic')
                    return;
                const subtopics = metadata.frontmatter.subtopics || [];
                if (!subtopics.length)
                    return;
                let completedCount = 0;
                const totalCount = subtopics.length;
                // Count completed subtopics
                for (const subtopic of subtopics) {
                    const subtopicName = subtopic.replace(/\[\[(.*?)\]\]/, '$1');
                    const subtopicFile = this.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                    if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                        const subtopicMetadata = this.app.metadataCache.getFileCache(subtopicFile);
                        if (((_b = subtopicMetadata === null || subtopicMetadata === void 0 ? void 0 : subtopicMetadata.frontmatter) === null || _b === void 0 ? void 0 : _b.completed) === true) {
                            completedCount++;
                        }
                    }
                }
                // Calculate progress
                const progress = totalCount > 0 ? completedCount / totalCount : 0;
                const progressPercent = Math.round(progress * 100);
                // Read the file content
                const content = yield this.app.vault.read(file);
                // Update frontmatter
                const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
                const match = content.match(frontmatterRegex);
                if (match) {
                    let frontmatter = match[1];
                    // Update progress
                    if (frontmatter.includes('progress:')) {
                        frontmatter = frontmatter.replace(/progress: [\d\.]+/, `progress: ${progress.toFixed(2)}`);
                    }
                    else {
                        frontmatter += `\nprogress: ${progress.toFixed(2)}`;
                    }
                    // Update completed_subtopics
                    if (frontmatter.includes('completed_subtopics:')) {
                        frontmatter = frontmatter.replace(/completed_subtopics: \d+/, `completed_subtopics: ${completedCount}`);
                    }
                    else {
                        frontmatter += `\ncompleted_subtopics: ${completedCount}`;
                    }
                    // Update total_subtopics
                    if (frontmatter.includes('total_subtopics:')) {
                        frontmatter = frontmatter.replace(/total_subtopics: \d+/, `total_subtopics: ${totalCount}`);
                    }
                    else {
                        frontmatter += `\ntotal_subtopics: ${totalCount}`;
                    }
                    // Replace frontmatter in content
                    let updatedContent = content.replace(frontmatterRegex, `---\n${frontmatter}\n---`);
                    // Update progress in content
                    const progressRegex = /## Progress\s*\n\s*\d+% complete/;
                    const progressMatch = updatedContent.match(progressRegex);
                    if (progressMatch) {
                        updatedContent = updatedContent.replace(progressRegex, `## Progress\n\n${progressPercent}% complete`);
                    }
                    // Update the file
                    yield this.app.vault.modify(file, updatedContent);
                    // Update subtopics list with completion status
                    yield this.addSubtopicToContentList(file);
                }
            }
            catch (error) {
                console.error('Error updating topic progress:', error);
            }
        });
    }
    updateProgressIfNeeded(file) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const metadata = this.app.metadataCache.getFileCache(file);
            if (((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.type) === 'subtopic') {
                // If a subtopic was modified, update its parent
                if (metadata.frontmatter.parent) {
                    const parentName = metadata.frontmatter.parent.replace(/\[\[(.*?)\]\]/, '$1');
                    const parentFile = this.app.vault.getAbstractFileByPath(`${parentName}.md`);
                    if (parentFile && parentFile instanceof obsidian.TFile) {
                        yield this.updateTopicProgress(parentFile);
                    }
                }
            }
            else if (((_b = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _b === void 0 ? void 0 : _b.type) === 'topic') {
                // If a topic was modified, update its progress
                yield this.updateTopicProgress(file);
            }
        });
    }
}
class TopicCreationModal extends obsidian.Modal {
    constructor(app, plugin) {
        super(app);
        this.topicName = '';
        this.plugin = plugin;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Create New Learning Topic' });
        new obsidian.Setting(contentEl)
            .setName('Topic Name')
            .setDesc('Enter the name of your learning topic')
            .addText(text => text
            .setPlaceholder('e.g., AWS S3')
            .setValue(this.topicName)
            .onChange(value => {
            this.topicName = value;
        }));
        new obsidian.Setting(contentEl)
            .addButton(btn => btn
            .setButtonText('Create')
            .setCta()
            .onClick(() => {
            if (this.topicName) {
                this.plugin.createTopicNote(this.topicName);
                this.close();
            }
            else {
                new obsidian.Notice('Please enter a topic name');
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
class SubtopicCreationModal extends obsidian.Modal {
    constructor(app, plugin, parentTopic) {
        super(app);
        this.subtopicName = '';
        this.plugin = plugin;
        this.parentTopic = parentTopic;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Create New Subtopic' });
        contentEl.createEl('p', { text: `Parent Topic: ${this.parentTopic}` });
        new obsidian.Setting(contentEl)
            .setName('Subtopic Name')
            .setDesc('Enter the name of your subtopic')
            .addText(text => text
            .setPlaceholder('e.g., S3 Buckets')
            .setValue(this.subtopicName)
            .onChange(value => {
            this.subtopicName = value;
        }));
        new obsidian.Setting(contentEl)
            .addButton(btn => btn
            .setButtonText('Create')
            .setCta()
            .onClick(() => {
            if (this.subtopicName) {
                this.plugin.createSubtopicNote(this.subtopicName, this.parentTopic);
                this.close();
            }
            else {
                new obsidian.Notice('Please enter a subtopic name');
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

module.exports = LearningProgressPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInNyYy92aWV3cy9TdWJ0b3BpY1RyYWNrZXJWaWV3LnRzIiwic3JjL3RyYWNraW5nL1Byb2dyZXNzVHJhY2tlci50cyIsInNyYy92aWV3cy9Lbm93bGVkZ2VNYXBWaWV3LnRzIiwic3JjL3JlbmRlcmluZy9Qcm9ncmVzc1JlbmRlcmVyLnRzIiwic3JjL3NldHRpbmdzL1NldHRpbmdzVGFiLnRzIiwic3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlLCBTdXBwcmVzc2VkRXJyb3IsIFN5bWJvbCwgSXRlcmF0b3IgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXNEZWNvcmF0ZShjdG9yLCBkZXNjcmlwdG9ySW4sIGRlY29yYXRvcnMsIGNvbnRleHRJbiwgaW5pdGlhbGl6ZXJzLCBleHRyYUluaXRpYWxpemVycykge1xyXG4gICAgZnVuY3Rpb24gYWNjZXB0KGYpIHsgaWYgKGYgIT09IHZvaWQgMCAmJiB0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRnVuY3Rpb24gZXhwZWN0ZWRcIik7IHJldHVybiBmOyB9XHJcbiAgICB2YXIga2luZCA9IGNvbnRleHRJbi5raW5kLCBrZXkgPSBraW5kID09PSBcImdldHRlclwiID8gXCJnZXRcIiA6IGtpbmQgPT09IFwic2V0dGVyXCIgPyBcInNldFwiIDogXCJ2YWx1ZVwiO1xyXG4gICAgdmFyIHRhcmdldCA9ICFkZXNjcmlwdG9ySW4gJiYgY3RvciA/IGNvbnRleHRJbltcInN0YXRpY1wiXSA/IGN0b3IgOiBjdG9yLnByb3RvdHlwZSA6IG51bGw7XHJcbiAgICB2YXIgZGVzY3JpcHRvciA9IGRlc2NyaXB0b3JJbiB8fCAodGFyZ2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGNvbnRleHRJbi5uYW1lKSA6IHt9KTtcclxuICAgIHZhciBfLCBkb25lID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4pIGNvbnRleHRbcF0gPSBwID09PSBcImFjY2Vzc1wiID8ge30gOiBjb250ZXh0SW5bcF07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4uYWNjZXNzKSBjb250ZXh0LmFjY2Vzc1twXSA9IGNvbnRleHRJbi5hY2Nlc3NbcF07XHJcbiAgICAgICAgY29udGV4dC5hZGRJbml0aWFsaXplciA9IGZ1bmN0aW9uIChmKSB7IGlmIChkb25lKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGFkZCBpbml0aWFsaXplcnMgYWZ0ZXIgZGVjb3JhdGlvbiBoYXMgY29tcGxldGVkXCIpOyBleHRyYUluaXRpYWxpemVycy5wdXNoKGFjY2VwdChmIHx8IG51bGwpKTsgfTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gKDAsIGRlY29yYXRvcnNbaV0pKGtpbmQgPT09IFwiYWNjZXNzb3JcIiA/IHsgZ2V0OiBkZXNjcmlwdG9yLmdldCwgc2V0OiBkZXNjcmlwdG9yLnNldCB9IDogZGVzY3JpcHRvcltrZXldLCBjb250ZXh0KTtcclxuICAgICAgICBpZiAoa2luZCA9PT0gXCJhY2Nlc3NvclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZFwiKTtcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmdldCkpIGRlc2NyaXB0b3IuZ2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LnNldCkpIGRlc2NyaXB0b3Iuc2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmluaXQpKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoXyA9IGFjY2VwdChyZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGlmIChraW5kID09PSBcImZpZWxkXCIpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xyXG4gICAgICAgICAgICBlbHNlIGRlc2NyaXB0b3Jba2V5XSA9IF87XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRhcmdldCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgY29udGV4dEluLm5hbWUsIGRlc2NyaXB0b3IpO1xyXG4gICAgZG9uZSA9IHRydWU7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19ydW5Jbml0aWFsaXplcnModGhpc0FyZywgaW5pdGlhbGl6ZXJzLCB2YWx1ZSkge1xyXG4gICAgdmFyIHVzZVZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRpYWxpemVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhbHVlID0gdXNlVmFsdWUgPyBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnLCB2YWx1ZSkgOiBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1c2VWYWx1ZSA/IHZhbHVlIDogdm9pZCAwO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcHJvcEtleSh4KSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCIgPyB4IDogXCJcIi5jb25jYXQoeCk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zZXRGdW5jdGlvbk5hbWUoZiwgbmFtZSwgcHJlZml4KSB7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIG5hbWUgPSBuYW1lLmRlc2NyaXB0aW9uID8gXCJbXCIuY29uY2F0KG5hbWUuZGVzY3JpcHRpb24sIFwiXVwiKSA6IFwiXCI7XHJcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGYsIFwibmFtZVwiLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHByZWZpeCA/IFwiXCIuY29uY2F0KHByZWZpeCwgXCIgXCIsIG5hbWUpIDogbmFtZSB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGcgPSBPYmplY3QuY3JlYXRlKCh0eXBlb2YgSXRlcmF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IEl0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpO1xyXG4gICAgcmV0dXJuIGcubmV4dCA9IHZlcmIoMCksIGdbXCJ0aHJvd1wiXSA9IHZlcmIoMSksIGdbXCJyZXR1cm5cIl0gPSB2ZXJiKDIpLCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XHJcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xyXG4gICAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIG8pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgcCkpIF9fY3JlYXRlQmluZGluZyhvLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheSh0bywgZnJvbSwgcGFjaykge1xyXG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XHJcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XHJcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IE9iamVjdC5jcmVhdGUoKHR5cGVvZiBBc3luY0l0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBBc3luY0l0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpLCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIsIGF3YWl0UmV0dXJuKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gYXdhaXRSZXR1cm4oZikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGYsIHJlamVjdCk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpZiAoZ1tuXSkgeyBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyBpZiAoZikgaVtuXSA9IGYoaVtuXSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IGZhbHNlIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbnZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xyXG4gICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgICAgdmFyIGFyID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcclxuICAgICAgICByZXR1cm4gYXI7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIG93bktleXMobyk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4oc3RhdGUsIHJlY2VpdmVyKSB7XHJcbiAgICBpZiAocmVjZWl2ZXIgPT09IG51bGwgfHwgKHR5cGVvZiByZWNlaXZlciAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVjZWl2ZXIgIT09IFwiZnVuY3Rpb25cIikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlICdpbicgb3BlcmF0b3Igb24gbm9uLW9iamVjdFwiKTtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyID09PSBzdGF0ZSA6IHN0YXRlLmhhcyhyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZShlbnYsIHZhbHVlLCBhc3luYykge1xyXG4gICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkLlwiKTtcclxuICAgICAgICB2YXIgZGlzcG9zZSwgaW5uZXI7XHJcbiAgICAgICAgaWYgKGFzeW5jKSB7XHJcbiAgICAgICAgICAgIGlmICghU3ltYm9sLmFzeW5jRGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0Rpc3Bvc2UgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgICAgICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmFzeW5jRGlzcG9zZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaXNwb3NlID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKCFTeW1ib2wuZGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5kaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgICAgICAgICAgZGlzcG9zZSA9IHZhbHVlW1N5bWJvbC5kaXNwb3NlXTtcclxuICAgICAgICAgICAgaWYgKGFzeW5jKSBpbm5lciA9IGRpc3Bvc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IG5vdCBkaXNwb3NhYmxlLlwiKTtcclxuICAgICAgICBpZiAoaW5uZXIpIGRpc3Bvc2UgPSBmdW5jdGlvbigpIHsgdHJ5IHsgaW5uZXIuY2FsbCh0aGlzKTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7IH0gfTtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IHZhbHVlOiB2YWx1ZSwgZGlzcG9zZTogZGlzcG9zZSwgYXN5bmM6IGFzeW5jIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYXN5bmMpIHtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IGFzeW5jOiB0cnVlIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG5cclxufVxyXG5cclxudmFyIF9TdXBwcmVzc2VkRXJyb3IgPSB0eXBlb2YgU3VwcHJlc3NlZEVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBTdXBwcmVzc2VkRXJyb3IgOiBmdW5jdGlvbiAoZXJyb3IsIHN1cHByZXNzZWQsIG1lc3NhZ2UpIHtcclxuICAgIHZhciBlID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgcmV0dXJuIGUubmFtZSA9IFwiU3VwcHJlc3NlZEVycm9yXCIsIGUuZXJyb3IgPSBlcnJvciwgZS5zdXBwcmVzc2VkID0gc3VwcHJlc3NlZCwgZTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2Rpc3Bvc2VSZXNvdXJjZXMoZW52KSB7XHJcbiAgICBmdW5jdGlvbiBmYWlsKGUpIHtcclxuICAgICAgICBlbnYuZXJyb3IgPSBlbnYuaGFzRXJyb3IgPyBuZXcgX1N1cHByZXNzZWRFcnJvcihlLCBlbnYuZXJyb3IsIFwiQW4gZXJyb3Igd2FzIHN1cHByZXNzZWQgZHVyaW5nIGRpc3Bvc2FsLlwiKSA6IGU7XHJcbiAgICAgICAgZW52Lmhhc0Vycm9yID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciByLCBzID0gMDtcclxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPSBlbnYuc3RhY2sucG9wKCkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmICghci5hc3luYyAmJiBzID09PSAxKSByZXR1cm4gcyA9IDAsIGVudi5zdGFjay5wdXNoKHIpLCBQcm9taXNlLnJlc29sdmUoKS50aGVuKG5leHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHIuZGlzcG9zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByLmRpc3Bvc2UuY2FsbChyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoci5hc3luYykgcmV0dXJuIHMgfD0gMiwgUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkudGhlbihuZXh0LCBmdW5jdGlvbihlKSB7IGZhaWwoZSk7IHJldHVybiBuZXh0KCk7IH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBzIHw9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGZhaWwoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMgPT09IDEpIHJldHVybiBlbnYuaGFzRXJyb3IgPyBQcm9taXNlLnJlamVjdChlbnYuZXJyb3IpIDogUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgaWYgKGVudi5oYXNFcnJvcikgdGhyb3cgZW52LmVycm9yO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5leHQoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uKHBhdGgsIHByZXNlcnZlSnN4KSB7XHJcbiAgICBpZiAodHlwZW9mIHBhdGggPT09IFwic3RyaW5nXCIgJiYgL15cXC5cXC4/XFwvLy50ZXN0KHBhdGgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFwuKHRzeCkkfCgoPzpcXC5kKT8pKCg/OlxcLlteLi9dKz8pPylcXC4oW2NtXT8pdHMkL2ksIGZ1bmN0aW9uIChtLCB0c3gsIGQsIGV4dCwgY20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRzeCA/IHByZXNlcnZlSnN4ID8gXCIuanN4XCIgOiBcIi5qc1wiIDogZCAmJiAoIWV4dCB8fCAhY20pID8gbSA6IChkICsgZXh0ICsgXCIuXCIgKyBjbS50b0xvd2VyQ2FzZSgpICsgXCJqc1wiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXRoO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBfX2V4dGVuZHM6IF9fZXh0ZW5kcyxcclxuICAgIF9fYXNzaWduOiBfX2Fzc2lnbixcclxuICAgIF9fcmVzdDogX19yZXN0LFxyXG4gICAgX19kZWNvcmF0ZTogX19kZWNvcmF0ZSxcclxuICAgIF9fcGFyYW06IF9fcGFyYW0sXHJcbiAgICBfX2VzRGVjb3JhdGU6IF9fZXNEZWNvcmF0ZSxcclxuICAgIF9fcnVuSW5pdGlhbGl6ZXJzOiBfX3J1bkluaXRpYWxpemVycyxcclxuICAgIF9fcHJvcEtleTogX19wcm9wS2V5LFxyXG4gICAgX19zZXRGdW5jdGlvbk5hbWU6IF9fc2V0RnVuY3Rpb25OYW1lLFxyXG4gICAgX19tZXRhZGF0YTogX19tZXRhZGF0YSxcclxuICAgIF9fYXdhaXRlcjogX19hd2FpdGVyLFxyXG4gICAgX19nZW5lcmF0b3I6IF9fZ2VuZXJhdG9yLFxyXG4gICAgX19jcmVhdGVCaW5kaW5nOiBfX2NyZWF0ZUJpbmRpbmcsXHJcbiAgICBfX2V4cG9ydFN0YXI6IF9fZXhwb3J0U3RhcixcclxuICAgIF9fdmFsdWVzOiBfX3ZhbHVlcyxcclxuICAgIF9fcmVhZDogX19yZWFkLFxyXG4gICAgX19zcHJlYWQ6IF9fc3ByZWFkLFxyXG4gICAgX19zcHJlYWRBcnJheXM6IF9fc3ByZWFkQXJyYXlzLFxyXG4gICAgX19zcHJlYWRBcnJheTogX19zcHJlYWRBcnJheSxcclxuICAgIF9fYXdhaXQ6IF9fYXdhaXQsXHJcbiAgICBfX2FzeW5jR2VuZXJhdG9yOiBfX2FzeW5jR2VuZXJhdG9yLFxyXG4gICAgX19hc3luY0RlbGVnYXRvcjogX19hc3luY0RlbGVnYXRvcixcclxuICAgIF9fYXN5bmNWYWx1ZXM6IF9fYXN5bmNWYWx1ZXMsXHJcbiAgICBfX21ha2VUZW1wbGF0ZU9iamVjdDogX19tYWtlVGVtcGxhdGVPYmplY3QsXHJcbiAgICBfX2ltcG9ydFN0YXI6IF9faW1wb3J0U3RhcixcclxuICAgIF9faW1wb3J0RGVmYXVsdDogX19pbXBvcnREZWZhdWx0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZEdldDogX19jbGFzc1ByaXZhdGVGaWVsZEdldCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRTZXQ6IF9fY2xhc3NQcml2YXRlRmllbGRTZXQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkSW46IF9fY2xhc3NQcml2YXRlRmllbGRJbixcclxuICAgIF9fYWRkRGlzcG9zYWJsZVJlc291cmNlOiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZSxcclxuICAgIF9fZGlzcG9zZVJlc291cmNlczogX19kaXNwb3NlUmVzb3VyY2VzLFxyXG4gICAgX19yZXdyaXRlUmVsYXRpdmVJbXBvcnRFeHRlbnNpb246IF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uLFxyXG59O1xyXG4iLCJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgTGVhcm5pbmdQcm9ncmVzc1BsdWdpbiBmcm9tICcuLi9tYWluJztcblxuZXhwb3J0IGNvbnN0IFNVQlRPUElDX1RSQUNLRVJfVklFV19UWVBFID0gJ3N1YnRvcGljLXRyYWNrZXItdmlldyc7XG5cbmV4cG9ydCBjbGFzcyBTdWJ0b3BpY1RyYWNrZXJWaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xuICAgIHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbjtcblxuICAgIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbikge1xuICAgICAgICBzdXBlcihsZWFmKTtcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgfVxuXG4gICAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFNVQlRPUElDX1RSQUNLRVJfVklFV19UWVBFO1xuICAgIH1cblxuICAgIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAnU3VidG9waWMgVHJhY2tlcic7XG4gICAgfVxuXG4gICAgYXN5bmMgb25PcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLnJlbmRlclZpZXcoKTtcbiAgICB9XG5cbiAgICBhc3luYyByZW5kZXJWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lckVsLmNoaWxkcmVuWzFdO1xuICAgICAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdMZWFybmluZyBQcm9ncmVzcyBUcmFja2VyJyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSB0YWJzIGZvciBkaWZmZXJlbnQgdmlld3NcbiAgICAgICAgY29uc3QgdGFic0NvbnRhaW5lciA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICduYXYtYnV0dG9ucy1jb250YWluZXInIH0pO1xuICAgICAgICBjb25zdCBhbGxUb3BpY3NUYWIgPSB0YWJzQ29udGFpbmVyLmNyZWF0ZUVsKCdidXR0b24nLCB7IFxuICAgICAgICAgICAgdGV4dDogJ0FsbCBUb3BpY3MnLFxuICAgICAgICAgICAgY2xzOiAnbmF2LWJ1dHRvbiBuYXYtYnV0dG9uLWFjdGl2ZSdcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGluUHJvZ3Jlc3NUYWIgPSB0YWJzQ29udGFpbmVyLmNyZWF0ZUVsKCdidXR0b24nLCB7IFxuICAgICAgICAgICAgdGV4dDogJ0luIFByb2dyZXNzJyxcbiAgICAgICAgICAgIGNsczogJ25hdi1idXR0b24nXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBjb21wbGV0ZWRUYWIgPSB0YWJzQ29udGFpbmVyLmNyZWF0ZUVsKCdidXR0b24nLCB7IFxuICAgICAgICAgICAgdGV4dDogJ0NvbXBsZXRlZCcsXG4gICAgICAgICAgICBjbHM6ICduYXYtYnV0dG9uJ1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbnRlbnQgY29udGFpbmVyXG4gICAgICAgIGNvbnN0IGNvbnRlbnRDb250YWluZXIgPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAndHJhY2tlci1jb250ZW50JyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIEluaXRpYWwgcmVuZGVyIG9mIGFsbCB0b3BpY3NcbiAgICAgICAgYXdhaXQgdGhpcy5yZW5kZXJBbGxUb3BpY3MoY29udGVudENvbnRhaW5lcik7XG4gICAgICAgIFxuICAgICAgICAvLyBUYWIgY2xpY2sgaGFuZGxlcnNcbiAgICAgICAgYWxsVG9waWNzVGFiLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVUYWIodGFic0NvbnRhaW5lciwgYWxsVG9waWNzVGFiKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVuZGVyQWxsVG9waWNzKGNvbnRlbnRDb250YWluZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGluUHJvZ3Jlc3NUYWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVRhYih0YWJzQ29udGFpbmVyLCBpblByb2dyZXNzVGFiKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVuZGVySW5Qcm9ncmVzc1RvcGljcyhjb250ZW50Q29udGFpbmVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBjb21wbGV0ZWRUYWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVRhYih0YWJzQ29udGFpbmVyLCBjb21wbGV0ZWRUYWIpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZW5kZXJDb21wbGV0ZWRUb3BpY3MoY29udGVudENvbnRhaW5lcik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBzZXRBY3RpdmVUYWIodGFic0NvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGFjdGl2ZVRhYjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgLy8gUmVtb3ZlIGFjdGl2ZSBjbGFzcyBmcm9tIGFsbCB0YWJzXG4gICAgICAgIHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLm5hdi1idXR0b24nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKCduYXYtYnV0dG9uLWFjdGl2ZScpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBhY3RpdmUgY2xhc3MgdG8gY2xpY2tlZCB0YWJcbiAgICAgICAgYWN0aXZlVGFiLmFkZENsYXNzKCduYXYtYnV0dG9uLWFjdGl2ZScpO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyByZW5kZXJBbGxUb3BpY3MoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHRvcGljRmlsZXMgPSBhd2FpdCB0aGlzLmdldFRvcGljRmlsZXMoKTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0b3BpY0ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdwJywgeyBcbiAgICAgICAgICAgICAgICB0ZXh0OiAnTm8gbGVhcm5pbmcgdG9waWNzIGZvdW5kLiBDcmVhdGUgYSB0b3BpYyB1c2luZyB0aGUgXCJDcmVhdGUgVG9waWMgTm90ZVwiIGNvbW1hbmQuJyxcbiAgICAgICAgICAgICAgICBjbHM6ICduby10b3BpY3MtbWVzc2FnZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTb3J0IHRvcGljcyBieSBuYW1lXG4gICAgICAgIHRvcGljRmlsZXMuc29ydCgoYSwgYikgPT4gYS5iYXNlbmFtZS5sb2NhbGVDb21wYXJlKGIuYmFzZW5hbWUpKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBhIGxpc3Qgb2YgdG9waWNzXG4gICAgICAgIGNvbnN0IHRvcGljTGlzdCA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1saXN0JyB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiB0b3BpY0ZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgICAgICAgICAgaWYgKCFtZXRhZGF0YT8uZnJvbnRtYXR0ZXIpIGNvbnRpbnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnByb2dyZXNzIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZFN1YnRvcGljcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLmNvbXBsZXRlZF9zdWJ0b3BpY3MgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IHRvdGFsU3VidG9waWNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIudG90YWxfc3VidG9waWNzIHx8IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IHRvcGljSXRlbSA9IHRvcGljTGlzdC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1pdGVtJyB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVG9waWMgaGVhZGVyIHdpdGggbmFtZSBhbmQgcHJvZ3Jlc3NcbiAgICAgICAgICAgIGNvbnN0IHRvcGljSGVhZGVyID0gdG9waWNJdGVtLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3RvcGljLWhlYWRlcicgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRvcGljIG5hbWUgd2l0aCBsaW5rXG4gICAgICAgICAgICBjb25zdCB0b3BpY05hbWUgPSB0b3BpY0hlYWRlci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1uYW1lJyB9KTtcbiAgICAgICAgICAgIHRvcGljTmFtZS5jcmVhdGVFbCgnYScsIHsgXG4gICAgICAgICAgICAgICAgdGV4dDogZmlsZS5iYXNlbmFtZSxcbiAgICAgICAgICAgICAgICBocmVmOiBmaWxlLnBhdGgsXG4gICAgICAgICAgICAgICAgY2xzOiAndG9waWMtbGluaydcbiAgICAgICAgICAgIH0pLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKGZpbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFByb2dyZXNzIGluZGljYXRvclxuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NUZXh0ID0gdG9waWNIZWFkZXIuY3JlYXRlRWwoJ2RpdicsIHsgXG4gICAgICAgICAgICAgICAgdGV4dDogYCR7cHJvZ3Jlc3NQZXJjZW50fSUgKCR7Y29tcGxldGVkU3VidG9waWNzfS8ke3RvdGFsU3VidG9waWNzfSlgLFxuICAgICAgICAgICAgICAgIGNsczogJ3RvcGljLXByb2dyZXNzLXRleHQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUHJvZ3Jlc3MgYmFyXG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzc0JhckNvbnRhaW5lciA9IHRvcGljSXRlbS5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdwcm9ncmVzcy1iYXItY29udGFpbmVyJyB9KTtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzQmFyID0gcHJvZ3Jlc3NCYXJDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncHJvZ3Jlc3MtYmFyJyB9KTtcbiAgICAgICAgICAgIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gYCR7cHJvZ3Jlc3NQZXJjZW50fSVgO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDb2xvciB0aGUgcHJvZ3Jlc3MgYmFyIGJhc2VkIG9uIGNvbXBsZXRpb25cbiAgICAgICAgICAgIGlmIChwcm9ncmVzc1BlcmNlbnQgPCAzMCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyLmFkZENsYXNzKCdwcm9ncmVzcy1sb3cnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3NQZXJjZW50IDwgNzApIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0Jhci5hZGRDbGFzcygncHJvZ3Jlc3MtbWVkaXVtJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyLmFkZENsYXNzKCdwcm9ncmVzcy1oaWdoJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFN1YnRvcGljcyBsaXN0IGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgaWYgKG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcyAmJiBtZXRhZGF0YS5mcm9udG1hdHRlci5zdWJ0b3BpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljc0NvbnRhaW5lciA9IHRvcGljSXRlbS5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdzdWJ0b3BpY3MtY29udGFpbmVyJyB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY3NUb2dnbGUgPSBzdWJ0b3BpY3NDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICdTaG93IFN1YnRvcGljcycsXG4gICAgICAgICAgICAgICAgICAgIGNsczogJ3N1YnRvcGljcy10b2dnbGUnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNzTGlzdCA9IHN1YnRvcGljc0NvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgICAgICAgICAgY2xzOiAnc3VidG9waWNzLWxpc3QgaGlkZGVuJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIFRvZ2dsZSBzdWJ0b3BpY3MgdmlzaWJpbGl0eVxuICAgICAgICAgICAgICAgIHN1YnRvcGljc1RvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3VidG9waWNzTGlzdC50b2dnbGVDbGFzcygnaGlkZGVuJywgIXN1YnRvcGljc0xpc3QuaGFzQ2xhc3MoJ2hpZGRlbicpKTtcbiAgICAgICAgICAgICAgICAgICAgc3VidG9waWNzVG9nZ2xlLnRleHRDb250ZW50ID0gc3VidG9waWNzTGlzdC5oYXNDbGFzcygnaGlkZGVuJykgXG4gICAgICAgICAgICAgICAgICAgICAgICA/ICdTaG93IFN1YnRvcGljcycgXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICdIaWRlIFN1YnRvcGljcyc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gUmVuZGVyIHN1YnRvcGljc1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3VidG9waWMgb2YgbWV0YWRhdGEuZnJvbnRtYXR0ZXIuc3VidG9waWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljTmFtZSA9IHN1YnRvcGljLnJlcGxhY2UoL1xcW1xcWyguKj8pXFxdXFxdLywgJyQxJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljRmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChgJHtzdWJ0b3BpY05hbWV9Lm1kYCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY0l0ZW0gPSBzdWJ0b3BpY3NMaXN0LmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3N1YnRvcGljLWl0ZW0nIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgc3VidG9waWMgZmlsZSBleGlzdHMgYW5kIGdldCBjb21wbGV0aW9uIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXNDb21wbGV0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnRvcGljRmlsZSAmJiBzdWJ0b3BpY0ZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNNZXRhZGF0YSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHN1YnRvcGljRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0NvbXBsZXRlZCA9IHN1YnRvcGljTWV0YWRhdGE/LmZyb250bWF0dGVyPy5jb21wbGV0ZWQgPT09IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIFN1YnRvcGljIG5hbWUgd2l0aCBjb21wbGV0aW9uIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY05hbWVFbCA9IHN1YnRvcGljSXRlbS5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdzdWJ0b3BpYy1uYW1lJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIFN0YXR1cyBpbmRpY2F0b3JcbiAgICAgICAgICAgICAgICAgICAgc3VidG9waWNOYW1lRWwuY3JlYXRlRWwoJ3NwYW4nLCB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogaXNDb21wbGV0ZWQgPyAn4pyFICcgOiAn4p2MICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdzdWJ0b3BpYy1zdGF0dXMnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gU3VidG9waWMgbGlua1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VidG9waWNGaWxlICYmIHN1YnRvcGljRmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJ0b3BpY05hbWVFbC5jcmVhdGVFbCgnYScsIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogc3VidG9waWNOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY6IHN1YnRvcGljRmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsczogJ3N1YnRvcGljLWxpbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKS5vcGVuRmlsZShzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZ2dsZSBjb21wbGV0aW9uIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9nZ2xlQnV0dG9uID0gc3VidG9waWNJdGVtLmNyZWF0ZUVsKCdidXR0b24nLCB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IGlzQ29tcGxldGVkID8gJ01hcmsgSW5jb21wbGV0ZScgOiAnTWFyayBDb21wbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzOiAnc3VidG9waWMtdG9nZ2xlLWJ1dHRvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4udG9nZ2xlU3VidG9waWNDb21wbGV0aW9uKHN1YnRvcGljRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJWaWV3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN1YnRvcGljIGZpbGUgZG9lc24ndCBleGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VidG9waWNOYW1lRWwuY3JlYXRlRWwoJ3NwYW4nLCB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHN1YnRvcGljTmFtZSArICcgKG1pc3NpbmcpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdzdWJ0b3BpYy1taXNzaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYXN5bmMgcmVuZGVySW5Qcm9ncmVzc1RvcGljcyhjb250YWluZXI6IEhUTUxFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdG9waWNGaWxlcyA9IGF3YWl0IHRoaXMuZ2V0VG9waWNGaWxlcygpO1xuICAgICAgICBjb25zdCBpblByb2dyZXNzVG9waWNzID0gdG9waWNGaWxlcy5maWx0ZXIoZmlsZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnByb2dyZXNzIHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gcHJvZ3Jlc3MgPiAwICYmIHByb2dyZXNzIDwgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoaW5Qcm9ncmVzc1RvcGljcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgncCcsIHsgXG4gICAgICAgICAgICAgICAgdGV4dDogJ05vIHRvcGljcyBpbiBwcm9ncmVzcy4gU3RhcnQgbGVhcm5pbmcgYSB0b3BpYyB0byBzZWUgaXQgaGVyZS4nLFxuICAgICAgICAgICAgICAgIGNsczogJ25vLXRvcGljcy1tZXNzYWdlJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFNvcnQgYnkgcHJvZ3Jlc3MgKGFzY2VuZGluZylcbiAgICAgICAgaW5Qcm9ncmVzc1RvcGljcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YUEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShhKTtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhQiA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGIpO1xuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NBID0gbWV0YWRhdGFBPy5mcm9udG1hdHRlcj8ucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzQiA9IG1ldGFkYXRhQj8uZnJvbnRtYXR0ZXI/LnByb2dyZXNzIHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gcHJvZ3Jlc3NBIC0gcHJvZ3Jlc3NCO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBhIGxpc3Qgb2YgdG9waWNzXG4gICAgICAgIGNvbnN0IHRvcGljTGlzdCA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1saXN0JyB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBpblByb2dyZXNzVG9waWNzKSB7XG4gICAgICAgICAgICAvLyBTaW1pbGFyIHJlbmRlcmluZyBhcyByZW5kZXJBbGxUb3BpY3MgYnV0IGZvciBpbi1wcm9ncmVzcyB0b3BpY3Mgb25seVxuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgICAgIGlmICghbWV0YWRhdGE/LmZyb250bWF0dGVyKSBjb250aW51ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5wcm9ncmVzcyB8fCAwO1xuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NQZXJjZW50ID0gTWF0aC5yb3VuZChwcm9ncmVzcyAqIDEwMCk7XG4gICAgICAgICAgICBjb25zdCBjb21wbGV0ZWRTdWJ0b3BpY3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5jb21wbGV0ZWRfc3VidG9waWNzIHx8IDA7XG4gICAgICAgICAgICBjb25zdCB0b3RhbFN1YnRvcGljcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnRvdGFsX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCB0b3BpY0l0ZW0gPSB0b3BpY0xpc3QuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAndG9waWMtaXRlbScgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRvcGljIGhlYWRlciB3aXRoIG5hbWUgYW5kIHByb2dyZXNzXG4gICAgICAgICAgICBjb25zdCB0b3BpY0hlYWRlciA9IHRvcGljSXRlbS5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1oZWFkZXInIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUb3BpYyBuYW1lIHdpdGggbGlua1xuICAgICAgICAgICAgY29uc3QgdG9waWNOYW1lID0gdG9waWNIZWFkZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAndG9waWMtbmFtZScgfSk7XG4gICAgICAgICAgICB0b3BpY05hbWUuY3JlYXRlRWwoJ2EnLCB7IFxuICAgICAgICAgICAgICAgIHRleHQ6IGZpbGUuYmFzZW5hbWUsXG4gICAgICAgICAgICAgICAgaHJlZjogZmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgIGNsczogJ3RvcGljLWxpbmsnXG4gICAgICAgICAgICB9KS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKS5vcGVuRmlsZShmaWxlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQcm9ncmVzcyBpbmRpY2F0b3JcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzVGV4dCA9IHRvcGljSGVhZGVyLmNyZWF0ZUVsKCdkaXYnLCB7IFxuICAgICAgICAgICAgICAgIHRleHQ6IGAke3Byb2dyZXNzUGVyY2VudH0lICgke2NvbXBsZXRlZFN1YnRvcGljc30vJHt0b3RhbFN1YnRvcGljc30pYCxcbiAgICAgICAgICAgICAgICBjbHM6ICd0b3BpYy1wcm9ncmVzcy10ZXh0J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFByb2dyZXNzIGJhclxuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NCYXJDb250YWluZXIgPSB0b3BpY0l0ZW0uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncHJvZ3Jlc3MtYmFyLWNvbnRhaW5lcicgfSk7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzc0JhciA9IHByb2dyZXNzQmFyQ29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3Byb2dyZXNzLWJhciBwcm9ncmVzcy1tZWRpdW0nIH0pO1xuICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzc1BlcmNlbnR9JWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYXN5bmMgcmVuZGVyQ29tcGxldGVkVG9waWNzKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0b3BpY0ZpbGVzID0gYXdhaXQgdGhpcy5nZXRUb3BpY0ZpbGVzKCk7XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZFRvcGljcyA9IHRvcGljRmlsZXMuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzID0gbWV0YWRhdGE/LmZyb250bWF0dGVyPy5wcm9ncmVzcyB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHByb2dyZXNzID09PSAxO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjb21wbGV0ZWRUb3BpY3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb250YWluZXIuY3JlYXRlRWwoJ3AnLCB7IFxuICAgICAgICAgICAgICAgIHRleHQ6ICdObyBjb21wbGV0ZWQgdG9waWNzIHlldC4gS2VlcCBsZWFybmluZyEnLFxuICAgICAgICAgICAgICAgIGNsczogJ25vLXRvcGljcy1tZXNzYWdlJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBhIGxpc3Qgb2YgdG9waWNzXG4gICAgICAgIGNvbnN0IHRvcGljTGlzdCA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1saXN0JyB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBjb21wbGV0ZWRUb3BpY3MpIHtcbiAgICAgICAgICAgIC8vIFNpbWlsYXIgcmVuZGVyaW5nIGFzIHJlbmRlckFsbFRvcGljcyBidXQgZm9yIGNvbXBsZXRlZCB0b3BpY3Mgb25seVxuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgICAgIGlmICghbWV0YWRhdGE/LmZyb250bWF0dGVyKSBjb250aW51ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgdG9waWNJdGVtID0gdG9waWNMaXN0LmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3RvcGljLWl0ZW0nIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUb3BpYyBoZWFkZXIgd2l0aCBuYW1lIGFuZCBjb21wbGV0aW9uIGluZGljYXRvclxuICAgICAgICAgICAgY29uc3QgdG9waWNIZWFkZXIgPSB0b3BpY0l0ZW0uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAndG9waWMtaGVhZGVyJyB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVG9waWMgbmFtZSB3aXRoIGxpbmtcbiAgICAgICAgICAgIGNvbnN0IHRvcGljTmFtZSA9IHRvcGljSGVhZGVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3RvcGljLW5hbWUnIH0pO1xuICAgICAgICAgICAgdG9waWNOYW1lLmNyZWF0ZUVsKCdzcGFuJywgeyBcbiAgICAgICAgICAgICAgICB0ZXh0OiAn4pyFICcsXG4gICAgICAgICAgICAgICAgY2xzOiAndG9waWMtY29tcGxldGVkLWluZGljYXRvcidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdG9waWNOYW1lLmNyZWF0ZUVsKCdhJywgeyBcbiAgICAgICAgICAgICAgICB0ZXh0OiBmaWxlLmJhc2VuYW1lLFxuICAgICAgICAgICAgICAgIGhyZWY6IGZpbGUucGF0aCxcbiAgICAgICAgICAgICAgICBjbHM6ICd0b3BpYy1saW5rJ1xuICAgICAgICAgICAgfSkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKCkub3BlbkZpbGUoZmlsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ29tcGxldGlvbiB0ZXh0XG4gICAgICAgICAgICB0b3BpY0hlYWRlci5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgICAgICB0ZXh0OiAnQ29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICBjbHM6ICd0b3BpYy1jb21wbGV0ZWQtdGV4dCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGdldFRvcGljRmlsZXMoKSB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xuICAgICAgICByZXR1cm4gZmlsZXMuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgICAgIHJldHVybiBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnR5cGUgPT09ICd0b3BpYyc7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW4gZnJvbSAnLi4vbWFpbic7XG5cbmV4cG9ydCBjbGFzcyBQcm9ncmVzc1RyYWNrZXIge1xuICAgIHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbjtcblxuICAgIGNvbnN0cnVjdG9yKHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbikge1xuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHRvcGljIG5vdGVzIGluIHRoZSB2YXVsdFxuICAgICAqL1xuICAgIGFzeW5jIGdldEFsbFRvcGljcygpOiBQcm9taXNlPFRGaWxlW10+IHtcbiAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xuICAgICAgICByZXR1cm4gZmlsZXMuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgICAgICByZXR1cm4gbWV0YWRhdGE/LmZyb250bWF0dGVyPy50eXBlID09PSAndG9waWMnO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHN1YnRvcGljIG5vdGVzIGZvciBhIHNwZWNpZmljIHRvcGljXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U3VidG9waWNzRm9yVG9waWModG9waWNGaWxlOiBURmlsZSk6IFByb21pc2U8VEZpbGVbXT4ge1xuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh0b3BpY0ZpbGUpO1xuICAgICAgICBpZiAoIW1ldGFkYXRhPy5mcm9udG1hdHRlcj8uc3VidG9waWNzKSByZXR1cm4gW107XG5cbiAgICAgICAgY29uc3Qgc3VidG9waWNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIuc3VidG9waWNzO1xuICAgICAgICBjb25zdCBzdWJ0b3BpY0ZpbGVzOiBURmlsZVtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBzdWJ0b3BpYyBvZiBzdWJ0b3BpY3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljTmFtZSA9IHN1YnRvcGljLnJlcGxhY2UoL1xcW1xcWyguKj8pXFxdXFxdLywgJyQxJyk7XG4gICAgICAgICAgICBjb25zdCBzdWJ0b3BpY0ZpbGUgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGAke3N1YnRvcGljTmFtZX0ubWRgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHN1YnRvcGljRmlsZSAmJiBzdWJ0b3BpY0ZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgIHN1YnRvcGljRmlsZXMucHVzaChzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN1YnRvcGljRmlsZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBpbmNvbXBsZXRlIHN1YnRvcGljcyBmb3IgYSBzcGVjaWZpYyB0b3BpY1xuICAgICAqL1xuICAgIGFzeW5jIGdldEluY29tcGxldGVTdWJ0b3BpY3ModG9waWNGaWxlOiBURmlsZSk6IFByb21pc2U8VEZpbGVbXT4ge1xuICAgICAgICBjb25zdCBzdWJ0b3BpY3MgPSBhd2FpdCB0aGlzLmdldFN1YnRvcGljc0ZvclRvcGljKHRvcGljRmlsZSk7XG4gICAgICAgIHJldHVybiBzdWJ0b3BpY3MuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgICAgICByZXR1cm4gbWV0YWRhdGE/LmZyb250bWF0dGVyPy5jb21wbGV0ZWQgIT09IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgdG9waWNzIHdpdGggcHJvZ3Jlc3MgaW5mb3JtYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBnZXRUb3BpY3NXaXRoUHJvZ3Jlc3MoKTogUHJvbWlzZTx7ZmlsZTogVEZpbGUsIHByb2dyZXNzOiBudW1iZXIsIGNvbXBsZXRlZDogbnVtYmVyLCB0b3RhbDogbnVtYmVyfVtdPiB7XG4gICAgICAgIGNvbnN0IHRvcGljcyA9IGF3YWl0IHRoaXMuZ2V0QWxsVG9waWNzKCk7XG4gICAgICAgIHJldHVybiB0b3BpY3MubWFwKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IG1ldGFkYXRhPy5mcm9udG1hdHRlcj8ucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IG1ldGFkYXRhPy5mcm9udG1hdHRlcj8uY29tcGxldGVkX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICAgICAgY29uc3QgdG90YWwgPSBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnRvdGFsX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkLFxuICAgICAgICAgICAgICAgIHRvdGFsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgb3ZlcmFsbCBsZWFybmluZyBwcm9ncmVzcyBhY3Jvc3MgYWxsIHRvcGljc1xuICAgICAqL1xuICAgIGFzeW5jIGdldE92ZXJhbGxQcm9ncmVzcygpOiBQcm9taXNlPHtwcm9ncmVzczogbnVtYmVyLCBjb21wbGV0ZWRUb3BpY3M6IG51bWJlciwgdG90YWxUb3BpY3M6IG51bWJlciwgY29tcGxldGVkU3VidG9waWNzOiBudW1iZXIsIHRvdGFsU3VidG9waWNzOiBudW1iZXJ9PiB7XG4gICAgICAgIGNvbnN0IHRvcGljcyA9IGF3YWl0IHRoaXMuZ2V0VG9waWNzV2l0aFByb2dyZXNzKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAodG9waWNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRUb3BpY3M6IDAsXG4gICAgICAgICAgICAgICAgdG90YWxUb3BpY3M6IDAsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkU3VidG9waWNzOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsU3VidG9waWNzOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjb21wbGV0ZWRUb3BpY3MgPSB0b3BpY3MuZmlsdGVyKHQgPT4gdC5wcm9ncmVzcyA9PT0gMSkubGVuZ3RoO1xuICAgICAgICBjb25zdCB0b3RhbFRvcGljcyA9IHRvcGljcy5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICBsZXQgY29tcGxldGVkU3VidG9waWNzID0gMDtcbiAgICAgICAgbGV0IHRvdGFsU3VidG9waWNzID0gMDtcbiAgICAgICAgXG4gICAgICAgIHRvcGljcy5mb3JFYWNoKHRvcGljID0+IHtcbiAgICAgICAgICAgIGNvbXBsZXRlZFN1YnRvcGljcyArPSB0b3BpYy5jb21wbGV0ZWQ7XG4gICAgICAgICAgICB0b3RhbFN1YnRvcGljcyArPSB0b3BpYy50b3RhbDtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwcm9ncmVzcyA9IHRvdGFsU3VidG9waWNzID4gMCA/IGNvbXBsZXRlZFN1YnRvcGljcyAvIHRvdGFsU3VidG9waWNzIDogMDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgICAgIGNvbXBsZXRlZFRvcGljcyxcbiAgICAgICAgICAgIHRvdGFsVG9waWNzLFxuICAgICAgICAgICAgY29tcGxldGVkU3VidG9waWNzLFxuICAgICAgICAgICAgdG90YWxTdWJ0b3BpY3NcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9waWNzIGdyb3VwZWQgYnkgcHJvZ3Jlc3Mgc3RhdHVzXG4gICAgICovXG4gICAgYXN5bmMgZ2V0VG9waWNzQnlTdGF0dXMoKTogUHJvbWlzZTx7bm90U3RhcnRlZDogVEZpbGVbXSwgaW5Qcm9ncmVzczogVEZpbGVbXSwgY29tcGxldGVkOiBURmlsZVtdfT4ge1xuICAgICAgICBjb25zdCB0b3BpY3MgPSBhd2FpdCB0aGlzLmdldEFsbFRvcGljcygpO1xuICAgICAgICBcbiAgICAgICAgY29uc3Qgbm90U3RhcnRlZDogVEZpbGVbXSA9IFtdO1xuICAgICAgICBjb25zdCBpblByb2dyZXNzOiBURmlsZVtdID0gW107XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZDogVEZpbGVbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIHRvcGljcykge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IG1ldGFkYXRhPy5mcm9udG1hdHRlcj8ucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHByb2dyZXNzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbm90U3RhcnRlZC5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9ncmVzcyA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZC5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpblByb2dyZXNzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBub3RTdGFydGVkLFxuICAgICAgICAgICAgaW5Qcm9ncmVzcyxcbiAgICAgICAgICAgIGNvbXBsZXRlZFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCByZWNvbW1lbmRlZCB0b3BpY3MgdG8gZm9jdXMgb24gKHRvcGljcyB3aXRoIHNvbWUgcHJvZ3Jlc3MgYnV0IG5vdCBjb21wbGV0ZWQpXG4gICAgICovXG4gICAgYXN5bmMgZ2V0UmVjb21tZW5kZWRUb3BpY3MobGltaXQ6IG51bWJlciA9IDUpOiBQcm9taXNlPFRGaWxlW10+IHtcbiAgICAgICAgY29uc3QgdG9waWNzID0gYXdhaXQgdGhpcy5nZXRUb3BpY3NXaXRoUHJvZ3Jlc3MoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZpbHRlciBmb3IgaW4tcHJvZ3Jlc3MgdG9waWNzXG4gICAgICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSB0b3BpY3MuZmlsdGVyKHQgPT4gdC5wcm9ncmVzcyA+IDAgJiYgdC5wcm9ncmVzcyA8IDEpO1xuICAgICAgICBcbiAgICAgICAgLy8gU29ydCBieSBwcm9ncmVzcyAoaGlnaGVzdCBmaXJzdClcbiAgICAgICAgaW5Qcm9ncmVzcy5zb3J0KChhLCBiKSA9PiBiLnByb2dyZXNzIC0gYS5wcm9ncmVzcyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaW5Qcm9ncmVzcy5zbGljZSgwLCBsaW1pdCkubWFwKHQgPT4gdC5maWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9waWNzIHdpdGgga25vd2xlZGdlIGdhcHMgKHRvcGljcyB3aXRoIGxvdyBwcm9ncmVzcylcbiAgICAgKi9cbiAgICBhc3luYyBnZXRLbm93bGVkZ2VHYXBzKHRocmVzaG9sZDogbnVtYmVyID0gMC4zLCBsaW1pdDogbnVtYmVyID0gNSk6IFByb21pc2U8VEZpbGVbXT4ge1xuICAgICAgICBjb25zdCB0b3BpY3MgPSBhd2FpdCB0aGlzLmdldFRvcGljc1dpdGhQcm9ncmVzcygpO1xuICAgICAgICBcbiAgICAgICAgLy8gRmlsdGVyIGZvciB0b3BpY3Mgd2l0aCBwcm9ncmVzcyBiZWxvdyB0aHJlc2hvbGRcbiAgICAgICAgY29uc3QgZ2FwcyA9IHRvcGljcy5maWx0ZXIodCA9PiB0LnByb2dyZXNzIDwgdGhyZXNob2xkKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNvcnQgYnkgcHJvZ3Jlc3MgKGxvd2VzdCBmaXJzdClcbiAgICAgICAgZ2Fwcy5zb3J0KChhLCBiKSA9PiBhLnByb2dyZXNzIC0gYi5wcm9ncmVzcyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZ2Fwcy5zbGljZSgwLCBsaW1pdCkubWFwKHQgPT4gdC5maWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHN1YnRvcGljIGlzIGNvbXBsZXRlZFxuICAgICAqL1xuICAgIGlzU3VidG9waWNDb21wbGV0ZWQoZmlsZTogVEZpbGUpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LmNvbXBsZXRlZCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHBhcmVudCB0b3BpYyBmb3IgYSBzdWJ0b3BpY1xuICAgICAqL1xuICAgIGFzeW5jIGdldFBhcmVudFRvcGljKHN1YnRvcGljRmlsZTogVEZpbGUpOiBQcm9taXNlPFRGaWxlIHwgbnVsbD4ge1xuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICBpZiAoIW1ldGFkYXRhPy5mcm9udG1hdHRlcj8ucGFyZW50KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHBhcmVudE5hbWUgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5wYXJlbnQucmVwbGFjZSgvXFxbXFxbKC4qPylcXF1cXF0vLCAnJDEnKTtcbiAgICAgICAgY29uc3QgcGFyZW50RmlsZSA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7cGFyZW50TmFtZX0ubWRgKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXJlbnRGaWxlICYmIHBhcmVudEZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudEZpbGU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgcHJvZ3Jlc3MgcmVwb3J0IGZvciBhIHRvcGljXG4gICAgICovXG4gICAgYXN5bmMgZ2VuZXJhdGVUb3BpY1JlcG9ydCh0b3BpY0ZpbGU6IFRGaWxlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUodG9waWNGaWxlKTtcbiAgICAgICAgaWYgKCFtZXRhZGF0YT8uZnJvbnRtYXR0ZXIpIHJldHVybiBcIk5vIG1ldGFkYXRhIGZvdW5kIGZvciB0aGlzIHRvcGljLlwiO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5wcm9ncmVzcyB8fCAwO1xuICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgY29uc3QgY29tcGxldGVkU3VidG9waWNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIuY29tcGxldGVkX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICBjb25zdCB0b3RhbFN1YnRvcGljcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnRvdGFsX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICBcbiAgICAgICAgbGV0IHJlcG9ydCA9IGAjIFByb2dyZXNzIFJlcG9ydDogJHt0b3BpY0ZpbGUuYmFzZW5hbWV9XFxuXFxuYDtcbiAgICAgICAgcmVwb3J0ICs9IGAjIyBPdmVydmlld1xcblxcbmA7XG4gICAgICAgIHJlcG9ydCArPSBgLSAqKlByb2dyZXNzKio6ICR7cHJvZ3Jlc3NQZXJjZW50fSUgY29tcGxldGVcXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipDb21wbGV0ZWQgU3VidG9waWNzKio6ICR7Y29tcGxldGVkU3VidG9waWNzfS8ke3RvdGFsU3VidG9waWNzfVxcblxcbmA7XG4gICAgICAgIFxuICAgICAgICByZXBvcnQgKz0gYCMjIFN1YnRvcGljc1xcblxcbmA7XG4gICAgICAgIFxuICAgICAgICBpZiAobWV0YWRhdGEuZnJvbnRtYXR0ZXIuc3VidG9waWNzICYmIG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN1YnRvcGljIG9mIG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljTmFtZSA9IHN1YnRvcGljLnJlcGxhY2UoL1xcW1xcWyguKj8pXFxdXFxdLywgJyQxJyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNGaWxlID0gdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChgJHtzdWJ0b3BpY05hbWV9Lm1kYCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHN1YnRvcGljRmlsZSAmJiBzdWJ0b3BpY0ZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY01ldGFkYXRhID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHN1YnRvcGljRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzQ29tcGxldGVkID0gc3VidG9waWNNZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LmNvbXBsZXRlZCA9PT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcGxldGlvbkRhdGUgPSBzdWJ0b3BpY01ldGFkYXRhPy5mcm9udG1hdHRlcj8uY29tcGxldGlvbl9kYXRlIHx8ICdOL0EnO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAtICR7aXNDb21wbGV0ZWQgPyAn4pyFJyA6ICfinYwnfSAqKiR7c3VidG9waWNOYW1lfSoqYDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBvcnQgKz0gYCAoQ29tcGxldGVkIG9uOiAke2NvbXBsZXRpb25EYXRlfSlgO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlcG9ydCArPSAnXFxuJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXBvcnQgKz0gYC0g4p2TICoqJHtzdWJ0b3BpY05hbWV9KiogKE1pc3NpbmcpXFxuYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBvcnQgKz0gXCJObyBzdWJ0b3BpY3MgZm91bmQgZm9yIHRoaXMgdG9waWMuXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJlcG9ydCArPSBgXFxuIyMgUmVjb21tZW5kYXRpb25zXFxuXFxuYDtcbiAgICAgICAgXG4gICAgICAgIGlmIChwcm9ncmVzcyA9PT0gMCkge1xuICAgICAgICAgICAgcmVwb3J0ICs9IFwiWW91IGhhdmVuJ3Qgc3RhcnRlZCBsZWFybmluZyB0aGlzIHRvcGljIHlldC4gQ3JlYXRlIHNvbWUgc3VidG9waWNzIHRvIGJlZ2luIHRyYWNraW5nIHlvdXIgcHJvZ3Jlc3MuXFxuXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3MgPT09IDEpIHtcbiAgICAgICAgICAgIHJlcG9ydCArPSBcIkNvbmdyYXR1bGF0aW9ucyEgWW91J3ZlIGNvbXBsZXRlZCBhbGwgc3VidG9waWNzIGZvciB0aGlzIHRvcGljLlxcblwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVwb3J0ICs9IGBZb3UncmUgbWFraW5nIHByb2dyZXNzIG9uIHRoaXMgdG9waWMuIEZvY3VzIG9uIGNvbXBsZXRpbmcgdGhlIHJlbWFpbmluZyBzdWJ0b3BpY3MgdG8gZmlsbCB5b3VyIGtub3dsZWRnZSBnYXBzLlxcbmA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXBvcnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYW4gb3ZlcmFsbCBwcm9ncmVzcyByZXBvcnRcbiAgICAgKi9cbiAgICBhc3luYyBnZW5lcmF0ZU92ZXJhbGxSZXBvcnQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgb3ZlcmFsbCA9IGF3YWl0IHRoaXMuZ2V0T3ZlcmFsbFByb2dyZXNzKCk7XG4gICAgICAgIGNvbnN0IHRvcGljc0J5U3RhdHVzID0gYXdhaXQgdGhpcy5nZXRUb3BpY3NCeVN0YXR1cygpO1xuICAgICAgICBjb25zdCByZWNvbW1lbmRlZFRvcGljcyA9IGF3YWl0IHRoaXMuZ2V0UmVjb21tZW5kZWRUb3BpY3MoMyk7XG4gICAgICAgIGNvbnN0IGtub3dsZWRnZUdhcHMgPSBhd2FpdCB0aGlzLmdldEtub3dsZWRnZUdhcHMoMC4zLCAzKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG92ZXJhbGxQZXJjZW50ID0gTWF0aC5yb3VuZChvdmVyYWxsLnByb2dyZXNzICogMTAwKTtcbiAgICAgICAgXG4gICAgICAgIGxldCByZXBvcnQgPSBgIyBMZWFybmluZyBQcm9ncmVzcyBSZXBvcnRcXG5cXG5gO1xuICAgICAgICByZXBvcnQgKz0gYCMjIE92ZXJhbGwgUHJvZ3Jlc3NcXG5cXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipPdmVyYWxsIFByb2dyZXNzKio6ICR7b3ZlcmFsbFBlcmNlbnR9JSBjb21wbGV0ZVxcbmA7XG4gICAgICAgIHJlcG9ydCArPSBgLSAqKlRvcGljcyoqOiAke292ZXJhbGwuY29tcGxldGVkVG9waWNzfS8ke292ZXJhbGwudG90YWxUb3BpY3N9IGNvbXBsZXRlZFxcbmA7XG4gICAgICAgIHJlcG9ydCArPSBgLSAqKlN1YnRvcGljcyoqOiAke292ZXJhbGwuY29tcGxldGVkU3VidG9waWNzfS8ke292ZXJhbGwudG90YWxTdWJ0b3BpY3N9IGNvbXBsZXRlZFxcblxcbmA7XG4gICAgICAgIFxuICAgICAgICByZXBvcnQgKz0gYCMjIFRvcGljcyBieSBTdGF0dXNcXG5cXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipOb3QgU3RhcnRlZCoqOiAke3RvcGljc0J5U3RhdHVzLm5vdFN0YXJ0ZWQubGVuZ3RofSB0b3BpY3NcXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipJbiBQcm9ncmVzcyoqOiAke3RvcGljc0J5U3RhdHVzLmluUHJvZ3Jlc3MubGVuZ3RofSB0b3BpY3NcXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipDb21wbGV0ZWQqKjogJHt0b3BpY3NCeVN0YXR1cy5jb21wbGV0ZWQubGVuZ3RofSB0b3BpY3NcXG5cXG5gO1xuICAgICAgICBcbiAgICAgICAgcmVwb3J0ICs9IGAjIyBSZWNvbW1lbmRlZCBGb2N1cyBBcmVhc1xcblxcbmA7XG4gICAgICAgIFxuICAgICAgICBpZiAocmVjb21tZW5kZWRUb3BpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB0b3BpYyBvZiByZWNvbW1lbmRlZFRvcGljcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHRvcGljKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IG1ldGFkYXRhPy5mcm9udG1hdHRlcj8ucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXBvcnQgKz0gYC0gW1ske3RvcGljLmJhc2VuYW1lfV1dICgke3Byb2dyZXNzUGVyY2VudH0lIGNvbXBsZXRlKVxcbmA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBvcnQgKz0gXCJObyB0b3BpY3MgaW4gcHJvZ3Jlc3MuIFN0YXJ0IGxlYXJuaW5nIGEgdG9waWMgdG8gZ2V0IHJlY29tbWVuZGF0aW9ucy5cXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmVwb3J0ICs9IGBcXG4jIyBLbm93bGVkZ2UgR2Fwc1xcblxcbmA7XG4gICAgICAgIFxuICAgICAgICBpZiAoa25vd2xlZGdlR2Fwcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRvcGljIG9mIGtub3dsZWRnZUdhcHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh0b3BpYyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnByb2dyZXNzIHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NQZXJjZW50ID0gTWF0aC5yb3VuZChwcm9ncmVzcyAqIDEwMCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAtIFtbJHt0b3BpYy5iYXNlbmFtZX1dXSAoJHtwcm9ncmVzc1BlcmNlbnR9JSBjb21wbGV0ZSlcXG5gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVwb3J0ICs9IFwiTm8gc2lnbmlmaWNhbnQga25vd2xlZGdlIGdhcHMgZm91bmQuXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXBvcnQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgSXRlbVZpZXcsIFdvcmtzcGFjZUxlYWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgTGVhcm5pbmdQcm9ncmVzc1BsdWdpbiBmcm9tICcuLi9tYWluJztcbmltcG9ydCB7IFByb2dyZXNzVHJhY2tlciB9IGZyb20gJy4uL3RyYWNraW5nL1Byb2dyZXNzVHJhY2tlcic7XG5cbmV4cG9ydCBjb25zdCBLTk9XTEVER0VfTUFQX1ZJRVdfVFlQRSA9ICdrbm93bGVkZ2UtbWFwLXZpZXcnO1xuXG5leHBvcnQgY2xhc3MgS25vd2xlZGdlTWFwVmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgICBwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW47XG4gICAgcHJvZ3Jlc3NUcmFja2VyOiBQcm9ncmVzc1RyYWNrZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihsZWFmOiBXb3Jrc3BhY2VMZWFmLCBwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW4pIHtcbiAgICAgICAgc3VwZXIobGVhZik7XG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgICAgICB0aGlzLnByb2dyZXNzVHJhY2tlciA9IG5ldyBQcm9ncmVzc1RyYWNrZXIocGx1Z2luKTtcbiAgICB9XG5cbiAgICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gS05PV0xFREdFX01BUF9WSUVXX1RZUEU7XG4gICAgfVxuXG4gICAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICdLbm93bGVkZ2UgTWFwJztcbiAgICB9XG5cbiAgICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGF3YWl0IHRoaXMucmVuZGVyVmlldygpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlbmRlclZpZXcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV07XG4gICAgICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgICBcbiAgICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0tub3dsZWRnZSBNYXAnIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGZvciB0aGUga25vd2xlZGdlIG1hcFxuICAgICAgICBjb25zdCBtYXBDb250YWluZXIgPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgXG4gICAgICAgICAgICBjbHM6ICdrbm93bGVkZ2UtbWFwLWNvbnRhaW5lcicgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGZvciB0aGUgbGVnZW5kXG4gICAgICAgIGNvbnN0IGxlZ2VuZENvbnRhaW5lciA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgIGNsczogJ2tub3dsZWRnZS1tYXAtbGVnZW5kJyBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgbGVnZW5kIGl0ZW1zXG4gICAgICAgIGxlZ2VuZENvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgIGNsczogJ2xlZ2VuZC10aXRsZScsXG4gICAgICAgICAgICB0ZXh0OiAnTGVnZW5kJ1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZExlZ2VuZCA9IGxlZ2VuZENvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtaXRlbScgfSk7XG4gICAgICAgIGNvbXBsZXRlZExlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLWNvbXBsZXRlZCcgfSk7XG4gICAgICAgIGNvbXBsZXRlZExlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtbGFiZWwnLCB0ZXh0OiAnQ29tcGxldGVkJyB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhpZ2hQcm9ncmVzc0xlZ2VuZCA9IGxlZ2VuZENvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtaXRlbScgfSk7XG4gICAgICAgIGhpZ2hQcm9ncmVzc0xlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLWhpZ2gtcHJvZ3Jlc3MnIH0pO1xuICAgICAgICBoaWdoUHJvZ3Jlc3NMZWdlbmQuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnbGVnZW5kLWxhYmVsJywgdGV4dDogJ0hpZ2ggUHJvZ3Jlc3MgKDcwLTk5JSknIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgbWVkaXVtUHJvZ3Jlc3NMZWdlbmQgPSBsZWdlbmRDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnbGVnZW5kLWl0ZW0nIH0pO1xuICAgICAgICBtZWRpdW1Qcm9ncmVzc0xlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLW1lZGl1bS1wcm9ncmVzcycgfSk7XG4gICAgICAgIG1lZGl1bVByb2dyZXNzTGVnZW5kLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2xlZ2VuZC1sYWJlbCcsIHRleHQ6ICdNZWRpdW0gUHJvZ3Jlc3MgKDMwLTY5JSknIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgbG93UHJvZ3Jlc3NMZWdlbmQgPSBsZWdlbmRDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnbGVnZW5kLWl0ZW0nIH0pO1xuICAgICAgICBsb3dQcm9ncmVzc0xlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLWxvdy1wcm9ncmVzcycgfSk7XG4gICAgICAgIGxvd1Byb2dyZXNzTGVnZW5kLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2xlZ2VuZC1sYWJlbCcsIHRleHQ6ICdMb3cgUHJvZ3Jlc3MgKDEtMjklKScgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBub3RTdGFydGVkTGVnZW5kID0gbGVnZW5kQ29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2xlZ2VuZC1pdGVtJyB9KTtcbiAgICAgICAgbm90U3RhcnRlZExlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLW5vdC1zdGFydGVkJyB9KTtcbiAgICAgICAgbm90U3RhcnRlZExlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtbGFiZWwnLCB0ZXh0OiAnTm90IFN0YXJ0ZWQnIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0IHRvcGljcyB3aXRoIHByb2dyZXNzIGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IHRvcGljcyA9IGF3YWl0IHRoaXMucHJvZ3Jlc3NUcmFja2VyLmdldFRvcGljc1dpdGhQcm9ncmVzcygpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRvcGljcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIG1hcENvbnRhaW5lci5jcmVhdGVFbCgncCcsIHsgXG4gICAgICAgICAgICAgICAgdGV4dDogJ05vIGxlYXJuaW5nIHRvcGljcyBmb3VuZC4gQ3JlYXRlIGEgdG9waWMgdXNpbmcgdGhlIFwiQ3JlYXRlIFRvcGljIE5vdGVcIiBjb21tYW5kLicsXG4gICAgICAgICAgICAgICAgY2xzOiAnbm8tdG9waWNzLW1lc3NhZ2UnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBrbm93bGVkZ2UgbWFwIHZpc3VhbGl6YXRpb25cbiAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVLbm93bGVkZ2VNYXAobWFwQ29udGFpbmVyLCB0b3BpY3MpO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBjcmVhdGVLbm93bGVkZ2VNYXAoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgdG9waWNzOiB7ZmlsZTogYW55LCBwcm9ncmVzczogbnVtYmVyLCBjb21wbGV0ZWQ6IG51bWJlciwgdG90YWw6IG51bWJlcn1bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBDcmVhdGUgYSBmb3JjZS1kaXJlY3RlZCBncmFwaCBsYXlvdXRcbiAgICAgICAgY29uc3QgbWFwU3ZnID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2tub3dsZWRnZS1tYXAtc3ZnJyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZvciBlYWNoIHRvcGljLCBjcmVhdGUgYSBub2RlIGluIHRoZSBncmFwaFxuICAgICAgICBmb3IgKGNvbnN0IHRvcGljIG9mIHRvcGljcykge1xuICAgICAgICAgICAgY29uc3QgdG9waWNOb2RlID0gbWFwU3ZnLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3RvcGljLW5vZGUnIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTZXQgbm9kZSBzaXplIGJhc2VkIG9uIG51bWJlciBvZiBzdWJ0b3BpY3NcbiAgICAgICAgICAgIGNvbnN0IG5vZGVTaXplID0gTWF0aC5tYXgoNTAsIE1hdGgubWluKDEwMCwgNTAgKyB0b3BpYy50b3RhbCAqIDUpKTtcbiAgICAgICAgICAgIHRvcGljTm9kZS5zdHlsZS53aWR0aCA9IGAke25vZGVTaXplfXB4YDtcbiAgICAgICAgICAgIHRvcGljTm9kZS5zdHlsZS5oZWlnaHQgPSBgJHtub2RlU2l6ZX1weGA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFNldCBub2RlIGNvbG9yIGJhc2VkIG9uIHByb2dyZXNzXG4gICAgICAgICAgICBpZiAodG9waWMucHJvZ3Jlc3MgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0b3BpY05vZGUuYWRkQ2xhc3MoJ25vZGUtbm90LXN0YXJ0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG9waWMucHJvZ3Jlc3MgPCAwLjMpIHtcbiAgICAgICAgICAgICAgICB0b3BpY05vZGUuYWRkQ2xhc3MoJ25vZGUtbG93LXByb2dyZXNzJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRvcGljLnByb2dyZXNzIDwgMC43KSB7XG4gICAgICAgICAgICAgICAgdG9waWNOb2RlLmFkZENsYXNzKCdub2RlLW1lZGl1bS1wcm9ncmVzcycpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0b3BpYy5wcm9ncmVzcyA8IDEpIHtcbiAgICAgICAgICAgICAgICB0b3BpY05vZGUuYWRkQ2xhc3MoJ25vZGUtaGlnaC1wcm9ncmVzcycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b3BpY05vZGUuYWRkQ2xhc3MoJ25vZGUtY29tcGxldGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFNldCBub2RlIG9wYWNpdHkgYmFzZWQgb24gcHJvZ3Jlc3MgKG1vcmUgcHJvZ3Jlc3MgPSBtb3JlIG9wYXF1ZSlcbiAgICAgICAgICAgIHRvcGljTm9kZS5zdHlsZS5vcGFjaXR5ID0gYCR7MC40ICsgdG9waWMucHJvZ3Jlc3MgKiAwLjZ9YDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQWRkIHRvcGljIG5hbWVcbiAgICAgICAgICAgIGNvbnN0IHRvcGljTmFtZSA9IHRvcGljTm9kZS5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgICAgICBjbHM6ICd0b3BpYy1ub2RlLW5hbWUnLFxuICAgICAgICAgICAgICAgIHRleHQ6IHRvcGljLmZpbGUuYmFzZW5hbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBZGQgcHJvZ3Jlc3MgaW5kaWNhdG9yXG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHRvcGljLnByb2dyZXNzICogMTAwKTtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzSW5kaWNhdG9yID0gdG9waWNOb2RlLmNyZWF0ZUVsKCdkaXYnLCB7IFxuICAgICAgICAgICAgICAgIGNsczogJ3RvcGljLW5vZGUtcHJvZ3Jlc3MnLFxuICAgICAgICAgICAgICAgIHRleHQ6IGAke3Byb2dyZXNzUGVyY2VudH0lYFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE1ha2Ugbm9kZSBjbGlja2FibGUgdG8gb3BlbiB0aGUgdG9waWNcbiAgICAgICAgICAgIHRvcGljTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKHRvcGljLmZpbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFBvc2l0aW9uIG5vZGVzIGluIGEgZ3JpZCBsYXlvdXQgKHNpbXBsZSB2aXN1YWxpemF0aW9uKVxuICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIHVzZSBEMy5qcyBvciBhIHNpbWlsYXIgbGlicmFyeSBmb3IgZm9yY2UtZGlyZWN0ZWQgbGF5b3V0XG4gICAgICAgICAgICB0b3BpY05vZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgICAgICAgICAgdG9waWNOb2RlLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgICAgIHRvcGljTm9kZS5zdHlsZS5tYXJnaW4gPSAnMTBweCc7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBpbnN0cnVjdGlvbnNcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb25zID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IFxuICAgICAgICAgICAgY2xzOiAna25vd2xlZGdlLW1hcC1pbnN0cnVjdGlvbnMnLFxuICAgICAgICAgICAgdGV4dDogJ0NsaWNrIG9uIGEgdG9waWMgbm9kZSB0byBvcGVuIGl0LiBOb2RlIHNpemUgcmVwcmVzZW50cyB0aGUgbnVtYmVyIG9mIHN1YnRvcGljcywgY29sb3IgcmVwcmVzZW50cyBwcm9ncmVzcyBsZXZlbCwgYW5kIG9wYWNpdHkgaW5jcmVhc2VzIHdpdGggcHJvZ3Jlc3MuJ1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCBMZWFybmluZ1Byb2dyZXNzUGx1Z2luIGZyb20gJy4uL21haW4nO1xuXG5leHBvcnQgY2xhc3MgUHJvZ3Jlc3NSZW5kZXJlciB7XG4gICAgcGx1Z2luOiBMZWFybmluZ1Byb2dyZXNzUGx1Z2luO1xuXG4gICAgY29uc3RydWN0b3IocGx1Z2luOiBMZWFybmluZ1Byb2dyZXNzUGx1Z2luKSB7XG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwcm9ncmVzcyBpbmZvcm1hdGlvbiBpbiBhIHRvcGljIG5vdGVcbiAgICAgKi9cbiAgICBhc3luYyByZW5kZXJQcm9ncmVzc0luTm90ZShmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIXRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dQcm9ncmVzc0JhcikgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgICAgICBpZiAoIW1ldGFkYXRhPy5mcm9udG1hdHRlcj8udHlwZSB8fCBtZXRhZGF0YS5mcm9udG1hdHRlci50eXBlICE9PSAndG9waWMnKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFJlYWQgdGhlIGZpbGUgY29udGVudFxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgcHJvZ3Jlc3Mgc2VjdGlvbiBleGlzdHNcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzU2VjdGlvblJlZ2V4ID0gLyMjIFByb2dyZXNzXFxzKlxcbihbXFxzXFxTXSo/KSg/PVxcbiMjfCQpLztcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gY29udGVudC5tYXRjaChwcm9ncmVzc1NlY3Rpb25SZWdleCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgIC8vIEdldCBwcm9ncmVzcyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wbGV0ZWRTdWJ0b3BpY3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5jb21wbGV0ZWRfc3VidG9waWNzIHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgdG90YWxTdWJ0b3BpY3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci50b3RhbF9zdWJ0b3BpY3MgfHwgMDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgcHJvZ3Jlc3MgdmlzdWFsaXphdGlvblxuICAgICAgICAgICAgICAgIGxldCBwcm9ncmVzc0NvbnRlbnQgPSBgXFxuJHtwcm9ncmVzc1BlcmNlbnR9JSBjb21wbGV0ZSAoJHtjb21wbGV0ZWRTdWJ0b3BpY3N9LyR7dG90YWxTdWJ0b3BpY3N9IHN1YnRvcGljcylcXG5cXG5gO1xuICAgICAgICAgICAgICAgIHByb2dyZXNzQ29udGVudCArPSB0aGlzLmNyZWF0ZVByb2dyZXNzQmFyKHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBwcm9ncmVzcyBzZWN0aW9uIGNvbnRlbnRcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkQ29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NTZWN0aW9uUmVnZXgsIFxuICAgICAgICAgICAgICAgICAgICBgIyMgUHJvZ3Jlc3NcXG4ke3Byb2dyZXNzQ29udGVudH1gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGZpbGUgaWYgY29udGVudCBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWRDb250ZW50ICE9PSBjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdXBkYXRlZENvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlbmRlcmluZyBwcm9ncmVzcyBpbiBub3RlOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbiBBU0NJSSBwcm9ncmVzcyBiYXJcbiAgICAgKi9cbiAgICBjcmVhdGVQcm9ncmVzc0Jhcihwcm9ncmVzczogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgYmFyTGVuZ3RoID0gMjA7XG4gICAgICAgIGNvbnN0IGZpbGxlZExlbmd0aCA9IE1hdGgucm91bmQocHJvZ3Jlc3MgKiBiYXJMZW5ndGgpO1xuICAgICAgICBjb25zdCBlbXB0eUxlbmd0aCA9IGJhckxlbmd0aCAtIGZpbGxlZExlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIGxldCBwcm9ncmVzc0JhciA9ICdcXG5gYGBwcm9ncmVzc1xcblsnO1xuICAgICAgICBwcm9ncmVzc0JhciArPSAn4paIJy5yZXBlYXQoZmlsbGVkTGVuZ3RoKTtcbiAgICAgICAgcHJvZ3Jlc3NCYXIgKz0gJ+KWkScucmVwZWF0KGVtcHR5TGVuZ3RoKTtcbiAgICAgICAgcHJvZ3Jlc3NCYXIgKz0gJ11cXG5gYGBcXG4nO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHByb2dyZXNzQmFyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjb21wbGV0aW9uIHN0YXR1cyBpbiBhIHN1YnRvcGljIG5vdGVcbiAgICAgKi9cbiAgICBhc3luYyByZW5kZXJDb21wbGV0aW9uU3RhdHVzKGZpbGU6IFRGaWxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgICAgICBpZiAoIW1ldGFkYXRhPy5mcm9udG1hdHRlcj8udHlwZSB8fCBtZXRhZGF0YS5mcm9udG1hdHRlci50eXBlICE9PSAnc3VidG9waWMnKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFJlYWQgdGhlIGZpbGUgY29udGVudFxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgc3RhdHVzIGxpbmUgZXhpc3RzXG4gICAgICAgICAgICBjb25zdCBzdGF0dXNSZWdleCA9IC9TdGF0dXM6ICjinYwgTm90IGNvbXBsZXRlZHzinIUgQ29tcGxldGVkKS87XG4gICAgICAgICAgICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goc3RhdHVzUmVnZXgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0NvbXBsZXRlZCA9IG1ldGFkYXRhLmZyb250bWF0dGVyLmNvbXBsZXRlZCA9PT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdTdGF0dXNUZXh0ID0gaXNDb21wbGV0ZWQgPyAn4pyFIENvbXBsZXRlZCcgOiAn4p2MIE5vdCBjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIE9ubHkgdXBkYXRlIGlmIHN0YXR1cyBoYXMgY2hhbmdlZFxuICAgICAgICAgICAgICAgIGlmIChtYXRjaFsxXSAhPT0gbmV3U3RhdHVzVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkQ29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1JlZ2V4LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGBTdGF0dXM6ICR7bmV3U3RhdHVzVGV4dH1gXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIHVwZGF0ZWRDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZW5kZXJpbmcgY29tcGxldGlvbiBzdGF0dXM6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgdmlzdWFsIGluZGljYXRvciB0byB0aGUgbm90ZSB0aXRsZSBpbiB0aGUgZmlsZSBleHBsb3JlclxuICAgICAqIE5vdGU6IFRoaXMgcmVxdWlyZXMgQ1NTIHN0eWxpbmcgdG8gYmUgZWZmZWN0aXZlXG4gICAgICovXG4gICAgYWRkVmlzdWFsSW5kaWNhdG9yVG9UaXRsZShmaWxlOiBURmlsZSk6IHZvaWQge1xuICAgICAgICAvLyBUaGlzIHdvdWxkIHR5cGljYWxseSBiZSBpbXBsZW1lbnRlZCB1c2luZyBDU1MgY2xhc3Nlc1xuICAgICAgICAvLyBGb3IgZXhhbXBsZSwgYWRkaW5nIGEgY2xhc3MgdG8gdGhlIGZpbGUgZXhwbG9yZXIgaXRlbSBiYXNlZCBvbiBjb21wbGV0aW9uIHN0YXR1c1xuICAgICAgICAvLyBTaW5jZSBkaXJlY3QgRE9NIG1hbmlwdWxhdGlvbiBvZiB0aGUgZmlsZSBleHBsb3JlciBpcyBub3QgcmVjb21tZW5kZWQsXG4gICAgICAgIC8vIHRoaXMgd291bGQgYmUgYmV0dGVyIGltcGxlbWVudGVkIHVzaW5nIENTUyBzZWxlY3RvcnMgYmFzZWQgb24gZmlsZSBhdHRyaWJ1dGVzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgZGV0YWlsZWQgcHJvZ3Jlc3MgcmVwb3J0IGZvciBhIHRvcGljXG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlUHJvZ3Jlc3NSZXBvcnQoZmlsZTogVEZpbGUpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgaWYgKCFtZXRhZGF0YT8uZnJvbnRtYXR0ZXIpIHJldHVybiBcIk5vIG1ldGFkYXRhIGZvdW5kIGZvciB0aGlzIHRvcGljLlwiO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5wcm9ncmVzcyB8fCAwO1xuICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgY29uc3QgY29tcGxldGVkU3VidG9waWNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIuY29tcGxldGVkX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICBjb25zdCB0b3RhbFN1YnRvcGljcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnRvdGFsX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICBcbiAgICAgICAgbGV0IHJlcG9ydCA9IGAjIFByb2dyZXNzIFJlcG9ydDogJHtmaWxlLmJhc2VuYW1lfVxcblxcbmA7XG4gICAgICAgIFxuICAgICAgICAvLyBPdmVyYWxsIHByb2dyZXNzXG4gICAgICAgIHJlcG9ydCArPSBgIyMgT3ZlcmFsbCBQcm9ncmVzc1xcblxcbmA7XG4gICAgICAgIHJlcG9ydCArPSBgJHtwcm9ncmVzc1BlcmNlbnR9JSBjb21wbGV0ZSAoJHtjb21wbGV0ZWRTdWJ0b3BpY3N9LyR7dG90YWxTdWJ0b3BpY3N9IHN1YnRvcGljcylcXG5cXG5gO1xuICAgICAgICByZXBvcnQgKz0gdGhpcy5jcmVhdGVQcm9ncmVzc0Jhcihwcm9ncmVzcyk7XG4gICAgICAgIHJlcG9ydCArPSAnXFxuJztcbiAgICAgICAgXG4gICAgICAgIC8vIFN1YnRvcGljcyBicmVha2Rvd25cbiAgICAgICAgcmVwb3J0ICs9IGAjIyBTdWJ0b3BpY3NcXG5cXG5gO1xuICAgICAgICBcbiAgICAgICAgaWYgKG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcyAmJiBtZXRhZGF0YS5mcm9udG1hdHRlci5zdWJ0b3BpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdWJ0b3BpYyBvZiBtZXRhZGF0YS5mcm9udG1hdHRlci5zdWJ0b3BpY3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY05hbWUgPSBzdWJ0b3BpYy5yZXBsYWNlKC9cXFtcXFsoLio/KVxcXVxcXS8sICckMScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljRmlsZSA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7c3VidG9waWNOYW1lfS5tZGApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChzdWJ0b3BpY0ZpbGUgJiYgc3VidG9waWNGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNNZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0NvbXBsZXRlZCA9IHN1YnRvcGljTWV0YWRhdGE/LmZyb250bWF0dGVyPy5jb21wbGV0ZWQgPT09IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRpb25EYXRlID0gc3VidG9waWNNZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LmNvbXBsZXRpb25fZGF0ZSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHJlcG9ydCArPSBgLSAke2lzQ29tcGxldGVkID8gJ+KchScgOiAn4p2MJ30gW1ske3N1YnRvcGljTmFtZX1dXWA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlZCAmJiBjb21wbGV0aW9uRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAgKENvbXBsZXRlZDogJHtjb21wbGV0aW9uRGF0ZX0pYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXBvcnQgKz0gJ1xcbic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAtIOKdkyBbWyR7c3VidG9waWNOYW1lfV1dIChNaXNzaW5nKVxcbmA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVwb3J0ICs9IFwiTm8gc3VidG9waWNzIGZvdW5kIGZvciB0aGlzIHRvcGljLlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBSZWNvbW1lbmRhdGlvbnNcbiAgICAgICAgcmVwb3J0ICs9IGBcXG4jIyBOZXh0IFN0ZXBzXFxuXFxuYDtcbiAgICAgICAgXG4gICAgICAgIGlmIChwcm9ncmVzcyA9PT0gMCkge1xuICAgICAgICAgICAgcmVwb3J0ICs9IFwiWW91IGhhdmVuJ3Qgc3RhcnRlZCBsZWFybmluZyB0aGlzIHRvcGljIHlldC4gQ3JlYXRlIHNvbWUgc3VidG9waWNzIHRvIGJlZ2luIHRyYWNraW5nIHlvdXIgcHJvZ3Jlc3MuXFxuXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3MgPT09IDEpIHtcbiAgICAgICAgICAgIHJlcG9ydCArPSBcIkNvbmdyYXR1bGF0aW9ucyEgWW91J3ZlIGNvbXBsZXRlZCBhbGwgc3VidG9waWNzIGZvciB0aGlzIHRvcGljLlxcblwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVwb3J0ICs9IGBZb3UncmUgbWFraW5nIHByb2dyZXNzIG9uIHRoaXMgdG9waWMuIEZvY3VzIG9uIGNvbXBsZXRpbmcgdGhlIHJlbWFpbmluZyBzdWJ0b3BpY3M6XFxuXFxuYDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTGlzdCBpbmNvbXBsZXRlIHN1YnRvcGljc1xuICAgICAgICAgICAgaWYgKG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcyAmJiBtZXRhZGF0YS5mcm9udG1hdHRlci5zdWJ0b3BpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3VidG9waWMgb2YgbWV0YWRhdGEuZnJvbnRtYXR0ZXIuc3VidG9waWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljTmFtZSA9IHN1YnRvcGljLnJlcGxhY2UoL1xcW1xcWyguKj8pXFxdXFxdLywgJyQxJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljRmlsZSA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7c3VidG9waWNOYW1lfS5tZGApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnRvcGljRmlsZSAmJiBzdWJ0b3BpY0ZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNNZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSBzdWJ0b3BpY01ldGFkYXRhPy5mcm9udG1hdHRlcj8uY29tcGxldGVkID09PSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQ29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAtIFtbJHtzdWJ0b3BpY05hbWV9XV1cXG5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVwb3J0O1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCBMZWFybmluZ1Byb2dyZXNzUGx1Z2luIGZyb20gJy4uL21haW4nO1xuXG5leHBvcnQgY2xhc3MgTGVhcm5pbmdQcm9ncmVzc1NldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgICBwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW47XG5cbiAgICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBMZWFybmluZ1Byb2dyZXNzUGx1Z2luKSB7XG4gICAgICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgfVxuXG4gICAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcblxuICAgICAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0xlYXJuaW5nIFByb2dyZXNzIFNldHRpbmdzJyB9KTtcblxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgIC5zZXROYW1lKCdTaG93IFByb2dyZXNzIEJhcicpXG4gICAgICAgICAgICAuc2V0RGVzYygnU2hvdyBwcm9ncmVzcyBiYXIgaW4gdG9waWMgbm90ZXMnKVxuICAgICAgICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dQcm9ncmVzc0JhcilcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dQcm9ncmVzc0JhciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZSgnU2hvdyBLbm93bGVkZ2UgTWFwJylcbiAgICAgICAgICAgIC5zZXREZXNjKCdTaG93IGtub3dsZWRnZSBtYXAgaW4gc2lkZWJhcicpXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc2hvd0tub3dsZWRnZU1hcClcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dLbm93bGVkZ2VNYXAgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoJ1RvcGljIFRlbXBsYXRlJylcbiAgICAgICAgICAgIC5zZXREZXNjKCdUZW1wbGF0ZSBmb3IgbmV3IHRvcGljIG5vdGVzJylcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYSh0ZXh0ID0+IHRleHRcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFRvcGljVGVtcGxhdGUpXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0VG9waWNUZW1wbGF0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIC5zZXRDbGFzcygndGVtcGxhdGUtc2V0dGluZycpO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoJ1N1YnRvcGljIFRlbXBsYXRlJylcbiAgICAgICAgICAgIC5zZXREZXNjKCdUZW1wbGF0ZSBmb3IgbmV3IHN1YnRvcGljIG5vdGVzJylcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYSh0ZXh0ID0+IHRleHRcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFN1YnRvcGljVGVtcGxhdGUpXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3VidG9waWNUZW1wbGF0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIC5zZXRDbGFzcygndGVtcGxhdGUtc2V0dGluZycpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEFwcCwgRWRpdG9yLCBNYXJrZG93blZpZXcsIE1vZGFsLCBOb3RpY2UsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgVEZpbGUsIEZyb250TWF0dGVyQ2FjaGUsIE1ldGFkYXRhQ2FjaGUsIFZhdWx0LCBNYXJrZG93bkZpbGVJbmZvIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgU3VidG9waWNUcmFja2VyVmlldywgU1VCVE9QSUNfVFJBQ0tFUl9WSUVXX1RZUEUgfSBmcm9tICcuL3ZpZXdzL1N1YnRvcGljVHJhY2tlclZpZXcnO1xuaW1wb3J0IHsgS25vd2xlZGdlTWFwVmlldywgS05PV0xFREdFX01BUF9WSUVXX1RZUEUgfSBmcm9tICcuL3ZpZXdzL0tub3dsZWRnZU1hcFZpZXcnO1xuaW1wb3J0IHsgUHJvZ3Jlc3NSZW5kZXJlciB9IGZyb20gJy4vcmVuZGVyaW5nL1Byb2dyZXNzUmVuZGVyZXInO1xuaW1wb3J0IHsgUHJvZ3Jlc3NUcmFja2VyIH0gZnJvbSAnLi90cmFja2luZy9Qcm9ncmVzc1RyYWNrZXInO1xuaW1wb3J0IHsgTGVhcm5pbmdQcm9ncmVzc1NldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzL1NldHRpbmdzVGFiJztcblxuaW50ZXJmYWNlIExlYXJuaW5nUHJvZ3Jlc3NTZXR0aW5ncyB7XG5cdGRlZmF1bHRUb3BpY1RlbXBsYXRlOiBzdHJpbmc7XG5cdGRlZmF1bHRTdWJ0b3BpY1RlbXBsYXRlOiBzdHJpbmc7XG5cdHNob3dQcm9ncmVzc0JhcjogYm9vbGVhbjtcblx0c2hvd0tub3dsZWRnZU1hcDogYm9vbGVhbjtcbn1cblxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogTGVhcm5pbmdQcm9ncmVzc1NldHRpbmdzID0ge1xuXHRkZWZhdWx0VG9waWNUZW1wbGF0ZTogXCItLS1cXG50eXBlOiB0b3BpY1xcbnByb2dyZXNzOiAwXFxuc3VidG9waWNzOiBbXVxcbnRvdGFsX3N1YnRvcGljczogMFxcbmNvbXBsZXRlZF9zdWJ0b3BpY3M6IDBcXG4tLS1cXG5cXG4jIHt7dGl0bGV9fVxcblxcbiMjIFByb2dyZXNzXFxuXFxuMCUgY29tcGxldGVcXG5cXG4jIyBTdWJ0b3BpY3NcXG5cXG5cIixcblx0ZGVmYXVsdFN1YnRvcGljVGVtcGxhdGU6IFwiLS0tXFxudHlwZTogc3VidG9waWNcXG5wYXJlbnQ6IFxcXCJbW3t7cGFyZW50fX1dXVxcXCJcXG5jb21wbGV0ZWQ6IGZhbHNlXFxuLS0tXFxuXFxuIyB7e3RpdGxlfX1cXG5cXG5TdGF0dXM6IOKdjCBOb3QgY29tcGxldGVkXFxuXFxuIyMgTm90ZXNcXG5cXG5cIixcblx0c2hvd1Byb2dyZXNzQmFyOiB0cnVlLFxuXHRzaG93S25vd2xlZGdlTWFwOiB0cnVlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuXHRzZXR0aW5nczogTGVhcm5pbmdQcm9ncmVzc1NldHRpbmdzO1xuXHRwcm9ncmVzc1JlbmRlcmVyOiBQcm9ncmVzc1JlbmRlcmVyO1xuXHRwcm9ncmVzc1RyYWNrZXI6IFByb2dyZXNzVHJhY2tlcjtcblxuXHRhc3luYyBvbmxvYWQoKSB7XG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTtcblxuXHRcdC8vIEluaXRpYWxpemUgY29tcG9uZW50c1xuXHRcdHRoaXMucHJvZ3Jlc3NSZW5kZXJlciA9IG5ldyBQcm9ncmVzc1JlbmRlcmVyKHRoaXMpO1xuXHRcdHRoaXMucHJvZ3Jlc3NUcmFja2VyID0gbmV3IFByb2dyZXNzVHJhY2tlcih0aGlzKTtcblxuXHRcdC8vIFJlZ2lzdGVyIHZpZXdzXG5cdFx0dGhpcy5yZWdpc3RlclZpZXcoXG5cdFx0XHRTVUJUT1BJQ19UUkFDS0VSX1ZJRVdfVFlQRSxcblx0XHRcdChsZWFmKSA9PiBuZXcgU3VidG9waWNUcmFja2VyVmlldyhsZWFmLCB0aGlzKVxuXHRcdCk7XG5cblx0XHR0aGlzLnJlZ2lzdGVyVmlldyhcblx0XHRcdEtOT1dMRURHRV9NQVBfVklFV19UWVBFLFxuXHRcdFx0KGxlYWYpID0+IG5ldyBLbm93bGVkZ2VNYXBWaWV3KGxlYWYsIHRoaXMpXG5cdFx0KTtcblxuXHRcdC8vIFJlZ2lzdGVyIGNvbW1hbmRzXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnY3JlYXRlLXRvcGljLW5vdGUnLFxuXHRcdFx0bmFtZTogJ0NyZWF0ZSBUb3BpYyBOb3RlJyxcblx0XHRcdGNhbGxiYWNrOiAoKSA9PiB7XG5cdFx0XHRcdG5ldyBUb3BpY0NyZWF0aW9uTW9kYWwodGhpcy5hcHAsIHRoaXMpLm9wZW4oKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2NyZWF0ZS1zdWJ0b3BpYy1ub3RlJyxcblx0XHRcdG5hbWU6ICdDcmVhdGUgU3VidG9waWMgTm90ZScsXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yLCB2aWV3OiBNYXJrZG93blZpZXcpID0+IHtcblx0XHRcdFx0Y29uc3QgZmlsZSA9IHZpZXcuZmlsZTtcblx0XHRcdFx0aWYgKGZpbGUpIHtcblx0XHRcdFx0XHRjb25zdCBtZXRhZGF0YSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuXHRcdFx0XHRcdGlmIChtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnR5cGUgPT09ICd0b3BpYycpIHtcblx0XHRcdFx0XHRcdG5ldyBTdWJ0b3BpY0NyZWF0aW9uTW9kYWwodGhpcy5hcHAsIHRoaXMsIGZpbGUuYmFzZW5hbWUpLm9wZW4oKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZSgnQ3VycmVudCBub3RlIGlzIG5vdCBhIHRvcGljIG5vdGUuIFBsZWFzZSBvcGVuIGEgdG9waWMgbm90ZSBmaXJzdC4nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ3RvZ2dsZS1zdWJ0b3BpYy1jb21wbGV0aW9uJyxcblx0XHRcdG5hbWU6ICdUb2dnbGUgU3VidG9waWMgQ29tcGxldGlvbicsXG5cdFx0XHRlZGl0b3JDYWxsYmFjazogKGVkaXRvcjogRWRpdG9yLCB2aWV3OiBNYXJrZG93blZpZXcpID0+IHtcblx0XHRcdFx0Y29uc3QgZmlsZSA9IHZpZXcuZmlsZTtcblx0XHRcdFx0aWYgKGZpbGUpIHtcblx0XHRcdFx0XHRjb25zdCBtZXRhZGF0YSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuXHRcdFx0XHRcdGlmIChtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnR5cGUgPT09ICdzdWJ0b3BpYycpIHtcblx0XHRcdFx0XHRcdHRoaXMudG9nZ2xlU3VidG9waWNDb21wbGV0aW9uKGZpbGUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRuZXcgTm90aWNlKCdDdXJyZW50IG5vdGUgaXMgbm90IGEgc3VidG9waWMgbm90ZS4gUGxlYXNlIG9wZW4gYSBzdWJ0b3BpYyBub3RlIGZpcnN0LicpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnc2hvdy1zdWJ0b3BpYy10cmFja2VyJyxcblx0XHRcdG5hbWU6ICdTaG93IFN1YnRvcGljIFRyYWNrZXInLFxuXHRcdFx0Y2FsbGJhY2s6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0dGhpcy5hY3RpdmF0ZVZpZXcoU1VCVE9QSUNfVFJBQ0tFUl9WSUVXX1RZUEUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hZGRDb21tYW5kKHtcblx0XHRcdGlkOiAnc2hvdy1rbm93bGVkZ2UtbWFwJyxcblx0XHRcdG5hbWU6ICdTaG93IEtub3dsZWRnZSBNYXAnLFxuXHRcdFx0Y2FsbGJhY2s6IGFzeW5jICgpID0+IHtcblx0XHRcdFx0dGhpcy5hY3RpdmF0ZVZpZXcoS05PV0xFREdFX01BUF9WSUVXX1RZUEUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gUmVnaXN0ZXIgZXZlbnQgbGlzdGVuZXJzXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdhY3RpdmUtbGVhZi1jaGFuZ2UnLCAobGVhZikgPT4ge1xuXHRcdFx0XHRpZiAobGVhZiAmJiBsZWFmLnZpZXcgaW5zdGFuY2VvZiBNYXJrZG93blZpZXcpIHtcblx0XHRcdFx0XHRjb25zdCBmaWxlID0gbGVhZi52aWV3LmZpbGU7XG5cdFx0XHRcdFx0aWYgKGZpbGUpIHtcblx0XHRcdFx0XHRcdHRoaXMucHJvZ3Jlc3NSZW5kZXJlci5yZW5kZXJQcm9ncmVzc0luTm90ZShmaWxlKTtcblx0XHRcdFx0XHRcdHRoaXMucHJvZ3Jlc3NSZW5kZXJlci5yZW5kZXJDb21wbGV0aW9uU3RhdHVzKGZpbGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHQpO1xuXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAubWV0YWRhdGFDYWNoZS5vbignY2hhbmdlZCcsIChmaWxlKSA9PiB7XG5cdFx0XHRcdHRoaXMudXBkYXRlUHJvZ3Jlc3NJZk5lZWRlZChmaWxlKTtcblx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdC8vIEFkZCBzZXR0aW5ncyB0YWJcblx0XHR0aGlzLmFkZFNldHRpbmdUYWIobmV3IExlYXJuaW5nUHJvZ3Jlc3NTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG5cblx0XHQvLyBBZGQgcmliYm9uIGljb25cblx0XHR0aGlzLmFkZFJpYmJvbkljb24oJ2dyYWR1YXRpb24tY2FwJywgJ0xlYXJuaW5nIFByb2dyZXNzJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5hY3RpdmF0ZVZpZXcoU1VCVE9QSUNfVFJBQ0tFUl9WSUVXX1RZUEUpO1xuXHRcdH0pO1xuXHR9XG5cblx0b251bmxvYWQoKSB7XG5cdFx0Y29uc29sZS5sb2coJ0xlYXJuaW5nIFByb2dyZXNzIFBsdWdpbiB1bmxvYWRlZCcpO1xuXHR9XG5cblx0YXN5bmMgbG9hZFNldHRpbmdzKCkge1xuXHRcdHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuXHR9XG5cblx0YXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuXHRcdGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG5cdH1cblxuXHRhc3luYyBhY3RpdmF0ZVZpZXcodmlld1R5cGU6IHN0cmluZykge1xuXHRcdGNvbnN0IHsgd29ya3NwYWNlIH0gPSB0aGlzLmFwcDtcblx0XHRcblx0XHQvLyBDaGVjayBpZiB2aWV3IGlzIGFscmVhZHkgb3BlblxuXHRcdGxldCBsZWFmID0gd29ya3NwYWNlLmdldExlYXZlc09mVHlwZSh2aWV3VHlwZSlbMF07XG5cdFx0XG5cdFx0aWYgKCFsZWFmKSB7XG5cdFx0XHQvLyBDcmVhdGUgbmV3IGxlYWYgaW4gdGhlIHJpZ2h0IHNpZGViYXJcblx0XHRcdGxlYWYgPSB3b3Jrc3BhY2UuZ2V0UmlnaHRMZWFmKGZhbHNlKTtcblx0XHRcdGF3YWl0IGxlYWYuc2V0Vmlld1N0YXRlKHsgdHlwZTogdmlld1R5cGUgfSk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vIFJldmVhbCB0aGUgbGVhZlxuXHRcdHdvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYWYpO1xuXHR9XG5cblx0YXN5bmMgY3JlYXRlVG9waWNOb3RlKHRpdGxlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBjb250ZW50ID0gdGhpcy5zZXR0aW5ncy5kZWZhdWx0VG9waWNUZW1wbGF0ZS5yZXBsYWNlKCd7e3RpdGxlfX0nLCB0aXRsZSk7XG5cdFx0Y29uc3QgZmlsZU5hbWUgPSBgJHt0aXRsZX0ubWRgO1xuXHRcdFxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBleGlzdGluZ0ZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoZmlsZU5hbWUpO1xuXHRcdFx0aWYgKGV4aXN0aW5nRmlsZSkge1xuXHRcdFx0XHRuZXcgTm90aWNlKGBOb3RlIFwiJHtmaWxlTmFtZX1cIiBhbHJlYWR5IGV4aXN0c2ApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGNvbnN0IGZpbGUgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5jcmVhdGUoZmlsZU5hbWUsIGNvbnRlbnQpO1xuXHRcdFx0bmV3IE5vdGljZShgVG9waWMgbm90ZSBcIiR7dGl0bGV9XCIgY3JlYXRlZGApO1xuXHRcdFx0XG5cdFx0XHQvLyBPcGVuIHRoZSBuZXdseSBjcmVhdGVkIGZpbGVcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKCkub3BlbkZpbGUoZmlsZSk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHRvcGljIG5vdGU6JywgZXJyb3IpO1xuXHRcdFx0bmV3IE5vdGljZSgnRXJyb3IgY3JlYXRpbmcgdG9waWMgbm90ZScpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGNyZWF0ZVN1YnRvcGljTm90ZSh0aXRsZTogc3RyaW5nLCBwYXJlbnRUb3BpYzogc3RyaW5nKSB7XG5cdFx0Y29uc3QgY29udGVudCA9IHRoaXMuc2V0dGluZ3MuZGVmYXVsdFN1YnRvcGljVGVtcGxhdGVcblx0XHRcdC5yZXBsYWNlKCd7e3RpdGxlfX0nLCB0aXRsZSlcblx0XHRcdC5yZXBsYWNlKCd7e3BhcmVudH19JywgcGFyZW50VG9waWMpO1xuXHRcdGNvbnN0IGZpbGVOYW1lID0gYCR7dGl0bGV9Lm1kYDtcblx0XHRcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZXhpc3RpbmdGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZpbGVOYW1lKTtcblx0XHRcdGlmIChleGlzdGluZ0ZpbGUpIHtcblx0XHRcdFx0bmV3IE5vdGljZShgTm90ZSBcIiR7ZmlsZU5hbWV9XCIgYWxyZWFkeSBleGlzdHNgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKGZpbGVOYW1lLCBjb250ZW50KTtcblx0XHRcdG5ldyBOb3RpY2UoYFN1YnRvcGljIG5vdGUgXCIke3RpdGxlfVwiIGNyZWF0ZWRgKTtcblx0XHRcdFxuXHRcdFx0Ly8gVXBkYXRlIHBhcmVudCB0b3BpYydzIHN1YnRvcGljcyBsaXN0XG5cdFx0XHRhd2FpdCB0aGlzLmFkZFN1YnRvcGljVG9QYXJlbnQocGFyZW50VG9waWMsIHRpdGxlKTtcblx0XHRcdFxuXHRcdFx0Ly8gT3BlbiB0aGUgbmV3bHkgY3JlYXRlZCBmaWxlXG5cdFx0XHR0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKGZpbGUpO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyBzdWJ0b3BpYyBub3RlOicsIGVycm9yKTtcblx0XHRcdG5ldyBOb3RpY2UoJ0Vycm9yIGNyZWF0aW5nIHN1YnRvcGljIG5vdGUnKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBhZGRTdWJ0b3BpY1RvUGFyZW50KHBhcmVudFRvcGljOiBzdHJpbmcsIHN1YnRvcGljVGl0bGU6IHN0cmluZykge1xuXHRcdGNvbnN0IHBhcmVudEZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7cGFyZW50VG9waWN9Lm1kYCk7XG5cdFx0aWYgKCFwYXJlbnRGaWxlIHx8ICEocGFyZW50RmlsZSBpbnN0YW5jZW9mIFRGaWxlKSkge1xuXHRcdFx0bmV3IE5vdGljZShgUGFyZW50IHRvcGljIFwiJHtwYXJlbnRUb3BpY31cIiBub3QgZm91bmRgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0XG5cdFx0dHJ5IHtcblx0XHRcdC8vIFJlYWQgdGhlIHBhcmVudCBmaWxlIGNvbnRlbnRcblx0XHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKHBhcmVudEZpbGUpO1xuXHRcdFx0XG5cdFx0XHQvLyBQYXJzZSBmcm9udG1hdHRlclxuXHRcdFx0Y29uc3QgZnJvbnRtYXR0ZXJSZWdleCA9IC9eLS0tXFxuKFtcXHNcXFNdKj8pXFxuLS0tLztcblx0XHRcdGNvbnN0IG1hdGNoID0gY29udGVudC5tYXRjaChmcm9udG1hdHRlclJlZ2V4KTtcblx0XHRcdFxuXHRcdFx0aWYgKG1hdGNoKSB7XG5cdFx0XHRcdGxldCBmcm9udG1hdHRlciA9IG1hdGNoWzFdO1xuXHRcdFx0XHRjb25zdCBzdWJ0b3BpY0xpbmsgPSBgW1ske3N1YnRvcGljVGl0bGV9XV1gO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVXBkYXRlIHN1YnRvcGljcyBhcnJheSBpbiBmcm9udG1hdHRlclxuXHRcdFx0XHRpZiAoZnJvbnRtYXR0ZXIuaW5jbHVkZXMoJ3N1YnRvcGljczonKSkge1xuXHRcdFx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYW4gYXJyYXkgZm9ybWF0XG5cdFx0XHRcdFx0aWYgKGZyb250bWF0dGVyLmluY2x1ZGVzKCdzdWJ0b3BpY3M6IFsnKSkge1xuXHRcdFx0XHRcdFx0Ly8gQXJyYXkgZm9ybWF0XG5cdFx0XHRcdFx0XHRjb25zdCBhcnJheVJlZ2V4ID0gL3N1YnRvcGljczogXFxbKFtcXHNcXFNdKj8pXFxdLztcblx0XHRcdFx0XHRcdGNvbnN0IGFycmF5TWF0Y2ggPSBmcm9udG1hdHRlci5tYXRjaChhcnJheVJlZ2V4KTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0aWYgKGFycmF5TWF0Y2gpIHtcblx0XHRcdFx0XHRcdFx0bGV0IHN1YnRvcGljc0FycmF5ID0gYXJyYXlNYXRjaFsxXS5zcGxpdCgnLCcpLm1hcChzID0+IHMudHJpbSgpKTtcblx0XHRcdFx0XHRcdFx0aWYgKCFzdWJ0b3BpY3NBcnJheS5pbmNsdWRlcyhgXCIke3N1YnRvcGljTGlua31cImApKSB7XG5cdFx0XHRcdFx0XHRcdFx0c3VidG9waWNzQXJyYXkucHVzaChgXCIke3N1YnRvcGljTGlua31cImApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGZyb250bWF0dGVyID0gZnJvbnRtYXR0ZXIucmVwbGFjZShhcnJheVJlZ2V4LCBgc3VidG9waWNzOiBbJHtzdWJ0b3BpY3NBcnJheS5qb2luKCcsICcpfV1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gTGlzdCBmb3JtYXRcblx0XHRcdFx0XHRcdGNvbnN0IGxpc3RSZWdleCA9IC9zdWJ0b3BpY3M6W1xcc1xcU10qPyg/PVxcblxcd3wkKS87XG5cdFx0XHRcdFx0XHRjb25zdCBsaXN0TWF0Y2ggPSBmcm9udG1hdHRlci5tYXRjaChsaXN0UmVnZXgpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRpZiAobGlzdE1hdGNoKSB7XG5cdFx0XHRcdFx0XHRcdGxldCBzdWJ0b3BpY3NMaXN0ID0gbGlzdE1hdGNoWzBdO1xuXHRcdFx0XHRcdFx0XHRpZiAoIXN1YnRvcGljc0xpc3QuaW5jbHVkZXMoc3VidG9waWNMaW5rKSkge1xuXHRcdFx0XHRcdFx0XHRcdHN1YnRvcGljc0xpc3QgKz0gYFxcbiAgLSBcIiR7c3VidG9waWNMaW5rfVwiYDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRmcm9udG1hdHRlciA9IGZyb250bWF0dGVyLnJlcGxhY2UobGlzdFJlZ2V4LCBzdWJ0b3BpY3NMaXN0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gQWRkIHN1YnRvcGljcyBmaWVsZCBpZiBpdCBkb2Vzbid0IGV4aXN0XG5cdFx0XHRcdFx0ZnJvbnRtYXR0ZXIgKz0gYFxcbnN1YnRvcGljczpcXG4gIC0gXCIke3N1YnRvcGljTGlua31cImA7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIFVwZGF0ZSB0b3RhbF9zdWJ0b3BpY3MgY291bnRcblx0XHRcdFx0Y29uc3QgdG90YWxTdWJ0b3BpY3NSZWdleCA9IC90b3RhbF9zdWJ0b3BpY3M6IChcXGQrKS87XG5cdFx0XHRcdGNvbnN0IHRvdGFsTWF0Y2ggPSBmcm9udG1hdHRlci5tYXRjaCh0b3RhbFN1YnRvcGljc1JlZ2V4KTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmICh0b3RhbE1hdGNoKSB7XG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudFRvdGFsID0gcGFyc2VJbnQodG90YWxNYXRjaFsxXSk7XG5cdFx0XHRcdFx0ZnJvbnRtYXR0ZXIgPSBmcm9udG1hdHRlci5yZXBsYWNlKHRvdGFsU3VidG9waWNzUmVnZXgsIGB0b3RhbF9zdWJ0b3BpY3M6ICR7Y3VycmVudFRvdGFsICsgMX1gKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmcm9udG1hdHRlciArPSBgXFxudG90YWxfc3VidG9waWNzOiAxYDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gUmVwbGFjZSBmcm9udG1hdHRlciBpbiBjb250ZW50XG5cdFx0XHRcdGNvbnN0IHVwZGF0ZWRDb250ZW50ID0gY29udGVudC5yZXBsYWNlKGZyb250bWF0dGVyUmVnZXgsIGAtLS1cXG4ke2Zyb250bWF0dGVyfVxcbi0tLWApO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSBmaWxlXG5cdFx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShwYXJlbnRGaWxlLCB1cGRhdGVkQ29udGVudCk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBBbHNvIGFkZCB0byB0aGUgc3VidG9waWNzIGxpc3QgaW4gdGhlIGNvbnRlbnQgaWYgaXQgZXhpc3RzXG5cdFx0XHRcdGF3YWl0IHRoaXMuYWRkU3VidG9waWNUb0NvbnRlbnRMaXN0KHBhcmVudEZpbGUpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBwYXJlbnQgdG9waWM6JywgZXJyb3IpO1xuXHRcdFx0bmV3IE5vdGljZSgnRXJyb3IgdXBkYXRpbmcgcGFyZW50IHRvcGljJyk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgYWRkU3VidG9waWNUb0NvbnRlbnRMaXN0KHBhcmVudEZpbGU6IFRGaWxlKSB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKHBhcmVudEZpbGUpO1xuXHRcdFx0Y29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShwYXJlbnRGaWxlKTtcblx0XHRcdFxuXHRcdFx0aWYgKG1ldGFkYXRhPy5mcm9udG1hdHRlcj8uc3VidG9waWNzKSB7XG5cdFx0XHRcdGNvbnN0IHN1YnRvcGljcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcztcblx0XHRcdFx0XG5cdFx0XHRcdC8vIEZpbmQgdGhlIHN1YnRvcGljcyBzZWN0aW9uIGluIHRoZSBjb250ZW50XG5cdFx0XHRcdGNvbnN0IHN1YnRvcGljc1NlY3Rpb25SZWdleCA9IC8jIyBTdWJ0b3BpY3NcXHMqXFxuKFtcXHNcXFNdKj8pKD89XFxuIyN8JCkvO1xuXHRcdFx0XHRjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goc3VidG9waWNzU2VjdGlvblJlZ2V4KTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChtYXRjaCkge1xuXHRcdFx0XHRcdGxldCBzdWJ0b3BpY3NTZWN0aW9uID0gbWF0Y2hbMF07XG5cdFx0XHRcdFx0bGV0IHN1YnRvcGljc0xpc3QgPSAnJztcblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBDcmVhdGUgYSBsaXN0IG9mIHN1YnRvcGljcyB3aXRoIGNvbXBsZXRpb24gc3RhdHVzXG5cdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoc3VidG9waWNzKSkge1xuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBzdWJ0b3BpYyBvZiBzdWJ0b3BpY3MpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3VidG9waWNOYW1lID0gc3VidG9waWMucmVwbGFjZSgvXFxbXFxbKC4qPylcXF1cXF0vLCAnJDEnKTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3VidG9waWNGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGAke3N1YnRvcGljTmFtZX0ubWRgKTtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdGlmIChzdWJ0b3BpY0ZpbGUgJiYgc3VidG9waWNGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdWJ0b3BpY01ldGFkYXRhID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoc3VidG9waWNGaWxlKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBpc0NvbXBsZXRlZCA9IHN1YnRvcGljTWV0YWRhdGE/LmZyb250bWF0dGVyPy5jb21wbGV0ZWQgPT09IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0c3VidG9waWNzTGlzdCArPSBgLSAke3N1YnRvcGljfSAke2lzQ29tcGxldGVkID8gJ+KchScgOiAn4p2MJ31cXG5gO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHN1YnRvcGljc0xpc3QgKz0gYC0gJHtzdWJ0b3BpY30g4p2MXFxuYDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBSZXBsYWNlIHRoZSBzdWJ0b3BpY3Mgc2VjdGlvbiBjb250ZW50XG5cdFx0XHRcdFx0Y29uc3QgdXBkYXRlZFN1YnRvcGljc1NlY3Rpb24gPSBgIyMgU3VidG9waWNzXFxuXFxuJHtzdWJ0b3BpY3NMaXN0fWA7XG5cdFx0XHRcdFx0Y29uc3QgdXBkYXRlZENvbnRlbnQgPSBjb250ZW50LnJlcGxhY2Uoc3VidG9waWNzU2VjdGlvblJlZ2V4LCB1cGRhdGVkU3VidG9waWNzU2VjdGlvbik7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KHBhcmVudEZpbGUsIHVwZGF0ZWRDb250ZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBzdWJ0b3BpY3MgbGlzdCBpbiBjb250ZW50OicsIGVycm9yKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyB0b2dnbGVTdWJ0b3BpY0NvbXBsZXRpb24oZmlsZTogVEZpbGUpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcblx0XHRcdGlmICghbWV0YWRhdGE/LmZyb250bWF0dGVyKSByZXR1cm47XG5cdFx0XHRcblx0XHRcdGNvbnN0IGlzQ29tcGxldGVkID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIuY29tcGxldGVkID09PSB0cnVlO1xuXHRcdFx0Y29uc3QgbmV3U3RhdHVzID0gIWlzQ29tcGxldGVkO1xuXHRcdFx0XG5cdFx0XHQvLyBSZWFkIHRoZSBmaWxlIGNvbnRlbnRcblx0XHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGUgZnJvbnRtYXR0ZXJcblx0XHRcdGNvbnN0IGZyb250bWF0dGVyUmVnZXggPSAvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLS87XG5cdFx0XHRjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goZnJvbnRtYXR0ZXJSZWdleCk7XG5cdFx0XHRcblx0XHRcdGlmIChtYXRjaCkge1xuXHRcdFx0XHRsZXQgZnJvbnRtYXR0ZXIgPSBtYXRjaFsxXTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIFVwZGF0ZSBjb21wbGV0ZWQgc3RhdHVzXG5cdFx0XHRcdGlmIChmcm9udG1hdHRlci5pbmNsdWRlcygnY29tcGxldGVkOicpKSB7XG5cdFx0XHRcdFx0ZnJvbnRtYXR0ZXIgPSBmcm9udG1hdHRlci5yZXBsYWNlKC9jb21wbGV0ZWQ6ICh0cnVlfGZhbHNlKS8sIGBjb21wbGV0ZWQ6ICR7bmV3U3RhdHVzfWApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZyb250bWF0dGVyICs9IGBcXG5jb21wbGV0ZWQ6ICR7bmV3U3RhdHVzfWA7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIEFkZCBjb21wbGV0aW9uIGRhdGUgaWYgYmVpbmcgbWFya2VkIGFzIGNvbXBsZXRlZFxuXHRcdFx0XHRpZiAobmV3U3RhdHVzKSB7XG5cdFx0XHRcdFx0Y29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkuc3BsaXQoJ1QnKVswXTtcblx0XHRcdFx0XHRpZiAoZnJvbnRtYXR0ZXIuaW5jbHVkZXMoJ2NvbXBsZXRpb25fZGF0ZTonKSkge1xuXHRcdFx0XHRcdFx0ZnJvbnRtYXR0ZXIgPSBmcm9udG1hdHRlci5yZXBsYWNlKC9jb21wbGV0aW9uX2RhdGU6IC4qLywgYGNvbXBsZXRpb25fZGF0ZTogJHt0b2RheX1gKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZnJvbnRtYXR0ZXIgKz0gYFxcbmNvbXBsZXRpb25fZGF0ZTogJHt0b2RheX1gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gUmVwbGFjZSBmcm9udG1hdHRlciBpbiBjb250ZW50XG5cdFx0XHRcdGxldCB1cGRhdGVkQ29udGVudCA9IGNvbnRlbnQucmVwbGFjZShmcm9udG1hdHRlclJlZ2V4LCBgLS0tXFxuJHtmcm9udG1hdHRlcn1cXG4tLS1gKTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIFVwZGF0ZSBzdGF0dXMgaW4gY29udGVudFxuXHRcdFx0XHRjb25zdCBzdGF0dXNSZWdleCA9IC9TdGF0dXM6ICjinYwgTm90IGNvbXBsZXRlZHzinIUgQ29tcGxldGVkKS87XG5cdFx0XHRcdGNvbnN0IHN0YXR1c01hdGNoID0gdXBkYXRlZENvbnRlbnQubWF0Y2goc3RhdHVzUmVnZXgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHN0YXR1c01hdGNoKSB7XG5cdFx0XHRcdFx0Y29uc3QgbmV3U3RhdHVzVGV4dCA9IG5ld1N0YXR1cyA/ICfinIUgQ29tcGxldGVkJyA6ICfinYwgTm90IGNvbXBsZXRlZCc7XG5cdFx0XHRcdFx0dXBkYXRlZENvbnRlbnQgPSB1cGRhdGVkQ29udGVudC5yZXBsYWNlKHN0YXR1c1JlZ2V4LCBgU3RhdHVzOiAke25ld1N0YXR1c1RleHR9YCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgZmlsZVxuXHRcdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdXBkYXRlZENvbnRlbnQpO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVXBkYXRlIHBhcmVudCB0b3BpYyBwcm9ncmVzc1xuXHRcdFx0XHRpZiAobWV0YWRhdGEuZnJvbnRtYXR0ZXIucGFyZW50KSB7XG5cdFx0XHRcdFx0Y29uc3QgcGFyZW50TmFtZSA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnBhcmVudC5yZXBsYWNlKC9cXFtcXFsoLio/KVxcXVxcXS8sICckMScpO1xuXHRcdFx0XHRcdGNvbnN0IHBhcmVudEZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7cGFyZW50TmFtZX0ubWRgKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAocGFyZW50RmlsZSAmJiBwYXJlbnRGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMudXBkYXRlVG9waWNQcm9ncmVzcyhwYXJlbnRGaWxlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdG5ldyBOb3RpY2UoYFN1YnRvcGljIG1hcmtlZCBhcyAke25ld1N0YXR1cyA/ICdjb21wbGV0ZWQnIDogJ25vdCBjb21wbGV0ZWQnfWApO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciB0b2dnbGluZyBzdWJ0b3BpYyBjb21wbGV0aW9uOicsIGVycm9yKTtcblx0XHRcdG5ldyBOb3RpY2UoJ0Vycm9yIHVwZGF0aW5nIHN1YnRvcGljIHN0YXR1cycpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIHVwZGF0ZVRvcGljUHJvZ3Jlc3MoZmlsZTogVEZpbGUpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcblx0XHRcdGlmICghbWV0YWRhdGE/LmZyb250bWF0dGVyPy50eXBlIHx8IG1ldGFkYXRhLmZyb250bWF0dGVyLnR5cGUgIT09ICd0b3BpYycpIHJldHVybjtcblx0XHRcdFxuXHRcdFx0Y29uc3Qgc3VidG9waWNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIuc3VidG9waWNzIHx8IFtdO1xuXHRcdFx0aWYgKCFzdWJ0b3BpY3MubGVuZ3RoKSByZXR1cm47XG5cdFx0XHRcblx0XHRcdGxldCBjb21wbGV0ZWRDb3VudCA9IDA7XG5cdFx0XHRjb25zdCB0b3RhbENvdW50ID0gc3VidG9waWNzLmxlbmd0aDtcblx0XHRcdFxuXHRcdFx0Ly8gQ291bnQgY29tcGxldGVkIHN1YnRvcGljc1xuXHRcdFx0Zm9yIChjb25zdCBzdWJ0b3BpYyBvZiBzdWJ0b3BpY3MpIHtcblx0XHRcdFx0Y29uc3Qgc3VidG9waWNOYW1lID0gc3VidG9waWMucmVwbGFjZSgvXFxbXFxbKC4qPylcXF1cXF0vLCAnJDEnKTtcblx0XHRcdFx0Y29uc3Qgc3VidG9waWNGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGAke3N1YnRvcGljTmFtZX0ubWRgKTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChzdWJ0b3BpY0ZpbGUgJiYgc3VidG9waWNGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdFx0XHRjb25zdCBzdWJ0b3BpY01ldGFkYXRhID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoc3VidG9waWNGaWxlKTtcblx0XHRcdFx0XHRpZiAoc3VidG9waWNNZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LmNvbXBsZXRlZCA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0Y29tcGxldGVkQ291bnQrKztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gQ2FsY3VsYXRlIHByb2dyZXNzXG5cdFx0XHRjb25zdCBwcm9ncmVzcyA9IHRvdGFsQ291bnQgPiAwID8gY29tcGxldGVkQ291bnQgLyB0b3RhbENvdW50IDogMDtcblx0XHRcdGNvbnN0IHByb2dyZXNzUGVyY2VudCA9IE1hdGgucm91bmQocHJvZ3Jlc3MgKiAxMDApO1xuXHRcdFx0XG5cdFx0XHQvLyBSZWFkIHRoZSBmaWxlIGNvbnRlbnRcblx0XHRcdGNvbnN0IGNvbnRlbnQgPSBhd2FpdCB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGUgZnJvbnRtYXR0ZXJcblx0XHRcdGNvbnN0IGZyb250bWF0dGVyUmVnZXggPSAvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLS87XG5cdFx0XHRjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goZnJvbnRtYXR0ZXJSZWdleCk7XG5cdFx0XHRcblx0XHRcdGlmIChtYXRjaCkge1xuXHRcdFx0XHRsZXQgZnJvbnRtYXR0ZXIgPSBtYXRjaFsxXTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIFVwZGF0ZSBwcm9ncmVzc1xuXHRcdFx0XHRpZiAoZnJvbnRtYXR0ZXIuaW5jbHVkZXMoJ3Byb2dyZXNzOicpKSB7XG5cdFx0XHRcdFx0ZnJvbnRtYXR0ZXIgPSBmcm9udG1hdHRlci5yZXBsYWNlKC9wcm9ncmVzczogW1xcZFxcLl0rLywgYHByb2dyZXNzOiAke3Byb2dyZXNzLnRvRml4ZWQoMil9YCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZnJvbnRtYXR0ZXIgKz0gYFxcbnByb2dyZXNzOiAke3Byb2dyZXNzLnRvRml4ZWQoMil9YDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVXBkYXRlIGNvbXBsZXRlZF9zdWJ0b3BpY3Ncblx0XHRcdFx0aWYgKGZyb250bWF0dGVyLmluY2x1ZGVzKCdjb21wbGV0ZWRfc3VidG9waWNzOicpKSB7XG5cdFx0XHRcdFx0ZnJvbnRtYXR0ZXIgPSBmcm9udG1hdHRlci5yZXBsYWNlKC9jb21wbGV0ZWRfc3VidG9waWNzOiBcXGQrLywgYGNvbXBsZXRlZF9zdWJ0b3BpY3M6ICR7Y29tcGxldGVkQ291bnR9YCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZnJvbnRtYXR0ZXIgKz0gYFxcbmNvbXBsZXRlZF9zdWJ0b3BpY3M6ICR7Y29tcGxldGVkQ291bnR9YDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVXBkYXRlIHRvdGFsX3N1YnRvcGljc1xuXHRcdFx0XHRpZiAoZnJvbnRtYXR0ZXIuaW5jbHVkZXMoJ3RvdGFsX3N1YnRvcGljczonKSkge1xuXHRcdFx0XHRcdGZyb250bWF0dGVyID0gZnJvbnRtYXR0ZXIucmVwbGFjZSgvdG90YWxfc3VidG9waWNzOiBcXGQrLywgYHRvdGFsX3N1YnRvcGljczogJHt0b3RhbENvdW50fWApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZyb250bWF0dGVyICs9IGBcXG50b3RhbF9zdWJ0b3BpY3M6ICR7dG90YWxDb3VudH1gO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBSZXBsYWNlIGZyb250bWF0dGVyIGluIGNvbnRlbnRcblx0XHRcdFx0bGV0IHVwZGF0ZWRDb250ZW50ID0gY29udGVudC5yZXBsYWNlKGZyb250bWF0dGVyUmVnZXgsIGAtLS1cXG4ke2Zyb250bWF0dGVyfVxcbi0tLWApO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVXBkYXRlIHByb2dyZXNzIGluIGNvbnRlbnRcblx0XHRcdFx0Y29uc3QgcHJvZ3Jlc3NSZWdleCA9IC8jIyBQcm9ncmVzc1xccypcXG5cXHMqXFxkKyUgY29tcGxldGUvO1xuXHRcdFx0XHRjb25zdCBwcm9ncmVzc01hdGNoID0gdXBkYXRlZENvbnRlbnQubWF0Y2gocHJvZ3Jlc3NSZWdleCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAocHJvZ3Jlc3NNYXRjaCkge1xuXHRcdFx0XHRcdHVwZGF0ZWRDb250ZW50ID0gdXBkYXRlZENvbnRlbnQucmVwbGFjZShwcm9ncmVzc1JlZ2V4LCBgIyMgUHJvZ3Jlc3NcXG5cXG4ke3Byb2dyZXNzUGVyY2VudH0lIGNvbXBsZXRlYCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgZmlsZVxuXHRcdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdXBkYXRlZENvbnRlbnQpO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVXBkYXRlIHN1YnRvcGljcyBsaXN0IHdpdGggY29tcGxldGlvbiBzdGF0dXNcblx0XHRcdFx0YXdhaXQgdGhpcy5hZGRTdWJ0b3BpY1RvQ29udGVudExpc3QoZmlsZSk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHVwZGF0aW5nIHRvcGljIHByb2dyZXNzOicsIGVycm9yKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyB1cGRhdGVQcm9ncmVzc0lmTmVlZGVkKGZpbGU6IFRGaWxlKSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcblx0XHRcblx0XHRpZiAobWV0YWRhdGE/LmZyb250bWF0dGVyPy50eXBlID09PSAnc3VidG9waWMnKSB7XG5cdFx0XHQvLyBJZiBhIHN1YnRvcGljIHdhcyBtb2RpZmllZCwgdXBkYXRlIGl0cyBwYXJlbnRcblx0XHRcdGlmIChtZXRhZGF0YS5mcm9udG1hdHRlci5wYXJlbnQpIHtcblx0XHRcdFx0Y29uc3QgcGFyZW50TmFtZSA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnBhcmVudC5yZXBsYWNlKC9cXFtcXFsoLio/KVxcXVxcXS8sICckMScpO1xuXHRcdFx0XHRjb25zdCBwYXJlbnRGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGAke3BhcmVudE5hbWV9Lm1kYCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAocGFyZW50RmlsZSAmJiBwYXJlbnRGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLnVwZGF0ZVRvcGljUHJvZ3Jlc3MocGFyZW50RmlsZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKG1ldGFkYXRhPy5mcm9udG1hdHRlcj8udHlwZSA9PT0gJ3RvcGljJykge1xuXHRcdFx0Ly8gSWYgYSB0b3BpYyB3YXMgbW9kaWZpZWQsIHVwZGF0ZSBpdHMgcHJvZ3Jlc3Ncblx0XHRcdGF3YWl0IHRoaXMudXBkYXRlVG9waWNQcm9ncmVzcyhmaWxlKTtcblx0XHR9XG5cdH1cbn1cblxuY2xhc3MgVG9waWNDcmVhdGlvbk1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW47XG5cdHRvcGljTmFtZTogc3RyaW5nID0gJyc7XG5cblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbikge1xuXHRcdHN1cGVyKGFwcCk7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG5cdH1cblxuXHRvbk9wZW4oKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0XG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0NyZWF0ZSBOZXcgTGVhcm5pbmcgVG9waWMnIH0pO1xuXHRcdFxuXHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHRcdC5zZXROYW1lKCdUb3BpYyBOYW1lJylcblx0XHRcdC5zZXREZXNjKCdFbnRlciB0aGUgbmFtZSBvZiB5b3VyIGxlYXJuaW5nIHRvcGljJylcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ2UuZy4sIEFXUyBTMycpXG5cdFx0XHRcdC5zZXRWYWx1ZSh0aGlzLnRvcGljTmFtZSlcblx0XHRcdFx0Lm9uQ2hhbmdlKHZhbHVlID0+IHtcblx0XHRcdFx0XHR0aGlzLnRvcGljTmFtZSA9IHZhbHVlO1xuXHRcdFx0XHR9KSk7XG5cdFx0XG5cdFx0bmV3IFNldHRpbmcoY29udGVudEVsKVxuXHRcdFx0LmFkZEJ1dHRvbihidG4gPT4gYnRuXG5cdFx0XHRcdC5zZXRCdXR0b25UZXh0KCdDcmVhdGUnKVxuXHRcdFx0XHQuc2V0Q3RhKClcblx0XHRcdFx0Lm9uQ2xpY2soKCkgPT4ge1xuXHRcdFx0XHRcdGlmICh0aGlzLnRvcGljTmFtZSkge1xuXHRcdFx0XHRcdFx0dGhpcy5wbHVnaW4uY3JlYXRlVG9waWNOb3RlKHRoaXMudG9waWNOYW1lKTtcblx0XHRcdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZSgnUGxlYXNlIGVudGVyIGEgdG9waWMgbmFtZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkpXG5cdFx0XHQuYWRkQnV0dG9uKGJ0biA9PiBidG5cblx0XHRcdFx0LnNldEJ1dHRvblRleHQoJ0NhbmNlbCcpXG5cdFx0XHRcdC5vbkNsaWNrKCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRcdH0pKTtcblx0fVxuXG5cdG9uQ2xvc2UoKSB7XG5cdFx0Y29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XG5cdH1cbn1cblxuY2xhc3MgU3VidG9waWNDcmVhdGlvbk1vZGFsIGV4dGVuZHMgTW9kYWwge1xuXHRwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW47XG5cdHBhcmVudFRvcGljOiBzdHJpbmc7XG5cdHN1YnRvcGljTmFtZTogc3RyaW5nID0gJyc7XG5cblx0Y29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbiwgcGFyZW50VG9waWM6IHN0cmluZykge1xuXHRcdHN1cGVyKGFwcCk7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG5cdFx0dGhpcy5wYXJlbnRUb3BpYyA9IHBhcmVudFRvcGljO1xuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdFxuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdDcmVhdGUgTmV3IFN1YnRvcGljJyB9KTtcblx0XHRjb250ZW50RWwuY3JlYXRlRWwoJ3AnLCB7IHRleHQ6IGBQYXJlbnQgVG9waWM6ICR7dGhpcy5wYXJlbnRUb3BpY31gIH0pO1xuXHRcdFxuXHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHRcdC5zZXROYW1lKCdTdWJ0b3BpYyBOYW1lJylcblx0XHRcdC5zZXREZXNjKCdFbnRlciB0aGUgbmFtZSBvZiB5b3VyIHN1YnRvcGljJylcblx0XHRcdC5hZGRUZXh0KHRleHQgPT4gdGV4dFxuXHRcdFx0XHQuc2V0UGxhY2Vob2xkZXIoJ2UuZy4sIFMzIEJ1Y2tldHMnKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy5zdWJ0b3BpY05hbWUpXG5cdFx0XHRcdC5vbkNoYW5nZSh2YWx1ZSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5zdWJ0b3BpY05hbWUgPSB2YWx1ZTtcblx0XHRcdFx0fSkpO1xuXHRcdFxuXHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHRcdC5hZGRCdXR0b24oYnRuID0+IGJ0blxuXHRcdFx0XHQuc2V0QnV0dG9uVGV4dCgnQ3JlYXRlJylcblx0XHRcdFx0LnNldEN0YSgpXG5cdFx0XHRcdC5vbkNsaWNrKCgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5zdWJ0b3BpY05hbWUpIHtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLmNyZWF0ZVN1YnRvcGljTm90ZSh0aGlzLnN1YnRvcGljTmFtZSwgdGhpcy5wYXJlbnRUb3BpYyk7XG5cdFx0XHRcdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoJ1BsZWFzZSBlbnRlciBhIHN1YnRvcGljIG5hbWUnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKVxuXHRcdFx0LmFkZEJ1dHRvbihidG4gPT4gYnRuXG5cdFx0XHRcdC5zZXRCdXR0b25UZXh0KCdDYW5jZWwnKVxuXHRcdFx0XHQub25DbGljaygoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0XHR9KSk7XG5cdH1cblxuXHRvbkNsb3NlKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHR9XG59XG4iXSwibmFtZXMiOlsiSXRlbVZpZXciLCJURmlsZSIsIlBsdWdpblNldHRpbmdUYWIiLCJTZXR0aW5nIiwiUGx1Z2luIiwiTm90aWNlIiwiTWFya2Rvd25WaWV3IiwiTW9kYWwiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWtHQTtBQUNPLFNBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtBQUM3RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtBQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxL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
