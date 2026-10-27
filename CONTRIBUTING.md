# Contributing

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)

Thanks for contributing to Hatsune Miku Editor Themes!

## Quick Start

```bash
bun install --frozen-lockfile
bun run check      # validate palette & JSON
bun run validate   # check + dry package (archiver)
bun run package:all
```

## Palette Contract

Canonical palette is `vsc/themes/mikuV1-dark.json` (and 3 variants). All ports must use exact hex values from the spec `docs/superpowers/specs/2026-08-24-editor-themes-design.md` (ignored in git, see local docs). Terminal ANSI taken verbatim from VSC.

## Adding a Theme Variant

1. Edit `vsc/themes/*.json` and `zed/themes/*.json`
2. Run `bun run check` — must be `ALL PASS`
3. Update generators in `tools/` if adding new editor
4. Keep JSON formatting (2 spaces), describe visual intent in PR

## Releasing

Every port has its own version in `release.json`, and a release bumps only the ports that changed.

1. Write [Conventional Commits](https://www.conventionalcommits.org/) in English: `feat(browser): ...`, `fix(telegram): ...`. A port changes when a commit touches its paths (see `tools/release/ports.ts`); `feat` bumps minor, `fix`, `perf`, `refactor`, `style`, `ui` and `docs` bump patch, `chore`, `ci`, `test` and `release` ship nothing. Bullets in the commit body become the details of the changelog entry, so write them for users.
2. `bun run release:plan` shows what the next release bumps and why.
3. `bun run release:prepare` bumps those versions in every file of the port, writes the section of each port's `CHANGELOG.md` (anything waiting under `[Unreleased]` joins it) and the JetBrains change notes.
4. Review, commit as `release: X.Y.Z`, tag `vX.Y.Z`, push the tag.

CI builds every port for the GitHub release, but publishes to Open VSX, JetBrains Marketplace and addons.mozilla.org only the ports whose version moved. The release notes come from the changelogs. Firefox goes to the listed channel with the changelog as release notes and its source code; once Mozilla signs it, the signed `.xpi` joins the release. Secrets: `OVSX_TOKEN`, `JB_TOKEN`, `FIREFOX_JWT_USER` and `FIREFOX_JWT_TOKEN` (the AMO API key and secret).

## Pull Request

- Title: `feat(vsc): add ...` or `fix(zed): ...`
- Include screenshots for visual changes
- Ensure `bun run validate` passes

## Author

Vadim Khristenko — `vadim@vai-rice.space`
