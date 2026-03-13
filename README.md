# Clean Paste

Clean messy pasted text from AI chats, websites, and docs before it lands in your note.

## Commands

- `Clean selected text`
- `Paste clean from clipboard`
- `Clean current note`

The plugin also adds a left ribbon icon for quickly cleaning the current note.

## What it cleans

- excessive blank lines
- heading spacing
- bullet list spacing
- numbered list spacing
- inconsistent list indentation
- smart quotes and odd unicode spaces
- repeated spaces
- common HTML artifacts

Code fences and inline code are protected during cleanup so they are restored unchanged.
For clipboard cleanup, the plugin prefers `text/markdown`, falls back to converted `text/html`, and only uses plain text as the last fallback.

## Settings

- `Preserve extra blank lines in paragraphs`
- `Normalize bullets to -`
- `Strip HTML artifacts`

## Development

```bash
npm install
npm run dev
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and release notes.

## Release notes

- `manifest.json` and `versions.json` should always agree on the minimum supported Obsidian version.
- Release assets should include `main.js`, `manifest.json`, and `styles.css`.
