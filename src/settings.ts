import { App, PluginSettingTab, Setting } from "obsidian";
import type CleanPastePlugin from "../main";

export class CleanPasteSettingTab extends PluginSettingTab {
	plugin: CleanPastePlugin;

	constructor(app: App, plugin: CleanPastePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl).setName("Paste Options").setHeading();

		new Setting(containerEl)
			.setName("Preserve extra blank lines in paragraphs")
			.setDesc("Keep larger paragraph gaps instead of collapsing them.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.preserveExtraBlankLinesInParagraphs)
					.onChange(async (value) => {
						this.plugin.settings.preserveExtraBlankLinesInParagraphs = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Normalize bullets to -")
			.setDesc("Convert fancy bullets and mixed bullet markers into dashes.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.normalizeBulletsToDash)
					.onChange(async (value) => {
						this.plugin.settings.normalizeBulletsToDash = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Strip HTML artifacts")
			.setDesc("Remove leftover tags, line break tags, and common HTML entities.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.stripHtmlArtifacts)
					.onChange(async (value) => {
						this.plugin.settings.stripHtmlArtifacts = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
