# Hatsune Miku Theme for Sublime Text

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)

Sublime Text port (Build 3152+, `is_light` 4075+) — 4 color schemes. Part of [HatsuneMikuEditorTheme](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme) monorepo. All themes are distributed under the **same MIT license** (root `LICENSE`).

## Variants

- Hatsune Miku Dark
- Hatsune Miku Light (`is_light: true`)
- Hatsune Miku Sakura Dark
- Hatsune Miku Sakura Light (`is_light: true`)

Only editor colors are themed (no global UI chrome).

## Installation

1. Build: `bun run package:sublime` → `dist/sublime-*.zip`
2. Sublime → Preferences → Browse Packages → `User/` → copy `*.sublime-color-scheme`
3. Preferences → Color Scheme → User → pick variant

## Development

```bash
bun run check
bun tools/package.ts sublime
```

## Author

Vadim Khristenko — `vadim@vai-rice.space` — MIT
