import { App, Plugin, PluginSettingTab, Setting, WorkspaceLeaf, ItemView } from 'obsidian';

export default class MyPlugin extends Plugin {
  async onload() {
    this.addRibbonIcon('dice', 'Graphsidian', () => {
      this.activateView();
    });

    this.registerView(
      'graphsidian-view',
      (leaf) => new MyPluginView(leaf)
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
}

class MyPluginView extends ItemView {
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