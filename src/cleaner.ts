import type { CleanPasteSettings } from "./settings-data";
import {
	collapseExcessBlankLines,
	fixHeadingSpacing,
	fixListSpacing,
	normalizeLineEndings,
	normalizeWhitespace,
	protectMarkdownSegments,
	restoreMarkdownSegments,
	stripHtmlArtifacts,
	stripTrailingSpaces,
} from "./rules";

export function cleanPastedText(
	text: string,
	settings: CleanPasteSettings,
): string {
	const protectedText = protectMarkdownSegments(text);

	const cleaned = [
		normalizeLineEndings,
		(value: string) => (settings.stripHtmlArtifacts ? stripHtmlArtifacts(value) : value),
		normalizeWhitespace,
		stripTrailingSpaces,
		fixHeadingSpacing,
		(value: string) => fixListSpacing(value, settings.normalizeBulletsToDash),
		(value: string) =>
			collapseExcessBlankLines(value, settings.preserveExtraBlankLinesInParagraphs),
	].reduce((value, rule) => rule(value), protectedText.text);

	return restoreMarkdownSegments(
		cleaned,
		protectedText.tokens,
		protectedText.tokenPrefix,
	);
}

export function cleanCurrentNoteText(
	text: string,
	settings: CleanPasteSettings,
): string {
	const { frontmatter, body } = splitFrontmatter(text);
	const cleanedBody = cleanPastedText(body, settings);
	return `${frontmatter}${cleanedBody}`;
}

function splitFrontmatter(text: string): { frontmatter: string; body: string } {
	if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) {
		return { frontmatter: "", body: text };
	}

	const match = text.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/);
	if (!match) {
		return { frontmatter: "", body: text };
	}

	return {
		frontmatter: match[0],
		body: text.slice(match[0].length),
	};
}
