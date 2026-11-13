# Changelog: MangaDex

Every release of this port, newest first. Written from the commits that changed it.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [SemVer](https://semver.org/).

## [Unreleased]

## [0.5.0] - 2026-11-13

### Added

- Hatsune Miku themes for MangaDex as share links
  - tools/mangadex/mangadex.ts reads and writes that format byte for byte with the site, and turns every look into a theme: neutrals sit where MangaDex puts its own, measured from background to text, colors come from the palette.
  - tools/mangadex/build.ts writes mangadex/README.md with one link per look; `bun run check` fails when the links fall behind the palette.
- MangaDex in the hub, with a step by step guide to keep a theme
  - MangaDex is a port of its own: its version, its changelog, its row in the hub and in the release notes, with the eight theme links right in the row.
  - A link only puts the theme on for now. mangadex/README.md shows how to keep it, avatar, Theme, the gear next to Custom, Save theme, with screenshots for a computer and a phone.
  - MangaDex in the issue form's app list, and in both READMEs.
