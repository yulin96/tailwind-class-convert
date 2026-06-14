# Changelog

All notable changes to Tailwind Class Convert will be documented in this file.

## [0.0.1] - 2026-06-14

### Added

- Automatic Tailwind CSS workspace detection.
- Conversion on save.
- Manual conversion for the current file or selected text.
- A status bar switch for enabling or disabling conversion in the current workspace.
- Support for complete shorthand class tokens, including spacing, position, gap, size, and rounded classes.
- Settings for enable mode, conversion on save, status bar visibility, and supported file types.
- English and Simplified Chinese localization.

### Improved

- Prevented partial matches such as `hellow100` from being converted.
- Prevented already converted and variant classes from being changed.
- Reduced workspace scanning when automatic detection is not needed.
- Skipped oversized or unreadable files during Tailwind CSS detection.
- Ensured repeated conversion produces stable results without save loops.
- Updated extension documentation and usage examples.
