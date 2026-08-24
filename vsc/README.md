# Hatsune Miku Theme for VS Code

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-0.0.3-ffd580?style=for-the-badge&labelColor=0d0e1a)](package.json)

VS Code port of Hatsune Miku themes — 4 variants (Miku Dark/Light, Sakura Dark/Light). Part of the monorepo [HatsuneMikuEditorTheme](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme). All themes in this monorepo are distributed under the **same MIT license** (root `LICENSE`).

## Variants

- **Miku Dark** `#0d0e1a` / `#39c5bb` — teal on navy
- **Miku Light** `#f0fafa` / `#007a72` — light cyan
- **Sakura Dark** `#130d14` / `#e87ea1`
- **Sakura Light** `#fff5f8` / `#cc4477`

Palette contract: `themes/mikuV1-dark.json` and siblings are canonical.

## Installation

1. Download `dist/hatsune-miku-vsc-*.vsix` from Releases or build locally:
   ```bash
   bun install
   bun run package:vsc
   ```
2. VS Code → Extensions → `...` → Install from VSIX → select file → reload.

Or copy `themes/*.json` into your own extension (requires `package.json` contributes).

## Development

```bash
bun run check    # palette + JSON
bun run package:vsc
```

## Author

Vadim Khristenko — `vadim@vai-rice.space` — MIT
