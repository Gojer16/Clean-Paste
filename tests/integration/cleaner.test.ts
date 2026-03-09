import { describe, expect, it } from "vitest";
import { htmlToMarkdown } from "../../src/clipboard";
import { cleanCurrentNoteText, cleanPastedText } from "../../src/cleaner";
import { DEFAULT_SETTINGS } from "../../src/settings-data";

describe("cleaner integration", () => {
	it("preserves code fences while cleaning surrounding markdown", () => {
		const input = "#Title\n\n-   one\n\n```js\nconst x = 1;\n```\n";
		expect(cleanPastedText(input, DEFAULT_SETTINGS)).toBe(
			"# Title\n\n- one\n\n```js\nconst x = 1;\n```",
		);
	});

	it("skips YAML frontmatter when cleaning the current note", () => {
		const input = "---\ntitle: #NoTouch\n---\n#Title\n\n-   one";
		expect(cleanCurrentNoteText(input, DEFAULT_SETTINGS)).toBe(
			"---\ntitle: #NoTouch\n---\n# Title\n\n- one",
		);
	});

	it("converts common clipboard html into markdown before cleaning", () => {
		const html = "<h1>Title</h1><ul><li>One</li><li><strong>Two</strong></li></ul>";
		const markdown = cleanPastedText(htmlToMarkdown(html), DEFAULT_SETTINGS);
		expect(markdown).toContain("# Title");
		expect(markdown).toContain("- One");
		expect(markdown).toContain("- **Two**");
	});

	it("handles windows frontmatter line endings without touching the frontmatter", () => {
		const input = "---\r\ntitle: Keep\r\n---\r\n#Title\r\n\r\n-   one";
		expect(cleanCurrentNoteText(input, DEFAULT_SETTINGS)).toBe(
			"---\r\ntitle: Keep\r\n---\r\n# Title\n\n- one",
		);
	});

	it("keeps html tags when html stripping is disabled", () => {
		expect(
			cleanPastedText("<div>#Title</div>", {
				...DEFAULT_SETTINGS,
				stripHtmlArtifacts: false,
			}),
		).toBe("<div>#Title</div>");
	});

	it("preserves extra paragraph spacing when the setting is enabled", () => {
		expect(
			cleanPastedText("First\n\n\nSecond", {
				...DEFAULT_SETTINGS,
				preserveExtraBlankLinesInParagraphs: true,
			}),
		).toBe("First\n\n\nSecond");
	});
});
