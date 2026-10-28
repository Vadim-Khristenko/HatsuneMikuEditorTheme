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

The palette lives in `tools/palette` and `palette/`; `palette/README.md` explains where every color comes from. `palette/templates` holds the hand-written v1 files of the four original looks, and `bun run build:palette` writes every port of all eight looks from them: VS Code, Zed, Neovim, Sublime Text, Notepad++, JetBrains (`tools/jb-palette.json`, then the JetBrains generators), the browser palettes, Telegram and the Spicetify schemes. Generated files are never edited by hand: `bun run check` fails when one differs from what the templates give.

## Changing Colors or Adding a Look

1. Edit a template in `palette/templates`, or the rules in `tools/palette/looks.ts` (a new look is one entry in `LOOKS` plus its names in `tools/palette/names.ts`).
2. Run `bun run build:palette`, then `bun run check`: it must end in `ALL PASS` and green tests.
3. A new look also needs a Telegram cloud theme in `tools/telegram/cloud.yml`; check the name is free at `t.me/addtheme/<name>` first.
4. Describe the visual intent in the PR, a screenshot helps.

## Releasing

Every port has its own version in `release.json`, and a release bumps only the ports that changed.

1. Write [Conventional Commits](https://www.conventionalcommits.org/) in English: `feat(browser): ...`, `fix(telegram): ...`. A port changes when a commit touches its paths (see `tools/release/ports.ts`); `feat` bumps minor, `fix`, `perf`, `refactor`, `style`, `ui` and `docs` bump patch, `chore`, `ci`, `test` and `release` ship nothing. Bullets in the commit body become the details of the changelog entry, so write them for users.
2. `bun run release:plan` shows what the next release bumps and why.
3. `bun run release:prepare` (or `--version X.Y.Z` to put every port on one version) bumps those versions in every file of the port, writes the section of each port's `CHANGELOG.md` (anything waiting under `[Unreleased]` joins it) and the JetBrains change notes.
4. Review, commit as `release: X.Y.Z`, tag `vX.Y.Z`, push the tag.

CI builds every port for the GitHub release, but publishes to Open VSX, JetBrains Marketplace and addons.mozilla.org only the ports whose version moved. The release notes come from the changelogs. Firefox goes to the listed channel with the changelog as release notes and its source code; once Mozilla signs it, the signed `.xpi` joins the release. Secrets: `OVSX_TOKEN`, `JB_TOKEN`, `FIREFOX_JWT_USER` and `FIREFOX_JWT_TOKEN` (the AMO API key and secret).

## Pull Request

- Title: `feat(vsc): add ...` or `fix(zed): ...`
- Include screenshots for visual changes
- Ensure `bun run validate` passes

## Author

Vadim Khristenko · `vadim@vai-rice.space`
