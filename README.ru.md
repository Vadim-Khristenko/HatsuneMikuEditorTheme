# Hatsune Miku — Темы для редакторов

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?branch=main&label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)
[![Релиз](https://img.shields.io/github/v/release/Vadim-Khristenko/HatsuneMikuEditorTheme?label=релиз&labelColor=0d0e1a&color=ff6e8a&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/releases)
[![Лицензия](https://img.shields.io/github/license/Vadim-Khristenko/HatsuneMikuEditorTheme?label=лицензия&labelColor=0d0e1a&color=86a8ff&style=for-the-badge)](LICENSE)
[![Версия](https://img.shields.io/badge/версия-0.0.3-ffd580?style=for-the-badge&labelColor=0d0e1a)](package.json)

Монорепозиторий тем Hatsune Miku — 4 варианта (Miku Dark/Light, Sakura Dark/Light) для 6 редакторов. Все темы распространяются под **единой лицензией MIT** и единым контрактом палитры (`vsc/themes/*.json` — канон). Никаких отдельных лицензий на редактор.

[English version](README.md)

## Особенности

- **Единая палитра** — один контракт, шесть портов: VS Code, Zed, JetBrains, Neovim, Sublime, Notepad++
- **Четыре варианта** с выверенным контрастом, валидация через `tools/check-themes.mjs`
- **Bun** — workspaces, упаковка на TypeScript (`tools/package.ts`, `archiver`), валидация `tools/validate.ts`
- **CI/CD** — `ci.yml` на каждый push, `release.yml` на тег `v*` с артефактами

## Варианты

- **Miku Dark** `#0d0e1a` / акцент `#39c5bb`
- **Miku Light** `#f0fafa` / акцент `#007a72`
- **Sakura Dark** `#130d14` / акцент `#e87ea1`
- **Sakura Light** `#fff5f8` / акцент `#cc4477`

## Редакторы

| Редактор | Папка | Артефакт | Установка |
|---|---|---|---|
| VS Code | `vsc/` | `dist/hatsune-miku-vsc-*.vsix` | Установить из VSIX |
| Zed | `zed/` | `dist/zed-*.zip` | Install Dev Extension |
| JetBrains | `jetbrains/` | `dist/jetbrains-*.zip` | Install Plugin from Disk |
| Neovim | `neovim/` | `dist/neovim-*.zip` | `:colorscheme hatsune-miku` |
| Sublime | `sublime/` | `dist/sublime-*.zip` | Preferences → Color Scheme |
| Notepad++ | `notepadpp/` | `dist/notepadpp-*.zip` | Опции → Импорт → Импортировать тему |

Каждая тема в каждой папке — под **одной лицензией MIT** (файл `LICENSE` в корне).

## Разработка

```bash
bun install --frozen-lockfile
bun run check
bun run validate
bun run package:all
```

Скрипты упаковки — на TypeScript, без хардкода shell.

## Релизы

Тег `v*` → GitHub Release с 6 артефактами. Публикация в Open VSX (`OVSX_TOKEN`) и JetBrains (`JB_TOKEN`) по секретам; VS Marketplace пока пропускается.

## Участие

См. [CONTRIBUTING.md](CONTRIBUTING.md).

## Автор

Vadim Khristenko — `vadim@vai-rice.space` — MIT
