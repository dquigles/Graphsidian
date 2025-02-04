import { LocalsidianPlugin } from "../LocalsidianPlugin";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface LocalsidianSettings {
	modelName: string;
	apiUrl: string;
}

export const DEFAULT_SETTINGS: LocalsidianSettings = {
	modelName: "llama2",
	apiUrl: "http://localhost:11434",
};

export class LocalsidianSettingTab extends PluginSettingTab {
	plugin: LocalsidianPlugin;

	constructor(app: App, plugin: LocalsidianPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Localsidian Settings" });

		new Setting(containerEl)
			.setName("Model Name")
			.setDesc("Name of the local LLM model to use")
			.addText((text) =>
				text
					.setPlaceholder("Enter model name")
					.setValue(this.plugin.settings.modelName)
					.onChange(async (value) => {
						this.plugin.settings.modelName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("API URL")
			.setDesc("URL of your local LLM API")
			.addText((text) =>
				text
					.setPlaceholder("Enter API URL")
					.setValue(this.plugin.settings.apiUrl)
					.onChange(async (value) => {
						this.plugin.settings.apiUrl = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
