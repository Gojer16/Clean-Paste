const FENCED_CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;
const INLINE_CODE_PATTERN = /`[^`\n]+`/g;
const TOKEN_PREFIX = "__CLEAN_PASTE_TOKEN_";
const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/gi;
const HTML_BREAK_PATTERN = /<br\s*\/?>/gi;
const HTML_ENTITY_MAP: Record<string, string> = {
	"&nbsp;": " ",
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
};

type ProtectedSegments = {
	tokenPrefix: string;
	text: string;
	tokens: string[];
};

export function protectMarkdownSegments(text: string): ProtectedSegments {
	const tokens: string[] = [];
	const tokenPrefix = createUniqueTokenPrefix(text);
	let protectedText = text;

	for (const pattern of [FENCED_CODE_BLOCK_PATTERN, INLINE_CODE_PATTERN]) {
		protectedText = protectedText.replace(pattern, (match) => {
			const token = `${tokenPrefix}${tokens.length}__`;
			tokens.push(match);
			return token;
		});
	}

	return { tokenPrefix, text: protectedText, tokens };
}

export function restoreMarkdownSegments(
	text: string,
	tokens: string[],
	tokenPrefix = TOKEN_PREFIX,
): string {
	return tokens.reduce(
		(current, value, index) => current.replace(`${tokenPrefix}${index}__`, value),
		text,
	);
}

export function normalizeLineEndings(text: string): string {
	return text.replace(/\r\n?/g, "\n");
}

export function stripTrailingSpaces(text: string): string {
	return text
		.split("\n")
		.map((line) => line.replace(/[ \t]+$/g, ""))
		.join("\n")
		.trim();
}

export function stripHtmlArtifacts(text: string): string {
	let cleaned = text.replace(HTML_BREAK_PATTERN, "\n");

	for (const [entity, value] of Object.entries(HTML_ENTITY_MAP)) {
		cleaned = cleaned.split(entity).join(value);
	}

	return cleaned.replace(HTML_TAG_PATTERN, "");
}

export function normalizeWhitespace(text: string): string {
	return text
		.replace(/\u00A0|\u2007|\u202F/g, " ")
		.replace(/[\u200B-\u200D\uFEFF]/g, "")
		.replace(/[“”]/g, '"')
		.replace(/[‘’]/g, "'")
		.replace(/[ \t]{2,}/g, " ");
}

export function fixHeadingSpacing(text: string): string {
	return text
		.split("\n")
		.map((line) => {
			const match = line.match(/^(\s{0,3}#{1,6})([^\s#].*)$/);
			if (!match) {
				return line;
			}

			return `${match[1]} ${match[2].trim()}`;
		})
		.join("\n");
}

export function fixListSpacing(text: string, normalizeBulletsToDash: boolean): string {
	const lines = text.split("\n");
	const cleaned: string[] = [];

	for (const line of lines) {
		const bulletMatch = line.match(/^(\s*)([-*+•◦▪●])(?:\s+(.*))?$/);
		if (bulletMatch) {
			const indent = normalizeIndentation(bulletMatch[1]);
			const bullet = normalizeBulletsToDash ? "-" : bulletMatch[2];
			cleaned.push(`${indent}${bullet} ${(bulletMatch[3] ?? "").trim()}`.trimEnd());
			continue;
		}

		const numberedMatch = line.match(/^(\s*)(\d+)([.)])(?:\s+(.*))?$/);
		if (numberedMatch) {
			const indent = normalizeIndentation(numberedMatch[1]);
			cleaned.push(
				`${indent}${numberedMatch[2]}. ${(numberedMatch[4] ?? "").trim()}`.trimEnd(),
			);
			continue;
		}

		cleaned.push(line);
	}

	return removeBlankLinesInsideLists(cleaned).join("\n");
}

export function collapseExcessBlankLines(
	text: string,
	preserveExtraBlankLinesInParagraphs: boolean,
): string {
	const maxBlankLines = preserveExtraBlankLinesInParagraphs ? 2 : 1;
	const lines = text.split("\n");
	const cleaned: string[] = [];
	let blankRun = 0;

	for (const line of lines) {
		if (line.trim() === "") {
			blankRun += 1;
			if (blankRun <= maxBlankLines) {
				cleaned.push("");
			}
			continue;
		}

		blankRun = 0;
		cleaned.push(line);
	}

	return cleaned.join("\n").trim();
}

function normalizeIndentation(indent: string): string {
	const spaces = indent.replace(/\t/g, "  ").length;
	const normalizedWidth = Math.floor(spaces / 2) * 2;
	return " ".repeat(normalizedWidth);
}

function removeBlankLinesInsideLists(lines: string[]): string[] {
	const cleaned: string[] = [];

	for (let index = 0; index < lines.length; index += 1) {
		const current = lines[index];
		const previous = cleaned[cleaned.length - 1];
		const next = lines[index + 1];

		if (
			current.trim() === "" &&
			isListItem(previous) &&
			isListItem(next)
		) {
			continue;
		}

		cleaned.push(current);
	}

	return cleaned;
}

function isListItem(line: string | undefined): boolean {
	if (!line) {
		return false;
	}

	return /^(\s*)([-*+•◦▪●]|\d+[.)])\s+/.test(line);
}

function createUniqueTokenPrefix(text: string): string {
	let tokenPrefix = TOKEN_PREFIX;

	while (text.includes(tokenPrefix)) {
		tokenPrefix = `_${tokenPrefix}`;
	}

	return tokenPrefix;
}
