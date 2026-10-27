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
| JetBrains | `jetbrains/` | `dist/jetbrains-*.zip` | Install Plugin from Disk. Есть обои: Settings → Appearance & Behavior → Hatsune Miku |
| Neovim | `neovim/` | `dist/neovim-*.zip` | `:colorscheme hatsune-miku` |
| Sublime | `sublime/` | `dist/sublime-*.zip` | Preferences → Color Scheme |
| Notepad++ | `notepadpp/` | `dist/notepadpp-*.zip` | Опции → Импорт → Импортировать тему |

Каждая папка — та же лицензия MIT. См. `LICENSE` в корне.

## Браузеры

Палитра переехала и в браузер: новая вкладка с четырьмя макетами (Сцена, Нотный стан, Бенто, Дзен), виджетами, `!бэнгами` как в Helium и тремя языками: русским, английским и китайским. Подробности в `browser/README.md`.

| Браузер | Папка | Файл | Как поставить |
|---|---|---|---|
| Chrome, Helium, любой Chromium | `browser/` | `dist/hatsune-miku-editor-chromium-*.zip` | Распаковать, `chrome://extensions` → Загрузить распакованное |
| Цвета рамки Chromium | `browser/` | `dist/hatsune-miku-colorful-browser-*.zip` | По одному на вариант, тоже распакованным |
| Firefox | `browser/` | `dist/hatsune-miku-editor-firefox-*.zip` | `about:debugging` → Загрузить временное дополнение |
| Zen | `browser/zen/` | `dist/hatsune-miku-zen-mod-*.zip` | См. `browser/zen/readme.md` |

Собрать: `bun run build:browser`.

## Telegram

Палитра добралась и до чатов. Значение есть у каждого цветового ключа Telegram: 812 на Android, 586 на Desktop, так что ничего не откатывается к стоковому синему. Фон чата это нарисованный арт с Мику из плагина JetBrains, в цветах каждого варианта.

| Приложение | Файл | Как поставить |
|---|---|---|
| Telegram для Android | `dist/HatsuneMiku*.attheme` | Отправить в Избранное, тапнуть, Применить |
| Telegram Desktop | `dist/HatsuneMiku*.tdesktop-theme` | Открыть файл в Telegram, Применить |

Собрать: `bun run build:telegram`. Генератор лежит в `tools/telegram/`. Он берёт дневную и ночную темы самого Telegram и перекрашивает их, так что расстановка света и тени остаётся телеграмовской, а каждый цвет приходит из палитры. Когда в Telegram появляются новые ключи, `bun run sync:telegram` снимает их заново.

## Разработка

```bash
bun install --frozen-lockfile
bun run check
bun run validate
bun run package:all
```

Скрипты в `tools/package.ts` и `tools/validate.ts`, всё читаемо.

## Релизы

Тег вроде `v0.2.0` собирает все пакеты: шесть редакторов, темы для Telegram, новую вкладку для Chromium и Firefox, темы рамки для Chromium и мод для Zen. Тег должен совпадать с версией во всех пакетах, иначе релиз остановится. Заметки к релизу генерируются с палитрой и подсказками по установке. Open VSX публикуется если есть `OVSX_TOKEN`, JetBrains если есть `JB_TOKEN`, а с `AMO_JWT_ISSUER` и `AMO_JWT_SECRET` Mozilla подписывает дополнение для Firefox, и в релизе появляется `.xpi`, который ставится насовсем. VS Marketplace пока пропускаю, с аккаунтом Microsoft не сложилось.

## Участие

См. `CONTRIBUTING.md`. Держите `vsc/themes/*.json` как канон и прогоняйте `bun run validate` перед PR.

## Автор

Vadim Khristenko — `vadim@vai-rice.space` — MIT
