declare module "turndown" {
	type TurndownPlugin = (service: TurndownService) => void;

	interface TurndownOptions {
		bulletListMarker?: "-" | "*" | "+";
		codeBlockStyle?: "indented" | "fenced";
		emDelimiter?: "_" | "*";
		headingStyle?: "setext" | "atx";
		strongDelimiter?: "__" | "**";
	}

	export default class TurndownService {
		constructor(options?: TurndownOptions);
		turndown(input: string): string;
		use(plugin: TurndownPlugin | TurndownPlugin[]): void;
	}
}

declare module "turndown-plugin-gfm" {
	import type TurndownService from "turndown";

	export function gfm(service: TurndownService): void;
}
