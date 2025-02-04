import { LocalsidianPlugin } from "../LocalsidianPlugin";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface LocalsidianSettings {
	modelName: string;
	apiUrl: string;
	prompt: string;
}

export const DEFAULT_SETTINGS: LocalsidianSettings = {
	modelName: "llama2",
	apiUrl: "http://localhost:11434",
	prompt: `You will be taking notes and formatting them for use in Obsidian MD. The notes will be provided to you as input. 

Here are the steps you will follow:

1. Read the notes provided in the input:
<notes>
{$NOTES}
</notes>

2. Use the following markdown formatting to enhance the notes:
   - Use \`#\` for headings (e.g., \`# Heading 1\`, \`## Heading 2\`).
   - Use \`-\` or \`*\` for bullet points.
   - Use \`1.\` for numbered lists.
   - Use \`**text**\` for bold text and \`*text*\` for italic text.
   - Use \`> text\` for blockquotes.
   - Use \`[[link]]\` for internal links to other notes.
   - Use \`![[image.png]]\` for embedding images.
   - Use \`---\` for horizontal lines.

3. Ensure the final output is clean and visually appealing, making use of the markdown features effectively.

4. Write your formatted notes inside <formatted_notes> tags.

<formatted_notes>
</formatted_notes>`,
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

		new Setting(containerEl)
			.setName("PROMPT")
			.setDesc(
				"Prompt for the local LLM, edit if you wish to change the prompt that will go to the AI"
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter Prompt")
					.setValue(this.plugin.settings.prompt)
					.onChange(async (value) => {
						this.plugin.settings.prompt = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
