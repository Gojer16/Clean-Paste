import { describe, expect, it } from "vitest";
import {
	collapseExcessBlankLines,
	fixHeadingSpacing,
	fixListSpacing,
	normalizeWhitespace,
	protectMarkdownSegments,
	restoreMarkdownSegments,
	stripHtmlArtifacts,
} from "../../src/rules";

describe("rules", () => {
	it("normalizes headings and list spacing", () => {
		expect(fixHeadingSpacing("#Title\n##Subtitle")).toBe("# Title\n## Subtitle");
		expect(fixListSpacing("-   one\n\n-   two", true)).toBe("- one\n- two");
	});

	it("collapses blank lines based on settings", () => {
		expect(collapseExcessBlankLines("a\n\n\nb", false)).toBe("a\n\nb");
		expect(collapseExcessBlankLines("a\n\n\nb", true)).toBe("a\n\n\nb");
	});

	it("normalizes smart quotes and unicode spaces", () => {
		expect(normalizeWhitespace("“hello”\u00A0\u00A0world")).toBe('"hello" world');
	});

	it("strips common html artifacts and preserves line breaks", () => {
		expect(stripHtmlArtifacts("<p>Hello&nbsp;<strong>world</strong><br>next</p>")).toBe(
			"Hello world\nnext",
		);
	});

	it("restores protected markdown segments even if the text contains token-like strings", () => {
		const input =
			"Literal __CLEAN_PASTE_TOKEN_ marker\n\n```ts\nconst value = `code`;\n```";
		const protectedText = protectMarkdownSegments(input);
		expect(restoreMarkdownSegments(protectedText.text, protectedText.tokens, protectedText.tokenPrefix)).toBe(
			input,
		);
	});

	it("preserves original bullet markers when normalization is disabled", () => {
		expect(fixListSpacing("•   one\n*   two", false)).toBe("• one\n* two");
	});

	it("does not false-positive on bold text or numbers without spaces", () => {
		expect(fixListSpacing("**bold text**", true)).toBe("**bold text**");
		expect(fixListSpacing("1.23", true)).toBe("1.23");
	});

	it("handles empty bullet and numbered items properly", () => {
		expect(fixListSpacing("-", true)).toBe("-");
		expect(fixListSpacing("1.", true)).toBe("1.");
	});
});
