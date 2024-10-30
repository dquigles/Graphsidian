import { GraphsidianPlugin } from "../GraphsidianPlugin";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface GraphsidianSettings {
	ollamaUrl: string;
	defaultModel: string;
	useAutotagPrefix: boolean;
	useFrontmatterAutotagsKey: boolean;
	tagsFormat:
		| "kebabCase"
		| "snakeCase"
		| "pascalCase"
		| "camelCase"
		| "pascalSnakeCase"
		| "trainCase"
		| "constantCase";
	showPreUpdateDialog: boolean;
	showPostUpdateDialog: boolean;
	writeToLogFile: boolean;
}

export const DEFAULT_SETTINGS: GraphsidianSettings = {
	ollamaUrl: "http://localhost:11434",
	defaultModel: "llama2",
	useAutotagPrefix: true,
	useFrontmatterAutotagsKey: true,
	tagsFormat: "kebabCase",
	showPreUpdateDialog: true,
	showPostUpdateDialog: true,
	writeToLogFile: true,
};

export class GraphsidianSettingTab extends PluginSettingTab {
	plugin: GraphsidianPlugin;

	constructor(app: App, plugin: GraphsidianPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Ollama Settings" });

		new Setting(containerEl)
			.setName("Ollama URL")
			.setDesc("The URL where Ollama is running")
			.addText((text) =>
				text
					.setPlaceholder("http://localhost:11434")
					.setValue(this.plugin.settings.ollamaUrl)
					.onChange(async (value) => {
						this.plugin.settings.ollamaUrl = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Default Model")
			.setDesc("The default Ollama model to use")
			.addText((text) =>
				text
					.setPlaceholder("llama2")
					.setValue(this.plugin.settings.defaultModel)
					.onChange(async (value) => {
						this.plugin.settings.defaultModel = value;
						await this.plugin.saveSettings();
					})
			);
            new Setting(containerEl)
            .setHeading()
            .setName('Tagging options');
    
            new Setting(containerEl)
            .setName(`Prefix newly suggested tags with "#graphsidian/"`)
            .setDesc(
                this.createDocumentFragment(`Example: "#graphsidian/recipe" instead of "#recipe".`)
            )
            .addToggle(toggle => {
                toggle.setValue(this.plugin.settings.useAutotagPrefix)
                toggle.onChange(async (toggleValue: boolean) => {
                    this.plugin.settings.useAutotagPrefix = toggleValue;
                    await this.plugin.saveSettings();
                })
            });
    
            new Setting(containerEl)
            .setName(`In front-matter insert under "AItags:" instead of "tags:"`)
            .setDesc(this.createDocumentFragment(`Benefit: don't mix your tags and AI tags in the front matter of your notes.<br>Downside: tags in a different property are not recognized as tags by Obsidian, no auto-complete when typing "#..".`))
            .addToggle(toggle => {
                toggle.setValue(this.plugin.settings.useFrontmatterAutotagsKey)
                toggle.onChange(async (toggleValue: boolean) => {
                    this.plugin.settings.useFrontmatterAutotagsKey = toggleValue;
                    await this.plugin.saveSettings();
                })
            });
    
            new Setting(containerEl)
            .setName('How to format tags?')
            .setDesc('You can indicate your own preference. Only applies to new suggested tags, does not update existing tags.')
            .addDropdown(dropdown => dropdown
            .addOption("kebabCase", 'two-words (kebab case)')
            .addOption("snakeCase", 'two_words (snake case)')
            .addOption("pascalCase", 'TwoWords (pascal case)')
            .addOption("camelCase", 'twoWords (camel case)')
            .addOption("pascalSnakeCase", 'Two_Words (pascal snake case)')
            .addOption("trainCase", 'Two-Words (train case)')
            .addOption("constantCase", 'TWO_WORDS (constant case)')
            .setValue(`${this.plugin.settings.tagsFormat}`)
            .onChange(async (value) => {
                await this.plugin.saveSettings();
            }));
            
            new Setting(containerEl)
            .setName("Review and approve suggested tags before inserting them")
            .setDesc(this.createDocumentFragment("Shows the suggested tags that will be added to the note.<br>You can make changes before accepting them."))
            .addToggle(toggle => {
                toggle.setValue(this.plugin.settings.showPreUpdateDialog);
                toggle.onChange(async (toggleValue: boolean) => {
                    this.plugin.settings.showPreUpdateDialog = toggleValue;
                    await this.plugin.saveSettings();
                });
            });
    
        }

        createDocumentFragment = (htmlString: string, unsafeValues: Record<string, string> = {}): DocumentFragment => {
            const fragment = document.createDocumentFragment();
            let safeHtmlString = htmlString;
        
            for (const placeholder in unsafeValues) {
                const safeValue = document.createTextNode(unsafeValues[placeholder]).textContent || '';
                safeHtmlString = safeHtmlString.replace(new RegExp(`{{${placeholder}}}`, 'g'), safeValue);
            }
        
            const parser = new DOMParser();
            const parsedDoc = parser.parseFromString(safeHtmlString, 'text/html');
        
            while (parsedDoc.body.firstChild) {
                fragment.appendChild(parsedDoc.body.firstChild);
            }
        
            return fragment;
        }
        
    }
    