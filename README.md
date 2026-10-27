# Hatsune Miku editor themes

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?branch=main&label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Vadim-Khristenko/HatsuneMikuEditorTheme?label=release&labelColor=0d0e1a&color=ff6e8a&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/releases)
[![License](https://img.shields.io/github/license/Vadim-Khristenko/HatsuneMikuEditorTheme?label=license&labelColor=0d0e1a&color=86a8ff&style=for-the-badge)](LICENSE)

I wanted a Miku theme that feels right in everyday coding. Not too flashy, not washed out. Four variants, six editors, one palette. That is the whole idea here.

This repo holds all of them together. I keep the VS Code themes as the source of truth, the rest follow. One MIT license covers everything, no separate fine print per editor.

[Русская версия](README.ru.md)

## What you get

I built this around a single palette contract. Six ports grow from it. VS Code, Zed, JetBrains, Neovim, Sublime, Notepad++. Same colors, same intent.

Four looks:

- Miku Dark `#0d0e1a` with `#39c5bb`. My daily driver.
- Miku Light `#f0fafa` with `#007a72`. Easier on bright rooms.
- Sakura Dark `#130d14` with `#e87ea1`.
- Sakura Light `#fff5f8` with `#cc4477`.

Contrast is tuned so you can read for hours. I check it with `tools/check-themes.mjs`, not by eye alone.

Tooling is simple. Bun workspaces, packaging in TypeScript with `archiver`, validation in `tools/validate.ts`. I tried to keep it boring and fast.

CI runs on every push. Tag `v*` builds a release with all artifacts.

## Editors

| Editor | Folder | File | How to install |
|---|---|---|---|
| VS Code | `vsc/` | `dist/hatsune-miku-vsc-*.vsix` | Install from VSIX or `bun run package:vsc` |
| Zed | `zed/` | `dist/zed-*.zip` | Unpack the zip, then Zed → Install Dev Extension and pick the folder. Marketplace is coming, I am working on it. |
| JetBrains | `jetbrains/` | `dist/jetbrains-*.zip` | Settings → Plugins → Install Plugin from Disk. Comes with a wallpaper: Settings → Appearance & Behavior → Hatsune Miku |
| Neovim | `neovim/` | `dist/neovim-*.zip` | Copy to `~/.config/nvim/colors/`, then `:colorscheme hatsune-miku` |
| Sublime Text | `sublime/` | `dist/sublime-*.zip` | Preferences → Color Scheme |
| Notepad++ | `notepadpp/` | `dist/notepadpp-*.zip` | Settings → Import → Import style theme(s) |

Each folder is distributed under the same MIT license. See root `LICENSE`. Nothing extra.

## Browsers

The palette also lives in the browser now: a new tab page with four layouts (Stage, Score, Bento, Zen), widgets, Helium style `!bangs` and Russian, English and Chinese. Details in `browser/README.md`.

| Browser | Folder | File | How to install |
|---|---|---|---|
| Chrome, Helium, any Chromium | `browser/` | `dist/hatsune-miku-editor-chromium-*.zip` | Unpack, `chrome://extensions` → Load unpacked |
| Chromium frame colors | `browser/` | `dist/hatsune-miku-colorful-browser-*.zip` | One per variant, Load unpacked |
| Firefox | `browser/` | `dist/hatsune-miku-editor-firefox-*.zip` | `about:debugging` → Load Temporary Add-on |
| Zen | `browser/zen/` | `dist/hatsune-miku-zen-mod-*.zip` | See `browser/zen/readme.md` |

Build them with `bun run build:browser`.

## Telegram

Chats get the palette too. Every color key Telegram has gets a value: 812 on Android, 586 on Desktop, so nothing falls back to the stock blue. The chat background is the drawn Miku art from the JetBrains plugin, painted in the colors of each variant.

| App | File | How to install |
|---|---|---|
| Telegram for Android | `dist/HatsuneMiku*.attheme` | Send it to Saved Messages, tap it, Apply |
| Telegram Desktop | `dist/HatsuneMiku*.tdesktop-theme` | Open the file in Telegram, Apply |

Build them with `bun run build:telegram`. The generator lives in `tools/telegram/`. It starts from Telegram's own day and night themes and recolors them, so the layout of light and shade stays Telegram's while every color comes from the palette. When Telegram adds keys, `bun run sync:telegram` takes a fresh snapshot of them.

## How to develop

```bash
bun install --frozen-lockfile
bun run check      # palette and JSON
bun run validate   # check plus dry package
bun run package:all
```

Scripts live in `tools/package.ts` and `tools/validate.ts`. No hidden shell, you can read them.

## Releases

Every port keeps its own version in `release.json`. `bun run release:plan` shows which ports changed since the last tag, `bun run release:prepare` bumps only those and writes their changelogs from the commits. A tag like `v0.3.0` then builds every package for the GitHub release, so the full set is always there, but only the changed ports reach the stores: Open VSX with `OVSX_TOKEN`, JetBrains with `JB_TOKEN`, and Firefox on addons.mozilla.org with `FIREFOX_JWT_USER` and `FIREFOX_JWT_TOKEN`, where the changelog becomes the release notes and the signed `.xpi` comes back into the release. Details in `CONTRIBUTING.md`. VS Marketplace is skipped for now, my Microsoft account hit a snag.

## Contributing

See `CONTRIBUTING.md`. Keep `vsc/themes/*.json` canonical and run `bun run validate` before a PR. Small, focused changes are easier to review.

## Author

Vadim Khristenko — `vadim@vai-rice.space` — MIT — https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme
