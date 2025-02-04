import { ItemView, Plugin, WorkspaceLeaf } from "obsidian";
import {
	LocalsidianSettings,
	DEFAULT_SETTINGS,
	LocalsidianSettingTab,
} from "./settings/settings";

export class LocalsidianPlugin extends Plugin {
	settings: LocalsidianSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new LocalsidianSettingTab(this.app, this));

		this.addRibbonIcon("cpu", "Localsidian", () => {
			this.activateView();
		});

		this.registerView(
			"localsidian-view",
			(leaf) => new LsidianView(leaf, this.settings)
		);
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType("localsidian-view")[0];
		if (!leaf) {
			leaf = workspace.getLeaf("tab");
			await leaf.setViewState({ type: "localsidian-view", active: true });
		}

		workspace.revealLeaf(leaf);
	}

	onunload() {
		this.app.workspace.detachLeavesOfType("localsidian-view");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class LsidianView extends ItemView {
	private inputEl: HTMLTextAreaElement;
	private outputEl: HTMLDivElement;
	private processingAbortController: AbortController | null = null;
	private settings: LocalsidianSettings;

	constructor(leaf: WorkspaceLeaf, settings: LocalsidianSettings) {
		super(leaf);
		this.settings = settings;
	}

	getViewType() {
		return "localsidian-view";
	}

	getDisplayText() {
		return "Localsidian";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();

		// Header
		container.createEl("h4", { text: "Localsidian" });
		container.createEl("p", {
			text: "Communicate with your local LLMs running on Ollama",
			cls: "localsidian-description",
		});

		// Create main interface container
		const mainContainer = container.createDiv({
			cls: "localsidian-container",
		});

		// Input section
		const inputSection = mainContainer.createDiv({
			cls: "localsidian-input-section",
		});

		inputSection.createEl("label", {
			text: "Enter your prompt:",
			cls: "localsidian-label",
		});

		this.inputEl = inputSection.createEl("textarea", {
			cls: "localsidian-input",
		});

		// Button container
		const buttonContainer = inputSection.createDiv({
			cls: "localsidian-button-container",
		});

		const processButton = buttonContainer.createEl("button", {
			text: "Process",
			cls: "localsidian-button",
		});

		const stopButton = buttonContainer.createEl("button", {
			text: "Stop",
			cls: "localsidian-button localsidian-stop-button",
		});
		stopButton.style.display = "none";

		// Output section
		const outputSection = mainContainer.createDiv({
			cls: "localsidian-output-section",
		});

		outputSection.createEl("label", {
			text: "Output:",
			cls: "localsidian-label",
		});

		this.outputEl = outputSection.createDiv({
			cls: "localsidian-output",
		});

		// Add event listeners
		processButton.addEventListener("click", async () => {
			if (this.inputEl.value.trim()) {
				processButton.style.display = "none";
				stopButton.style.display = "block";
				this.outputEl.empty();
				await this.processInput();
				processButton.style.display = "block";
				stopButton.style.display = "none";
			}
		});

		stopButton.addEventListener("click", () => {
			if (this.processingAbortController) {
				this.processingAbortController.abort();
				this.processingAbortController = null;
				processButton.style.display = "block";
				stopButton.style.display = "none";
			}
		});

		// Add styles
		this.addStyles();
	}

	async onClose() {
		if (this.processingAbortController) {
			this.processingAbortController.abort();
		}
	}

	private addStyles() {
		const style = document.createElement("style");
		style.textContent = `
            .localsidian-container {
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .localsidian-description {
                color: var(--text-muted);
                margin-bottom: 20px;
            }

            .localsidian-input-section,
            .localsidian-output-section {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .localsidian-label {
                font-weight: 500;
                margin-bottom: 4px;
            }

            .localsidian-input {
                width: 100%;
                height: 150px;
                resize: vertical;
                padding: 8px;
                border-radius: 4px;
                border: 1px solid var(--background-modifier-border);
                background-color: var(--background-primary);
                font-family: inherit;
            }

            .localsidian-button-container {
                display: flex;
                gap: 8px;
                margin-top: 8px;
            }

            .localsidian-button {
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                background-color: var(--interactive-accent);
                color: var(--text-on-accent);
                border: none;
            }

            .localsidian-stop-button {
                background-color: var(--text-error);
            }

            .localsidian-output {
                padding: 12px;
                border-radius: 4px;
                background-color: var(--background-secondary);
                min-height: 100px;
                max-height: 500px;
                overflow-y: auto;
                white-space: pre-wrap;
                font-family: var(--font-monospace);
            }

            .localsidian-error {
                color: var(--text-error);
                margin-top: 8px;
            }
        `;
		document.head.appendChild(style);
	}

	private async processInput() {
		try {
			this.processingAbortController = new AbortController();

			const response = await fetch(
				`${this.settings.apiUrl}/api/generate`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						model: this.settings.modelName,
						prompt: this.inputEl.value,
						stream: true,
					}),
					signal: this.processingAbortController.signal,
				}
			);

			if (!response.ok) {
				throw new Error("Failed to get response from Ollama");
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("Failed to initialize stream reader");
			}

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const text = new TextDecoder().decode(value);
				try {
					const lines = text.split("\n");
					for (const line of lines) {
						if (line.trim()) {
							const json = JSON.parse(line);
							this.outputEl.appendText(json.response);
						}
					}
				} catch (e) {
					console.error("Error parsing stream:", e);
				}
			}
		} catch (error) {
			if (error.name === "AbortError") {
				this.outputEl.createDiv({
					text: "\n\nProcessing stopped by user",
					cls: "localsidian-error",
				});
			} else {
				this.outputEl.createDiv({
					text: `\n\nError: ${error.message}`,
					cls: "localsidian-error",
				});
			}
		} finally {
			this.processingAbortController = null;
		}
	}
}
