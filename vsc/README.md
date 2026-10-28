# Hatsune Miku Theme for VS Code

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-0.0.3-ffd580?style=for-the-badge&labelColor=0d0e1a)](package.json)

VS Code port of Hatsune Miku themes: 8 variants (Miku, Sakura, Snow Miku and Kasane Teto, each in Dark and Light). Part of the monorepo [HatsuneMikuEditorTheme](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme). All themes in this monorepo are distributed under the **same MIT license** (root `LICENSE`).

## Variants

- **Miku Dark** `#0d0e1a` / `#39c5bb`: teal on navy
- **Miku Light** `#f0fafa` / `#007a72`: light cyan
- **Sakura Dark** `#130d14` / `#e87ea1`
- **Sakura Light** `#fff5f8` / `#cc4477`
- **Snow Miku Dark** `#031121` / `#95caed`
- **Snow Miku Light** `#f5faff` / `#05598b`
- **Kasane Teto Dark** `#160e0e` / `#da646a`
- **Kasane Teto Light** `#fff7f6` / `#c13c51`

Palette: every look is generated from one palette by `bun run build:palette` (tools/palette/build.ts), out of the templates in `palette/templates`. Snow Miku colors were sampled from official Snow Miku key visuals, Kasane Teto colors from her official Synthesizer V art.

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

Vadim Khristenko, `vadim@vai-rice.space`, MIT
