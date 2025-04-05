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
    constructor() {
        super(...arguments);
        // Add flags to prevent infinite loops
        this.isUpdating = false;
        this.updateQueue = new Set();
        this.debounceTimeout = null;
    }
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
                        // Don't trigger updates when just viewing a file
                        this.progressRenderer.renderProgressInNote(file);
                        this.progressRenderer.renderCompletionStatus(file);
                    }
                }
            }));
            this.registerEvent(this.app.metadataCache.on('changed', (file) => {
                // Use debounced update to prevent infinite loops
                this.debouncedUpdateProgress(file);
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
        // Clear any pending timeouts
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
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
                const rightLeaf = workspace.getRightLeaf(false);
                if (rightLeaf) {
                    yield rightLeaf.setViewState({ type: viewType });
                    leaf = rightLeaf;
                }
            }
            // Reveal the leaf
            if (leaf) {
                workspace.revealLeaf(leaf);
            }
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
                // Set updating flag to prevent infinite loops
                this.isUpdating = true;
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
                                const nestedList = subtopicsArray.map(subtopic => `  - ${subtopic}`).join('\n');
                                frontmatter = frontmatter.replace(arrayRegex, `subtopics:\n${nestedList}`);
                                //frontmatter = frontmatter.replace(arrayRegex, `subtopics: [${subtopicsArray.join(', ')}]`);
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
                    // Force update the topic progress
                    yield this.forceUpdateTopicProgress(parentFile);
                }
                // Reset updating flag
                this.isUpdating = false;
            }
            catch (error) {
                // Reset updating flag even if there's an error
                this.isUpdating = false;
                console.error('Error updating parent topic:', error);
                new obsidian.Notice('Error updating parent topic');
            }
        });
    }
    addSubtopicToContentList(parentFile) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Skip if already updating to prevent infinite loops
            if (this.isUpdating)
                return;
            try {
                // Set updating flag
                this.isUpdating = true;
                const content = yield this.app.vault.read(parentFile);
                // Force refresh metadata cache to get the latest data
                // Use the correct method signature
                this.app.metadataCache.trigger('changed');
                // Wait a moment for the cache to update
                yield new Promise(resolve => setTimeout(resolve, 100));
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
                                const subtopicName = this.extractLinkText(subtopic);
                                const subtopicFile = this.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                                if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                                    // Force refresh metadata cache for this subtopic
                                    this.app.metadataCache.trigger('changed');
                                    // Wait a moment for the cache to update
                                    yield new Promise(resolve => setTimeout(resolve, 100));
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
                // Reset updating flag
                this.isUpdating = false;
            }
            catch (error) {
                // Reset updating flag even if there's an error
                this.isUpdating = false;
                console.error('Error updating subtopics list in content:', error);
            }
        });
    }
    toggleSubtopicCompletion(file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Set updating flag
                this.isUpdating = true;
                // Force refresh metadata cache to get the latest data
                this.app.metadataCache.trigger('changed');
                // Wait a moment for the cache to update
                yield new Promise(resolve => setTimeout(resolve, 100));
                const metadata = this.app.metadataCache.getFileCache(file);
                if (!(metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter)) {
                    this.isUpdating = false;
                    return;
                }
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
                    // Force refresh metadata cache
                    this.app.metadataCache.trigger('changed');
                    // Wait a moment for the cache to update
                    yield new Promise(resolve => setTimeout(resolve, 100));
                    // Update parent topic progress
                    if (metadata.frontmatter.parent) {
                        const parentName = this.extractLinkText(metadata.frontmatter.parent);
                        const parentFile = this.app.vault.getAbstractFileByPath(`${parentName}.md`);
                        if (parentFile && parentFile instanceof obsidian.TFile) {
                            yield this.forceUpdateTopicProgress(parentFile);
                        }
                    }
                    new obsidian.Notice(`Subtopic marked as ${newStatus ? 'completed' : 'not completed'}`);
                }
                // Reset updating flag
                this.isUpdating = false;
            }
            catch (error) {
                // Reset updating flag even if there's an error
                this.isUpdating = false;
                console.error('Error toggling subtopic completion:', error);
                new obsidian.Notice('Error updating subtopic status');
            }
        });
    }
    // Helper method to extract text from [[link]] format
    extractLinkText(link) {
        const match = link.match(/\[\[(.*?)\]\]/);
        return match ? match[1] : link;
    }
    // Force update topic progress with direct file reading instead of relying on metadata cache
    forceUpdateTopicProgress(file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Skip if already updating to prevent infinite loops
            if (this.isUpdating)
                return;
            try {
                // Set updating flag
                this.isUpdating = true;
                // Read the file content directly
                const content = yield this.app.vault.read(file);
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
                let subtopics = [];
                // Check if it's an array format
                const arrayRegex = /subtopics: \[([\s\S]*?)\]/;
                const arrayMatch = frontmatter.match(arrayRegex);
                if (arrayMatch) {
                    // Array format
                    subtopics = arrayMatch[1].split(',')
                        .map(s => s.trim())
                        .filter(s => s.length > 0)
                        .map(s => s.replace(/"/g, ''));
                }
                else {
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
                                if (item)
                                    subtopics.push(item);
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
                    if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                        // Read the subtopic file directly
                        const subtopicContent = yield this.app.vault.read(subtopicFile);
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
                }
                else {
                    updatedFrontmatter += `\nprogress: ${progress.toFixed(2)}`;
                }
                // Update completed_subtopics
                if (updatedFrontmatter.includes('completed_subtopics:')) {
                    updatedFrontmatter = updatedFrontmatter.replace(/completed_subtopics: \d+/, `completed_subtopics: ${completedCount}`);
                }
                else {
                    updatedFrontmatter += `\ncompleted_subtopics: ${completedCount}`;
                }
                // Update total_subtopics
                if (updatedFrontmatter.includes('total_subtopics:')) {
                    updatedFrontmatter = updatedFrontmatter.replace(/total_subtopics: \d+/, `total_subtopics: ${totalCount}`);
                }
                else {
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
                yield this.app.vault.modify(file, updatedContent);
                // Update subtopics list with completion status
                const subtopicsSectionRegex = /## Subtopics\s*\n([\s\S]*?)(?=\n##|$)/;
                const subtopicsMatch = updatedContent.match(subtopicsSectionRegex);
                if (subtopicsMatch) {
                    let subtopicsList = '';
                    // Create a list of subtopics with completion status
                    for (const subtopic of subtopics) {
                        const subtopicName = this.extractLinkText(subtopic);
                        const subtopicFile = this.app.vault.getAbstractFileByPath(`${subtopicName}.md`);
                        if (subtopicFile && subtopicFile instanceof obsidian.TFile) {
                            // Read the subtopic file directly
                            const subtopicContent = yield this.app.vault.read(subtopicFile);
                            const subtopicFrontmatterMatch = subtopicContent.match(frontmatterRegex);
                            let isCompleted = false;
                            if (subtopicFrontmatterMatch) {
                                const subtopicFrontmatter = subtopicFrontmatterMatch[1];
                                isCompleted = subtopicFrontmatter.includes('completed: true');
                            }
                            subtopicsList += `- ${subtopic} ${isCompleted ? '✅' : '❌'}\n`;
                        }
                        else {
                            subtopicsList += `- ${subtopic} ❌\n`;
                        }
                    }
                    // Replace the subtopics section content
                    const updatedSubtopicsSection = `## Subtopics\n\n${subtopicsList}`;
                    updatedContent = updatedContent.replace(subtopicsSectionRegex, updatedSubtopicsSection);
                    yield this.app.vault.modify(file, updatedContent);
                }
                // Reset updating flag
                this.isUpdating = false;
            }
            catch (error) {
                // Reset updating flag even if there's an error
                this.isUpdating = false;
                console.error('Error updating topic progress:', error);
            }
        });
    }
    updateTopicProgress(file) {
        return __awaiter(this, void 0, void 0, function* () {
            // Use the force update method instead
            yield this.forceUpdateTopicProgress(file);
        });
    }
    // Debounced update to prevent rapid successive updates
    debouncedUpdateProgress(file) {
        // Skip if already updating to prevent infinite loops
        if (this.isUpdating)
            return;
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
    processUpdateQueue() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            // Skip if already updating
            if (this.isUpdating)
                return;
            // Set updating flag
            this.isUpdating = true;
            try {
                // Process each file in the queue
                for (const filePath of this.updateQueue) {
                    const file = this.app.vault.getAbstractFileByPath(filePath);
                    if (file && file instanceof obsidian.TFile) {
                        // Force refresh metadata cache
                        this.app.metadataCache.trigger('changed');
                        // Wait a moment for the cache to update
                        yield new Promise(resolve => setTimeout(resolve, 100));
                        const metadata = this.app.metadataCache.getFileCache(file);
                        if (((_a = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _a === void 0 ? void 0 : _a.type) === 'subtopic') {
                            // If a subtopic was modified, update its parent
                            if (metadata.frontmatter.parent) {
                                const parentName = this.extractLinkText(metadata.frontmatter.parent);
                                const parentFile = this.app.vault.getAbstractFileByPath(`${parentName}.md`);
                                if (parentFile && parentFile instanceof obsidian.TFile) {
                                    yield this.forceUpdateTopicProgress(parentFile);
                                }
                            }
                        }
                        else if (((_b = metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) === null || _b === void 0 ? void 0 : _b.type) === 'topic') {
                            // If a topic was modified, update its progress
                            yield this.forceUpdateTopicProgress(file);
                        }
                    }
                }
                // Clear the queue
                this.updateQueue.clear();
            }
            catch (error) {
                console.error('Error processing update queue:', error);
            }
            finally {
                // Reset updating flag
                this.isUpdating = false;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInNyYy92aWV3cy9TdWJ0b3BpY1RyYWNrZXJWaWV3LnRzIiwic3JjL3RyYWNraW5nL1Byb2dyZXNzVHJhY2tlci50cyIsInNyYy92aWV3cy9Lbm93bGVkZ2VNYXBWaWV3LnRzIiwic3JjL3JlbmRlcmluZy9Qcm9ncmVzc1JlbmRlcmVyLnRzIiwic3JjL3NldHRpbmdzL1NldHRpbmdzVGFiLnRzIiwic3JjL21haW4udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlLCBTdXBwcmVzc2VkRXJyb3IsIFN5bWJvbCwgSXRlcmF0b3IgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXNEZWNvcmF0ZShjdG9yLCBkZXNjcmlwdG9ySW4sIGRlY29yYXRvcnMsIGNvbnRleHRJbiwgaW5pdGlhbGl6ZXJzLCBleHRyYUluaXRpYWxpemVycykge1xyXG4gICAgZnVuY3Rpb24gYWNjZXB0KGYpIHsgaWYgKGYgIT09IHZvaWQgMCAmJiB0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRnVuY3Rpb24gZXhwZWN0ZWRcIik7IHJldHVybiBmOyB9XHJcbiAgICB2YXIga2luZCA9IGNvbnRleHRJbi5raW5kLCBrZXkgPSBraW5kID09PSBcImdldHRlclwiID8gXCJnZXRcIiA6IGtpbmQgPT09IFwic2V0dGVyXCIgPyBcInNldFwiIDogXCJ2YWx1ZVwiO1xyXG4gICAgdmFyIHRhcmdldCA9ICFkZXNjcmlwdG9ySW4gJiYgY3RvciA/IGNvbnRleHRJbltcInN0YXRpY1wiXSA/IGN0b3IgOiBjdG9yLnByb3RvdHlwZSA6IG51bGw7XHJcbiAgICB2YXIgZGVzY3JpcHRvciA9IGRlc2NyaXB0b3JJbiB8fCAodGFyZ2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGNvbnRleHRJbi5uYW1lKSA6IHt9KTtcclxuICAgIHZhciBfLCBkb25lID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4pIGNvbnRleHRbcF0gPSBwID09PSBcImFjY2Vzc1wiID8ge30gOiBjb250ZXh0SW5bcF07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4uYWNjZXNzKSBjb250ZXh0LmFjY2Vzc1twXSA9IGNvbnRleHRJbi5hY2Nlc3NbcF07XHJcbiAgICAgICAgY29udGV4dC5hZGRJbml0aWFsaXplciA9IGZ1bmN0aW9uIChmKSB7IGlmIChkb25lKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGFkZCBpbml0aWFsaXplcnMgYWZ0ZXIgZGVjb3JhdGlvbiBoYXMgY29tcGxldGVkXCIpOyBleHRyYUluaXRpYWxpemVycy5wdXNoKGFjY2VwdChmIHx8IG51bGwpKTsgfTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gKDAsIGRlY29yYXRvcnNbaV0pKGtpbmQgPT09IFwiYWNjZXNzb3JcIiA/IHsgZ2V0OiBkZXNjcmlwdG9yLmdldCwgc2V0OiBkZXNjcmlwdG9yLnNldCB9IDogZGVzY3JpcHRvcltrZXldLCBjb250ZXh0KTtcclxuICAgICAgICBpZiAoa2luZCA9PT0gXCJhY2Nlc3NvclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZFwiKTtcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmdldCkpIGRlc2NyaXB0b3IuZ2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LnNldCkpIGRlc2NyaXB0b3Iuc2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmluaXQpKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoXyA9IGFjY2VwdChyZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGlmIChraW5kID09PSBcImZpZWxkXCIpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xyXG4gICAgICAgICAgICBlbHNlIGRlc2NyaXB0b3Jba2V5XSA9IF87XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRhcmdldCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgY29udGV4dEluLm5hbWUsIGRlc2NyaXB0b3IpO1xyXG4gICAgZG9uZSA9IHRydWU7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19ydW5Jbml0aWFsaXplcnModGhpc0FyZywgaW5pdGlhbGl6ZXJzLCB2YWx1ZSkge1xyXG4gICAgdmFyIHVzZVZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRpYWxpemVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhbHVlID0gdXNlVmFsdWUgPyBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnLCB2YWx1ZSkgOiBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1c2VWYWx1ZSA/IHZhbHVlIDogdm9pZCAwO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcHJvcEtleSh4KSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCIgPyB4IDogXCJcIi5jb25jYXQoeCk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zZXRGdW5jdGlvbk5hbWUoZiwgbmFtZSwgcHJlZml4KSB7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIG5hbWUgPSBuYW1lLmRlc2NyaXB0aW9uID8gXCJbXCIuY29uY2F0KG5hbWUuZGVzY3JpcHRpb24sIFwiXVwiKSA6IFwiXCI7XHJcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGYsIFwibmFtZVwiLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHByZWZpeCA/IFwiXCIuY29uY2F0KHByZWZpeCwgXCIgXCIsIG5hbWUpIDogbmFtZSB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGcgPSBPYmplY3QuY3JlYXRlKCh0eXBlb2YgSXRlcmF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IEl0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpO1xyXG4gICAgcmV0dXJuIGcubmV4dCA9IHZlcmIoMCksIGdbXCJ0aHJvd1wiXSA9IHZlcmIoMSksIGdbXCJyZXR1cm5cIl0gPSB2ZXJiKDIpLCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XHJcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xyXG4gICAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIG8pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgcCkpIF9fY3JlYXRlQmluZGluZyhvLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheSh0bywgZnJvbSwgcGFjaykge1xyXG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XHJcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XHJcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IE9iamVjdC5jcmVhdGUoKHR5cGVvZiBBc3luY0l0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBBc3luY0l0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpLCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIsIGF3YWl0UmV0dXJuKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gYXdhaXRSZXR1cm4oZikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGYsIHJlamVjdCk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpZiAoZ1tuXSkgeyBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyBpZiAoZikgaVtuXSA9IGYoaVtuXSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IGZhbHNlIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbnZhciBvd25LZXlzID0gZnVuY3Rpb24obykge1xyXG4gICAgb3duS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgICAgdmFyIGFyID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgayBpbiBvKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG8sIGspKSBhclthci5sZW5ndGhdID0gaztcclxuICAgICAgICByZXR1cm4gYXI7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIG93bktleXMobyk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19pbXBvcnRTdGFyKG1vZCkge1xyXG4gICAgaWYgKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgcmV0dXJuIG1vZDtcclxuICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgIGlmIChtb2QgIT0gbnVsbCkgZm9yICh2YXIgayA9IG93bktleXMobW9kKSwgaSA9IDA7IGkgPCBrLmxlbmd0aDsgaSsrKSBpZiAoa1tpXSAhPT0gXCJkZWZhdWx0XCIpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwga1tpXSk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4oc3RhdGUsIHJlY2VpdmVyKSB7XHJcbiAgICBpZiAocmVjZWl2ZXIgPT09IG51bGwgfHwgKHR5cGVvZiByZWNlaXZlciAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVjZWl2ZXIgIT09IFwiZnVuY3Rpb25cIikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlICdpbicgb3BlcmF0b3Igb24gbm9uLW9iamVjdFwiKTtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyID09PSBzdGF0ZSA6IHN0YXRlLmhhcyhyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZShlbnYsIHZhbHVlLCBhc3luYykge1xyXG4gICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkLlwiKTtcclxuICAgICAgICB2YXIgZGlzcG9zZSwgaW5uZXI7XHJcbiAgICAgICAgaWYgKGFzeW5jKSB7XHJcbiAgICAgICAgICAgIGlmICghU3ltYm9sLmFzeW5jRGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0Rpc3Bvc2UgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgICAgICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmFzeW5jRGlzcG9zZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaXNwb3NlID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKCFTeW1ib2wuZGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5kaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgICAgICAgICAgZGlzcG9zZSA9IHZhbHVlW1N5bWJvbC5kaXNwb3NlXTtcclxuICAgICAgICAgICAgaWYgKGFzeW5jKSBpbm5lciA9IGRpc3Bvc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IG5vdCBkaXNwb3NhYmxlLlwiKTtcclxuICAgICAgICBpZiAoaW5uZXIpIGRpc3Bvc2UgPSBmdW5jdGlvbigpIHsgdHJ5IHsgaW5uZXIuY2FsbCh0aGlzKTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7IH0gfTtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IHZhbHVlOiB2YWx1ZSwgZGlzcG9zZTogZGlzcG9zZSwgYXN5bmM6IGFzeW5jIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYXN5bmMpIHtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IGFzeW5jOiB0cnVlIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG5cclxufVxyXG5cclxudmFyIF9TdXBwcmVzc2VkRXJyb3IgPSB0eXBlb2YgU3VwcHJlc3NlZEVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBTdXBwcmVzc2VkRXJyb3IgOiBmdW5jdGlvbiAoZXJyb3IsIHN1cHByZXNzZWQsIG1lc3NhZ2UpIHtcclxuICAgIHZhciBlID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgcmV0dXJuIGUubmFtZSA9IFwiU3VwcHJlc3NlZEVycm9yXCIsIGUuZXJyb3IgPSBlcnJvciwgZS5zdXBwcmVzc2VkID0gc3VwcHJlc3NlZCwgZTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2Rpc3Bvc2VSZXNvdXJjZXMoZW52KSB7XHJcbiAgICBmdW5jdGlvbiBmYWlsKGUpIHtcclxuICAgICAgICBlbnYuZXJyb3IgPSBlbnYuaGFzRXJyb3IgPyBuZXcgX1N1cHByZXNzZWRFcnJvcihlLCBlbnYuZXJyb3IsIFwiQW4gZXJyb3Igd2FzIHN1cHByZXNzZWQgZHVyaW5nIGRpc3Bvc2FsLlwiKSA6IGU7XHJcbiAgICAgICAgZW52Lmhhc0Vycm9yID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciByLCBzID0gMDtcclxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPSBlbnYuc3RhY2sucG9wKCkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmICghci5hc3luYyAmJiBzID09PSAxKSByZXR1cm4gcyA9IDAsIGVudi5zdGFjay5wdXNoKHIpLCBQcm9taXNlLnJlc29sdmUoKS50aGVuKG5leHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHIuZGlzcG9zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByLmRpc3Bvc2UuY2FsbChyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoci5hc3luYykgcmV0dXJuIHMgfD0gMiwgUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkudGhlbihuZXh0LCBmdW5jdGlvbihlKSB7IGZhaWwoZSk7IHJldHVybiBuZXh0KCk7IH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBzIHw9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGZhaWwoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMgPT09IDEpIHJldHVybiBlbnYuaGFzRXJyb3IgPyBQcm9taXNlLnJlamVjdChlbnYuZXJyb3IpIDogUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgaWYgKGVudi5oYXNFcnJvcikgdGhyb3cgZW52LmVycm9yO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5leHQoKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uKHBhdGgsIHByZXNlcnZlSnN4KSB7XHJcbiAgICBpZiAodHlwZW9mIHBhdGggPT09IFwic3RyaW5nXCIgJiYgL15cXC5cXC4/XFwvLy50ZXN0KHBhdGgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFwuKHRzeCkkfCgoPzpcXC5kKT8pKCg/OlxcLlteLi9dKz8pPylcXC4oW2NtXT8pdHMkL2ksIGZ1bmN0aW9uIChtLCB0c3gsIGQsIGV4dCwgY20pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRzeCA/IHByZXNlcnZlSnN4ID8gXCIuanN4XCIgOiBcIi5qc1wiIDogZCAmJiAoIWV4dCB8fCAhY20pID8gbSA6IChkICsgZXh0ICsgXCIuXCIgKyBjbS50b0xvd2VyQ2FzZSgpICsgXCJqc1wiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiBwYXRoO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgICBfX2V4dGVuZHM6IF9fZXh0ZW5kcyxcclxuICAgIF9fYXNzaWduOiBfX2Fzc2lnbixcclxuICAgIF9fcmVzdDogX19yZXN0LFxyXG4gICAgX19kZWNvcmF0ZTogX19kZWNvcmF0ZSxcclxuICAgIF9fcGFyYW06IF9fcGFyYW0sXHJcbiAgICBfX2VzRGVjb3JhdGU6IF9fZXNEZWNvcmF0ZSxcclxuICAgIF9fcnVuSW5pdGlhbGl6ZXJzOiBfX3J1bkluaXRpYWxpemVycyxcclxuICAgIF9fcHJvcEtleTogX19wcm9wS2V5LFxyXG4gICAgX19zZXRGdW5jdGlvbk5hbWU6IF9fc2V0RnVuY3Rpb25OYW1lLFxyXG4gICAgX19tZXRhZGF0YTogX19tZXRhZGF0YSxcclxuICAgIF9fYXdhaXRlcjogX19hd2FpdGVyLFxyXG4gICAgX19nZW5lcmF0b3I6IF9fZ2VuZXJhdG9yLFxyXG4gICAgX19jcmVhdGVCaW5kaW5nOiBfX2NyZWF0ZUJpbmRpbmcsXHJcbiAgICBfX2V4cG9ydFN0YXI6IF9fZXhwb3J0U3RhcixcclxuICAgIF9fdmFsdWVzOiBfX3ZhbHVlcyxcclxuICAgIF9fcmVhZDogX19yZWFkLFxyXG4gICAgX19zcHJlYWQ6IF9fc3ByZWFkLFxyXG4gICAgX19zcHJlYWRBcnJheXM6IF9fc3ByZWFkQXJyYXlzLFxyXG4gICAgX19zcHJlYWRBcnJheTogX19zcHJlYWRBcnJheSxcclxuICAgIF9fYXdhaXQ6IF9fYXdhaXQsXHJcbiAgICBfX2FzeW5jR2VuZXJhdG9yOiBfX2FzeW5jR2VuZXJhdG9yLFxyXG4gICAgX19hc3luY0RlbGVnYXRvcjogX19hc3luY0RlbGVnYXRvcixcclxuICAgIF9fYXN5bmNWYWx1ZXM6IF9fYXN5bmNWYWx1ZXMsXHJcbiAgICBfX21ha2VUZW1wbGF0ZU9iamVjdDogX19tYWtlVGVtcGxhdGVPYmplY3QsXHJcbiAgICBfX2ltcG9ydFN0YXI6IF9faW1wb3J0U3RhcixcclxuICAgIF9faW1wb3J0RGVmYXVsdDogX19pbXBvcnREZWZhdWx0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZEdldDogX19jbGFzc1ByaXZhdGVGaWVsZEdldCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRTZXQ6IF9fY2xhc3NQcml2YXRlRmllbGRTZXQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkSW46IF9fY2xhc3NQcml2YXRlRmllbGRJbixcclxuICAgIF9fYWRkRGlzcG9zYWJsZVJlc291cmNlOiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZSxcclxuICAgIF9fZGlzcG9zZVJlc291cmNlczogX19kaXNwb3NlUmVzb3VyY2VzLFxyXG4gICAgX19yZXdyaXRlUmVsYXRpdmVJbXBvcnRFeHRlbnNpb246IF9fcmV3cml0ZVJlbGF0aXZlSW1wb3J0RXh0ZW5zaW9uLFxyXG59O1xyXG4iLCJpbXBvcnQgeyBJdGVtVmlldywgV29ya3NwYWNlTGVhZiwgVEZpbGUgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgTGVhcm5pbmdQcm9ncmVzc1BsdWdpbiBmcm9tICcuLi9tYWluJztcblxuZXhwb3J0IGNvbnN0IFNVQlRPUElDX1RSQUNLRVJfVklFV19UWVBFID0gJ3N1YnRvcGljLXRyYWNrZXItdmlldyc7XG5cbmV4cG9ydCBjbGFzcyBTdWJ0b3BpY1RyYWNrZXJWaWV3IGV4dGVuZHMgSXRlbVZpZXcge1xuICAgIHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbjtcblxuICAgIGNvbnN0cnVjdG9yKGxlYWY6IFdvcmtzcGFjZUxlYWYsIHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbikge1xuICAgICAgICBzdXBlcihsZWFmKTtcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgfVxuXG4gICAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFNVQlRPUElDX1RSQUNLRVJfVklFV19UWVBFO1xuICAgIH1cblxuICAgIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAnU3VidG9waWMgVHJhY2tlcic7XG4gICAgfVxuXG4gICAgYXN5bmMgb25PcGVuKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLnJlbmRlclZpZXcoKTtcbiAgICB9XG5cbiAgICBhc3luYyByZW5kZXJWaWV3KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lckVsLmNoaWxkcmVuWzFdO1xuICAgICAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdMZWFybmluZyBQcm9ncmVzcyBUcmFja2VyJyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSB0YWJzIGZvciBkaWZmZXJlbnQgdmlld3NcbiAgICAgICAgY29uc3QgdGFic0NvbnRhaW5lciA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICduYXYtYnV0dG9ucy1jb250YWluZXInIH0pO1xuICAgICAgICBjb25zdCBhbGxUb3BpY3NUYWIgPSB0YWJzQ29udGFpbmVyLmNyZWF0ZUVsKCdidXR0b24nLCB7IFxuICAgICAgICAgICAgdGV4dDogJ0FsbCBUb3BpY3MnLFxuICAgICAgICAgICAgY2xzOiAnbmF2LWJ1dHRvbiBuYXYtYnV0dG9uLWFjdGl2ZSdcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGluUHJvZ3Jlc3NUYWIgPSB0YWJzQ29udGFpbmVyLmNyZWF0ZUVsKCdidXR0b24nLCB7IFxuICAgICAgICAgICAgdGV4dDogJ0luIFByb2dyZXNzJyxcbiAgICAgICAgICAgIGNsczogJ25hdi1idXR0b24nXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBjb21wbGV0ZWRUYWIgPSB0YWJzQ29udGFpbmVyLmNyZWF0ZUVsKCdidXR0b24nLCB7IFxuICAgICAgICAgICAgdGV4dDogJ0NvbXBsZXRlZCcsXG4gICAgICAgICAgICBjbHM6ICduYXYtYnV0dG9uJ1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIENvbnRlbnQgY29udGFpbmVyXG4gICAgICAgIGNvbnN0IGNvbnRlbnRDb250YWluZXIgPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAndHJhY2tlci1jb250ZW50JyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIEluaXRpYWwgcmVuZGVyIG9mIGFsbCB0b3BpY3NcbiAgICAgICAgYXdhaXQgdGhpcy5yZW5kZXJBbGxUb3BpY3MoY29udGVudENvbnRhaW5lcik7XG4gICAgICAgIFxuICAgICAgICAvLyBUYWIgY2xpY2sgaGFuZGxlcnNcbiAgICAgICAgYWxsVG9waWNzVGFiLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVUYWIodGFic0NvbnRhaW5lciwgYWxsVG9waWNzVGFiKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVuZGVyQWxsVG9waWNzKGNvbnRlbnRDb250YWluZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGluUHJvZ3Jlc3NUYWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVRhYih0YWJzQ29udGFpbmVyLCBpblByb2dyZXNzVGFiKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVuZGVySW5Qcm9ncmVzc1RvcGljcyhjb250ZW50Q29udGFpbmVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBjb21wbGV0ZWRUYWIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVRhYih0YWJzQ29udGFpbmVyLCBjb21wbGV0ZWRUYWIpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZW5kZXJDb21wbGV0ZWRUb3BpY3MoY29udGVudENvbnRhaW5lcik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICBzZXRBY3RpdmVUYWIodGFic0NvbnRhaW5lcjogSFRNTEVsZW1lbnQsIGFjdGl2ZVRhYjogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICAgICAgLy8gUmVtb3ZlIGFjdGl2ZSBjbGFzcyBmcm9tIGFsbCB0YWJzXG4gICAgICAgIHRhYnNDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLm5hdi1idXR0b24nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLnJlbW92ZUNsYXNzKCduYXYtYnV0dG9uLWFjdGl2ZScpO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBhY3RpdmUgY2xhc3MgdG8gY2xpY2tlZCB0YWJcbiAgICAgICAgYWN0aXZlVGFiLmFkZENsYXNzKCduYXYtYnV0dG9uLWFjdGl2ZScpO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyByZW5kZXJBbGxUb3BpY3MoY29udGFpbmVyOiBIVE1MRWxlbWVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHRvcGljRmlsZXMgPSBhd2FpdCB0aGlzLmdldFRvcGljRmlsZXMoKTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0b3BpY0ZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdwJywgeyBcbiAgICAgICAgICAgICAgICB0ZXh0OiAnTm8gbGVhcm5pbmcgdG9waWNzIGZvdW5kLiBDcmVhdGUgYSB0b3BpYyB1c2luZyB0aGUgXCJDcmVhdGUgVG9waWMgTm90ZVwiIGNvbW1hbmQuJyxcbiAgICAgICAgICAgICAgICBjbHM6ICduby10b3BpY3MtbWVzc2FnZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBTb3J0IHRvcGljcyBieSBuYW1lXG4gICAgICAgIHRvcGljRmlsZXMuc29ydCgoYSwgYikgPT4gYS5iYXNlbmFtZS5sb2NhbGVDb21wYXJlKGIuYmFzZW5hbWUpKTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBhIGxpc3Qgb2YgdG9waWNzXG4gICAgICAgIGNvbnN0IHRvcGljTGlzdCA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1saXN0JyB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiB0b3BpY0ZpbGVzKSB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgICAgICAgICAgaWYgKCFtZXRhZGF0YT8uZnJvbnRtYXR0ZXIpIGNvbnRpbnVlO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnByb2dyZXNzIHx8IDA7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZFN1YnRvcGljcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLmNvbXBsZXRlZF9zdWJ0b3BpY3MgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IHRvdGFsU3VidG9waWNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIudG90YWxfc3VidG9waWNzIHx8IDA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IHRvcGljSXRlbSA9IHRvcGljTGlzdC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1pdGVtJyB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVG9waWMgaGVhZGVyIHdpdGggbmFtZSBhbmQgcHJvZ3Jlc3NcbiAgICAgICAgICAgIGNvbnN0IHRvcGljSGVhZGVyID0gdG9waWNJdGVtLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3RvcGljLWhlYWRlcicgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRvcGljIG5hbWUgd2l0aCBsaW5rXG4gICAgICAgICAgICBjb25zdCB0b3BpY05hbWUgPSB0b3BpY0hlYWRlci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1uYW1lJyB9KTtcbiAgICAgICAgICAgIHRvcGljTmFtZS5jcmVhdGVFbCgnYScsIHsgXG4gICAgICAgICAgICAgICAgdGV4dDogZmlsZS5iYXNlbmFtZSxcbiAgICAgICAgICAgICAgICBocmVmOiBmaWxlLnBhdGgsXG4gICAgICAgICAgICAgICAgY2xzOiAndG9waWMtbGluaydcbiAgICAgICAgICAgIH0pLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKGZpbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFByb2dyZXNzIGluZGljYXRvclxuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NUZXh0ID0gdG9waWNIZWFkZXIuY3JlYXRlRWwoJ2RpdicsIHsgXG4gICAgICAgICAgICAgICAgdGV4dDogYCR7cHJvZ3Jlc3NQZXJjZW50fSUgKCR7Y29tcGxldGVkU3VidG9waWNzfS8ke3RvdGFsU3VidG9waWNzfSlgLFxuICAgICAgICAgICAgICAgIGNsczogJ3RvcGljLXByb2dyZXNzLXRleHQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUHJvZ3Jlc3MgYmFyXG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzc0JhckNvbnRhaW5lciA9IHRvcGljSXRlbS5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdwcm9ncmVzcy1iYXItY29udGFpbmVyJyB9KTtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzQmFyID0gcHJvZ3Jlc3NCYXJDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncHJvZ3Jlc3MtYmFyJyB9KTtcbiAgICAgICAgICAgIHByb2dyZXNzQmFyLnN0eWxlLndpZHRoID0gYCR7cHJvZ3Jlc3NQZXJjZW50fSVgO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDb2xvciB0aGUgcHJvZ3Jlc3MgYmFyIGJhc2VkIG9uIGNvbXBsZXRpb25cbiAgICAgICAgICAgIGlmIChwcm9ncmVzc1BlcmNlbnQgPCAzMCkge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyLmFkZENsYXNzKCdwcm9ncmVzcy1sb3cnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3NQZXJjZW50IDwgNzApIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0Jhci5hZGRDbGFzcygncHJvZ3Jlc3MtbWVkaXVtJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb2dyZXNzQmFyLmFkZENsYXNzKCdwcm9ncmVzcy1oaWdoJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFN1YnRvcGljcyBsaXN0IGlmIGF2YWlsYWJsZVxuICAgICAgICAgICAgaWYgKG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcyAmJiBtZXRhZGF0YS5mcm9udG1hdHRlci5zdWJ0b3BpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljc0NvbnRhaW5lciA9IHRvcGljSXRlbS5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdzdWJ0b3BpY3MtY29udGFpbmVyJyB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY3NUb2dnbGUgPSBzdWJ0b3BpY3NDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6ICdTaG93IFN1YnRvcGljcycsXG4gICAgICAgICAgICAgICAgICAgIGNsczogJ3N1YnRvcGljcy10b2dnbGUnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNzTGlzdCA9IHN1YnRvcGljc0NvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgICAgICAgICAgY2xzOiAnc3VidG9waWNzLWxpc3QgaGlkZGVuJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIFRvZ2dsZSBzdWJ0b3BpY3MgdmlzaWJpbGl0eVxuICAgICAgICAgICAgICAgIHN1YnRvcGljc1RvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3VidG9waWNzTGlzdC50b2dnbGVDbGFzcygnaGlkZGVuJywgIXN1YnRvcGljc0xpc3QuaGFzQ2xhc3MoJ2hpZGRlbicpKTtcbiAgICAgICAgICAgICAgICAgICAgc3VidG9waWNzVG9nZ2xlLnRleHRDb250ZW50ID0gc3VidG9waWNzTGlzdC5oYXNDbGFzcygnaGlkZGVuJykgXG4gICAgICAgICAgICAgICAgICAgICAgICA/ICdTaG93IFN1YnRvcGljcycgXG4gICAgICAgICAgICAgICAgICAgICAgICA6ICdIaWRlIFN1YnRvcGljcyc7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgLy8gUmVuZGVyIHN1YnRvcGljc1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3VidG9waWMgb2YgbWV0YWRhdGEuZnJvbnRtYXR0ZXIuc3VidG9waWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljTmFtZSA9IHN1YnRvcGljLnJlcGxhY2UoL1xcW1xcWyguKj8pXFxdXFxdLywgJyQxJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljRmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChgJHtzdWJ0b3BpY05hbWV9Lm1kYCk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY0l0ZW0gPSBzdWJ0b3BpY3NMaXN0LmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3N1YnRvcGljLWl0ZW0nIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgc3VidG9waWMgZmlsZSBleGlzdHMgYW5kIGdldCBjb21wbGV0aW9uIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBsZXQgaXNDb21wbGV0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnRvcGljRmlsZSAmJiBzdWJ0b3BpY0ZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNNZXRhZGF0YSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHN1YnRvcGljRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc0NvbXBsZXRlZCA9IHN1YnRvcGljTWV0YWRhdGE/LmZyb250bWF0dGVyPy5jb21wbGV0ZWQgPT09IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIFN1YnRvcGljIG5hbWUgd2l0aCBjb21wbGV0aW9uIHN0YXR1c1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY05hbWVFbCA9IHN1YnRvcGljSXRlbS5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdzdWJ0b3BpYy1uYW1lJyB9KTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC8vIFN0YXR1cyBpbmRpY2F0b3JcbiAgICAgICAgICAgICAgICAgICAgc3VidG9waWNOYW1lRWwuY3JlYXRlRWwoJ3NwYW4nLCB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogaXNDb21wbGV0ZWQgPyAn4pyFICcgOiAn4p2MICcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdzdWJ0b3BpYy1zdGF0dXMnXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLy8gU3VidG9waWMgbGlua1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3VidG9waWNGaWxlICYmIHN1YnRvcGljRmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWJ0b3BpY05hbWVFbC5jcmVhdGVFbCgnYScsIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogc3VidG9waWNOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhyZWY6IHN1YnRvcGljRmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsczogJ3N1YnRvcGljLWxpbmsnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKS5vcGVuRmlsZShzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZ2dsZSBjb21wbGV0aW9uIGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9nZ2xlQnV0dG9uID0gc3VidG9waWNJdGVtLmNyZWF0ZUVsKCdidXR0b24nLCB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IGlzQ29tcGxldGVkID8gJ01hcmsgSW5jb21wbGV0ZScgOiAnTWFyayBDb21wbGV0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xzOiAnc3VidG9waWMtdG9nZ2xlLWJ1dHRvbidcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICB0b2dnbGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4udG9nZ2xlU3VidG9waWNDb21wbGV0aW9uKHN1YnRvcGljRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJWaWV3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN1YnRvcGljIGZpbGUgZG9lc24ndCBleGlzdFxuICAgICAgICAgICAgICAgICAgICAgICAgc3VidG9waWNOYW1lRWwuY3JlYXRlRWwoJ3NwYW4nLCB7IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6IHN1YnRvcGljTmFtZSArICcgKG1pc3NpbmcpJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbHM6ICdzdWJ0b3BpYy1taXNzaW5nJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYXN5bmMgcmVuZGVySW5Qcm9ncmVzc1RvcGljcyhjb250YWluZXI6IEhUTUxFbGVtZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgdG9waWNGaWxlcyA9IGF3YWl0IHRoaXMuZ2V0VG9waWNGaWxlcygpO1xuICAgICAgICBjb25zdCBpblByb2dyZXNzVG9waWNzID0gdG9waWNGaWxlcy5maWx0ZXIoZmlsZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnByb2dyZXNzIHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gcHJvZ3Jlc3MgPiAwICYmIHByb2dyZXNzIDwgMTtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBpZiAoaW5Qcm9ncmVzc1RvcGljcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5jcmVhdGVFbCgncCcsIHsgXG4gICAgICAgICAgICAgICAgdGV4dDogJ05vIHRvcGljcyBpbiBwcm9ncmVzcy4gU3RhcnQgbGVhcm5pbmcgYSB0b3BpYyB0byBzZWUgaXQgaGVyZS4nLFxuICAgICAgICAgICAgICAgIGNsczogJ25vLXRvcGljcy1tZXNzYWdlJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFNvcnQgYnkgcHJvZ3Jlc3MgKGFzY2VuZGluZylcbiAgICAgICAgaW5Qcm9ncmVzc1RvcGljcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXRhZGF0YUEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShhKTtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhQiA9IHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGIpO1xuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NBID0gbWV0YWRhdGFBPy5mcm9udG1hdHRlcj8ucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzQiA9IG1ldGFkYXRhQj8uZnJvbnRtYXR0ZXI/LnByb2dyZXNzIHx8IDA7XG4gICAgICAgICAgICByZXR1cm4gcHJvZ3Jlc3NBIC0gcHJvZ3Jlc3NCO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBhIGxpc3Qgb2YgdG9waWNzXG4gICAgICAgIGNvbnN0IHRvcGljTGlzdCA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1saXN0JyB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBpblByb2dyZXNzVG9waWNzKSB7XG4gICAgICAgICAgICAvLyBTaW1pbGFyIHJlbmRlcmluZyBhcyByZW5kZXJBbGxUb3BpY3MgYnV0IGZvciBpbi1wcm9ncmVzcyB0b3BpY3Mgb25seVxuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgICAgIGlmICghbWV0YWRhdGE/LmZyb250bWF0dGVyKSBjb250aW51ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5wcm9ncmVzcyB8fCAwO1xuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NQZXJjZW50ID0gTWF0aC5yb3VuZChwcm9ncmVzcyAqIDEwMCk7XG4gICAgICAgICAgICBjb25zdCBjb21wbGV0ZWRTdWJ0b3BpY3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5jb21wbGV0ZWRfc3VidG9waWNzIHx8IDA7XG4gICAgICAgICAgICBjb25zdCB0b3RhbFN1YnRvcGljcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnRvdGFsX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjb25zdCB0b3BpY0l0ZW0gPSB0b3BpY0xpc3QuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAndG9waWMtaXRlbScgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRvcGljIGhlYWRlciB3aXRoIG5hbWUgYW5kIHByb2dyZXNzXG4gICAgICAgICAgICBjb25zdCB0b3BpY0hlYWRlciA9IHRvcGljSXRlbS5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1oZWFkZXInIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUb3BpYyBuYW1lIHdpdGggbGlua1xuICAgICAgICAgICAgY29uc3QgdG9waWNOYW1lID0gdG9waWNIZWFkZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAndG9waWMtbmFtZScgfSk7XG4gICAgICAgICAgICB0b3BpY05hbWUuY3JlYXRlRWwoJ2EnLCB7IFxuICAgICAgICAgICAgICAgIHRleHQ6IGZpbGUuYmFzZW5hbWUsXG4gICAgICAgICAgICAgICAgaHJlZjogZmlsZS5wYXRoLFxuICAgICAgICAgICAgICAgIGNsczogJ3RvcGljLWxpbmsnXG4gICAgICAgICAgICB9KS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKS5vcGVuRmlsZShmaWxlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBQcm9ncmVzcyBpbmRpY2F0b3JcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzVGV4dCA9IHRvcGljSGVhZGVyLmNyZWF0ZUVsKCdkaXYnLCB7IFxuICAgICAgICAgICAgICAgIHRleHQ6IGAke3Byb2dyZXNzUGVyY2VudH0lICgke2NvbXBsZXRlZFN1YnRvcGljc30vJHt0b3RhbFN1YnRvcGljc30pYCxcbiAgICAgICAgICAgICAgICBjbHM6ICd0b3BpYy1wcm9ncmVzcy10ZXh0J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFByb2dyZXNzIGJhclxuICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NCYXJDb250YWluZXIgPSB0b3BpY0l0ZW0uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAncHJvZ3Jlc3MtYmFyLWNvbnRhaW5lcicgfSk7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzc0JhciA9IHByb2dyZXNzQmFyQ29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3Byb2dyZXNzLWJhciBwcm9ncmVzcy1tZWRpdW0nIH0pO1xuICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuc3R5bGUud2lkdGggPSBgJHtwcm9ncmVzc1BlcmNlbnR9JWA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgYXN5bmMgcmVuZGVyQ29tcGxldGVkVG9waWNzKGNvbnRhaW5lcjogSFRNTEVsZW1lbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29udGFpbmVyLmVtcHR5KCk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCB0b3BpY0ZpbGVzID0gYXdhaXQgdGhpcy5nZXRUb3BpY0ZpbGVzKCk7XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZFRvcGljcyA9IHRvcGljRmlsZXMuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzID0gbWV0YWRhdGE/LmZyb250bWF0dGVyPy5wcm9ncmVzcyB8fCAwO1xuICAgICAgICAgICAgcmV0dXJuIHByb2dyZXNzID09PSAxO1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChjb21wbGV0ZWRUb3BpY3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBjb250YWluZXIuY3JlYXRlRWwoJ3AnLCB7IFxuICAgICAgICAgICAgICAgIHRleHQ6ICdObyBjb21wbGV0ZWQgdG9waWNzIHlldC4gS2VlcCBsZWFybmluZyEnLFxuICAgICAgICAgICAgICAgIGNsczogJ25vLXRvcGljcy1tZXNzYWdlJ1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIENyZWF0ZSBhIGxpc3Qgb2YgdG9waWNzXG4gICAgICAgIGNvbnN0IHRvcGljTGlzdCA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICd0b3BpYy1saXN0JyB9KTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBjb21wbGV0ZWRUb3BpY3MpIHtcbiAgICAgICAgICAgIC8vIFNpbWlsYXIgcmVuZGVyaW5nIGFzIHJlbmRlckFsbFRvcGljcyBidXQgZm9yIGNvbXBsZXRlZCB0b3BpY3Mgb25seVxuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgICAgIGlmICghbWV0YWRhdGE/LmZyb250bWF0dGVyKSBjb250aW51ZTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc3QgdG9waWNJdGVtID0gdG9waWNMaXN0LmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3RvcGljLWl0ZW0nIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUb3BpYyBoZWFkZXIgd2l0aCBuYW1lIGFuZCBjb21wbGV0aW9uIGluZGljYXRvclxuICAgICAgICAgICAgY29uc3QgdG9waWNIZWFkZXIgPSB0b3BpY0l0ZW0uY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAndG9waWMtaGVhZGVyJyB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVG9waWMgbmFtZSB3aXRoIGxpbmtcbiAgICAgICAgICAgIGNvbnN0IHRvcGljTmFtZSA9IHRvcGljSGVhZGVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3RvcGljLW5hbWUnIH0pO1xuICAgICAgICAgICAgdG9waWNOYW1lLmNyZWF0ZUVsKCdzcGFuJywgeyBcbiAgICAgICAgICAgICAgICB0ZXh0OiAn4pyFICcsXG4gICAgICAgICAgICAgICAgY2xzOiAndG9waWMtY29tcGxldGVkLWluZGljYXRvcidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdG9waWNOYW1lLmNyZWF0ZUVsKCdhJywgeyBcbiAgICAgICAgICAgICAgICB0ZXh0OiBmaWxlLmJhc2VuYW1lLFxuICAgICAgICAgICAgICAgIGhyZWY6IGZpbGUucGF0aCxcbiAgICAgICAgICAgICAgICBjbHM6ICd0b3BpYy1saW5rJ1xuICAgICAgICAgICAgfSkuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWFmKCkub3BlbkZpbGUoZmlsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ29tcGxldGlvbiB0ZXh0XG4gICAgICAgICAgICB0b3BpY0hlYWRlci5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgICAgICB0ZXh0OiAnQ29tcGxldGVkJyxcbiAgICAgICAgICAgICAgICBjbHM6ICd0b3BpYy1jb21wbGV0ZWQtdGV4dCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGFzeW5jIGdldFRvcGljRmlsZXMoKSB7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gdGhpcy5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xuICAgICAgICByZXR1cm4gZmlsZXMuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgICAgIHJldHVybiBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnR5cGUgPT09ICd0b3BpYyc7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IFRGaWxlIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW4gZnJvbSAnLi4vbWFpbic7XG5cbmV4cG9ydCBjbGFzcyBQcm9ncmVzc1RyYWNrZXIge1xuICAgIHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbjtcblxuICAgIGNvbnN0cnVjdG9yKHBsdWdpbjogTGVhcm5pbmdQcm9ncmVzc1BsdWdpbikge1xuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpbjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHRvcGljIG5vdGVzIGluIHRoZSB2YXVsdFxuICAgICAqL1xuICAgIGFzeW5jIGdldEFsbFRvcGljcygpOiBQcm9taXNlPFRGaWxlW10+IHtcbiAgICAgICAgY29uc3QgZmlsZXMgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQuZ2V0TWFya2Rvd25GaWxlcygpO1xuICAgICAgICByZXR1cm4gZmlsZXMuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgICAgICByZXR1cm4gbWV0YWRhdGE/LmZyb250bWF0dGVyPy50eXBlID09PSAndG9waWMnO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIHN1YnRvcGljIG5vdGVzIGZvciBhIHNwZWNpZmljIHRvcGljXG4gICAgICovXG4gICAgYXN5bmMgZ2V0U3VidG9waWNzRm9yVG9waWModG9waWNGaWxlOiBURmlsZSk6IFByb21pc2U8VEZpbGVbXT4ge1xuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh0b3BpY0ZpbGUpO1xuICAgICAgICBpZiAoIW1ldGFkYXRhPy5mcm9udG1hdHRlcj8uc3VidG9waWNzKSByZXR1cm4gW107XG5cbiAgICAgICAgY29uc3Qgc3VidG9waWNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIuc3VidG9waWNzO1xuICAgICAgICBjb25zdCBzdWJ0b3BpY0ZpbGVzOiBURmlsZVtdID0gW107XG5cbiAgICAgICAgZm9yIChjb25zdCBzdWJ0b3BpYyBvZiBzdWJ0b3BpY3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljTmFtZSA9IHN1YnRvcGljLnJlcGxhY2UoL1xcW1xcWyguKj8pXFxdXFxdLywgJyQxJyk7XG4gICAgICAgICAgICBjb25zdCBzdWJ0b3BpY0ZpbGUgPSB0aGlzLnBsdWdpbi5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGAke3N1YnRvcGljTmFtZX0ubWRgKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHN1YnRvcGljRmlsZSAmJiBzdWJ0b3BpY0ZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgIHN1YnRvcGljRmlsZXMucHVzaChzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN1YnRvcGljRmlsZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBpbmNvbXBsZXRlIHN1YnRvcGljcyBmb3IgYSBzcGVjaWZpYyB0b3BpY1xuICAgICAqL1xuICAgIGFzeW5jIGdldEluY29tcGxldGVTdWJ0b3BpY3ModG9waWNGaWxlOiBURmlsZSk6IFByb21pc2U8VEZpbGVbXT4ge1xuICAgICAgICBjb25zdCBzdWJ0b3BpY3MgPSBhd2FpdCB0aGlzLmdldFN1YnRvcGljc0ZvclRvcGljKHRvcGljRmlsZSk7XG4gICAgICAgIHJldHVybiBzdWJ0b3BpY3MuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgICAgICByZXR1cm4gbWV0YWRhdGE/LmZyb250bWF0dGVyPy5jb21wbGV0ZWQgIT09IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhbGwgdG9waWNzIHdpdGggcHJvZ3Jlc3MgaW5mb3JtYXRpb25cbiAgICAgKi9cbiAgICBhc3luYyBnZXRUb3BpY3NXaXRoUHJvZ3Jlc3MoKTogUHJvbWlzZTx7ZmlsZTogVEZpbGUsIHByb2dyZXNzOiBudW1iZXIsIGNvbXBsZXRlZDogbnVtYmVyLCB0b3RhbDogbnVtYmVyfVtdPiB7XG4gICAgICAgIGNvbnN0IHRvcGljcyA9IGF3YWl0IHRoaXMuZ2V0QWxsVG9waWNzKCk7XG4gICAgICAgIHJldHVybiB0b3BpY3MubWFwKGZpbGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IG1ldGFkYXRhPy5mcm9udG1hdHRlcj8ucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IG1ldGFkYXRhPy5mcm9udG1hdHRlcj8uY29tcGxldGVkX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICAgICAgY29uc3QgdG90YWwgPSBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnRvdGFsX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3MsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkLFxuICAgICAgICAgICAgICAgIHRvdGFsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgb3ZlcmFsbCBsZWFybmluZyBwcm9ncmVzcyBhY3Jvc3MgYWxsIHRvcGljc1xuICAgICAqL1xuICAgIGFzeW5jIGdldE92ZXJhbGxQcm9ncmVzcygpOiBQcm9taXNlPHtwcm9ncmVzczogbnVtYmVyLCBjb21wbGV0ZWRUb3BpY3M6IG51bWJlciwgdG90YWxUb3BpY3M6IG51bWJlciwgY29tcGxldGVkU3VidG9waWNzOiBudW1iZXIsIHRvdGFsU3VidG9waWNzOiBudW1iZXJ9PiB7XG4gICAgICAgIGNvbnN0IHRvcGljcyA9IGF3YWl0IHRoaXMuZ2V0VG9waWNzV2l0aFByb2dyZXNzKCk7XG4gICAgICAgIFxuICAgICAgICBpZiAodG9waWNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzczogMCxcbiAgICAgICAgICAgICAgICBjb21wbGV0ZWRUb3BpY3M6IDAsXG4gICAgICAgICAgICAgICAgdG90YWxUb3BpY3M6IDAsXG4gICAgICAgICAgICAgICAgY29tcGxldGVkU3VidG9waWNzOiAwLFxuICAgICAgICAgICAgICAgIHRvdGFsU3VidG9waWNzOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBjb25zdCBjb21wbGV0ZWRUb3BpY3MgPSB0b3BpY3MuZmlsdGVyKHQgPT4gdC5wcm9ncmVzcyA9PT0gMSkubGVuZ3RoO1xuICAgICAgICBjb25zdCB0b3RhbFRvcGljcyA9IHRvcGljcy5sZW5ndGg7XG4gICAgICAgIFxuICAgICAgICBsZXQgY29tcGxldGVkU3VidG9waWNzID0gMDtcbiAgICAgICAgbGV0IHRvdGFsU3VidG9waWNzID0gMDtcbiAgICAgICAgXG4gICAgICAgIHRvcGljcy5mb3JFYWNoKHRvcGljID0+IHtcbiAgICAgICAgICAgIGNvbXBsZXRlZFN1YnRvcGljcyArPSB0b3BpYy5jb21wbGV0ZWQ7XG4gICAgICAgICAgICB0b3RhbFN1YnRvcGljcyArPSB0b3BpYy50b3RhbDtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBwcm9ncmVzcyA9IHRvdGFsU3VidG9waWNzID4gMCA/IGNvbXBsZXRlZFN1YnRvcGljcyAvIHRvdGFsU3VidG9waWNzIDogMDtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcm9ncmVzcyxcbiAgICAgICAgICAgIGNvbXBsZXRlZFRvcGljcyxcbiAgICAgICAgICAgIHRvdGFsVG9waWNzLFxuICAgICAgICAgICAgY29tcGxldGVkU3VidG9waWNzLFxuICAgICAgICAgICAgdG90YWxTdWJ0b3BpY3NcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9waWNzIGdyb3VwZWQgYnkgcHJvZ3Jlc3Mgc3RhdHVzXG4gICAgICovXG4gICAgYXN5bmMgZ2V0VG9waWNzQnlTdGF0dXMoKTogUHJvbWlzZTx7bm90U3RhcnRlZDogVEZpbGVbXSwgaW5Qcm9ncmVzczogVEZpbGVbXSwgY29tcGxldGVkOiBURmlsZVtdfT4ge1xuICAgICAgICBjb25zdCB0b3BpY3MgPSBhd2FpdCB0aGlzLmdldEFsbFRvcGljcygpO1xuICAgICAgICBcbiAgICAgICAgY29uc3Qgbm90U3RhcnRlZDogVEZpbGVbXSA9IFtdO1xuICAgICAgICBjb25zdCBpblByb2dyZXNzOiBURmlsZVtdID0gW107XG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZDogVEZpbGVbXSA9IFtdO1xuICAgICAgICBcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIHRvcGljcykge1xuICAgICAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IG1ldGFkYXRhPy5mcm9udG1hdHRlcj8ucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHByb2dyZXNzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbm90U3RhcnRlZC5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcm9ncmVzcyA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGNvbXBsZXRlZC5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpblByb2dyZXNzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBub3RTdGFydGVkLFxuICAgICAgICAgICAgaW5Qcm9ncmVzcyxcbiAgICAgICAgICAgIGNvbXBsZXRlZFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCByZWNvbW1lbmRlZCB0b3BpY3MgdG8gZm9jdXMgb24gKHRvcGljcyB3aXRoIHNvbWUgcHJvZ3Jlc3MgYnV0IG5vdCBjb21wbGV0ZWQpXG4gICAgICovXG4gICAgYXN5bmMgZ2V0UmVjb21tZW5kZWRUb3BpY3MobGltaXQ6IG51bWJlciA9IDUpOiBQcm9taXNlPFRGaWxlW10+IHtcbiAgICAgICAgY29uc3QgdG9waWNzID0gYXdhaXQgdGhpcy5nZXRUb3BpY3NXaXRoUHJvZ3Jlc3MoKTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZpbHRlciBmb3IgaW4tcHJvZ3Jlc3MgdG9waWNzXG4gICAgICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSB0b3BpY3MuZmlsdGVyKHQgPT4gdC5wcm9ncmVzcyA+IDAgJiYgdC5wcm9ncmVzcyA8IDEpO1xuICAgICAgICBcbiAgICAgICAgLy8gU29ydCBieSBwcm9ncmVzcyAoaGlnaGVzdCBmaXJzdClcbiAgICAgICAgaW5Qcm9ncmVzcy5zb3J0KChhLCBiKSA9PiBiLnByb2dyZXNzIC0gYS5wcm9ncmVzcyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaW5Qcm9ncmVzcy5zbGljZSgwLCBsaW1pdCkubWFwKHQgPT4gdC5maWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdG9waWNzIHdpdGgga25vd2xlZGdlIGdhcHMgKHRvcGljcyB3aXRoIGxvdyBwcm9ncmVzcylcbiAgICAgKi9cbiAgICBhc3luYyBnZXRLbm93bGVkZ2VHYXBzKHRocmVzaG9sZDogbnVtYmVyID0gMC4zLCBsaW1pdDogbnVtYmVyID0gNSk6IFByb21pc2U8VEZpbGVbXT4ge1xuICAgICAgICBjb25zdCB0b3BpY3MgPSBhd2FpdCB0aGlzLmdldFRvcGljc1dpdGhQcm9ncmVzcygpO1xuICAgICAgICBcbiAgICAgICAgLy8gRmlsdGVyIGZvciB0b3BpY3Mgd2l0aCBwcm9ncmVzcyBiZWxvdyB0aHJlc2hvbGRcbiAgICAgICAgY29uc3QgZ2FwcyA9IHRvcGljcy5maWx0ZXIodCA9PiB0LnByb2dyZXNzIDwgdGhyZXNob2xkKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNvcnQgYnkgcHJvZ3Jlc3MgKGxvd2VzdCBmaXJzdClcbiAgICAgICAgZ2Fwcy5zb3J0KChhLCBiKSA9PiBhLnByb2dyZXNzIC0gYi5wcm9ncmVzcyk7XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gZ2Fwcy5zbGljZSgwLCBsaW1pdCkubWFwKHQgPT4gdC5maWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBhIHN1YnRvcGljIGlzIGNvbXBsZXRlZFxuICAgICAqL1xuICAgIGlzU3VidG9waWNDb21wbGV0ZWQoZmlsZTogVEZpbGUpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG4gICAgICAgIHJldHVybiBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LmNvbXBsZXRlZCA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHBhcmVudCB0b3BpYyBmb3IgYSBzdWJ0b3BpY1xuICAgICAqL1xuICAgIGFzeW5jIGdldFBhcmVudFRvcGljKHN1YnRvcGljRmlsZTogVEZpbGUpOiBQcm9taXNlPFRGaWxlIHwgbnVsbD4ge1xuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICBpZiAoIW1ldGFkYXRhPy5mcm9udG1hdHRlcj8ucGFyZW50KSByZXR1cm4gbnVsbDtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHBhcmVudE5hbWUgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5wYXJlbnQucmVwbGFjZSgvXFxbXFxbKC4qPylcXF1cXF0vLCAnJDEnKTtcbiAgICAgICAgY29uc3QgcGFyZW50RmlsZSA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7cGFyZW50TmFtZX0ubWRgKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChwYXJlbnRGaWxlICYmIHBhcmVudEZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcmVudEZpbGU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlIGEgcHJvZ3Jlc3MgcmVwb3J0IGZvciBhIHRvcGljXG4gICAgICovXG4gICAgYXN5bmMgZ2VuZXJhdGVUb3BpY1JlcG9ydCh0b3BpY0ZpbGU6IFRGaWxlKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSB0aGlzLnBsdWdpbi5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUodG9waWNGaWxlKTtcbiAgICAgICAgaWYgKCFtZXRhZGF0YT8uZnJvbnRtYXR0ZXIpIHJldHVybiBcIk5vIG1ldGFkYXRhIGZvdW5kIGZvciB0aGlzIHRvcGljLlwiO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5wcm9ncmVzcyB8fCAwO1xuICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgY29uc3QgY29tcGxldGVkU3VidG9waWNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIuY29tcGxldGVkX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICBjb25zdCB0b3RhbFN1YnRvcGljcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnRvdGFsX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICBcbiAgICAgICAgbGV0IHJlcG9ydCA9IGAjIFByb2dyZXNzIFJlcG9ydDogJHt0b3BpY0ZpbGUuYmFzZW5hbWV9XFxuXFxuYDtcbiAgICAgICAgcmVwb3J0ICs9IGAjIyBPdmVydmlld1xcblxcbmA7XG4gICAgICAgIHJlcG9ydCArPSBgLSAqKlByb2dyZXNzKio6ICR7cHJvZ3Jlc3NQZXJjZW50fSUgY29tcGxldGVcXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipDb21wbGV0ZWQgU3VidG9waWNzKio6ICR7Y29tcGxldGVkU3VidG9waWNzfS8ke3RvdGFsU3VidG9waWNzfVxcblxcbmA7XG4gICAgICAgIFxuICAgICAgICByZXBvcnQgKz0gYCMjIFN1YnRvcGljc1xcblxcbmA7XG4gICAgICAgIFxuICAgICAgICBpZiAobWV0YWRhdGEuZnJvbnRtYXR0ZXIuc3VidG9waWNzICYmIG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHN1YnRvcGljIG9mIG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljTmFtZSA9IHN1YnRvcGljLnJlcGxhY2UoL1xcW1xcWyguKj8pXFxdXFxdLywgJyQxJyk7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNGaWxlID0gdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChgJHtzdWJ0b3BpY05hbWV9Lm1kYCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHN1YnRvcGljRmlsZSAmJiBzdWJ0b3BpY0ZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY01ldGFkYXRhID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHN1YnRvcGljRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzQ29tcGxldGVkID0gc3VidG9waWNNZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LmNvbXBsZXRlZCA9PT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcGxldGlvbkRhdGUgPSBzdWJ0b3BpY01ldGFkYXRhPy5mcm9udG1hdHRlcj8uY29tcGxldGlvbl9kYXRlIHx8ICdOL0EnO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAtICR7aXNDb21wbGV0ZWQgPyAn4pyFJyA6ICfinYwnfSAqKiR7c3VidG9waWNOYW1lfSoqYDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQ29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXBvcnQgKz0gYCAoQ29tcGxldGVkIG9uOiAke2NvbXBsZXRpb25EYXRlfSlgO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlcG9ydCArPSAnXFxuJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXBvcnQgKz0gYC0g4p2TICoqJHtzdWJ0b3BpY05hbWV9KiogKE1pc3NpbmcpXFxuYDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBvcnQgKz0gXCJObyBzdWJ0b3BpY3MgZm91bmQgZm9yIHRoaXMgdG9waWMuXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJlcG9ydCArPSBgXFxuIyMgUmVjb21tZW5kYXRpb25zXFxuXFxuYDtcbiAgICAgICAgXG4gICAgICAgIGlmIChwcm9ncmVzcyA9PT0gMCkge1xuICAgICAgICAgICAgcmVwb3J0ICs9IFwiWW91IGhhdmVuJ3Qgc3RhcnRlZCBsZWFybmluZyB0aGlzIHRvcGljIHlldC4gQ3JlYXRlIHNvbWUgc3VidG9waWNzIHRvIGJlZ2luIHRyYWNraW5nIHlvdXIgcHJvZ3Jlc3MuXFxuXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3MgPT09IDEpIHtcbiAgICAgICAgICAgIHJlcG9ydCArPSBcIkNvbmdyYXR1bGF0aW9ucyEgWW91J3ZlIGNvbXBsZXRlZCBhbGwgc3VidG9waWNzIGZvciB0aGlzIHRvcGljLlxcblwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVwb3J0ICs9IGBZb3UncmUgbWFraW5nIHByb2dyZXNzIG9uIHRoaXMgdG9waWMuIEZvY3VzIG9uIGNvbXBsZXRpbmcgdGhlIHJlbWFpbmluZyBzdWJ0b3BpY3MgdG8gZmlsbCB5b3VyIGtub3dsZWRnZSBnYXBzLlxcbmA7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXBvcnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgYW4gb3ZlcmFsbCBwcm9ncmVzcyByZXBvcnRcbiAgICAgKi9cbiAgICBhc3luYyBnZW5lcmF0ZU92ZXJhbGxSZXBvcnQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgY29uc3Qgb3ZlcmFsbCA9IGF3YWl0IHRoaXMuZ2V0T3ZlcmFsbFByb2dyZXNzKCk7XG4gICAgICAgIGNvbnN0IHRvcGljc0J5U3RhdHVzID0gYXdhaXQgdGhpcy5nZXRUb3BpY3NCeVN0YXR1cygpO1xuICAgICAgICBjb25zdCByZWNvbW1lbmRlZFRvcGljcyA9IGF3YWl0IHRoaXMuZ2V0UmVjb21tZW5kZWRUb3BpY3MoMyk7XG4gICAgICAgIGNvbnN0IGtub3dsZWRnZUdhcHMgPSBhd2FpdCB0aGlzLmdldEtub3dsZWRnZUdhcHMoMC4zLCAzKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IG92ZXJhbGxQZXJjZW50ID0gTWF0aC5yb3VuZChvdmVyYWxsLnByb2dyZXNzICogMTAwKTtcbiAgICAgICAgXG4gICAgICAgIGxldCByZXBvcnQgPSBgIyBMZWFybmluZyBQcm9ncmVzcyBSZXBvcnRcXG5cXG5gO1xuICAgICAgICByZXBvcnQgKz0gYCMjIE92ZXJhbGwgUHJvZ3Jlc3NcXG5cXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipPdmVyYWxsIFByb2dyZXNzKio6ICR7b3ZlcmFsbFBlcmNlbnR9JSBjb21wbGV0ZVxcbmA7XG4gICAgICAgIHJlcG9ydCArPSBgLSAqKlRvcGljcyoqOiAke292ZXJhbGwuY29tcGxldGVkVG9waWNzfS8ke292ZXJhbGwudG90YWxUb3BpY3N9IGNvbXBsZXRlZFxcbmA7XG4gICAgICAgIHJlcG9ydCArPSBgLSAqKlN1YnRvcGljcyoqOiAke292ZXJhbGwuY29tcGxldGVkU3VidG9waWNzfS8ke292ZXJhbGwudG90YWxTdWJ0b3BpY3N9IGNvbXBsZXRlZFxcblxcbmA7XG4gICAgICAgIFxuICAgICAgICByZXBvcnQgKz0gYCMjIFRvcGljcyBieSBTdGF0dXNcXG5cXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipOb3QgU3RhcnRlZCoqOiAke3RvcGljc0J5U3RhdHVzLm5vdFN0YXJ0ZWQubGVuZ3RofSB0b3BpY3NcXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipJbiBQcm9ncmVzcyoqOiAke3RvcGljc0J5U3RhdHVzLmluUHJvZ3Jlc3MubGVuZ3RofSB0b3BpY3NcXG5gO1xuICAgICAgICByZXBvcnQgKz0gYC0gKipDb21wbGV0ZWQqKjogJHt0b3BpY3NCeVN0YXR1cy5jb21wbGV0ZWQubGVuZ3RofSB0b3BpY3NcXG5cXG5gO1xuICAgICAgICBcbiAgICAgICAgcmVwb3J0ICs9IGAjIyBSZWNvbW1lbmRlZCBGb2N1cyBBcmVhc1xcblxcbmA7XG4gICAgICAgIFxuICAgICAgICBpZiAocmVjb21tZW5kZWRUb3BpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCB0b3BpYyBvZiByZWNvbW1lbmRlZFRvcGljcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKHRvcGljKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzcyA9IG1ldGFkYXRhPy5mcm9udG1hdHRlcj8ucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXBvcnQgKz0gYC0gW1ske3RvcGljLmJhc2VuYW1lfV1dICgke3Byb2dyZXNzUGVyY2VudH0lIGNvbXBsZXRlKVxcbmA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBvcnQgKz0gXCJObyB0b3BpY3MgaW4gcHJvZ3Jlc3MuIFN0YXJ0IGxlYXJuaW5nIGEgdG9waWMgdG8gZ2V0IHJlY29tbWVuZGF0aW9ucy5cXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmVwb3J0ICs9IGBcXG4jIyBLbm93bGVkZ2UgR2Fwc1xcblxcbmA7XG4gICAgICAgIFxuICAgICAgICBpZiAoa25vd2xlZGdlR2Fwcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRvcGljIG9mIGtub3dsZWRnZUdhcHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZSh0b3BpYyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnByb2dyZXNzIHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvZ3Jlc3NQZXJjZW50ID0gTWF0aC5yb3VuZChwcm9ncmVzcyAqIDEwMCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAtIFtbJHt0b3BpYy5iYXNlbmFtZX1dXSAoJHtwcm9ncmVzc1BlcmNlbnR9JSBjb21wbGV0ZSlcXG5gO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVwb3J0ICs9IFwiTm8gc2lnbmlmaWNhbnQga25vd2xlZGdlIGdhcHMgZm91bmQuXFxuXCI7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiByZXBvcnQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgSXRlbVZpZXcsIFdvcmtzcGFjZUxlYWYgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgTGVhcm5pbmdQcm9ncmVzc1BsdWdpbiBmcm9tICcuLi9tYWluJztcbmltcG9ydCB7IFByb2dyZXNzVHJhY2tlciB9IGZyb20gJy4uL3RyYWNraW5nL1Byb2dyZXNzVHJhY2tlcic7XG5cbmV4cG9ydCBjb25zdCBLTk9XTEVER0VfTUFQX1ZJRVdfVFlQRSA9ICdrbm93bGVkZ2UtbWFwLXZpZXcnO1xuXG5leHBvcnQgY2xhc3MgS25vd2xlZGdlTWFwVmlldyBleHRlbmRzIEl0ZW1WaWV3IHtcbiAgICBwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW47XG4gICAgcHJvZ3Jlc3NUcmFja2VyOiBQcm9ncmVzc1RyYWNrZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihsZWFmOiBXb3Jrc3BhY2VMZWFmLCBwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW4pIHtcbiAgICAgICAgc3VwZXIobGVhZik7XG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgICAgICB0aGlzLnByb2dyZXNzVHJhY2tlciA9IG5ldyBQcm9ncmVzc1RyYWNrZXIocGx1Z2luKTtcbiAgICB9XG5cbiAgICBnZXRWaWV3VHlwZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gS05PV0xFREdFX01BUF9WSUVXX1RZUEU7XG4gICAgfVxuXG4gICAgZ2V0RGlzcGxheVRleHQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICdLbm93bGVkZ2UgTWFwJztcbiAgICB9XG5cbiAgICBhc3luYyBvbk9wZW4oKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGF3YWl0IHRoaXMucmVuZGVyVmlldygpO1xuICAgIH1cblxuICAgIGFzeW5jIHJlbmRlclZpZXcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyRWwuY2hpbGRyZW5bMV07XG4gICAgICAgIGNvbnRhaW5lci5lbXB0eSgpO1xuICAgICAgICBcbiAgICAgICAgY29udGFpbmVyLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0tub3dsZWRnZSBNYXAnIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGZvciB0aGUga25vd2xlZGdlIG1hcFxuICAgICAgICBjb25zdCBtYXBDb250YWluZXIgPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgXG4gICAgICAgICAgICBjbHM6ICdrbm93bGVkZ2UtbWFwLWNvbnRhaW5lcicgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIGEgY29udGFpbmVyIGZvciB0aGUgbGVnZW5kXG4gICAgICAgIGNvbnN0IGxlZ2VuZENvbnRhaW5lciA9IGNvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgIGNsczogJ2tub3dsZWRnZS1tYXAtbGVnZW5kJyBcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICAvLyBBZGQgbGVnZW5kIGl0ZW1zXG4gICAgICAgIGxlZ2VuZENvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgIGNsczogJ2xlZ2VuZC10aXRsZScsXG4gICAgICAgICAgICB0ZXh0OiAnTGVnZW5kJ1xuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGNvbXBsZXRlZExlZ2VuZCA9IGxlZ2VuZENvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtaXRlbScgfSk7XG4gICAgICAgIGNvbXBsZXRlZExlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLWNvbXBsZXRlZCcgfSk7XG4gICAgICAgIGNvbXBsZXRlZExlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtbGFiZWwnLCB0ZXh0OiAnQ29tcGxldGVkJyB9KTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IGhpZ2hQcm9ncmVzc0xlZ2VuZCA9IGxlZ2VuZENvbnRhaW5lci5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtaXRlbScgfSk7XG4gICAgICAgIGhpZ2hQcm9ncmVzc0xlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLWhpZ2gtcHJvZ3Jlc3MnIH0pO1xuICAgICAgICBoaWdoUHJvZ3Jlc3NMZWdlbmQuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnbGVnZW5kLWxhYmVsJywgdGV4dDogJ0hpZ2ggUHJvZ3Jlc3MgKDcwLTk5JSknIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgbWVkaXVtUHJvZ3Jlc3NMZWdlbmQgPSBsZWdlbmRDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnbGVnZW5kLWl0ZW0nIH0pO1xuICAgICAgICBtZWRpdW1Qcm9ncmVzc0xlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLW1lZGl1bS1wcm9ncmVzcycgfSk7XG4gICAgICAgIG1lZGl1bVByb2dyZXNzTGVnZW5kLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2xlZ2VuZC1sYWJlbCcsIHRleHQ6ICdNZWRpdW0gUHJvZ3Jlc3MgKDMwLTY5JSknIH0pO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgbG93UHJvZ3Jlc3NMZWdlbmQgPSBsZWdlbmRDb250YWluZXIuY3JlYXRlRWwoJ2RpdicsIHsgY2xzOiAnbGVnZW5kLWl0ZW0nIH0pO1xuICAgICAgICBsb3dQcm9ncmVzc0xlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLWxvdy1wcm9ncmVzcycgfSk7XG4gICAgICAgIGxvd1Byb2dyZXNzTGVnZW5kLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2xlZ2VuZC1sYWJlbCcsIHRleHQ6ICdMb3cgUHJvZ3Jlc3MgKDEtMjklKScgfSk7XG4gICAgICAgIFxuICAgICAgICBjb25zdCBub3RTdGFydGVkTGVnZW5kID0gbGVnZW5kQ29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2xlZ2VuZC1pdGVtJyB9KTtcbiAgICAgICAgbm90U3RhcnRlZExlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtY29sb3IgbGVnZW5kLW5vdC1zdGFydGVkJyB9KTtcbiAgICAgICAgbm90U3RhcnRlZExlZ2VuZC5jcmVhdGVFbCgnZGl2JywgeyBjbHM6ICdsZWdlbmQtbGFiZWwnLCB0ZXh0OiAnTm90IFN0YXJ0ZWQnIH0pO1xuICAgICAgICBcbiAgICAgICAgLy8gR2V0IHRvcGljcyB3aXRoIHByb2dyZXNzIGluZm9ybWF0aW9uXG4gICAgICAgIGNvbnN0IHRvcGljcyA9IGF3YWl0IHRoaXMucHJvZ3Jlc3NUcmFja2VyLmdldFRvcGljc1dpdGhQcm9ncmVzcygpO1xuICAgICAgICBcbiAgICAgICAgaWYgKHRvcGljcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIG1hcENvbnRhaW5lci5jcmVhdGVFbCgncCcsIHsgXG4gICAgICAgICAgICAgICAgdGV4dDogJ05vIGxlYXJuaW5nIHRvcGljcyBmb3VuZC4gQ3JlYXRlIGEgdG9waWMgdXNpbmcgdGhlIFwiQ3JlYXRlIFRvcGljIE5vdGVcIiBjb21tYW5kLicsXG4gICAgICAgICAgICAgICAgY2xzOiAnbm8tdG9waWNzLW1lc3NhZ2UnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBrbm93bGVkZ2UgbWFwIHZpc3VhbGl6YXRpb25cbiAgICAgICAgYXdhaXQgdGhpcy5jcmVhdGVLbm93bGVkZ2VNYXAobWFwQ29udGFpbmVyLCB0b3BpY3MpO1xuICAgIH1cbiAgICBcbiAgICBhc3luYyBjcmVhdGVLbm93bGVkZ2VNYXAoY29udGFpbmVyOiBIVE1MRWxlbWVudCwgdG9waWNzOiB7ZmlsZTogYW55LCBwcm9ncmVzczogbnVtYmVyLCBjb21wbGV0ZWQ6IG51bWJlciwgdG90YWw6IG51bWJlcn1bXSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBDcmVhdGUgYSBmb3JjZS1kaXJlY3RlZCBncmFwaCBsYXlvdXRcbiAgICAgICAgY29uc3QgbWFwU3ZnID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ2tub3dsZWRnZS1tYXAtc3ZnJyB9KTtcbiAgICAgICAgXG4gICAgICAgIC8vIEZvciBlYWNoIHRvcGljLCBjcmVhdGUgYSBub2RlIGluIHRoZSBncmFwaFxuICAgICAgICBmb3IgKGNvbnN0IHRvcGljIG9mIHRvcGljcykge1xuICAgICAgICAgICAgY29uc3QgdG9waWNOb2RlID0gbWFwU3ZnLmNyZWF0ZUVsKCdkaXYnLCB7IGNsczogJ3RvcGljLW5vZGUnIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBTZXQgbm9kZSBzaXplIGJhc2VkIG9uIG51bWJlciBvZiBzdWJ0b3BpY3NcbiAgICAgICAgICAgIGNvbnN0IG5vZGVTaXplID0gTWF0aC5tYXgoNTAsIE1hdGgubWluKDEwMCwgNTAgKyB0b3BpYy50b3RhbCAqIDUpKTtcbiAgICAgICAgICAgIHRvcGljTm9kZS5zdHlsZS53aWR0aCA9IGAke25vZGVTaXplfXB4YDtcbiAgICAgICAgICAgIHRvcGljTm9kZS5zdHlsZS5oZWlnaHQgPSBgJHtub2RlU2l6ZX1weGA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFNldCBub2RlIGNvbG9yIGJhc2VkIG9uIHByb2dyZXNzXG4gICAgICAgICAgICBpZiAodG9waWMucHJvZ3Jlc3MgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0b3BpY05vZGUuYWRkQ2xhc3MoJ25vZGUtbm90LXN0YXJ0ZWQnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodG9waWMucHJvZ3Jlc3MgPCAwLjMpIHtcbiAgICAgICAgICAgICAgICB0b3BpY05vZGUuYWRkQ2xhc3MoJ25vZGUtbG93LXByb2dyZXNzJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRvcGljLnByb2dyZXNzIDwgMC43KSB7XG4gICAgICAgICAgICAgICAgdG9waWNOb2RlLmFkZENsYXNzKCdub2RlLW1lZGl1bS1wcm9ncmVzcycpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0b3BpYy5wcm9ncmVzcyA8IDEpIHtcbiAgICAgICAgICAgICAgICB0b3BpY05vZGUuYWRkQ2xhc3MoJ25vZGUtaGlnaC1wcm9ncmVzcycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b3BpY05vZGUuYWRkQ2xhc3MoJ25vZGUtY29tcGxldGVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFNldCBub2RlIG9wYWNpdHkgYmFzZWQgb24gcHJvZ3Jlc3MgKG1vcmUgcHJvZ3Jlc3MgPSBtb3JlIG9wYXF1ZSlcbiAgICAgICAgICAgIHRvcGljTm9kZS5zdHlsZS5vcGFjaXR5ID0gYCR7MC40ICsgdG9waWMucHJvZ3Jlc3MgKiAwLjZ9YDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQWRkIHRvcGljIG5hbWVcbiAgICAgICAgICAgIGNvbnN0IHRvcGljTmFtZSA9IHRvcGljTm9kZS5jcmVhdGVFbCgnZGl2JywgeyBcbiAgICAgICAgICAgICAgICBjbHM6ICd0b3BpYy1ub2RlLW5hbWUnLFxuICAgICAgICAgICAgICAgIHRleHQ6IHRvcGljLmZpbGUuYmFzZW5hbWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBZGQgcHJvZ3Jlc3MgaW5kaWNhdG9yXG4gICAgICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHRvcGljLnByb2dyZXNzICogMTAwKTtcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzSW5kaWNhdG9yID0gdG9waWNOb2RlLmNyZWF0ZUVsKCdkaXYnLCB7IFxuICAgICAgICAgICAgICAgIGNsczogJ3RvcGljLW5vZGUtcHJvZ3Jlc3MnLFxuICAgICAgICAgICAgICAgIHRleHQ6IGAke3Byb2dyZXNzUGVyY2VudH0lYFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE1ha2Ugbm9kZSBjbGlja2FibGUgdG8gb3BlbiB0aGUgdG9waWNcbiAgICAgICAgICAgIHRvcGljTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKHRvcGljLmZpbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFBvc2l0aW9uIG5vZGVzIGluIGEgZ3JpZCBsYXlvdXQgKHNpbXBsZSB2aXN1YWxpemF0aW9uKVxuICAgICAgICAgICAgLy8gSW4gYSByZWFsIGltcGxlbWVudGF0aW9uLCB0aGlzIHdvdWxkIHVzZSBEMy5qcyBvciBhIHNpbWlsYXIgbGlicmFyeSBmb3IgZm9yY2UtZGlyZWN0ZWQgbGF5b3V0XG4gICAgICAgICAgICB0b3BpY05vZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgICAgICAgICAgdG9waWNOb2RlLnN0eWxlLmRpc3BsYXkgPSAnaW5saW5lLWJsb2NrJztcbiAgICAgICAgICAgIHRvcGljTm9kZS5zdHlsZS5tYXJnaW4gPSAnMTBweCc7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIEFkZCBpbnN0cnVjdGlvbnNcbiAgICAgICAgY29uc3QgaW5zdHJ1Y3Rpb25zID0gY29udGFpbmVyLmNyZWF0ZUVsKCdkaXYnLCB7IFxuICAgICAgICAgICAgY2xzOiAna25vd2xlZGdlLW1hcC1pbnN0cnVjdGlvbnMnLFxuICAgICAgICAgICAgdGV4dDogJ0NsaWNrIG9uIGEgdG9waWMgbm9kZSB0byBvcGVuIGl0LiBOb2RlIHNpemUgcmVwcmVzZW50cyB0aGUgbnVtYmVyIG9mIHN1YnRvcGljcywgY29sb3IgcmVwcmVzZW50cyBwcm9ncmVzcyBsZXZlbCwgYW5kIG9wYWNpdHkgaW5jcmVhc2VzIHdpdGggcHJvZ3Jlc3MuJ1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCBMZWFybmluZ1Byb2dyZXNzUGx1Z2luIGZyb20gJy4uL21haW4nO1xuXG5leHBvcnQgY2xhc3MgUHJvZ3Jlc3NSZW5kZXJlciB7XG4gICAgcGx1Z2luOiBMZWFybmluZ1Byb2dyZXNzUGx1Z2luO1xuXG4gICAgY29uc3RydWN0b3IocGx1Z2luOiBMZWFybmluZ1Byb2dyZXNzUGx1Z2luKSB7XG4gICAgICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBwcm9ncmVzcyBpbmZvcm1hdGlvbiBpbiBhIHRvcGljIG5vdGVcbiAgICAgKi9cbiAgICBhc3luYyByZW5kZXJQcm9ncmVzc0luTm90ZShmaWxlOiBURmlsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIXRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dQcm9ncmVzc0JhcikgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgICAgICBpZiAoIW1ldGFkYXRhPy5mcm9udG1hdHRlcj8udHlwZSB8fCBtZXRhZGF0YS5mcm9udG1hdHRlci50eXBlICE9PSAndG9waWMnKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFJlYWQgdGhlIGZpbGUgY29udGVudFxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgcHJvZ3Jlc3Mgc2VjdGlvbiBleGlzdHNcbiAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzU2VjdGlvblJlZ2V4ID0gLyMjIFByb2dyZXNzXFxzKlxcbihbXFxzXFxTXSo/KSg/PVxcbiMjfCQpLztcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gY29udGVudC5tYXRjaChwcm9ncmVzc1NlY3Rpb25SZWdleCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgIC8vIEdldCBwcm9ncmVzcyBpbmZvcm1hdGlvblxuICAgICAgICAgICAgICAgIGNvbnN0IHByb2dyZXNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIucHJvZ3Jlc3MgfHwgMDtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wbGV0ZWRTdWJ0b3BpY3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5jb21wbGV0ZWRfc3VidG9waWNzIHx8IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgdG90YWxTdWJ0b3BpY3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci50b3RhbF9zdWJ0b3BpY3MgfHwgMDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGUgcHJvZ3Jlc3MgdmlzdWFsaXphdGlvblxuICAgICAgICAgICAgICAgIGxldCBwcm9ncmVzc0NvbnRlbnQgPSBgXFxuJHtwcm9ncmVzc1BlcmNlbnR9JSBjb21wbGV0ZSAoJHtjb21wbGV0ZWRTdWJ0b3BpY3N9LyR7dG90YWxTdWJ0b3BpY3N9IHN1YnRvcGljcylcXG5cXG5gO1xuICAgICAgICAgICAgICAgIHByb2dyZXNzQ29udGVudCArPSB0aGlzLmNyZWF0ZVByb2dyZXNzQmFyKHByb2dyZXNzKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBSZXBsYWNlIHRoZSBwcm9ncmVzcyBzZWN0aW9uIGNvbnRlbnRcbiAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkQ29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NTZWN0aW9uUmVnZXgsIFxuICAgICAgICAgICAgICAgICAgICBgIyMgUHJvZ3Jlc3NcXG4ke3Byb2dyZXNzQ29udGVudH1gXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIGZpbGUgaWYgY29udGVudCBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZWRDb250ZW50ICE9PSBjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdXBkYXRlZENvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHJlbmRlcmluZyBwcm9ncmVzcyBpbiBub3RlOicsIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhbiBBU0NJSSBwcm9ncmVzcyBiYXJcbiAgICAgKi9cbiAgICBjcmVhdGVQcm9ncmVzc0Jhcihwcm9ncmVzczogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgYmFyTGVuZ3RoID0gMjA7XG4gICAgICAgIGNvbnN0IGZpbGxlZExlbmd0aCA9IE1hdGgucm91bmQocHJvZ3Jlc3MgKiBiYXJMZW5ndGgpO1xuICAgICAgICBjb25zdCBlbXB0eUxlbmd0aCA9IGJhckxlbmd0aCAtIGZpbGxlZExlbmd0aDtcbiAgICAgICAgXG4gICAgICAgIGxldCBwcm9ncmVzc0JhciA9ICdcXG5gYGBwcm9ncmVzc1xcblsnO1xuICAgICAgICBwcm9ncmVzc0JhciArPSAn4paIJy5yZXBlYXQoZmlsbGVkTGVuZ3RoKTtcbiAgICAgICAgcHJvZ3Jlc3NCYXIgKz0gJ+KWkScucmVwZWF0KGVtcHR5TGVuZ3RoKTtcbiAgICAgICAgcHJvZ3Jlc3NCYXIgKz0gJ11cXG5gYGBcXG4nO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHByb2dyZXNzQmFyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbmRlciBjb21wbGV0aW9uIHN0YXR1cyBpbiBhIHN1YnRvcGljIG5vdGVcbiAgICAgKi9cbiAgICBhc3luYyByZW5kZXJDb21wbGV0aW9uU3RhdHVzKGZpbGU6IFRGaWxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IG1ldGFkYXRhID0gdGhpcy5wbHVnaW4uYXBwLm1ldGFkYXRhQ2FjaGUuZ2V0RmlsZUNhY2hlKGZpbGUpO1xuICAgICAgICBpZiAoIW1ldGFkYXRhPy5mcm9udG1hdHRlcj8udHlwZSB8fCBtZXRhZGF0YS5mcm9udG1hdHRlci50eXBlICE9PSAnc3VidG9waWMnKSByZXR1cm47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFJlYWQgdGhlIGZpbGUgY29udGVudFxuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMucGx1Z2luLmFwcC52YXVsdC5yZWFkKGZpbGUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgc3RhdHVzIGxpbmUgZXhpc3RzXG4gICAgICAgICAgICBjb25zdCBzdGF0dXNSZWdleCA9IC9TdGF0dXM6ICjinYwgTm90IGNvbXBsZXRlZHzinIUgQ29tcGxldGVkKS87XG4gICAgICAgICAgICBjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goc3RhdHVzUmVnZXgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpc0NvbXBsZXRlZCA9IG1ldGFkYXRhLmZyb250bWF0dGVyLmNvbXBsZXRlZCA9PT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdTdGF0dXNUZXh0ID0gaXNDb21wbGV0ZWQgPyAn4pyFIENvbXBsZXRlZCcgOiAn4p2MIE5vdCBjb21wbGV0ZWQnO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIC8vIE9ubHkgdXBkYXRlIGlmIHN0YXR1cyBoYXMgY2hhbmdlZFxuICAgICAgICAgICAgICAgIGlmIChtYXRjaFsxXSAhPT0gbmV3U3RhdHVzVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkQ29udGVudCA9IGNvbnRlbnQucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXR1c1JlZ2V4LCBcbiAgICAgICAgICAgICAgICAgICAgICAgIGBTdGF0dXM6ICR7bmV3U3RhdHVzVGV4dH1gXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIHVwZGF0ZWRDb250ZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZW5kZXJpbmcgY29tcGxldGlvbiBzdGF0dXM6JywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQWRkIGEgdmlzdWFsIGluZGljYXRvciB0byB0aGUgbm90ZSB0aXRsZSBpbiB0aGUgZmlsZSBleHBsb3JlclxuICAgICAqIE5vdGU6IFRoaXMgcmVxdWlyZXMgQ1NTIHN0eWxpbmcgdG8gYmUgZWZmZWN0aXZlXG4gICAgICovXG4gICAgYWRkVmlzdWFsSW5kaWNhdG9yVG9UaXRsZShmaWxlOiBURmlsZSk6IHZvaWQge1xuICAgICAgICAvLyBUaGlzIHdvdWxkIHR5cGljYWxseSBiZSBpbXBsZW1lbnRlZCB1c2luZyBDU1MgY2xhc3Nlc1xuICAgICAgICAvLyBGb3IgZXhhbXBsZSwgYWRkaW5nIGEgY2xhc3MgdG8gdGhlIGZpbGUgZXhwbG9yZXIgaXRlbSBiYXNlZCBvbiBjb21wbGV0aW9uIHN0YXR1c1xuICAgICAgICAvLyBTaW5jZSBkaXJlY3QgRE9NIG1hbmlwdWxhdGlvbiBvZiB0aGUgZmlsZSBleHBsb3JlciBpcyBub3QgcmVjb21tZW5kZWQsXG4gICAgICAgIC8vIHRoaXMgd291bGQgYmUgYmV0dGVyIGltcGxlbWVudGVkIHVzaW5nIENTUyBzZWxlY3RvcnMgYmFzZWQgb24gZmlsZSBhdHRyaWJ1dGVzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgZGV0YWlsZWQgcHJvZ3Jlc3MgcmVwb3J0IGZvciBhIHRvcGljXG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlUHJvZ3Jlc3NSZXBvcnQoZmlsZTogVEZpbGUpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgICAgICBjb25zdCBtZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcbiAgICAgICAgaWYgKCFtZXRhZGF0YT8uZnJvbnRtYXR0ZXIpIHJldHVybiBcIk5vIG1ldGFkYXRhIGZvdW5kIGZvciB0aGlzIHRvcGljLlwiO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcHJvZ3Jlc3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5wcm9ncmVzcyB8fCAwO1xuICAgICAgICBjb25zdCBwcm9ncmVzc1BlcmNlbnQgPSBNYXRoLnJvdW5kKHByb2dyZXNzICogMTAwKTtcbiAgICAgICAgY29uc3QgY29tcGxldGVkU3VidG9waWNzID0gbWV0YWRhdGEuZnJvbnRtYXR0ZXIuY29tcGxldGVkX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICBjb25zdCB0b3RhbFN1YnRvcGljcyA9IG1ldGFkYXRhLmZyb250bWF0dGVyLnRvdGFsX3N1YnRvcGljcyB8fCAwO1xuICAgICAgICBcbiAgICAgICAgbGV0IHJlcG9ydCA9IGAjIFByb2dyZXNzIFJlcG9ydDogJHtmaWxlLmJhc2VuYW1lfVxcblxcbmA7XG4gICAgICAgIFxuICAgICAgICAvLyBPdmVyYWxsIHByb2dyZXNzXG4gICAgICAgIHJlcG9ydCArPSBgIyMgT3ZlcmFsbCBQcm9ncmVzc1xcblxcbmA7XG4gICAgICAgIHJlcG9ydCArPSBgJHtwcm9ncmVzc1BlcmNlbnR9JSBjb21wbGV0ZSAoJHtjb21wbGV0ZWRTdWJ0b3BpY3N9LyR7dG90YWxTdWJ0b3BpY3N9IHN1YnRvcGljcylcXG5cXG5gO1xuICAgICAgICByZXBvcnQgKz0gdGhpcy5jcmVhdGVQcm9ncmVzc0Jhcihwcm9ncmVzcyk7XG4gICAgICAgIHJlcG9ydCArPSAnXFxuJztcbiAgICAgICAgXG4gICAgICAgIC8vIFN1YnRvcGljcyBicmVha2Rvd25cbiAgICAgICAgcmVwb3J0ICs9IGAjIyBTdWJ0b3BpY3NcXG5cXG5gO1xuICAgICAgICBcbiAgICAgICAgaWYgKG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcyAmJiBtZXRhZGF0YS5mcm9udG1hdHRlci5zdWJ0b3BpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBzdWJ0b3BpYyBvZiBtZXRhZGF0YS5mcm9udG1hdHRlci5zdWJ0b3BpY3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJ0b3BpY05hbWUgPSBzdWJ0b3BpYy5yZXBsYWNlKC9cXFtcXFsoLio/KVxcXVxcXS8sICckMScpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljRmlsZSA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7c3VidG9waWNOYW1lfS5tZGApO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChzdWJ0b3BpY0ZpbGUgJiYgc3VidG9waWNGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNNZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0NvbXBsZXRlZCA9IHN1YnRvcGljTWV0YWRhdGE/LmZyb250bWF0dGVyPy5jb21wbGV0ZWQgPT09IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRpb25EYXRlID0gc3VidG9waWNNZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LmNvbXBsZXRpb25fZGF0ZSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIHJlcG9ydCArPSBgLSAke2lzQ29tcGxldGVkID8gJ+KchScgOiAn4p2MJ30gW1ske3N1YnRvcGljTmFtZX1dXWA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0NvbXBsZXRlZCAmJiBjb21wbGV0aW9uRGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAgKENvbXBsZXRlZDogJHtjb21wbGV0aW9uRGF0ZX0pYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXBvcnQgKz0gJ1xcbic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAtIOKdkyBbWyR7c3VidG9waWNOYW1lfV1dIChNaXNzaW5nKVxcbmA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVwb3J0ICs9IFwiTm8gc3VidG9waWNzIGZvdW5kIGZvciB0aGlzIHRvcGljLlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyBSZWNvbW1lbmRhdGlvbnNcbiAgICAgICAgcmVwb3J0ICs9IGBcXG4jIyBOZXh0IFN0ZXBzXFxuXFxuYDtcbiAgICAgICAgXG4gICAgICAgIGlmIChwcm9ncmVzcyA9PT0gMCkge1xuICAgICAgICAgICAgcmVwb3J0ICs9IFwiWW91IGhhdmVuJ3Qgc3RhcnRlZCBsZWFybmluZyB0aGlzIHRvcGljIHlldC4gQ3JlYXRlIHNvbWUgc3VidG9waWNzIHRvIGJlZ2luIHRyYWNraW5nIHlvdXIgcHJvZ3Jlc3MuXFxuXCI7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvZ3Jlc3MgPT09IDEpIHtcbiAgICAgICAgICAgIHJlcG9ydCArPSBcIkNvbmdyYXR1bGF0aW9ucyEgWW91J3ZlIGNvbXBsZXRlZCBhbGwgc3VidG9waWNzIGZvciB0aGlzIHRvcGljLlxcblwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVwb3J0ICs9IGBZb3UncmUgbWFraW5nIHByb2dyZXNzIG9uIHRoaXMgdG9waWMuIEZvY3VzIG9uIGNvbXBsZXRpbmcgdGhlIHJlbWFpbmluZyBzdWJ0b3BpY3M6XFxuXFxuYDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gTGlzdCBpbmNvbXBsZXRlIHN1YnRvcGljc1xuICAgICAgICAgICAgaWYgKG1ldGFkYXRhLmZyb250bWF0dGVyLnN1YnRvcGljcyAmJiBtZXRhZGF0YS5mcm9udG1hdHRlci5zdWJ0b3BpY3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGZvciAoY29uc3Qgc3VidG9waWMgb2YgbWV0YWRhdGEuZnJvbnRtYXR0ZXIuc3VidG9waWNzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljTmFtZSA9IHN1YnRvcGljLnJlcGxhY2UoL1xcW1xcWyguKj8pXFxdXFxdLywgJyQxJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1YnRvcGljRmlsZSA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7c3VidG9waWNOYW1lfS5tZGApO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YnRvcGljRmlsZSAmJiBzdWJ0b3BpY0ZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3VidG9waWNNZXRhZGF0YSA9IHRoaXMucGx1Z2luLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShzdWJ0b3BpY0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSBzdWJ0b3BpY01ldGFkYXRhPy5mcm9udG1hdHRlcj8uY29tcGxldGVkID09PSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQ29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwb3J0ICs9IGAtIFtbJHtzdWJ0b3BpY05hbWV9XV1cXG5gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gcmVwb3J0O1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEFwcCwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCBMZWFybmluZ1Byb2dyZXNzUGx1Z2luIGZyb20gJy4uL21haW4nO1xuXG5leHBvcnQgY2xhc3MgTGVhcm5pbmdQcm9ncmVzc1NldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgICBwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW47XG5cbiAgICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBMZWFybmluZ1Byb2dyZXNzUGx1Z2luKSB7XG4gICAgICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcbiAgICAgICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgfVxuXG4gICAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBjb250YWluZXJFbCB9ID0gdGhpcztcblxuICAgICAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ0xlYXJuaW5nIFByb2dyZXNzIFNldHRpbmdzJyB9KTtcblxuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAgIC5zZXROYW1lKCdTaG93IFByb2dyZXNzIEJhcicpXG4gICAgICAgICAgICAuc2V0RGVzYygnU2hvdyBwcm9ncmVzcyBiYXIgaW4gdG9waWMgbm90ZXMnKVxuICAgICAgICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXG4gICAgICAgICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dQcm9ncmVzc0JhcilcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dQcm9ncmVzc0JhciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICB9KSk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZSgnU2hvdyBLbm93bGVkZ2UgTWFwJylcbiAgICAgICAgICAgIC5zZXREZXNjKCdTaG93IGtub3dsZWRnZSBtYXAgaW4gc2lkZWJhcicpXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKHRvZ2dsZSA9PiB0b2dnbGVcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3Muc2hvd0tub3dsZWRnZU1hcClcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnNob3dLbm93bGVkZ2VNYXAgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoJ1RvcGljIFRlbXBsYXRlJylcbiAgICAgICAgICAgIC5zZXREZXNjKCdUZW1wbGF0ZSBmb3IgbmV3IHRvcGljIG5vdGVzJylcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYSh0ZXh0ID0+IHRleHRcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFRvcGljVGVtcGxhdGUpXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0VG9waWNUZW1wbGF0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIC5zZXRDbGFzcygndGVtcGxhdGUtc2V0dGluZycpO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoJ1N1YnRvcGljIFRlbXBsYXRlJylcbiAgICAgICAgICAgIC5zZXREZXNjKCdUZW1wbGF0ZSBmb3IgbmV3IHN1YnRvcGljIG5vdGVzJylcbiAgICAgICAgICAgIC5hZGRUZXh0QXJlYSh0ZXh0ID0+IHRleHRcbiAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZGVmYXVsdFN1YnRvcGljVGVtcGxhdGUpXG4gICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5kZWZhdWx0U3VidG9waWNUZW1wbGF0ZSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIC5zZXRDbGFzcygndGVtcGxhdGUtc2V0dGluZycpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IEFwcCwgRWRpdG9yLCBNYXJrZG93blZpZXcsIE1vZGFsLCBOb3RpY2UsIFBsdWdpbiwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZywgVEZpbGUsIEZyb250TWF0dGVyQ2FjaGUsIE1ldGFkYXRhQ2FjaGUsIFZhdWx0LCBNYXJrZG93bkZpbGVJbmZvIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHsgU3VidG9waWNUcmFja2VyVmlldywgU1VCVE9QSUNfVFJBQ0tFUl9WSUVXX1RZUEUgfSBmcm9tICcuL3ZpZXdzL1N1YnRvcGljVHJhY2tlclZpZXcnO1xuaW1wb3J0IHsgS25vd2xlZGdlTWFwVmlldywgS05PV0xFREdFX01BUF9WSUVXX1RZUEUgfSBmcm9tICcuL3ZpZXdzL0tub3dsZWRnZU1hcFZpZXcnO1xuaW1wb3J0IHsgUHJvZ3Jlc3NSZW5kZXJlciB9IGZyb20gJy4vcmVuZGVyaW5nL1Byb2dyZXNzUmVuZGVyZXInO1xuaW1wb3J0IHsgUHJvZ3Jlc3NUcmFja2VyIH0gZnJvbSAnLi90cmFja2luZy9Qcm9ncmVzc1RyYWNrZXInO1xuaW1wb3J0IHsgTGVhcm5pbmdQcm9ncmVzc1NldHRpbmdUYWIgfSBmcm9tICcuL3NldHRpbmdzL1NldHRpbmdzVGFiJztcblxuaW50ZXJmYWNlIExlYXJuaW5nUHJvZ3Jlc3NTZXR0aW5ncyB7XG5cdGRlZmF1bHRUb3BpY1RlbXBsYXRlOiBzdHJpbmc7XG5cdGRlZmF1bHRTdWJ0b3BpY1RlbXBsYXRlOiBzdHJpbmc7XG5cdHNob3dQcm9ncmVzc0JhcjogYm9vbGVhbjtcblx0c2hvd0tub3dsZWRnZU1hcDogYm9vbGVhbjtcbn1cblxuY29uc3QgREVGQVVMVF9TRVRUSU5HUzogTGVhcm5pbmdQcm9ncmVzc1NldHRpbmdzID0ge1xuXHRkZWZhdWx0VG9waWNUZW1wbGF0ZTogXCItLS1cXG50eXBlOiB0b3BpY1xcbnByb2dyZXNzOiAwXFxuc3VidG9waWNzOiBbXVxcbnRvdGFsX3N1YnRvcGljczogMFxcbmNvbXBsZXRlZF9zdWJ0b3BpY3M6IDBcXG4tLS1cXG5cXG4jIHt7dGl0bGV9fVxcblxcbiMjIFByb2dyZXNzXFxuXFxuMCUgY29tcGxldGVcXG5cXG4jIyBTdWJ0b3BpY3NcXG5cXG5cIixcblx0ZGVmYXVsdFN1YnRvcGljVGVtcGxhdGU6IFwiLS0tXFxudHlwZTogc3VidG9waWNcXG5wYXJlbnQ6IFxcXCJbW3t7cGFyZW50fX1dXVxcXCJcXG5jb21wbGV0ZWQ6IGZhbHNlXFxuLS0tXFxuXFxuIyB7e3RpdGxlfX1cXG5cXG5TdGF0dXM6IOKdjCBOb3QgY29tcGxldGVkXFxuXFxuIyMgTm90ZXNcXG5cXG5cIixcblx0c2hvd1Byb2dyZXNzQmFyOiB0cnVlLFxuXHRzaG93S25vd2xlZGdlTWFwOiB0cnVlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuXHRzZXR0aW5nczogTGVhcm5pbmdQcm9ncmVzc1NldHRpbmdzO1xuXHRwcm9ncmVzc1JlbmRlcmVyOiBQcm9ncmVzc1JlbmRlcmVyO1xuXHRwcm9ncmVzc1RyYWNrZXI6IFByb2dyZXNzVHJhY2tlcjtcblx0XG5cdC8vIEFkZCBmbGFncyB0byBwcmV2ZW50IGluZmluaXRlIGxvb3BzXG5cdHByaXZhdGUgaXNVcGRhdGluZzogYm9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIHVwZGF0ZVF1ZXVlOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcblx0cHJpdmF0ZSBkZWJvdW5jZVRpbWVvdXQ6IE5vZGVKUy5UaW1lb3V0IHwgbnVsbCA9IG51bGw7XG5cblx0YXN5bmMgb25sb2FkKCkge1xuXHRcdGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cblx0XHQvLyBJbml0aWFsaXplIGNvbXBvbmVudHNcblx0XHR0aGlzLnByb2dyZXNzUmVuZGVyZXIgPSBuZXcgUHJvZ3Jlc3NSZW5kZXJlcih0aGlzKTtcblx0XHR0aGlzLnByb2dyZXNzVHJhY2tlciA9IG5ldyBQcm9ncmVzc1RyYWNrZXIodGhpcyk7XG5cblx0XHQvLyBSZWdpc3RlciB2aWV3c1xuXHRcdHRoaXMucmVnaXN0ZXJWaWV3KFxuXHRcdFx0U1VCVE9QSUNfVFJBQ0tFUl9WSUVXX1RZUEUsXG5cdFx0XHQobGVhZikgPT4gbmV3IFN1YnRvcGljVHJhY2tlclZpZXcobGVhZiwgdGhpcylcblx0XHQpO1xuXG5cdFx0dGhpcy5yZWdpc3RlclZpZXcoXG5cdFx0XHRLTk9XTEVER0VfTUFQX1ZJRVdfVFlQRSxcblx0XHRcdChsZWFmKSA9PiBuZXcgS25vd2xlZGdlTWFwVmlldyhsZWFmLCB0aGlzKVxuXHRcdCk7XG5cblx0XHQvLyBSZWdpc3RlciBjb21tYW5kc1xuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ2NyZWF0ZS10b3BpYy1ub3RlJyxcblx0XHRcdG5hbWU6ICdDcmVhdGUgVG9waWMgTm90ZScsXG5cdFx0XHRjYWxsYmFjazogKCkgPT4ge1xuXHRcdFx0XHRuZXcgVG9waWNDcmVhdGlvbk1vZGFsKHRoaXMuYXBwLCB0aGlzKS5vcGVuKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICdjcmVhdGUtc3VidG9waWMtbm90ZScsXG5cdFx0XHRuYW1lOiAnQ3JlYXRlIFN1YnRvcGljIE5vdGUnLFxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGZpbGUgPSB2aWV3LmZpbGU7XG5cdFx0XHRcdGlmIChmaWxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcblx0XHRcdFx0XHRpZiAobWV0YWRhdGE/LmZyb250bWF0dGVyPy50eXBlID09PSAndG9waWMnKSB7XG5cdFx0XHRcdFx0XHRuZXcgU3VidG9waWNDcmVhdGlvbk1vZGFsKHRoaXMuYXBwLCB0aGlzLCBmaWxlLmJhc2VuYW1lKS5vcGVuKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoJ0N1cnJlbnQgbm90ZSBpcyBub3QgYSB0b3BpYyBub3RlLiBQbGVhc2Ugb3BlbiBhIHRvcGljIG5vdGUgZmlyc3QuJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0aGlzLmFkZENvbW1hbmQoe1xuXHRcdFx0aWQ6ICd0b2dnbGUtc3VidG9waWMtY29tcGxldGlvbicsXG5cdFx0XHRuYW1lOiAnVG9nZ2xlIFN1YnRvcGljIENvbXBsZXRpb24nLFxuXHRcdFx0ZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGZpbGUgPSB2aWV3LmZpbGU7XG5cdFx0XHRcdGlmIChmaWxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcblx0XHRcdFx0XHRpZiAobWV0YWRhdGE/LmZyb250bWF0dGVyPy50eXBlID09PSAnc3VidG9waWMnKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnRvZ2dsZVN1YnRvcGljQ29tcGxldGlvbihmaWxlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bmV3IE5vdGljZSgnQ3VycmVudCBub3RlIGlzIG5vdCBhIHN1YnRvcGljIG5vdGUuIFBsZWFzZSBvcGVuIGEgc3VidG9waWMgbm90ZSBmaXJzdC4nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ3Nob3ctc3VidG9waWMtdHJhY2tlcicsXG5cdFx0XHRuYW1lOiAnU2hvdyBTdWJ0b3BpYyBUcmFja2VyJyxcblx0XHRcdGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYWN0aXZhdGVWaWV3KFNVQlRPUElDX1RSQUNLRVJfVklFV19UWVBFKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRoaXMuYWRkQ29tbWFuZCh7XG5cdFx0XHRpZDogJ3Nob3cta25vd2xlZGdlLW1hcCcsXG5cdFx0XHRuYW1lOiAnU2hvdyBLbm93bGVkZ2UgTWFwJyxcblx0XHRcdGNhbGxiYWNrOiBhc3luYyAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYWN0aXZhdGVWaWV3KEtOT1dMRURHRV9NQVBfVklFV19UWVBFKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIFJlZ2lzdGVyIGV2ZW50IGxpc3RlbmVyc1xuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcblx0XHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbignYWN0aXZlLWxlYWYtY2hhbmdlJywgKGxlYWYpID0+IHtcblx0XHRcdFx0aWYgKGxlYWYgJiYgbGVhZi52aWV3IGluc3RhbmNlb2YgTWFya2Rvd25WaWV3KSB7XG5cdFx0XHRcdFx0Y29uc3QgZmlsZSA9IGxlYWYudmlldy5maWxlO1xuXHRcdFx0XHRcdGlmIChmaWxlKSB7XG5cdFx0XHRcdFx0XHQvLyBEb24ndCB0cmlnZ2VyIHVwZGF0ZXMgd2hlbiBqdXN0IHZpZXdpbmcgYSBmaWxlXG5cdFx0XHRcdFx0XHR0aGlzLnByb2dyZXNzUmVuZGVyZXIucmVuZGVyUHJvZ3Jlc3NJbk5vdGUoZmlsZSk7XG5cdFx0XHRcdFx0XHR0aGlzLnByb2dyZXNzUmVuZGVyZXIucmVuZGVyQ29tcGxldGlvblN0YXR1cyhmaWxlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0KTtcblxuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcblx0XHRcdHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUub24oJ2NoYW5nZWQnLCAoZmlsZSkgPT4ge1xuXHRcdFx0XHQvLyBVc2UgZGVib3VuY2VkIHVwZGF0ZSB0byBwcmV2ZW50IGluZmluaXRlIGxvb3BzXG5cdFx0XHRcdHRoaXMuZGVib3VuY2VkVXBkYXRlUHJvZ3Jlc3MoZmlsZSk7XG5cdFx0XHR9KVxuXHRcdCk7XG5cblx0XHQvLyBBZGQgc2V0dGluZ3MgdGFiXG5cdFx0dGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBMZWFybmluZ1Byb2dyZXNzU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG5cdFx0Ly8gQWRkIHJpYmJvbiBpY29uXG5cdFx0dGhpcy5hZGRSaWJib25JY29uKCdncmFkdWF0aW9uLWNhcCcsICdMZWFybmluZyBQcm9ncmVzcycsICgpID0+IHtcblx0XHRcdHRoaXMuYWN0aXZhdGVWaWV3KFNVQlRPUElDX1RSQUNLRVJfVklFV19UWVBFKTtcblx0XHR9KTtcblx0fVxuXG5cdG9udW5sb2FkKCkge1xuXHRcdGNvbnNvbGUubG9nKCdMZWFybmluZyBQcm9ncmVzcyBQbHVnaW4gdW5sb2FkZWQnKTtcblx0XHQvLyBDbGVhciBhbnkgcGVuZGluZyB0aW1lb3V0c1xuXHRcdGlmICh0aGlzLmRlYm91bmNlVGltZW91dCkge1xuXHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuZGVib3VuY2VUaW1lb3V0KTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG5cdH1cblxuXHRhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG5cdFx0YXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcblx0fVxuXG5cdGFzeW5jIGFjdGl2YXRlVmlldyh2aWV3VHlwZTogc3RyaW5nKSB7XG5cdFx0Y29uc3QgeyB3b3Jrc3BhY2UgfSA9IHRoaXMuYXBwO1xuXHRcdFxuXHRcdC8vIENoZWNrIGlmIHZpZXcgaXMgYWxyZWFkeSBvcGVuXG5cdFx0bGV0IGxlYWYgPSB3b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKHZpZXdUeXBlKVswXTtcblx0XHRcblx0XHRpZiAoIWxlYWYpIHtcblx0XHRcdC8vIENyZWF0ZSBuZXcgbGVhZiBpbiB0aGUgcmlnaHQgc2lkZWJhclxuXHRcdFx0Y29uc3QgcmlnaHRMZWFmID0gd29ya3NwYWNlLmdldFJpZ2h0TGVhZihmYWxzZSk7XG5cdFx0XHRpZiAocmlnaHRMZWFmKSB7XG5cdFx0XHRcdGF3YWl0IHJpZ2h0TGVhZi5zZXRWaWV3U3RhdGUoeyB0eXBlOiB2aWV3VHlwZSB9KTtcblx0XHRcdFx0bGVhZiA9IHJpZ2h0TGVhZjtcblx0XHRcdH1cblx0XHR9XG5cdFx0XG5cdFx0Ly8gUmV2ZWFsIHRoZSBsZWFmXG5cdFx0aWYgKGxlYWYpIHtcblx0XHRcdHdvcmtzcGFjZS5yZXZlYWxMZWFmKGxlYWYpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGNyZWF0ZVRvcGljTm90ZSh0aXRsZTogc3RyaW5nKSB7XG5cdFx0Y29uc3QgY29udGVudCA9IHRoaXMuc2V0dGluZ3MuZGVmYXVsdFRvcGljVGVtcGxhdGUucmVwbGFjZSgne3t0aXRsZX19JywgdGl0bGUpO1xuXHRcdGNvbnN0IGZpbGVOYW1lID0gYCR7dGl0bGV9Lm1kYDtcblx0XHRcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgZXhpc3RpbmdGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZpbGVOYW1lKTtcblx0XHRcdGlmIChleGlzdGluZ0ZpbGUpIHtcblx0XHRcdFx0bmV3IE5vdGljZShgTm90ZSBcIiR7ZmlsZU5hbWV9XCIgYWxyZWFkeSBleGlzdHNgKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb25zdCBmaWxlID0gYXdhaXQgdGhpcy5hcHAudmF1bHQuY3JlYXRlKGZpbGVOYW1lLCBjb250ZW50KTtcblx0XHRcdG5ldyBOb3RpY2UoYFRvcGljIG5vdGUgXCIke3RpdGxlfVwiIGNyZWF0ZWRgKTtcblx0XHRcdFxuXHRcdFx0Ly8gT3BlbiB0aGUgbmV3bHkgY3JlYXRlZCBmaWxlXG5cdFx0XHR0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhZigpLm9wZW5GaWxlKGZpbGUpO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciBjcmVhdGluZyB0b3BpYyBub3RlOicsIGVycm9yKTtcblx0XHRcdG5ldyBOb3RpY2UoJ0Vycm9yIGNyZWF0aW5nIHRvcGljIG5vdGUnKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBjcmVhdGVTdWJ0b3BpY05vdGUodGl0bGU6IHN0cmluZywgcGFyZW50VG9waWM6IHN0cmluZykge1xuXHRcdGNvbnN0IGNvbnRlbnQgPSB0aGlzLnNldHRpbmdzLmRlZmF1bHRTdWJ0b3BpY1RlbXBsYXRlXG5cdFx0XHQucmVwbGFjZSgne3t0aXRsZX19JywgdGl0bGUpXG5cdFx0XHQucmVwbGFjZSgne3twYXJlbnR9fScsIHBhcmVudFRvcGljKTtcblx0XHRjb25zdCBmaWxlTmFtZSA9IGAke3RpdGxlfS5tZGA7XG5cdFx0XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGV4aXN0aW5nRmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChmaWxlTmFtZSk7XG5cdFx0XHRpZiAoZXhpc3RpbmdGaWxlKSB7XG5cdFx0XHRcdG5ldyBOb3RpY2UoYE5vdGUgXCIke2ZpbGVOYW1lfVwiIGFscmVhZHkgZXhpc3RzYCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Y29uc3QgZmlsZSA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LmNyZWF0ZShmaWxlTmFtZSwgY29udGVudCk7XG5cdFx0XHRuZXcgTm90aWNlKGBTdWJ0b3BpYyBub3RlIFwiJHt0aXRsZX1cIiBjcmVhdGVkYCk7XG5cdFx0XHRcblx0XHRcdC8vIFVwZGF0ZSBwYXJlbnQgdG9waWMncyBzdWJ0b3BpY3MgbGlzdFxuXHRcdFx0YXdhaXQgdGhpcy5hZGRTdWJ0b3BpY1RvUGFyZW50KHBhcmVudFRvcGljLCB0aXRsZSk7XG5cdFx0XHRcblx0XHRcdC8vIE9wZW4gdGhlIG5ld2x5IGNyZWF0ZWQgZmlsZVxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLmdldExlYWYoKS5vcGVuRmlsZShmaWxlKTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgY3JlYXRpbmcgc3VidG9waWMgbm90ZTonLCBlcnJvcik7XG5cdFx0XHRuZXcgTm90aWNlKCdFcnJvciBjcmVhdGluZyBzdWJ0b3BpYyBub3RlJyk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgYWRkU3VidG9waWNUb1BhcmVudChwYXJlbnRUb3BpYzogc3RyaW5nLCBzdWJ0b3BpY1RpdGxlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBwYXJlbnRGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGAke3BhcmVudFRvcGljfS5tZGApO1xuXHRcdGlmICghcGFyZW50RmlsZSB8fCAhKHBhcmVudEZpbGUgaW5zdGFuY2VvZiBURmlsZSkpIHtcblx0XHRcdG5ldyBOb3RpY2UoYFBhcmVudCB0b3BpYyBcIiR7cGFyZW50VG9waWN9XCIgbm90IGZvdW5kYCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdFxuXHRcdHRyeSB7XG5cdFx0XHQvLyBTZXQgdXBkYXRpbmcgZmxhZyB0byBwcmV2ZW50IGluZmluaXRlIGxvb3BzXG5cdFx0XHR0aGlzLmlzVXBkYXRpbmcgPSB0cnVlO1xuXHRcdFx0XG5cdFx0XHQvLyBSZWFkIHRoZSBwYXJlbnQgZmlsZSBjb250ZW50XG5cdFx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChwYXJlbnRGaWxlKTtcblx0XHRcdFxuXHRcdFx0Ly8gUGFyc2UgZnJvbnRtYXR0ZXJcblx0XHRcdGNvbnN0IGZyb250bWF0dGVyUmVnZXggPSAvXi0tLVxcbihbXFxzXFxTXSo/KVxcbi0tLS87XG5cdFx0XHRjb25zdCBtYXRjaCA9IGNvbnRlbnQubWF0Y2goZnJvbnRtYXR0ZXJSZWdleCk7XG5cdFx0XHRcblx0XHRcdGlmIChtYXRjaCkge1xuXHRcdFx0XHRsZXQgZnJvbnRtYXR0ZXIgPSBtYXRjaFsxXTtcblx0XHRcdFx0Y29uc3Qgc3VidG9waWNMaW5rID0gYFtbJHtzdWJ0b3BpY1RpdGxlfV1dYDtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIFVwZGF0ZSBzdWJ0b3BpY3MgYXJyYXkgaW4gZnJvbnRtYXR0ZXJcblx0XHRcdFx0aWYgKGZyb250bWF0dGVyLmluY2x1ZGVzKCdzdWJ0b3BpY3M6JykpIHtcblx0XHRcdFx0XHQvLyBDaGVjayBpZiBpdCdzIGFuIGFycmF5IGZvcm1hdFxuXHRcdFx0XHRcdGlmIChmcm9udG1hdHRlci5pbmNsdWRlcygnc3VidG9waWNzOiBbJykpIHtcblx0XHRcdFx0XHRcdC8vIEFycmF5IGZvcm1hdFxuXHRcdFx0XHRcdFx0Y29uc3QgYXJyYXlSZWdleCA9IC9zdWJ0b3BpY3M6IFxcWyhbXFxzXFxTXSo/KVxcXS87XG5cdFx0XHRcdFx0XHRjb25zdCBhcnJheU1hdGNoID0gZnJvbnRtYXR0ZXIubWF0Y2goYXJyYXlSZWdleCk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmIChhcnJheU1hdGNoKSB7XG5cdFx0XHRcdFx0XHRcdGxldCBzdWJ0b3BpY3NBcnJheSA9IGFycmF5TWF0Y2hbMV0uc3BsaXQoJywnKS5tYXAocyA9PiBzLnRyaW0oKSk7XG5cdFx0XHRcdFx0XHRcdGlmICghc3VidG9waWNzQXJyYXkuaW5jbHVkZXMoYFwiJHtzdWJ0b3BpY0xpbmt9XCJgKSkge1xuXHRcdFx0XHRcdFx0XHRcdHN1YnRvcGljc0FycmF5LnB1c2goYFwiJHtzdWJ0b3BpY0xpbmt9XCJgKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjb25zdCBuZXN0ZWRMaXN0ID0gc3VidG9waWNzQXJyYXkubWFwKHN1YnRvcGljID0+IGAgIC0gJHtzdWJ0b3BpY31gKS5qb2luKCdcXG4nKTtcbiAgICBcdFx0XHRcdFx0XHRmcm9udG1hdHRlciA9IGZyb250bWF0dGVyLnJlcGxhY2UoYXJyYXlSZWdleCwgYHN1YnRvcGljczpcXG4ke25lc3RlZExpc3R9YCk7XG5cdFx0XHRcdFx0XHRcdC8vZnJvbnRtYXR0ZXIgPSBmcm9udG1hdHRlci5yZXBsYWNlKGFycmF5UmVnZXgsIGBzdWJ0b3BpY3M6IFske3N1YnRvcGljc0FycmF5LmpvaW4oJywgJyl9XWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBMaXN0IGZvcm1hdFxuXHRcdFx0XHRcdFx0Y29uc3QgbGlzdFJlZ2V4ID0gL3N1YnRvcGljczpbXFxzXFxTXSo/KD89XFxuXFx3fCQpLztcblx0XHRcdFx0XHRcdGNvbnN0IGxpc3RNYXRjaCA9IGZyb250bWF0dGVyLm1hdGNoKGxpc3RSZWdleCk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGlmIChsaXN0TWF0Y2gpIHtcblx0XHRcdFx0XHRcdFx0bGV0IHN1YnRvcGljc0xpc3QgPSBsaXN0TWF0Y2hbMF07XG5cdFx0XHRcdFx0XHRcdGlmICghc3VidG9waWNzTGlzdC5pbmNsdWRlcyhzdWJ0b3BpY0xpbmspKSB7XG5cdFx0XHRcdFx0XHRcdFx0c3VidG9waWNzTGlzdCArPSBgXFxuICAtIFwiJHtzdWJ0b3BpY0xpbmt9XCJgO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGZyb250bWF0dGVyID0gZnJvbnRtYXR0ZXIucmVwbGFjZShsaXN0UmVnZXgsIHN1YnRvcGljc0xpc3QpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBBZGQgc3VidG9waWNzIGZpZWxkIGlmIGl0IGRvZXNuJ3QgZXhpc3Rcblx0XHRcdFx0XHRmcm9udG1hdHRlciArPSBgXFxuc3VidG9waWNzOlxcbiAgLSBcIiR7c3VidG9waWNMaW5rfVwiYDtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0Ly8gVXBkYXRlIHRvdGFsX3N1YnRvcGljcyBjb3VudFxuXHRcdFx0XHRjb25zdCB0b3RhbFN1YnRvcGljc1JlZ2V4ID0gL3RvdGFsX3N1YnRvcGljczogKFxcZCspLztcblx0XHRcdFx0Y29uc3QgdG90YWxNYXRjaCA9IGZyb250bWF0dGVyLm1hdGNoKHRvdGFsU3VidG9waWNzUmVnZXgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKHRvdGFsTWF0Y2gpIHtcblx0XHRcdFx0XHRjb25zdCBjdXJyZW50VG90YWwgPSBwYXJzZUludCh0b3RhbE1hdGNoWzFdKTtcblx0XHRcdFx0XHRmcm9udG1hdHRlciA9IGZyb250bWF0dGVyLnJlcGxhY2UodG90YWxTdWJ0b3BpY3NSZWdleCwgYHRvdGFsX3N1YnRvcGljczogJHtjdXJyZW50VG90YWwgKyAxfWApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZyb250bWF0dGVyICs9IGBcXG50b3RhbF9zdWJ0b3BpY3M6IDFgO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBSZXBsYWNlIGZyb250bWF0dGVyIGluIGNvbnRlbnRcblx0XHRcdFx0Y29uc3QgdXBkYXRlZENvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoZnJvbnRtYXR0ZXJSZWdleCwgYC0tLVxcbiR7ZnJvbnRtYXR0ZXJ9XFxuLS0tYCk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIGZpbGVcblx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KHBhcmVudEZpbGUsIHVwZGF0ZWRDb250ZW50KTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIEFsc28gYWRkIHRvIHRoZSBzdWJ0b3BpY3MgbGlzdCBpbiB0aGUgY29udGVudCBpZiBpdCBleGlzdHNcblx0XHRcdFx0YXdhaXQgdGhpcy5hZGRTdWJ0b3BpY1RvQ29udGVudExpc3QocGFyZW50RmlsZSk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBGb3JjZSB1cGRhdGUgdGhlIHRvcGljIHByb2dyZXNzXG5cdFx0XHRcdGF3YWl0IHRoaXMuZm9yY2VVcGRhdGVUb3BpY1Byb2dyZXNzKHBhcmVudEZpbGUpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBSZXNldCB1cGRhdGluZyBmbGFnXG5cdFx0XHR0aGlzLmlzVXBkYXRpbmcgPSBmYWxzZTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0Ly8gUmVzZXQgdXBkYXRpbmcgZmxhZyBldmVuIGlmIHRoZXJlJ3MgYW4gZXJyb3Jcblx0XHRcdHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuXHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgcGFyZW50IHRvcGljOicsIGVycm9yKTtcblx0XHRcdG5ldyBOb3RpY2UoJ0Vycm9yIHVwZGF0aW5nIHBhcmVudCB0b3BpYycpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGFkZFN1YnRvcGljVG9Db250ZW50TGlzdChwYXJlbnRGaWxlOiBURmlsZSkge1xuXHRcdC8vIFNraXAgaWYgYWxyZWFkeSB1cGRhdGluZyB0byBwcmV2ZW50IGluZmluaXRlIGxvb3BzXG5cdFx0aWYgKHRoaXMuaXNVcGRhdGluZykgcmV0dXJuO1xuXHRcdFxuXHRcdHRyeSB7XG5cdFx0XHQvLyBTZXQgdXBkYXRpbmcgZmxhZ1xuXHRcdFx0dGhpcy5pc1VwZGF0aW5nID0gdHJ1ZTtcblx0XHRcdFxuXHRcdFx0Y29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQocGFyZW50RmlsZSk7XG5cdFx0XHRcblx0XHRcdC8vIEZvcmNlIHJlZnJlc2ggbWV0YWRhdGEgY2FjaGUgdG8gZ2V0IHRoZSBsYXRlc3QgZGF0YVxuXHRcdFx0Ly8gVXNlIHRoZSBjb3JyZWN0IG1ldGhvZCBzaWduYXR1cmVcblx0XHRcdHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUudHJpZ2dlcignY2hhbmdlZCcpO1xuXHRcdFx0XG5cdFx0XHQvLyBXYWl0IGEgbW9tZW50IGZvciB0aGUgY2FjaGUgdG8gdXBkYXRlXG5cdFx0XHRhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwKSk7XG5cdFx0XHRcblx0XHRcdGNvbnN0IG1ldGFkYXRhID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUocGFyZW50RmlsZSk7XG5cdFx0XHRcblx0XHRcdGlmIChtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnN1YnRvcGljcykge1xuXHRcdFx0XHRjb25zdCBzdWJ0b3BpY3MgPSBtZXRhZGF0YS5mcm9udG1hdHRlci5zdWJ0b3BpY3M7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBGaW5kIHRoZSBzdWJ0b3BpY3Mgc2VjdGlvbiBpbiB0aGUgY29udGVudFxuXHRcdFx0XHRjb25zdCBzdWJ0b3BpY3NTZWN0aW9uUmVnZXggPSAvIyMgU3VidG9waWNzXFxzKlxcbihbXFxzXFxTXSo/KSg/PVxcbiMjfCQpLztcblx0XHRcdFx0Y29uc3QgbWF0Y2ggPSBjb250ZW50Lm1hdGNoKHN1YnRvcGljc1NlY3Rpb25SZWdleCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAobWF0Y2gpIHtcblx0XHRcdFx0XHRsZXQgc3VidG9waWNzU2VjdGlvbiA9IG1hdGNoWzBdO1xuXHRcdFx0XHRcdGxldCBzdWJ0b3BpY3NMaXN0ID0gJyc7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Ly8gQ3JlYXRlIGEgbGlzdCBvZiBzdWJ0b3BpY3Mgd2l0aCBjb21wbGV0aW9uIHN0YXR1c1xuXHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHN1YnRvcGljcykpIHtcblx0XHRcdFx0XHRcdGZvciAoY29uc3Qgc3VidG9waWMgb2Ygc3VidG9waWNzKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHN1YnRvcGljTmFtZSA9IHRoaXMuZXh0cmFjdExpbmtUZXh0KHN1YnRvcGljKTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3VidG9waWNGaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGAke3N1YnRvcGljTmFtZX0ubWRgKTtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdGlmIChzdWJ0b3BpY0ZpbGUgJiYgc3VidG9waWNGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBGb3JjZSByZWZyZXNoIG1ldGFkYXRhIGNhY2hlIGZvciB0aGlzIHN1YnRvcGljXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5hcHAubWV0YWRhdGFDYWNoZS50cmlnZ2VyKCdjaGFuZ2VkJyk7XG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0Ly8gV2FpdCBhIG1vbWVudCBmb3IgdGhlIGNhY2hlIHRvIHVwZGF0ZVxuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMDApKTtcblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdWJ0b3BpY01ldGFkYXRhID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoc3VidG9waWNGaWxlKTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBpc0NvbXBsZXRlZCA9IHN1YnRvcGljTWV0YWRhdGE/LmZyb250bWF0dGVyPy5jb21wbGV0ZWQgPT09IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdFx0c3VidG9waWNzTGlzdCArPSBgLSAke3N1YnRvcGljfSAke2lzQ29tcGxldGVkID8gJ+KchScgOiAn4p2MJ31cXG5gO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHN1YnRvcGljc0xpc3QgKz0gYC0gJHtzdWJ0b3BpY30g4p2MXFxuYDtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcblx0XHRcdFx0XHQvLyBSZXBsYWNlIHRoZSBzdWJ0b3BpY3Mgc2VjdGlvbiBjb250ZW50XG5cdFx0XHRcdFx0Y29uc3QgdXBkYXRlZFN1YnRvcGljc1NlY3Rpb24gPSBgIyMgU3VidG9waWNzXFxuXFxuJHtzdWJ0b3BpY3NMaXN0fWA7XG5cdFx0XHRcdFx0Y29uc3QgdXBkYXRlZENvbnRlbnQgPSBjb250ZW50LnJlcGxhY2Uoc3VidG9waWNzU2VjdGlvblJlZ2V4LCB1cGRhdGVkU3VidG9waWNzU2VjdGlvbik7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KHBhcmVudEZpbGUsIHVwZGF0ZWRDb250ZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBSZXNldCB1cGRhdGluZyBmbGFnXG5cdFx0XHR0aGlzLmlzVXBkYXRpbmcgPSBmYWxzZTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0Ly8gUmVzZXQgdXBkYXRpbmcgZmxhZyBldmVuIGlmIHRoZXJlJ3MgYW4gZXJyb3Jcblx0XHRcdHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuXHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgc3VidG9waWNzIGxpc3QgaW4gY29udGVudDonLCBlcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgdG9nZ2xlU3VidG9waWNDb21wbGV0aW9uKGZpbGU6IFRGaWxlKSB7XG5cdFx0dHJ5IHtcblx0XHRcdC8vIFNldCB1cGRhdGluZyBmbGFnXG5cdFx0XHR0aGlzLmlzVXBkYXRpbmcgPSB0cnVlO1xuXHRcdFx0XG5cdFx0XHQvLyBGb3JjZSByZWZyZXNoIG1ldGFkYXRhIGNhY2hlIHRvIGdldCB0aGUgbGF0ZXN0IGRhdGFcblx0XHRcdHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUudHJpZ2dlcignY2hhbmdlZCcpO1xuXHRcdFx0XG5cdFx0XHQvLyBXYWl0IGEgbW9tZW50IGZvciB0aGUgY2FjaGUgdG8gdXBkYXRlXG5cdFx0XHRhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwKSk7XG5cdFx0XHRcblx0XHRcdGNvbnN0IG1ldGFkYXRhID0gdGhpcy5hcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZmlsZSk7XG5cdFx0XHRpZiAoIW1ldGFkYXRhPy5mcm9udG1hdHRlcikge1xuXHRcdFx0XHR0aGlzLmlzVXBkYXRpbmcgPSBmYWxzZTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRjb25zdCBpc0NvbXBsZXRlZCA9IG1ldGFkYXRhLmZyb250bWF0dGVyLmNvbXBsZXRlZCA9PT0gdHJ1ZTtcblx0XHRcdGNvbnN0IG5ld1N0YXR1cyA9ICFpc0NvbXBsZXRlZDtcblx0XHRcdFxuXHRcdFx0Ly8gUmVhZCB0aGUgZmlsZSBjb250ZW50XG5cdFx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChmaWxlKTtcblx0XHRcdFxuXHRcdFx0Ly8gVXBkYXRlIGZyb250bWF0dGVyXG5cdFx0XHRjb25zdCBmcm9udG1hdHRlclJlZ2V4ID0gL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS0vO1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSBjb250ZW50Lm1hdGNoKGZyb250bWF0dGVyUmVnZXgpO1xuXHRcdFx0XG5cdFx0XHRpZiAobWF0Y2gpIHtcblx0XHRcdFx0bGV0IGZyb250bWF0dGVyID0gbWF0Y2hbMV07XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBVcGRhdGUgY29tcGxldGVkIHN0YXR1c1xuXHRcdFx0XHRpZiAoZnJvbnRtYXR0ZXIuaW5jbHVkZXMoJ2NvbXBsZXRlZDonKSkge1xuXHRcdFx0XHRcdGZyb250bWF0dGVyID0gZnJvbnRtYXR0ZXIucmVwbGFjZSgvY29tcGxldGVkOiAodHJ1ZXxmYWxzZSkvLCBgY29tcGxldGVkOiAke25ld1N0YXR1c31gKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmcm9udG1hdHRlciArPSBgXFxuY29tcGxldGVkOiAke25ld1N0YXR1c31gO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBBZGQgY29tcGxldGlvbiBkYXRlIGlmIGJlaW5nIG1hcmtlZCBhcyBjb21wbGV0ZWRcblx0XHRcdFx0aWYgKG5ld1N0YXR1cykge1xuXHRcdFx0XHRcdGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpLnNwbGl0KCdUJylbMF07XG5cdFx0XHRcdFx0aWYgKGZyb250bWF0dGVyLmluY2x1ZGVzKCdjb21wbGV0aW9uX2RhdGU6JykpIHtcblx0XHRcdFx0XHRcdGZyb250bWF0dGVyID0gZnJvbnRtYXR0ZXIucmVwbGFjZSgvY29tcGxldGlvbl9kYXRlOiAuKi8sIGBjb21wbGV0aW9uX2RhdGU6ICR7dG9kYXl9YCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGZyb250bWF0dGVyICs9IGBcXG5jb21wbGV0aW9uX2RhdGU6ICR7dG9kYXl9YDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdC8vIFJlcGxhY2UgZnJvbnRtYXR0ZXIgaW4gY29udGVudFxuXHRcdFx0XHRsZXQgdXBkYXRlZENvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoZnJvbnRtYXR0ZXJSZWdleCwgYC0tLVxcbiR7ZnJvbnRtYXR0ZXJ9XFxuLS0tYCk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBVcGRhdGUgc3RhdHVzIGluIGNvbnRlbnRcblx0XHRcdFx0Y29uc3Qgc3RhdHVzUmVnZXggPSAvU3RhdHVzOiAo4p2MIE5vdCBjb21wbGV0ZWR84pyFIENvbXBsZXRlZCkvO1xuXHRcdFx0XHRjb25zdCBzdGF0dXNNYXRjaCA9IHVwZGF0ZWRDb250ZW50Lm1hdGNoKHN0YXR1c1JlZ2V4KTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmIChzdGF0dXNNYXRjaCkge1xuXHRcdFx0XHRcdGNvbnN0IG5ld1N0YXR1c1RleHQgPSBuZXdTdGF0dXMgPyAn4pyFIENvbXBsZXRlZCcgOiAn4p2MIE5vdCBjb21wbGV0ZWQnO1xuXHRcdFx0XHRcdHVwZGF0ZWRDb250ZW50ID0gdXBkYXRlZENvbnRlbnQucmVwbGFjZShzdGF0dXNSZWdleCwgYFN0YXR1czogJHtuZXdTdGF0dXNUZXh0fWApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBVcGRhdGUgdGhlIGZpbGVcblx0XHRcdFx0YXdhaXQgdGhpcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIHVwZGF0ZWRDb250ZW50KTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIEZvcmNlIHJlZnJlc2ggbWV0YWRhdGEgY2FjaGVcblx0XHRcdFx0dGhpcy5hcHAubWV0YWRhdGFDYWNoZS50cmlnZ2VyKCdjaGFuZ2VkJyk7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBXYWl0IGEgbW9tZW50IGZvciB0aGUgY2FjaGUgdG8gdXBkYXRlXG5cdFx0XHRcdGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxMDApKTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vIFVwZGF0ZSBwYXJlbnQgdG9waWMgcHJvZ3Jlc3Ncblx0XHRcdFx0aWYgKG1ldGFkYXRhLmZyb250bWF0dGVyLnBhcmVudCkge1xuXHRcdFx0XHRcdGNvbnN0IHBhcmVudE5hbWUgPSB0aGlzLmV4dHJhY3RMaW5rVGV4dChtZXRhZGF0YS5mcm9udG1hdHRlci5wYXJlbnQpO1xuXHRcdFx0XHRcdGNvbnN0IHBhcmVudEZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7cGFyZW50TmFtZX0ubWRgKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAocGFyZW50RmlsZSAmJiBwYXJlbnRGaWxlIGluc3RhbmNlb2YgVEZpbGUpIHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZm9yY2VVcGRhdGVUb3BpY1Byb2dyZXNzKHBhcmVudEZpbGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdFx0bmV3IE5vdGljZShgU3VidG9waWMgbWFya2VkIGFzICR7bmV3U3RhdHVzID8gJ2NvbXBsZXRlZCcgOiAnbm90IGNvbXBsZXRlZCd9YCk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIFJlc2V0IHVwZGF0aW5nIGZsYWdcblx0XHRcdHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHQvLyBSZXNldCB1cGRhdGluZyBmbGFnIGV2ZW4gaWYgdGhlcmUncyBhbiBlcnJvclxuXHRcdFx0dGhpcy5pc1VwZGF0aW5nID0gZmFsc2U7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdFcnJvciB0b2dnbGluZyBzdWJ0b3BpYyBjb21wbGV0aW9uOicsIGVycm9yKTtcblx0XHRcdG5ldyBOb3RpY2UoJ0Vycm9yIHVwZGF0aW5nIHN1YnRvcGljIHN0YXR1cycpO1xuXHRcdH1cblx0fVxuXG5cdC8vIEhlbHBlciBtZXRob2QgdG8gZXh0cmFjdCB0ZXh0IGZyb20gW1tsaW5rXV0gZm9ybWF0XG5cdGV4dHJhY3RMaW5rVGV4dChsaW5rOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGNvbnN0IG1hdGNoID0gbGluay5tYXRjaCgvXFxbXFxbKC4qPylcXF1cXF0vKTtcblx0XHRyZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXSA6IGxpbms7XG5cdH1cblxuXHQvLyBGb3JjZSB1cGRhdGUgdG9waWMgcHJvZ3Jlc3Mgd2l0aCBkaXJlY3QgZmlsZSByZWFkaW5nIGluc3RlYWQgb2YgcmVseWluZyBvbiBtZXRhZGF0YSBjYWNoZVxuXHRhc3luYyBmb3JjZVVwZGF0ZVRvcGljUHJvZ3Jlc3MoZmlsZTogVEZpbGUpIHtcblx0XHQvLyBTa2lwIGlmIGFscmVhZHkgdXBkYXRpbmcgdG8gcHJldmVudCBpbmZpbml0ZSBsb29wc1xuXHRcdGlmICh0aGlzLmlzVXBkYXRpbmcpIHJldHVybjtcblx0XHRcblx0XHR0cnkge1xuXHRcdFx0Ly8gU2V0IHVwZGF0aW5nIGZsYWdcblx0XHRcdHRoaXMuaXNVcGRhdGluZyA9IHRydWU7XG5cdFx0XHRcblx0XHRcdC8vIFJlYWQgdGhlIGZpbGUgY29udGVudCBkaXJlY3RseVxuXHRcdFx0Y29uc3QgY29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSk7XG5cdFx0XHRcblx0XHRcdC8vIFBhcnNlIGZyb250bWF0dGVyIG1hbnVhbGx5XG5cdFx0XHRjb25zdCBmcm9udG1hdHRlclJlZ2V4ID0gL14tLS1cXG4oW1xcc1xcU10qPylcXG4tLS0vO1xuXHRcdFx0Y29uc3QgbWF0Y2ggPSBjb250ZW50Lm1hdGNoKGZyb250bWF0dGVyUmVnZXgpO1xuXHRcdFx0XG5cdFx0XHRpZiAoIW1hdGNoKSB7XG5cdFx0XHRcdHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGNvbnN0IGZyb250bWF0dGVyID0gbWF0Y2hbMV07XG5cdFx0XHRcblx0XHRcdC8vIENoZWNrIGlmIHRoaXMgaXMgYSB0b3BpYyBub3RlXG5cdFx0XHRpZiAoIWZyb250bWF0dGVyLmluY2x1ZGVzKCd0eXBlOiB0b3BpYycpKSB7XG5cdFx0XHRcdHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdC8vIEV4dHJhY3Qgc3VidG9waWNzIGZyb20gZnJvbnRtYXR0ZXJcblx0XHRcdGxldCBzdWJ0b3BpY3M6IHN0cmluZ1tdID0gW107XG5cdFx0XHRcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYW4gYXJyYXkgZm9ybWF0XG5cdFx0XHRjb25zdCBhcnJheVJlZ2V4ID0gL3N1YnRvcGljczogXFxbKFtcXHNcXFNdKj8pXFxdLztcblx0XHRcdGNvbnN0IGFycmF5TWF0Y2ggPSBmcm9udG1hdHRlci5tYXRjaChhcnJheVJlZ2V4KTtcblx0XHRcdFxuXHRcdFx0aWYgKGFycmF5TWF0Y2gpIHtcblx0XHRcdFx0Ly8gQXJyYXkgZm9ybWF0XG5cdFx0XHRcdHN1YnRvcGljcyA9IGFycmF5TWF0Y2hbMV0uc3BsaXQoJywnKVxuXHRcdFx0XHRcdC5tYXAocyA9PiBzLnRyaW0oKSlcblx0XHRcdFx0XHQuZmlsdGVyKHMgPT4gcy5sZW5ndGggPiAwKVxuXHRcdFx0XHRcdC5tYXAocyA9PiBzLnJlcGxhY2UoL1wiL2csICcnKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBMaXN0IGZvcm1hdFxuXHRcdFx0XHRjb25zdCBsaXN0UmVnZXggPSAvc3VidG9waWNzOltcXHNcXFNdKj8oPz1cXG5cXHd8JCkvO1xuXHRcdFx0XHRjb25zdCBsaXN0TWF0Y2ggPSBmcm9udG1hdHRlci5tYXRjaChsaXN0UmVnZXgpO1xuXHRcdFx0XHRcblx0XHRcdFx0aWYgKGxpc3RNYXRjaCkge1xuXHRcdFx0XHRcdGNvbnN0IGxpc3RDb250ZW50ID0gbGlzdE1hdGNoWzBdO1xuXHRcdFx0XHRcdGNvbnN0IGxpbmVzID0gbGlzdENvbnRlbnQuc3BsaXQoJ1xcbicpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAxOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGNvbnN0IGxpbmUgPSBsaW5lc1tpXS50cmltKCk7XG5cdFx0XHRcdFx0XHRpZiAobGluZS5zdGFydHNXaXRoKCctJykpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgaXRlbSA9IGxpbmUuc3Vic3RyaW5nKDEpLnRyaW0oKS5yZXBsYWNlKC9cIi9nLCAnJyk7XG5cdFx0XHRcdFx0XHRcdGlmIChpdGVtKSBzdWJ0b3BpY3MucHVzaChpdGVtKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKHN1YnRvcGljcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0dGhpcy5pc1VwZGF0aW5nID0gZmFsc2U7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gQ291bnQgY29tcGxldGVkIHN1YnRvcGljcyBieSBkaXJlY3RseSByZWFkaW5nIGVhY2ggc3VidG9waWMgZmlsZVxuXHRcdFx0bGV0IGNvbXBsZXRlZENvdW50ID0gMDtcblx0XHRcdGNvbnN0IHRvdGFsQ291bnQgPSBzdWJ0b3BpY3MubGVuZ3RoO1xuXHRcdFx0XG5cdFx0XHRmb3IgKGNvbnN0IHN1YnRvcGljIG9mIHN1YnRvcGljcykge1xuXHRcdFx0XHRjb25zdCBzdWJ0b3BpY05hbWUgPSB0aGlzLmV4dHJhY3RMaW5rVGV4dChzdWJ0b3BpYyk7XG5cdFx0XHRcdGNvbnN0IHN1YnRvcGljRmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChgJHtzdWJ0b3BpY05hbWV9Lm1kYCk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiAoc3VidG9waWNGaWxlICYmIHN1YnRvcGljRmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG5cdFx0XHRcdFx0Ly8gUmVhZCB0aGUgc3VidG9waWMgZmlsZSBkaXJlY3RseVxuXHRcdFx0XHRcdGNvbnN0IHN1YnRvcGljQ29udGVudCA9IGF3YWl0IHRoaXMuYXBwLnZhdWx0LnJlYWQoc3VidG9waWNGaWxlKTtcblx0XHRcdFx0XHRjb25zdCBzdWJ0b3BpY0Zyb250bWF0dGVyTWF0Y2ggPSBzdWJ0b3BpY0NvbnRlbnQubWF0Y2goZnJvbnRtYXR0ZXJSZWdleCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKHN1YnRvcGljRnJvbnRtYXR0ZXJNYXRjaCkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc3VidG9waWNGcm9udG1hdHRlciA9IHN1YnRvcGljRnJvbnRtYXR0ZXJNYXRjaFsxXTtcblx0XHRcdFx0XHRcdGlmIChzdWJ0b3BpY0Zyb250bWF0dGVyLmluY2x1ZGVzKCdjb21wbGV0ZWQ6IHRydWUnKSkge1xuXHRcdFx0XHRcdFx0XHRjb21wbGV0ZWRDb3VudCsrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBDYWxjdWxhdGUgcHJvZ3Jlc3Ncblx0XHRcdGNvbnN0IHByb2dyZXNzID0gdG90YWxDb3VudCA+IDAgPyBjb21wbGV0ZWRDb3VudCAvIHRvdGFsQ291bnQgOiAwO1xuXHRcdFx0Y29uc3QgcHJvZ3Jlc3NQZXJjZW50ID0gTWF0aC5yb3VuZChwcm9ncmVzcyAqIDEwMCk7XG5cdFx0XHRcblx0XHRcdC8vIFVwZGF0ZSBmcm9udG1hdHRlclxuXHRcdFx0bGV0IHVwZGF0ZWRGcm9udG1hdHRlciA9IGZyb250bWF0dGVyO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGUgcHJvZ3Jlc3Ncblx0XHRcdGlmICh1cGRhdGVkRnJvbnRtYXR0ZXIuaW5jbHVkZXMoJ3Byb2dyZXNzOicpKSB7XG5cdFx0XHRcdHVwZGF0ZWRGcm9udG1hdHRlciA9IHVwZGF0ZWRGcm9udG1hdHRlci5yZXBsYWNlKC9wcm9ncmVzczogW1xcZFxcLl0rLywgYHByb2dyZXNzOiAke3Byb2dyZXNzLnRvRml4ZWQoMil9YCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR1cGRhdGVkRnJvbnRtYXR0ZXIgKz0gYFxcbnByb2dyZXNzOiAke3Byb2dyZXNzLnRvRml4ZWQoMil9YDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gVXBkYXRlIGNvbXBsZXRlZF9zdWJ0b3BpY3Ncblx0XHRcdGlmICh1cGRhdGVkRnJvbnRtYXR0ZXIuaW5jbHVkZXMoJ2NvbXBsZXRlZF9zdWJ0b3BpY3M6JykpIHtcblx0XHRcdFx0dXBkYXRlZEZyb250bWF0dGVyID0gdXBkYXRlZEZyb250bWF0dGVyLnJlcGxhY2UoL2NvbXBsZXRlZF9zdWJ0b3BpY3M6IFxcZCsvLCBgY29tcGxldGVkX3N1YnRvcGljczogJHtjb21wbGV0ZWRDb3VudH1gKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHVwZGF0ZWRGcm9udG1hdHRlciArPSBgXFxuY29tcGxldGVkX3N1YnRvcGljczogJHtjb21wbGV0ZWRDb3VudH1gO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGUgdG90YWxfc3VidG9waWNzXG5cdFx0XHRpZiAodXBkYXRlZEZyb250bWF0dGVyLmluY2x1ZGVzKCd0b3RhbF9zdWJ0b3BpY3M6JykpIHtcblx0XHRcdFx0dXBkYXRlZEZyb250bWF0dGVyID0gdXBkYXRlZEZyb250bWF0dGVyLnJlcGxhY2UoL3RvdGFsX3N1YnRvcGljczogXFxkKy8sIGB0b3RhbF9zdWJ0b3BpY3M6ICR7dG90YWxDb3VudH1gKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHVwZGF0ZWRGcm9udG1hdHRlciArPSBgXFxudG90YWxfc3VidG9waWNzOiAke3RvdGFsQ291bnR9YDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gUmVwbGFjZSBmcm9udG1hdHRlciBpbiBjb250ZW50XG5cdFx0XHRsZXQgdXBkYXRlZENvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoZnJvbnRtYXR0ZXJSZWdleCwgYC0tLVxcbiR7dXBkYXRlZEZyb250bWF0dGVyfVxcbi0tLWApO1xuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGUgcHJvZ3Jlc3MgaW4gY29udGVudFxuXHRcdFx0Y29uc3QgcHJvZ3Jlc3NSZWdleCA9IC8jIyBQcm9ncmVzc1xccypcXG5cXHMqXFxkKyUgY29tcGxldGUvO1xuXHRcdFx0Y29uc3QgcHJvZ3Jlc3NNYXRjaCA9IHVwZGF0ZWRDb250ZW50Lm1hdGNoKHByb2dyZXNzUmVnZXgpO1xuXHRcdFx0XG5cdFx0XHRpZiAocHJvZ3Jlc3NNYXRjaCkge1xuXHRcdFx0XHR1cGRhdGVkQ29udGVudCA9IHVwZGF0ZWRDb250ZW50LnJlcGxhY2UocHJvZ3Jlc3NSZWdleCwgYCMjIFByb2dyZXNzXFxuXFxuJHtwcm9ncmVzc1BlcmNlbnR9JSBjb21wbGV0ZWApO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBVcGRhdGUgdGhlIGZpbGVcblx0XHRcdGF3YWl0IHRoaXMuYXBwLnZhdWx0Lm1vZGlmeShmaWxlLCB1cGRhdGVkQ29udGVudCk7XG5cdFx0XHRcblx0XHRcdC8vIFVwZGF0ZSBzdWJ0b3BpY3MgbGlzdCB3aXRoIGNvbXBsZXRpb24gc3RhdHVzXG5cdFx0XHRjb25zdCBzdWJ0b3BpY3NTZWN0aW9uUmVnZXggPSAvIyMgU3VidG9waWNzXFxzKlxcbihbXFxzXFxTXSo/KSg/PVxcbiMjfCQpLztcblx0XHRcdGNvbnN0IHN1YnRvcGljc01hdGNoID0gdXBkYXRlZENvbnRlbnQubWF0Y2goc3VidG9waWNzU2VjdGlvblJlZ2V4KTtcblx0XHRcdFxuXHRcdFx0aWYgKHN1YnRvcGljc01hdGNoKSB7XG5cdFx0XHRcdGxldCBzdWJ0b3BpY3NMaXN0ID0gJyc7XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBDcmVhdGUgYSBsaXN0IG9mIHN1YnRvcGljcyB3aXRoIGNvbXBsZXRpb24gc3RhdHVzXG5cdFx0XHRcdGZvciAoY29uc3Qgc3VidG9waWMgb2Ygc3VidG9waWNzKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc3VidG9waWNOYW1lID0gdGhpcy5leHRyYWN0TGlua1RleHQoc3VidG9waWMpO1xuXHRcdFx0XHRcdGNvbnN0IHN1YnRvcGljRmlsZSA9IHRoaXMuYXBwLnZhdWx0LmdldEFic3RyYWN0RmlsZUJ5UGF0aChgJHtzdWJ0b3BpY05hbWV9Lm1kYCk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0aWYgKHN1YnRvcGljRmlsZSAmJiBzdWJ0b3BpY0ZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuXHRcdFx0XHRcdFx0Ly8gUmVhZCB0aGUgc3VidG9waWMgZmlsZSBkaXJlY3RseVxuXHRcdFx0XHRcdFx0Y29uc3Qgc3VidG9waWNDb250ZW50ID0gYXdhaXQgdGhpcy5hcHAudmF1bHQucmVhZChzdWJ0b3BpY0ZpbGUpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc3VidG9waWNGcm9udG1hdHRlck1hdGNoID0gc3VidG9waWNDb250ZW50Lm1hdGNoKGZyb250bWF0dGVyUmVnZXgpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRsZXQgaXNDb21wbGV0ZWQgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGlmIChzdWJ0b3BpY0Zyb250bWF0dGVyTWF0Y2gpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc3VidG9waWNGcm9udG1hdHRlciA9IHN1YnRvcGljRnJvbnRtYXR0ZXJNYXRjaFsxXTtcblx0XHRcdFx0XHRcdFx0aXNDb21wbGV0ZWQgPSBzdWJ0b3BpY0Zyb250bWF0dGVyLmluY2x1ZGVzKCdjb21wbGV0ZWQ6IHRydWUnKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0c3VidG9waWNzTGlzdCArPSBgLSAke3N1YnRvcGljfSAke2lzQ29tcGxldGVkID8gJ+KchScgOiAn4p2MJ31cXG5gO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzdWJ0b3BpY3NMaXN0ICs9IGAtICR7c3VidG9waWN9IOKdjFxcbmA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHQvLyBSZXBsYWNlIHRoZSBzdWJ0b3BpY3Mgc2VjdGlvbiBjb250ZW50XG5cdFx0XHRcdGNvbnN0IHVwZGF0ZWRTdWJ0b3BpY3NTZWN0aW9uID0gYCMjIFN1YnRvcGljc1xcblxcbiR7c3VidG9waWNzTGlzdH1gO1xuXHRcdFx0XHR1cGRhdGVkQ29udGVudCA9IHVwZGF0ZWRDb250ZW50LnJlcGxhY2Uoc3VidG9waWNzU2VjdGlvblJlZ2V4LCB1cGRhdGVkU3VidG9waWNzU2VjdGlvbik7XG5cdFx0XHRcdFxuXHRcdFx0XHRhd2FpdCB0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgdXBkYXRlZENvbnRlbnQpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvLyBSZXNldCB1cGRhdGluZyBmbGFnXG5cdFx0XHR0aGlzLmlzVXBkYXRpbmcgPSBmYWxzZTtcblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0Ly8gUmVzZXQgdXBkYXRpbmcgZmxhZyBldmVuIGlmIHRoZXJlJ3MgYW4gZXJyb3Jcblx0XHRcdHRoaXMuaXNVcGRhdGluZyA9IGZhbHNlO1xuXHRcdFx0Y29uc29sZS5lcnJvcignRXJyb3IgdXBkYXRpbmcgdG9waWMgcHJvZ3Jlc3M6JywgZXJyb3IpO1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIHVwZGF0ZVRvcGljUHJvZ3Jlc3MoZmlsZTogVEZpbGUpIHtcblx0XHQvLyBVc2UgdGhlIGZvcmNlIHVwZGF0ZSBtZXRob2QgaW5zdGVhZFxuXHRcdGF3YWl0IHRoaXMuZm9yY2VVcGRhdGVUb3BpY1Byb2dyZXNzKGZpbGUpO1xuXHR9XG5cblx0Ly8gRGVib3VuY2VkIHVwZGF0ZSB0byBwcmV2ZW50IHJhcGlkIHN1Y2Nlc3NpdmUgdXBkYXRlc1xuXHRkZWJvdW5jZWRVcGRhdGVQcm9ncmVzcyhmaWxlOiBURmlsZSkge1xuXHRcdC8vIFNraXAgaWYgYWxyZWFkeSB1cGRhdGluZyB0byBwcmV2ZW50IGluZmluaXRlIGxvb3BzXG5cdFx0aWYgKHRoaXMuaXNVcGRhdGluZykgcmV0dXJuO1xuXHRcdFxuXHRcdC8vIEFkZCBmaWxlIHBhdGggdG8gdXBkYXRlIHF1ZXVlXG5cdFx0dGhpcy51cGRhdGVRdWV1ZS5hZGQoZmlsZS5wYXRoKTtcblx0XHRcblx0XHQvLyBDbGVhciBleGlzdGluZyB0aW1lb3V0XG5cdFx0aWYgKHRoaXMuZGVib3VuY2VUaW1lb3V0KSB7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5kZWJvdW5jZVRpbWVvdXQpO1xuXHRcdH1cblx0XHRcblx0XHQvLyBTZXQgbmV3IHRpbWVvdXRcblx0XHR0aGlzLmRlYm91bmNlVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0dGhpcy5wcm9jZXNzVXBkYXRlUXVldWUoKTtcblx0XHR9LCA1MDApOyAvLyA1MDBtcyBkZWJvdW5jZSB0aW1lXG5cdH1cblxuXHQvLyBQcm9jZXNzIGFsbCBmaWxlcyBpbiB0aGUgdXBkYXRlIHF1ZXVlXG5cdGFzeW5jIHByb2Nlc3NVcGRhdGVRdWV1ZSgpIHtcblx0XHQvLyBTa2lwIGlmIGFscmVhZHkgdXBkYXRpbmdcblx0XHRpZiAodGhpcy5pc1VwZGF0aW5nKSByZXR1cm47XG5cdFx0XG5cdFx0Ly8gU2V0IHVwZGF0aW5nIGZsYWdcblx0XHR0aGlzLmlzVXBkYXRpbmcgPSB0cnVlO1xuXHRcdFxuXHRcdHRyeSB7XG5cdFx0XHQvLyBQcm9jZXNzIGVhY2ggZmlsZSBpbiB0aGUgcXVldWVcblx0XHRcdGZvciAoY29uc3QgZmlsZVBhdGggb2YgdGhpcy51cGRhdGVRdWV1ZSkge1xuXHRcdFx0XHRjb25zdCBmaWxlID0gdGhpcy5hcHAudmF1bHQuZ2V0QWJzdHJhY3RGaWxlQnlQYXRoKGZpbGVQYXRoKTtcblx0XHRcdFx0aWYgKGZpbGUgJiYgZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSB7XG5cdFx0XHRcdFx0Ly8gRm9yY2UgcmVmcmVzaCBtZXRhZGF0YSBjYWNoZVxuXHRcdFx0XHRcdHRoaXMuYXBwLm1ldGFkYXRhQ2FjaGUudHJpZ2dlcignY2hhbmdlZCcpO1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdC8vIFdhaXQgYSBtb21lbnQgZm9yIHRoZSBjYWNoZSB0byB1cGRhdGVcblx0XHRcdFx0XHRhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwKSk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0Y29uc3QgbWV0YWRhdGEgPSB0aGlzLmFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmaWxlKTtcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRpZiAobWV0YWRhdGE/LmZyb250bWF0dGVyPy50eXBlID09PSAnc3VidG9waWMnKSB7XG5cdFx0XHRcdFx0XHQvLyBJZiBhIHN1YnRvcGljIHdhcyBtb2RpZmllZCwgdXBkYXRlIGl0cyBwYXJlbnRcblx0XHRcdFx0XHRcdGlmIChtZXRhZGF0YS5mcm9udG1hdHRlci5wYXJlbnQpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgcGFyZW50TmFtZSA9IHRoaXMuZXh0cmFjdExpbmtUZXh0KG1ldGFkYXRhLmZyb250bWF0dGVyLnBhcmVudCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHBhcmVudEZpbGUgPSB0aGlzLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgoYCR7cGFyZW50TmFtZX0ubWRgKTtcblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdGlmIChwYXJlbnRGaWxlICYmIHBhcmVudEZpbGUgaW5zdGFuY2VvZiBURmlsZSkge1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuZm9yY2VVcGRhdGVUb3BpY1Byb2dyZXNzKHBhcmVudEZpbGUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChtZXRhZGF0YT8uZnJvbnRtYXR0ZXI/LnR5cGUgPT09ICd0b3BpYycpIHtcblx0XHRcdFx0XHRcdC8vIElmIGEgdG9waWMgd2FzIG1vZGlmaWVkLCB1cGRhdGUgaXRzIHByb2dyZXNzXG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLmZvcmNlVXBkYXRlVG9waWNQcm9ncmVzcyhmaWxlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8gQ2xlYXIgdGhlIHF1ZXVlXG5cdFx0XHR0aGlzLnVwZGF0ZVF1ZXVlLmNsZWFyKCk7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHByb2Nlc3NpbmcgdXBkYXRlIHF1ZXVlOicsIGVycm9yKTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0Ly8gUmVzZXQgdXBkYXRpbmcgZmxhZ1xuXHRcdFx0dGhpcy5pc1VwZGF0aW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG59XG5cbmNsYXNzIFRvcGljQ3JlYXRpb25Nb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cGx1Z2luOiBMZWFybmluZ1Byb2dyZXNzUGx1Z2luO1xuXHR0b3BpY05hbWU6IHN0cmluZyA9ICcnO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW4pIHtcblx0XHRzdXBlcihhcHApO1xuXHRcdHRoaXMucGx1Z2luID0gcGx1Z2luO1xuXHR9XG5cblx0b25PcGVuKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdFxuXHRcdGNvbnRlbnRFbC5jcmVhdGVFbCgnaDInLCB7IHRleHQ6ICdDcmVhdGUgTmV3IExlYXJuaW5nIFRvcGljJyB9KTtcblx0XHRcblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuc2V0TmFtZSgnVG9waWMgTmFtZScpXG5cdFx0XHQuc2V0RGVzYygnRW50ZXIgdGhlIG5hbWUgb2YgeW91ciBsZWFybmluZyB0b3BpYycpXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdlLmcuLCBBV1MgUzMnKVxuXHRcdFx0XHQuc2V0VmFsdWUodGhpcy50b3BpY05hbWUpXG5cdFx0XHRcdC5vbkNoYW5nZSh2YWx1ZSA9PiB7XG5cdFx0XHRcdFx0dGhpcy50b3BpY05hbWUgPSB2YWx1ZTtcblx0XHRcdFx0fSkpO1xuXHRcdFxuXHRcdG5ldyBTZXR0aW5nKGNvbnRlbnRFbClcblx0XHRcdC5hZGRCdXR0b24oYnRuID0+IGJ0blxuXHRcdFx0XHQuc2V0QnV0dG9uVGV4dCgnQ3JlYXRlJylcblx0XHRcdFx0LnNldEN0YSgpXG5cdFx0XHRcdC5vbkNsaWNrKCgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy50b3BpY05hbWUpIHtcblx0XHRcdFx0XHRcdHRoaXMucGx1Z2luLmNyZWF0ZVRvcGljTm90ZSh0aGlzLnRvcGljTmFtZSk7XG5cdFx0XHRcdFx0XHR0aGlzLmNsb3NlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG5ldyBOb3RpY2UoJ1BsZWFzZSBlbnRlciBhIHRvcGljIG5hbWUnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pKVxuXHRcdFx0LmFkZEJ1dHRvbihidG4gPT4gYnRuXG5cdFx0XHRcdC5zZXRCdXR0b25UZXh0KCdDYW5jZWwnKVxuXHRcdFx0XHQub25DbGljaygoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0XHR9KSk7XG5cdH1cblxuXHRvbkNsb3NlKCkge1xuXHRcdGNvbnN0IHsgY29udGVudEVsIH0gPSB0aGlzO1xuXHRcdGNvbnRlbnRFbC5lbXB0eSgpO1xuXHR9XG59XG5cbmNsYXNzIFN1YnRvcGljQ3JlYXRpb25Nb2RhbCBleHRlbmRzIE1vZGFsIHtcblx0cGx1Z2luOiBMZWFybmluZ1Byb2dyZXNzUGx1Z2luO1xuXHRwYXJlbnRUb3BpYzogc3RyaW5nO1xuXHRzdWJ0b3BpY05hbWU6IHN0cmluZyA9ICcnO1xuXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IExlYXJuaW5nUHJvZ3Jlc3NQbHVnaW4sIHBhcmVudFRvcGljOiBzdHJpbmcpIHtcblx0XHRzdXBlcihhcHApO1xuXHRcdHRoaXMucGx1Z2luID0gcGx1Z2luO1xuXHRcdHRoaXMucGFyZW50VG9waWMgPSBwYXJlbnRUb3BpYztcblx0fVxuXG5cdG9uT3BlbigpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRcblx0XHRjb250ZW50RWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQ3JlYXRlIE5ldyBTdWJ0b3BpYycgfSk7XG5cdFx0Y29udGVudEVsLmNyZWF0ZUVsKCdwJywgeyB0ZXh0OiBgUGFyZW50IFRvcGljOiAke3RoaXMucGFyZW50VG9waWN9YCB9KTtcblx0XHRcblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuc2V0TmFtZSgnU3VidG9waWMgTmFtZScpXG5cdFx0XHQuc2V0RGVzYygnRW50ZXIgdGhlIG5hbWUgb2YgeW91ciBzdWJ0b3BpYycpXG5cdFx0XHQuYWRkVGV4dCh0ZXh0ID0+IHRleHRcblx0XHRcdFx0LnNldFBsYWNlaG9sZGVyKCdlLmcuLCBTMyBCdWNrZXRzJylcblx0XHRcdFx0LnNldFZhbHVlKHRoaXMuc3VidG9waWNOYW1lKVxuXHRcdFx0XHQub25DaGFuZ2UodmFsdWUgPT4ge1xuXHRcdFx0XHRcdHRoaXMuc3VidG9waWNOYW1lID0gdmFsdWU7XG5cdFx0XHRcdH0pKTtcblx0XHRcblx0XHRuZXcgU2V0dGluZyhjb250ZW50RWwpXG5cdFx0XHQuYWRkQnV0dG9uKGJ0biA9PiBidG5cblx0XHRcdFx0LnNldEJ1dHRvblRleHQoJ0NyZWF0ZScpXG5cdFx0XHRcdC5zZXRDdGEoKVxuXHRcdFx0XHQub25DbGljaygoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuc3VidG9waWNOYW1lKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnBsdWdpbi5jcmVhdGVTdWJ0b3BpY05vdGUodGhpcy5zdWJ0b3BpY05hbWUsIHRoaXMucGFyZW50VG9waWMpO1xuXHRcdFx0XHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRuZXcgTm90aWNlKCdQbGVhc2UgZW50ZXIgYSBzdWJ0b3BpYyBuYW1lJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSlcblx0XHRcdC5hZGRCdXR0b24oYnRuID0+IGJ0blxuXHRcdFx0XHQuc2V0QnV0dG9uVGV4dCgnQ2FuY2VsJylcblx0XHRcdFx0Lm9uQ2xpY2soKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuY2xvc2UoKTtcblx0XHRcdFx0fSkpO1xuXHR9XG5cblx0b25DbG9zZSgpIHtcblx0XHRjb25zdCB7IGNvbnRlbnRFbCB9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0fVxufVxuIl0sIm5hbWVzIjpbIkl0ZW1WaWV3IiwiVEZpbGUiLCJQbHVnaW5TZXR0aW5nVGFiIiwiU2V0dGluZyIsIlBsdWdpbiIsIk5vdGljZSIsIk1hcmtkb3duVmlldyIsIk1vZGFsIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFrR0E7QUFDTyxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUU7QUFDN0QsSUFBSSxTQUFTLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEtBQUssWUFBWSxDQUFDLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUU7QUFDaEgsSUFBSSxPQUFPLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsRUFBRSxVQUFVLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDL0QsUUFBUSxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFB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
