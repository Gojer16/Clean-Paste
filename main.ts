import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { readClipboardContent } from "./src/clipboard";
import { cleanCurrentNote, cleanEditorSelections } from "./src/editor-actions";
import { DEFAULT_SETTINGS, type CleanPasteSettings } from "./src/settings-data";
import {
	CleanPasteSettingTab,
} from "./src/settings";

export default class CleanPastePlugin extends Plugin {
	settings: CleanPasteSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.addRibbonIcon("wand", "Clean current note", () => {
			this.cleanActiveNote();
		});

		this.addCommand({
			id: "clean-selected-text",
			name: "Clean selected text",
			editorCallback: (editor) => {
				const didClean = cleanEditorSelections(editor, this.settings);
				new Notice(didClean ? "Paste cleaned" : "Select text to clean");
			},
		});

		this.addCommand({
			id: "paste-clean-from-clipboard",
			name: "Paste clean from clipboard",
			editorCallback: (editor) => void this.pasteCleanFromClipboard(editor),
		});

		this.addCommand({
			id: "clean-current-note",
			name: "Clean current note",
			editorCallback: (editor) => this.cleanNoteInEditor(editor),
		});

		this.addSettingTab(new CleanPasteSettingTab(this.app, this));
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	private async loadSettings(): Promise<void> {
		const saved = (await this.loadData()) as Partial<CleanPasteSettings> | null;
		this.settings = { ...DEFAULT_SETTINGS, ...saved };
	}

	private async pasteCleanFromClipboard(editor: Editor): Promise<void> {
		try {
			const text = await readClipboardContent(this.settings);
			if (!text) {
				new Notice("Clipboard is empty");
				return;
			}

			editor.replaceSelection(text);
			new Notice("Paste cleaned");
		} catch (error) {
			console.error("Failed to read clipboard", error);
			new Notice("Unable to read clipboard");
		}
	}

	private cleanActiveNote(): void {
		const editor = this.getActiveEditor();
		if (!editor) {
			new Notice("Open a note to clean");
			return;
		}

		this.cleanNoteInEditor(editor);
	}

	private cleanNoteInEditor(editor: Editor): void {
		const didClean = cleanCurrentNote(editor, this.settings);
		new Notice(didClean ? "Note cleaned" : "Nothing to clean");
	}

	private getActiveEditor(): Editor | null {
		return this.app.workspace.getActiveViewOfType(MarkdownView)?.editor ?? null;
	}
}
