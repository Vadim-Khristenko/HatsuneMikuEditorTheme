# Hatsune Miku — темы для редакторов

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?branch=main&label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)
[![Релиз](https://img.shields.io/github/v/release/Vadim-Khristenko/HatsuneMikuEditorTheme?label=релиз&labelColor=0d0e1a&color=ff6e8a&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/releases)
[![Лицензия](https://img.shields.io/github/license/Vadim-Khristenko/HatsuneMikuEditorTheme?label=лицензия&labelColor=0d0e1a&color=86a8ff&style=for-the-badge)](LICENSE)

Мне хотелось, чтобы Мику была рядом и в коде. Спокойная, читаемая, без кричащих цветов. Получилось четыре варианта на шесть редакторов. Одна палитра, одна идея.

Я держу темы VS Code как основу, остальные повторяют её. Лицензия одна на всё — MIT в корне, без отдельных оговорок на редактор.

[English version](README.md)

## Что внутри

Одна палитра, шесть портов. VS Code, Zed, JetBrains, Neovim, Sublime, Notepad++. Цвета одинаковые, ощущения тоже.

Четыре образа:

- Miku Dark `#0d0e1a` с `#39c5bb`. Мой основной.
- Miku Light `#f0fafa` с `#007a72`. Для светлых комнат.
- Sakura Dark `#130d14` с `#e87ea1`.
- Sakura Light `#fff5f8` с `#cc4477`.

Контраст я проверяю скриптом `tools/check-themes.mjs`, а не на глаз.

Сборка простая. Bun, TypeScript и `archiver` в `tools/package.ts`, проверка в `tools/validate.ts`. Старался без магии.

CI на каждый пуш, релиз по тегу `v*`.

## Редакторы

| Редактор | Папка | Файл | Установка |
|---|---|---|---|
| VS Code | `vsc/` | `dist/hatsune-miku-vsc-*.vsix` | Установить из VSIX |
| Zed | `zed/` | `dist/zed-*.zip` | Распаковать архив, затем Zed → Install Dev Extension и выбрать папку. Скоро попробую публикацию в маркетплейс Zed. |
| JetBrains | `jetbrains/` | `dist/jetbrains-*.zip` | Install Plugin from Disk |
| Neovim | `neovim/` | `dist/neovim-*.zip` | `:colorscheme hatsune-miku` |
| Sublime | `sublime/` | `dist/sublime-*.zip` | Preferences → Color Scheme |
| Notepad++ | `notepadpp/` | `dist/notepadpp-*.zip` | Опции → Импорт → Импортировать тему |

Каждая папка — та же лицензия MIT. См. `LICENSE` в корне.

## Разработка

```bash
bun install --frozen-lockfile
bun run check
bun run validate
bun run package:all
```

Скрипты в `tools/package.ts` и `tools/validate.ts`, всё читаемо.

## Релизы

Тег вроде `v0.0.8` собирает все шесть пакетов. Заметки к релизу генерируются с палитрой и подсказками по установке. Open VSX публикуется если есть `OVSX_TOKEN`, JetBrains если есть `JB_TOKEN`. VS Marketplace пока пропускаю, с аккаунтом Microsoft не сложилось.

## Участие

См. `CONTRIBUTING.md`. Держите `vsc/themes/*.json` как канон и прогоняйте `bun run validate` перед PR.

## Автор

Vadim Khristenko — `vadim@vai-rice.space` — MIT
