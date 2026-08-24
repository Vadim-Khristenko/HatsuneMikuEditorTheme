# Hatsune Miku Theme for JetBrains IDEs

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)

JetBrains port (IntelliJ IDEA, PyCharm, WebStorm, CLion, Rider, etc.) — 4 variants. Part of [HatsuneMikuEditorTheme](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme) monorepo. All themes are distributed under the **same MIT license** (root `LICENSE`).

## Variants

- **Miku Dark** `#0d0e1a` / `#39c5bb`
- **Miku Light** `#f0fafa` / `#007a72`
- **Sakura Dark** `#130d14` / `#e87ea1`
- **Sakura Light** `#fff5f8` / `#cc4477`

## Installation

1. Build: `bun run package:jetbrains` → `dist/jetbrains-*.zip`
2. IDE → Settings → Plugins → ⚙ → Install Plugin from Disk → select zip
3. Appearance → Theme → pick Hatsune Miku variant

Marketplace publishing via `JB_TOKEN` is optional (free, `plugins.jetbrains.com`).

## Development

```bash
bun run check
bun tools/package.ts jetbrains
```

## Author

Vadim Khristenko — `vadim@vai-rice.space` — MIT
