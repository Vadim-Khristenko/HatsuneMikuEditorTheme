# Hatsune Miku Theme for JetBrains IDEs

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)

JetBrains port (IntelliJ IDEA, PyCharm, WebStorm, CLion, Rider and the rest), four looks and a wallpaper. Part of the [HatsuneMikuEditorTheme](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme) monorepo, MIT like everything there (root `LICENSE`).

Works on 2024.2 and newer.

## Variants

- **Miku Dark** `#0d0e1a` / `#39c5bb`
- **Miku Light** `#f0fafa` / `#007a72`
- **Sakura Dark** `#130d14` / `#e87ea1`
- **Sakura Light** `#fff5f8` / `#cc4477`

## Wallpaper

**Settings | Appearance & Behavior | Hatsune Miku**

| Setting | What it does |
| --- | --- |
| Wallpaper | None, the drawn Miku art, or your own picture (PNG, JPEG, GIF, BMP) |
| Show behind | The editor, the whole window, or both |
| Opacity | 0 to 100 %, 12 is a quiet default that keeps code readable |
| Fill and position | Scale to cover, tile, or as is, anchored to any corner or side |

The drawn art is the one from the browser new tab: a sun, two twin tails and a thin third one, a staff with notes. It is painted for each of the four themes in its own colors and is drawn again when you switch themes. Under a theme that is not Hatsune Miku the art steps aside, your own picture stays.

**View | Appearance | Hatsune Miku Wallpaper** turns it on and off from the menu or Find Action.

The plugin uses the IDE's own background slots, the same ones as View | Appearance | Set Background Image, so the IDE does the painting. A picture you set by hand in that dialog is never cleared by the plugin.

## Installation

1. Build: `bun run package:jetbrains`, the result is `dist/jetbrains-*.zip`
2. IDE: Settings, Plugins, the gear, Install Plugin from Disk, select the zip
3. Appearance, Theme: pick a Hatsune Miku variant

Marketplace publishing via `JB_TOKEN` is optional (free, `plugins.jetbrains.com`).

## Development

```bash
bun run check
bun tools/package.ts jetbrains
```

Java sources live in `src/main/java`, compiled for Java 21 against the platform in `gradle.properties`. The art accents must equal the new tab's; `bun test browser` checks that.

## Author

Vadim Khristenko, `vadim@vai-rice.space`, MIT
