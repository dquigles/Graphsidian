import { GraphsidianPlugin } from '../GraphsidianPlugin'
import { App, PluginSettingTab, Setting } from 'obsidian';



  
export interface GraphsidianSettings {
    ollamaUrl: string;
    defaultModel: string;
  }



export const DEFAULT_SETTINGS: GraphsidianSettings = {
    ollamaUrl: 'http://localhost:11434',
    defaultModel: 'llama2'

}

export class GraphsidianSettingTab extends PluginSettingTab {
  plugin: GraphsidianPlugin;

  constructor(app: App, plugin: GraphsidianPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Graphsidian Settings' });

    new Setting(containerEl)
        .setName('Ollama URL')
        .setDesc('The URL where Ollama is running')
        .addText(text => text
            .setPlaceholder('http://localhost:11434')
            .setValue(this.plugin.settings.ollamaUrl)
            .onChange(async (value) => {
                this.plugin.settings.ollamaUrl = value;
                await this.plugin.saveSettings();
            }));

    new Setting(containerEl)
        .setName('Default Model')
        .setDesc('The default Ollama model to use')
        .addText(text => text
            .setPlaceholder('llama2')
            .setValue(this.plugin.settings.defaultModel)
            .onChange(async (value) => {
                this.plugin.settings.defaultModel = value;
                await this.plugin.saveSettings();
            }));
}
}
