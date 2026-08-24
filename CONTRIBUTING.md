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

## Pull Request

- Title: `feat(vsc): add ...` or `fix(zed): ...`
- Include screenshots for visual changes
- Ensure `bun run validate` passes

## Author

Vadim Khristenko — `vadim@vai-rice.space`
