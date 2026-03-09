import { afterEach, describe, expect, it, vi } from "vitest";
import { readClipboardContent } from "../../src/clipboard";
import { cleanCurrentNote, cleanEditorSelections } from "../../src/editor-actions";
import { DEFAULT_SETTINGS } from "../../src/settings-data";

describe("command flows", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("cleans multiple selections without shifting later ranges", () => {
		const editor = createMockEditor("#Title\n\n-   one\n\n##Subtitle");
		editor.setSelections([
			{
				anchor: { line: 0, ch: 0 },
				head: { line: 2, ch: 7 },
			},
			{
				anchor: { line: 4, ch: 0 },
				head: { line: 4, ch: 10 },
			},
		]);

		expect(cleanEditorSelections(editor, DEFAULT_SETTINGS)).toBe(true);
		expect(editor.getValue()).toBe("# Title\n\n- one\n\n## Subtitle");
	});

	it("cleans the current note while preserving frontmatter", () => {
		const editor = createMockEditor("---\na: 1\n---\n#Title\n\n-   one");
		expect(cleanCurrentNote(editor, DEFAULT_SETTINGS)).toBe(true);
		expect(editor.getValue()).toBe("---\na: 1\n---\n# Title\n\n- one");
	});

	it("returns false when there is no selected text to clean", () => {
		const editor = createMockEditor("No changes");
		editor.setSelections([
			{
				anchor: { line: 0, ch: 0 },
				head: { line: 0, ch: 0 },
			},
		]);

		expect(cleanEditorSelections(editor, DEFAULT_SETTINGS)).toBe(false);
		expect(editor.getValue()).toBe("No changes");
	});

	it("supports reversed selections", () => {
		const editor = createMockEditor("##Subtitle");
		editor.setSelections([
			{
				anchor: { line: 0, ch: 10 },
				head: { line: 0, ch: 0 },
			},
		]);

		expect(cleanEditorSelections(editor, DEFAULT_SETTINGS)).toBe(true);
		expect(editor.getValue()).toBe("## Subtitle");
	});

	it("returns false when cleaning the current note makes no changes", () => {
		const editor = createMockEditor("# Title");
		expect(cleanCurrentNote(editor, DEFAULT_SETTINGS)).toBe(false);
		expect(editor.getValue()).toBe("# Title");
	});

	it("prefers markdown clipboard data over plain text", async () => {
		const clipboard = {
			read: async () => [
				createClipboardItem({
					"text/plain": "Title\nOne",
					"text/markdown": "# Title\n- One",
				}),
			],
			readText: async () => "Title\nOne",
		} as Clipboard;

		await expect(readClipboardContent(DEFAULT_SETTINGS, clipboard)).resolves.toBe(
			"# Title\n- One",
		);
	});

	it("falls back to readText when rich clipboard access fails", async () => {
		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
		const clipboard = {
			read: async () => {
				throw new Error("Permission denied");
			},
			readText: async () => "#Title\n\n-   one",
		} as Clipboard;

		await expect(readClipboardContent(DEFAULT_SETTINGS, clipboard)).resolves.toBe(
			"# Title\n\n- one",
		);
		expect(warnSpy).toHaveBeenCalled();
	});

	it("falls back to plain text when a rich clipboard type cannot be read", async () => {
		const clipboard = {
			read: async () => [
				{
					types: ["text/markdown", "text/plain"],
					getType: async (type: string) => {
						if (type === "text/markdown") {
							throw new Error("Unsupported");
						}

						return {
							text: async () => "#Title",
							type,
						};
					},
				},
			],
		} as Clipboard;

		await expect(readClipboardContent(DEFAULT_SETTINGS, clipboard)).resolves.toBe(
			"# Title",
		);
	});

	it("returns an empty string when no clipboard APIs are available", async () => {
		await expect(readClipboardContent(DEFAULT_SETTINGS, {} as Clipboard)).resolves.toBe("");
	});
});

type MockSelection = {
	anchor: { line: number; ch: number };
	head: { line: number; ch: number };
};

function createMockEditor(initialValue: string) {
	let value = initialValue;
	let selections: MockSelection[] = [];

	return {
		getValue: () => value,
		setValue: (nextValue: string) => {
			value = nextValue;
		},
		listSelections: () => selections,
		setSelections: (nextSelections: MockSelection[]) => {
			selections = nextSelections;
		},
		getRange: (from: { line: number; ch: number }, to: { line: number; ch: number }) =>
			getTextRange(value, from, to),
		replaceRange: (
			replacement: string,
			from: { line: number; ch: number },
			to: { line: number; ch: number },
		) => {
			value = replaceTextRange(value, from, to, replacement);
		},
	} as any;
}

function getTextRange(
	text: string,
	from: { line: number; ch: number },
	to: { line: number; ch: number },
): string {
	return text.slice(positionToOffset(text, from), positionToOffset(text, to));
}

function replaceTextRange(
	text: string,
	from: { line: number; ch: number },
	to: { line: number; ch: number },
	replacement: string,
): string {
	const start = positionToOffset(text, from);
	const end = positionToOffset(text, to);
	return `${text.slice(0, start)}${replacement}${text.slice(end)}`;
}

function positionToOffset(text: string, position: { line: number; ch: number }): number {
	const lines = text.split("\n");
	let offset = 0;

	for (let index = 0; index < position.line; index += 1) {
		offset += lines[index].length + 1;
	}

	return offset + position.ch;
}

function createClipboardItem(contents: Record<string, string>): ClipboardItem {
	return {
		types: Object.keys(contents),
		getType: async (type: string) => ({
			type,
			text: async () => contents[type],
		}),
	} as ClipboardItem;
}
