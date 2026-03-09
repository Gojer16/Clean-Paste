import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import { cleanPastedText } from "./cleaner";
import { DEFAULT_SETTINGS, type CleanPasteSettings } from "./settings-data";

const turndown = createTurndownService();

export async function readClipboardContent(
	settings: CleanPasteSettings = DEFAULT_SETTINGS,
	clipboard: Clipboard = navigator.clipboard,
): Promise<string> {
	const preferredText = await readPreferredClipboardText(clipboard);
	return cleanPastedText(preferredText, settings);
}

export async function readPreferredClipboardText(
	clipboard: Clipboard = navigator.clipboard,
): Promise<string> {
	if (typeof clipboard.read === "function") {
		try {
			const items = await clipboard.read();
			for (const item of items) {
				const markdown = await readClipboardType(item, "text/markdown");
				if (markdown) {
					return markdown;
				}

				const html = await readClipboardType(item, "text/html");
				if (html) {
					return htmlToMarkdown(html);
				}

				const text = await readClipboardType(item, "text/plain");
				if (text) {
					return text;
				}
			}
		} catch (error) {
			console.warn("Falling back to plain clipboard text", error);
		}
	}

	if (typeof clipboard.readText === "function") {
		return clipboard.readText();
	}

	return "";
}

export function htmlToMarkdown(html: string): string {
	return turndown.turndown(html);
}

async function readClipboardType(
	item: ClipboardItem,
	type: string,
): Promise<string | null> {
	if (!item.types.includes(type)) {
		return null;
	}

	try {
		const blob = await item.getType(type);
		return readBlobText(blob);
	} catch {
		return null;
	}
}

function createTurndownService(): TurndownService {
	const service = new TurndownService({
		bulletListMarker: "-",
		codeBlockStyle: "fenced",
		emDelimiter: "*",
		headingStyle: "atx",
		strongDelimiter: "**",
	});

	service.use(gfm);
	return service;
}

async function readBlobText(blob: Blob | { text: () => Promise<string> }): Promise<string> {
	if (typeof blob.text === "function") {
		return blob.text();
	}

	return "";
}
