# Hatsune Miku Theme for Zed

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)

Zed port: 8 variants (Miku, Sakura, Snow Miku and Kasane Teto, each in Dark and Light). Part of [HatsuneMikuEditorTheme](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme) monorepo. All themes are distributed under the **same MIT license** (root `LICENSE`).

## Variants

- **Miku Dark** `#0d0e1a` / `#39c5bb`
- **Miku Light** `#f0fafa` / `#007a72`
- **Sakura Dark** `#130d14` / `#e87ea1`
- **Sakura Light** `#fff5f8` / `#cc4477`
- **Snow Miku Dark** `#031121` / `#95caed`
- **Snow Miku Light** `#f5faff` / `#05598b`
- **Kasane Teto Dark** `#160e0e` / `#da646a`
- **Kasane Teto Light** `#fff7f6` / `#c13c51`

## Installation

1. Download `dist/zed-*.zip` from Releases and unpack it, or build locally: `bun run package:zed`
2. Zed → Extensions → Install Dev Extension → select the unpacked `zed/` folder
3. Settings → Theme → pick any variant

I will try to publish this to the Zed extensions marketplace soon, so you can install it with one click. For now dev extension is the way.

## Development

```bash
bun run check
bun tools/package.ts zed
```

Every port is generated from one palette by `bun run build:palette` (tools/palette/build.ts), out of the templates in `palette/templates`. Theme files are checked by `tools/check-themes.mjs`.

## Author

Vadim Khristenko, `vadim@vai-rice.space`, MIT
