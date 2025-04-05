import { App, PluginSettingTab, Setting } from 'obsidian';
import LearningProgressPlugin from '../main';

export class LearningProgressSettingTab extends PluginSettingTab {
    plugin: LearningProgressPlugin;

    constructor(app: App, plugin: LearningProgressPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Learning Progress Settings' });

        new Setting(containerEl)
            .setName('Show Progress Bar')
            .setDesc('Show progress bar in topic notes')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showProgressBar)
                .onChange(async (value) => {
                    this.plugin.settings.showProgressBar = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Show Knowledge Map')
            .setDesc('Show knowledge map in sidebar')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.showKnowledgeMap)
                .onChange(async (value) => {
                    this.plugin.settings.showKnowledgeMap = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Topic Template')
            .setDesc('Template for new topic notes')
            .addTextArea(text => text
                .setValue(this.plugin.settings.defaultTopicTemplate)
                .onChange(async (value) => {
                    this.plugin.settings.defaultTopicTemplate = value;
                    await this.plugin.saveSettings();
                }))
            .setClass('template-setting');

        new Setting(containerEl)
            .setName('Subtopic Template')
            .setDesc('Template for new subtopic notes')
            .addTextArea(text => text
                .setValue(this.plugin.settings.defaultSubtopicTemplate)
                .onChange(async (value) => {
                    this.plugin.settings.defaultSubtopicTemplate = value;
                    await this.plugin.saveSettings();
                }))
            .setClass('template-setting');
    }
}
