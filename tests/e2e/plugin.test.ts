import { beforeEach, describe, expect, it, vi } from "vitest";
import { Notice, Setting, resetObsidianMocks } from "obsidian";
import type { CleanPasteSettings } from "../../src/settings-data";

const cleanCurrentNoteMock = vi.fn();
const cleanEditorSelectionsMock = vi.fn();
const readClipboardContentMock = vi.fn();

vi.mock("../../src/editor-actions", () => ({
	cleanCurrentNote: cleanCurrentNoteMock,
	cleanEditorSelections: cleanEditorSelectionsMock,
}));

vi.mock("../../src/clipboard", () => ({
	readClipboardContent: readClipboardContentMock,
}));

describe("plugin flows", () => {
	beforeEach(() => {
		cleanCurrentNoteMock.mockReset();
		cleanEditorSelectionsMock.mockReset();
		readClipboardContentMock.mockReset();
		resetObsidianMocks();
	});

	it("registers commands, ribbon action, and setting tab on load", async () => {
		const { default: CleanPastePlugin } = await import("../../main.ts");
		const app = createMockApp(null);
		const plugin = new CleanPastePlugin(app as any, {} as any);

		const savedSettings: Partial<CleanPasteSettings> = {
			normalizeBulletsToDash: false,
		};
		(plugin.loadData as any).mockResolvedValue(savedSettings);

		await plugin.onload();

		expect(plugin.addRibbonIcon).toHaveBeenCalledWith(
			"wand",
			"Clean current note",
			expect.any(Function),
		);
		expect(plugin.addCommand).toHaveBeenCalledTimes(3);
		expect(plugin.addSettingTab).toHaveBeenCalledTimes(1);
		expect(plugin.settings.normalizeBulletsToDash).toBe(false);
	});

	it("shows a notice when the ribbon action runs without an active editor", async () => {
		const { default: CleanPastePlugin } = await import("../../main.ts");
		const app = createMockApp(null);
		const plugin = new CleanPastePlugin(app as any, {} as any);

		await plugin.onload();

		const ribbonCallback = (plugin.addRibbonIcon as any).mock.calls[0][2];
		ribbonCallback();

		expect(Notice.messages).toContain("Open a note to clean");
	});

	it("uses the shared note-cleaning path for the ribbon and command", async () => {
		const { default: CleanPastePlugin } = await import("../../main.ts");
		const editor = { getValue: vi.fn(), setValue: vi.fn() };
		const app = createMockApp(editor);
		const plugin = new CleanPastePlugin(app as any, {} as any);

		cleanCurrentNoteMock.mockReturnValue(true);

		await plugin.onload();

		const ribbonCallback = (plugin.addRibbonIcon as any).mock.calls[0][2];
		ribbonCallback();

		const cleanCurrentNoteCommand = (plugin.addCommand as any).mock.calls.find(
			([command]: any[]) => command.id === "clean-current-note",
		)?.[0];
		cleanCurrentNoteCommand.editorCallback(editor);

		expect(cleanCurrentNoteMock).toHaveBeenCalledTimes(2);
		expect(Notice.messages.filter((message) => message === "Note cleaned")).toHaveLength(2);
	});

	it("handles the clipboard command empty and error states", async () => {
		const { default: CleanPastePlugin } = await import("../../main.ts");
		const editor = { replaceSelection: vi.fn() };
		const app = createMockApp(editor);
		const plugin = new CleanPastePlugin(app as any, {} as any);
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

		await plugin.onload();

		const pasteCommand = (plugin.addCommand as any).mock.calls.find(
			([command]: any[]) => command.id === "paste-clean-from-clipboard",
		)?.[0];

		readClipboardContentMock.mockResolvedValueOnce("");
		await pasteCommand.editorCallback(editor);

		readClipboardContentMock.mockRejectedValueOnce(new Error("Clipboard blocked"));
		await pasteCommand.editorCallback(editor);

		expect(Notice.messages).toContain("Clipboard is empty");
		expect(Notice.messages).toContain("Unable to read clipboard");
		expect(editor.replaceSelection).not.toHaveBeenCalled();
		expect(errorSpy).toHaveBeenCalled();
	});

	it("renders settings and persists toggle changes", async () => {
		const { default: CleanPastePlugin } = await import("../../main.ts");
		const app = createMockApp(null);
		const plugin = new CleanPastePlugin(app as any, {} as any);

		await plugin.onload();

		const tab = (plugin.addSettingTab as any).mock.calls[0][0];
		tab.display();

		expect(tab.containerEl.textContent).toContain("Clean paste settings");
		expect(Setting.instances).toHaveLength(4);

		await Setting.instances[1].toggle.onChangeHandler?.(true);

		expect(plugin.settings.preserveExtraBlankLinesInParagraphs).toBe(true);
		expect(plugin.saveData).toHaveBeenCalledWith(plugin.settings);
	});
});

function createMockApp(editor: unknown) {
	return {
		workspace: {
			getActiveViewOfType: vi.fn(() => (editor ? { editor } : null)),
		},
	};
}
