# Hatsune Miku editor themes

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?branch=main&label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Vadim-Khristenko/HatsuneMikuEditorTheme?label=release&labelColor=0d0e1a&color=ff6e8a&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/releases)
[![License](https://img.shields.io/github/license/Vadim-Khristenko/HatsuneMikuEditorTheme?label=license&labelColor=0d0e1a&color=86a8ff&style=for-the-badge)](LICENSE)

I wanted a Miku theme that feels right in everyday coding. Not too flashy, not washed out. It grew into something bigger: any app I use, in a Miku-like style. Eight looks, editors, browsers, Telegram and Spotify, one palette. That is the whole idea here.

This repo holds all of them together. One palette is the source of truth and every port is generated from it, so a color never drifts between apps. One MIT license covers everything, no separate fine print per app.

[Русская версия](README.ru.md)

## Download

Everything ready to install lives on the [`themes` branch](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/tree/themes): one folder per app, direct download links, install steps. Every release rebuilds it, so the links always give the newest build.

On Telegram you can skip files altogether. One link works on Android and Desktop, and the theme updates itself with every release:

| | Dark | Light |
|---|---|---|
| Hatsune Miku | [HatsuneMikuEditorDark](https://t.me/addtheme/HatsuneMikuEditorDark) | [HatsuneMikuEditorLight](https://t.me/addtheme/HatsuneMikuEditorLight) |
| Sakura Miku | [SakuraMikuEditorDark](https://t.me/addtheme/SakuraMikuEditorDark) | [SakuraMikuEditorLight](https://t.me/addtheme/SakuraMikuEditorLight) |
| Snow Miku | [SnowMikuEditorDark](https://t.me/addtheme/SnowMikuEditorDark) | [SnowMikuEditorLight](https://t.me/addtheme/SnowMikuEditorLight) |
| Kasane Teto | [KasaneTetoEditorDark](https://t.me/addtheme/KasaneTetoEditorDark) | [KasaneTetoEditorLight](https://t.me/addtheme/KasaneTetoEditorLight) |

## What you get

I built this around a single palette. Every port grows from it: VS Code, Zed, JetBrains, Neovim, Sublime, Notepad++, the browser, Telegram and Spotify. Same colors, same intent.

Eight looks:

- Hatsune Miku Dark `#0d0e1a` with `#39c5bb`. My daily driver.
- Hatsune Miku Light `#f0fafa` with `#007a72`. Easier on bright rooms.
- Sakura Miku Dark `#130d14` with `#e87ea1`.
- Sakura Miku Light `#fff5f8` with `#cc4477`.
- Snow Miku Dark `#031121` with `#95caed`. Ice blue on a winter night.
- Snow Miku Light `#f5faff` with `#05598b`.
- Kasane Teto Dark `#160e0e` with `#da646a`. Her drill red on warm black.
- Kasane Teto Light `#fff7f6` with `#c13c51`.

Snow Miku and Kasane Teto start from colors sampled off official art. The syntax colors of every look carry as much color as their hue holds without losing contrast: at least 4.5:1 on light backgrounds, up to 7:1 on dark ones. I check it with `tools/check-themes.mjs` and the palette tests, not by eye alone.

How the palette becomes every port is in [palette/README.md](palette/README.md): edit a template, run `bun run build:palette`, and the change lands in every look of every app.

Tooling is simple. Bun workspaces, packaging in TypeScript with `archiver`, validation in `tools/validate.ts`. I tried to keep it boring and fast.

CI runs on every push. Tag `v*` builds a release with all artifacts.

## Editors

| Editor | Folder | File | How to install |
|---|---|---|---|
| VS Code | `vsc/` | `dist/hatsune-miku-vsc-*.vsix` | Install from VSIX or `bun run package:vsc` |
| Zed | `zed/` | `dist/zed-*.zip` | Unpack the zip, then Zed → Install Dev Extension and pick the folder. Marketplace is coming, I am working on it. |
| JetBrains | `jetbrains/` | `dist/jetbrains-*.zip` | Settings → Plugins → Install Plugin from Disk. Comes with a wallpaper: Settings → Appearance & Behavior → Hatsune Miku |
| Neovim | `neovim/` | `dist/neovim-*.zip` | Copy to `~/.config/nvim/colors/`, then `:colorscheme hatsune-miku` (or `snow-miku`, `kasane-teto`, with `-light` for the light looks) |
| Sublime Text | `sublime/` | `dist/sublime-*.zip` | Preferences → Color Scheme |
| Notepad++ | `notepadpp/` | `dist/notepadpp-*.zip` | Settings → Import → Import style theme(s) |

Each folder is distributed under the same MIT license. See root `LICENSE`. Nothing extra.

## Browsers

The palette also lives in the browser now: a new tab page with four layouts (Stage, Score, Bento, Zen), widgets, Helium style `!bangs` and Russian, English and Chinese. Details in `browser/README.md`.

| Browser | Folder | File | How to install |
|---|---|---|---|
| Chrome, Helium, any Chromium | `browser/` | `dist/hatsune-miku-editor-chromium-*.zip` | Unpack, `chrome://extensions` → Load unpacked |
| Chromium frame colors | `browser/` | `dist/hatsune-miku-colorful-browser-*.zip` | One per look, Load unpacked |
| Firefox | `browser/` | `dist/hatsune-miku-editor-firefox-*.zip` | `about:debugging` → Load Temporary Add-on |
| Zen | `browser/zen/` | `dist/hatsune-miku-zen-mod-*.zip` | See `browser/zen/readme.md` |

Build them with `bun run build:browser`.

## Telegram

Chats get the palette too. Every color key Telegram has gets a value: 812 on Android, 586 on Desktop, so nothing falls back to the stock blue. The chat background is the drawn Miku art from the JetBrains plugin, painted in the colors of each look.

| App | File | How to install |
|---|---|---|
| Telegram for Android | `dist/*.attheme` | Send it to Saved Messages, tap it, Apply |
| Telegram Desktop | `dist/*.tdesktop-theme` | Open the file in Telegram, Apply |

The cloud themes from [Download](#download) are the same files, kept in sync by [telegram-theme-action](https://github.com/Vadim-Khristenko/telegram-theme-action) on every release; the list is `tools/telegram/cloud.yml`.

Build them with `bun run build:telegram`. The generator lives in `tools/telegram/`. It starts from Telegram's own day and night themes and recolors them, so the layout of light and shade stays Telegram's while every color comes from the palette. When Telegram adds keys, `bun run sync:telegram` takes a fresh snapshot of them.

## Spotify

Spotify gets the palette through [Spicetify](https://spicetify.app): eight color schemes in `spicetify/HatsuneMiku/color.ini`, generated from the palette, and one `user.css` that takes every color from the picked scheme. Teal glows on play and progress, the look's second color on likes and shuffle, and Spotify's own surfaces stay in the palette instead of picking up album art tints.

| App | File | How to install |
|---|---|---|
| Spotify | `dist/spicetify-*.zip` | Unpack into the Spicetify Themes folder, `spicetify config current_theme HatsuneMiku color_scheme MikuDark`, `spicetify apply`. Details and fixes in `spicetify/README.md` |

## How to develop

```bash
bun install --frozen-lockfile
bun run build:palette   # write every port of every look from palette/templates
bun run check           # palette drift, contrast, JSON, tests
bun run validate        # check plus dry package
bun run package:all
```

Scripts live in `tools/package.ts` and `tools/validate.ts`. No hidden shell, you can read them.

## Releases

Every port keeps its own version in `release.json`. `bun run release:plan` shows which ports changed since the last tag, `bun run release:prepare` bumps only those and writes their changelogs from the commits. A tag like `v0.3.0` then builds every package for the GitHub release, so the full set is always there, but only the changed ports reach the stores: Open VSX with `OVSX_TOKEN`, JetBrains with `JB_TOKEN`, and Firefox on addons.mozilla.org with `FIREFOX_JWT_USER` and `FIREFOX_JWT_TOKEN`, where the changelog becomes the release notes and the signed `.xpi` comes back into the release. Details in `CONTRIBUTING.md`. VS Marketplace is skipped for now, my Microsoft account hit a snag.

## Contributing

See `CONTRIBUTING.md`. Change colors in `palette/templates` or `tools/palette`, never in the generated port files, then run `bun run build:palette` and `bun run validate` before a PR. Small, focused changes are easier to review.

## Author

Vadim Khristenko · `vadim@vai-rice.space` · MIT · https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme
