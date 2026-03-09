export interface CleanPasteSettings {
	preserveExtraBlankLinesInParagraphs: boolean;
	normalizeBulletsToDash: boolean;
	stripHtmlArtifacts: boolean;
}

export const DEFAULT_SETTINGS: CleanPasteSettings = {
	preserveExtraBlankLinesInParagraphs: false,
	normalizeBulletsToDash: true,
	stripHtmlArtifacts: true,
};
