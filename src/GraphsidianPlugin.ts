import { 
    App,
    Plugin,
    PluginSettingTab,
    Setting,
    WorkspaceLeaf,
    ItemView } from 'obsidian';
import { DEFAULT_SETTINGS, GraphsidianSettingTab, GraphsidianSettings } from './settings/settings';
  


  export class GraphsidianPlugin extends Plugin {
    settings: GraphsidianSettings;

    async onload() {
      await this.loadSettings(); // Load settings first

      this.addSettingTab(new GraphsidianSettingTab(this.app, this));

      this.addRibbonIcon('bot', 'Graphsidian', () => {
        this.activateView();
      });
  
      this.registerView(
        'graphsidian-view',
        (leaf) => new GsidianView(leaf)
      );
    }
  
    async activateView() {
      const { workspace } = this.app;
  
      let leaf = workspace.getLeavesOfType('graphsidian-view')[0];
      if (!leaf) {
        leaf = workspace.getLeaf('split');
        await leaf.setViewState({ type: 'graphsidian-view', active: true });
      }
  
      workspace.revealLeaf(leaf);
    }
  
    onunload() {
      this.app.workspace.detachLeavesOfType('graphsidian-view');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
      }
    
      async saveSettings() {
        await this.saveData(this.settings);
      }
  }
  
  class GsidianView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
      super(leaf);
    }
  
    getViewType() {
      return 'graphsidian-view';
    }
  
    getDisplayText() {
      return 'Graphsidian';
    }
  
    async onOpen() {
      const container = this.containerEl.children[1];
      container.empty();
      container.createEl('h4', { text: 'Graphsidian' });
      container.createEl('p', { text: 'This is a obsidian plugin that takes from your knowledge graph and uses Graph-based RAG with OLlama' });
    }
  
    async onClose() {
      // Nothing to clean up
    }

    
  
  
  }
  
  