import type { Editor, EditorPosition, EditorSelection } from "obsidian";
import { cleanCurrentNoteText, cleanPastedText } from "./cleaner";
import type { CleanPasteSettings } from "./settings-data";

export function cleanEditorSelections(
	editor: Editor,
	settings: CleanPasteSettings,
): boolean {
	const selections = editor
		.listSelections()
		.filter((selection) => !isCaret(selection))
		.sort(compareSelectionsDescending);

	if (selections.length === 0) {
		return false;
	}

	for (const selection of selections) {
		const from = getEarlierPosition(selection.anchor, selection.head);
		const to = getLaterPosition(selection.anchor, selection.head);
		const selectedText = editor.getRange(from, to);
		const cleanedText = cleanPastedText(selectedText, settings);
		editor.replaceRange(cleanedText, from, to);
	}

	return true;
}

export function cleanCurrentNote(
	editor: Editor,
	settings: CleanPasteSettings,
): boolean {
	const currentText = editor.getValue();
	const cleanedText = cleanCurrentNoteText(currentText, settings);

	if (cleanedText === currentText) {
		return false;
	}

	editor.setValue(cleanedText);
	return true;
}

function isCaret(selection: EditorSelection): boolean {
	return (
		selection.anchor.line === selection.head.line &&
		selection.anchor.ch === selection.head.ch
	);
}

function compareSelectionsDescending(
	left: EditorSelection,
	right: EditorSelection,
): number {
	const leftStart = getEarlierPosition(left.anchor, left.head);
	const rightStart = getEarlierPosition(right.anchor, right.head);

	if (leftStart.line !== rightStart.line) {
		return rightStart.line - leftStart.line;
	}

	return rightStart.ch - leftStart.ch;
}

function getEarlierPosition(left: EditorPosition, right: EditorPosition): EditorPosition {
	if (left.line !== right.line) {
		return left.line < right.line ? left : right;
	}

	return left.ch <= right.ch ? left : right;
}

function getLaterPosition(left: EditorPosition, right: EditorPosition): EditorPosition {
	if (left.line !== right.line) {
		return left.line > right.line ? left : right;
	}

	return left.ch >= right.ch ? left : right;
}
