# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-03-13

### Fixed
- Fixed an issue where bold text spanning across multiple lines would incorrectly be converted to a bullet list due to zero-space matching in the list parser.
- Updated the Clean Paste settings page UI to use the native `Setting(...).setHeading()` API for consistent formatting and sentence casing ("Clean paste settings").

## [1.0.0] - Initial Release

### Added
- Created the core Obsidian plugin to clean messy pasted text from AI chats, websites, and docs.
- Commands to "Clean selected text", "Paste clean from clipboard", and "Clean current note".
- Automatic formatting improvements including:
  - Collapsing excessive blank lines
  - Normalizing heading and list spacing
  - Fixing inconsistent list indentation
  - Replacing smart quotes and unicode spaces
  - Removing common HTML artifacts
- Plugin settings to toggle formatting features like HTML artifact stripping and blank line preservation.
