# Hatsune Miku: темы для редакторов

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?branch=main&label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)
[![Релиз](https://img.shields.io/github/v/release/Vadim-Khristenko/HatsuneMikuEditorTheme?label=релиз&labelColor=0d0e1a&color=ff6e8a&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/releases)
[![Лицензия](https://img.shields.io/github/license/Vadim-Khristenko/HatsuneMikuEditorTheme?label=лицензия&labelColor=0d0e1a&color=86a8ff&style=for-the-badge)](LICENSE)

Мне хотелось, чтобы Мику была рядом и в коде. Спокойная, читаемая, без кричащих цветов. Потом идея выросла: любое приложение, которым я пользуюсь, в стиле Мику. Восемь образов, редакторы, браузеры, Telegram и Spotify. Одна палитра, одна идея.

Основа одна: палитра, и каждый порт генерируется из неё, так что цвет не расходится между приложениями. Лицензия одна на всё: MIT в корне, без отдельных оговорок на редактор.

[English version](README.md)

## Скачать

Всё готовое к установке лежит в [ветке `themes`](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/tree/themes): по папке на приложение, прямые ссылки на скачивание и шаги установки. Каждый релиз пересобирает её, так что ссылки всегда ведут на свежую сборку.

В Telegram файлы вообще не нужны. Одна ссылка работает и на Android, и на Desktop, а тема сама обновляется с каждым релизом:

| | Тёмная | Светлая |
|---|---|---|
| Hatsune Miku | [HatsuneMikuEditorDark](https://t.me/addtheme/HatsuneMikuEditorDark) | [HatsuneMikuEditorLight](https://t.me/addtheme/HatsuneMikuEditorLight) |
| Sakura Miku | [SakuraMikuEditorDark](https://t.me/addtheme/SakuraMikuEditorDark) | [SakuraMikuEditorLight](https://t.me/addtheme/SakuraMikuEditorLight) |
| Snow Miku | [SnowMikuEditorDark](https://t.me/addtheme/SnowMikuEditorDark) | [SnowMikuEditorLight](https://t.me/addtheme/SnowMikuEditorLight) |
| Kasane Teto | [KasaneTetoEditorDark](https://t.me/addtheme/KasaneTetoEditorDark) | [KasaneTetoEditorLight](https://t.me/addtheme/KasaneTetoEditorLight) |

## Что внутри

Одна палитра, много портов: VS Code, Zed, JetBrains, Neovim, Sublime, Notepad++, браузер, Telegram и Spotify. Цвета одинаковые, ощущения тоже.

Восемь образов:

- Hatsune Miku Dark `#0d0e1a` с `#39c5bb`. Мой основной.
- Hatsune Miku Light `#f0fafa` с `#007a72`. Для светлых комнат.
- Sakura Miku Dark `#130d14` с `#e87ea1`.
- Sakura Miku Light `#fff5f8` с `#cc4477`.
- Snow Miku Dark `#031121` с `#95caed`. Ледяной голубой в зимней ночи.
- Snow Miku Light `#f5faff` с `#05598b`.
- Kasane Teto Dark `#160e0e` с `#da646a`. Красные дрели на тёплом чёрном.
- Kasane Teto Light `#fff7f6` с `#c13c51`.

Цвета Snow Miku и Kasane Teto сняты с официальных артов. Цвета подсветки в каждом образе сочные настолько, насколько позволяет их тон, без потери контраста: от 4.5:1 на светлом фоне и до 7:1 на тёмном. Контраст я проверяю скриптом `tools/check-themes.mjs` и тестами палитры, а не на глаз.

Как палитра превращается в порты, описано в [palette/README.md](palette/README.md): правишь шаблон, запускаешь `bun run build:palette`, и правка попадает во все образы всех приложений.

Сборка простая. Bun, TypeScript и `archiver` в `tools/package.ts`, проверка в `tools/validate.ts`. Старался без магии.

CI на каждый пуш, релиз по тегу `v*`.

## Редакторы

| Редактор | Папка | Файл | Установка |
|---|---|---|---|
| VS Code | `vsc/` | `dist/hatsune-miku-vsc-*.vsix` | Установить из VSIX |
| Zed | `zed/` | `dist/zed-*.zip` | Распаковать архив, затем Zed → Install Dev Extension и выбрать папку. Скоро попробую публикацию в маркетплейс Zed. |
| JetBrains | `jetbrains/` | `dist/jetbrains-*.zip` | Install Plugin from Disk. Есть обои: Settings → Appearance & Behavior → Hatsune Miku |
| Neovim | `neovim/` | `dist/neovim-*.zip` | `:colorscheme hatsune-miku` (или `snow-miku`, `kasane-teto`, с `-light` для светлых) |
| Sublime | `sublime/` | `dist/sublime-*.zip` | Preferences → Color Scheme |
| Notepad++ | `notepadpp/` | `dist/notepadpp-*.zip` | Опции → Импорт → Импортировать тему |

У каждой папки та же лицензия MIT. См. `LICENSE` в корне.

## Браузеры

Палитра переехала и в браузер: новая вкладка с четырьмя макетами (Сцена, Нотный стан, Бенто, Дзен), виджетами, `!бэнгами` как в Helium и тремя языками: русским, английским и китайским. Подробности в `browser/README.md`.

| Браузер | Папка | Файл | Как поставить |
|---|---|---|---|
| Chrome, Helium, любой Chromium | `browser/` | `dist/hatsune-miku-editor-chromium-*.zip` | Распаковать, `chrome://extensions` → Загрузить распакованное |
| Цвета рамки Chromium | `browser/` | `dist/hatsune-miku-colorful-browser-*.zip` | По одному на образ, тоже распакованным |
| Firefox | `browser/` | `dist/hatsune-miku-editor-firefox-*.zip` | `about:debugging` → Загрузить временное дополнение |
| Zen | `browser/zen/` | `dist/hatsune-miku-zen-mod-*.zip` | См. `browser/zen/readme.md` |

Собрать: `bun run build:browser`.

## Telegram

Палитра добралась и до чатов. Значение есть у каждого цветового ключа Telegram: 812 на Android, 586 на Desktop, так что ничего не откатывается к стоковому синему. Фон чата это нарисованный арт с Мику из плагина JetBrains, в цветах каждого образа.

| Приложение | Файл | Как поставить |
|---|---|---|
| Telegram для Android | `dist/*.attheme` | Отправить в Избранное, тапнуть, Применить |
| Telegram Desktop | `dist/*.tdesktop-theme` | Открыть файл в Telegram, Применить |

Облачные темы из раздела [Скачать](#скачать) это те же файлы. Их на каждом релизе синхронизирует [telegram-theme-action](https://github.com/Vadim-Khristenko/telegram-theme-action), список лежит в `tools/telegram/cloud.yml`.

Собрать: `bun run build:telegram`. Генератор лежит в `tools/telegram/`. Он берёт дневную и ночную темы самого Telegram и перекрашивает их, так что расстановка света и тени остаётся телеграмовской, а каждый цвет приходит из палитры. Когда в Telegram появляются новые ключи, `bun run sync:telegram` снимает их заново.

## Spotify

Spotify получает палитру через [Spicetify](https://spicetify.app): восемь цветовых схем в `spicetify/HatsuneMiku/color.ini`, сгенерированных из палитры, и один `user.css`, который берёт каждый цвет из выбранной схемы. Бирюзовое свечение на кнопке и прогрессе, второй цвет образа на лайках и шаффле, а собственные поверхности Spotify держатся палитры и не перекрашиваются под обложки.

| Приложение | Файл | Установка |
|---|---|---|
| Spotify | `dist/spicetify-*.zip` | Распаковать в папку Themes Spicetify, `spicetify config current_theme HatsuneMiku color_scheme MikuDark`, `spicetify apply`. Подробности и решения проблем в `spicetify/README.md` |

## Разработка

```bash
bun install --frozen-lockfile
bun run build:palette   # все порты всех образов из palette/templates
bun run check           # дрейф палитры, контраст, JSON, тесты
bun run validate
bun run package:all
```

Скрипты в `tools/package.ts` и `tools/validate.ts`, всё читаемо.

## Релизы

У каждого порта своя версия в `release.json`. `bun run release:plan` показывает, какие порты изменились с прошлого тега, `bun run release:prepare` поднимает версии только им и пишет их чейнджлоги из коммитов. Тег вроде `v0.3.0` собирает все пакеты для релиза на GitHub, так что полный набор всегда на месте, но в магазины уходят только изменившиеся порты: Open VSX с `OVSX_TOKEN`, JetBrains с `JB_TOKEN` и Firefox на addons.mozilla.org с `FIREFOX_JWT_USER` и `FIREFOX_JWT_TOKEN`, где чейнджлог становится заметками к версии, а подписанный `.xpi` возвращается в релиз. Подробности в `CONTRIBUTING.md`. VS Marketplace пока пропускаю, с аккаунтом Microsoft не сложилось.

## Участие

См. `CONTRIBUTING.md`. Цвета меняйте в `palette/templates` или `tools/palette`, а не в сгенерированных файлах портов, потом `bun run build:palette` и `bun run validate` перед PR.

## Автор

Vadim Khristenko · `vadim@vai-rice.space` · MIT
