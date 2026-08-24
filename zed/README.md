# Hatsune Miku Theme for Zed

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)

Zed port — 4 variants (Miku Dark/Light, Sakura Dark/Light). Part of [HatsuneMikuEditorTheme](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme) monorepo. All themes are distributed under the **same MIT license** (root `LICENSE`).

## Variants

- **Miku Dark** `#0d0e1a` / `#39c5bb`
- **Miku Light** `#f0fafa` / `#007a72`
- **Sakura Dark** `#130d14` / `#e87ea1`
- **Sakura Light** `#fff5f8` / `#cc4477`

## Installation

1. Download `dist/zed-*.zip` from Releases and unpack it, or build locally: `bun run package:zed`
2. Zed → Extensions → Install Dev Extension → select the unpacked `zed/` folder
3. Settings → Theme → pick Hatsune Miku variant

I will try to publish this to the Zed extensions marketplace soon, so you can install it with one click. For now dev extension is the way.

## Development

```bash
bun run check
bun tools/package.ts zed
```

Palette contract in `vsc/themes/*.json`, validated via `tools/check-themes.mjs`.

## Author

Vadim Khristenko — `vadim@vai-rice.space` — MIT
