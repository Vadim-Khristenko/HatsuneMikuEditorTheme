# HatsuneMikuEditor для Zen

Цвета Miku и Sakura для окна Zen: боковая панель, вкладки, панель инструментов, адресная строка и меню. В пару к нему идёт новая вкладка HatsuneMikuEditor, дополнение для Firefox, которое работает в Zen без изменений.

English: [readme.md](readme.md).

## Варианты

Выбираются в настройках мода (`mod.hatsunemiku.variant`):

| Значение | Вид |
|---|---|
| `miku-auto` | Miku Dark или Miku Light, как в системе |
| `sakura-auto` | Sakura Dark или Sakura Light, как в системе |
| `miku-dark` | `#0d0e1a` и `#39c5bb` |
| `miku-light` | `#f0fafa` и `#007a72` |
| `sakura-dark` | `#130d14` и `#e87ea1` |
| `sakura-light` | `#fff5f8` и `#bd3b6e` |

## Установка через Sine (рекомендуется)

Собственный магазин модов Zen закрыли в июле 2026 года. Сейчас моды ставят через [Sine](https://github.com/CosmoCreeper/Sine): он берёт мод прямо с GitHub и сам его обновляет.

1. Закрой Zen.
2. Скачай установщик Sine из [последнего релиза](https://github.com/CosmoCreeper/Sine/releases/latest). Файл зависит от процессора:
   - Windows на Intel или AMD: `sine-win-x64.exe`
   - Windows на ARM (Snapdragon и подобные): `sine-win-arm64.exe`
   - macOS: `sine-osx-arm64` (Apple silicon) или `sine-osx-x64` (Intel)
   - Linux: `sine-linux-x64` или `sine-linux-arm64`
3. Запусти его. Когда спросит, выбери Zen и тот профиль, которым пользуешься. Не бери профиль из списка «Show unused profiles».
4. Открой Zen, зайди в Настройки, раздел **Sine Mods**.
5. В поле установки с GitHub вставь этот путь и установи:

   ```
   Vadim-Khristenko/HatsuneMikuEditorTheme/tree/master/browser/zen
   ```

   Часть `tree/master/browser/zen` обязательна. Без неё Sine ищет ветку `main` в корне репозитория и ничего не находит.
6. Открой настройки мода и выбери вариант.

На macOS установщику нужен полный доступ к диску для Терминала (Настройки, Конфиденциальность и безопасность, Полный доступ к диску), потом:

```bash
xattr -d com.apple.quarantine ./sine-osx-arm64
chmod +x ./sine-osx-arm64
./sine-osx-arm64
```

На Linux: `chmod +x ./sine-linux-x64 && ./sine-linux-x64`. Для Zen из Flatpak нужна ручная установка, она ниже.

### Если установщик не запускается (Windows)

- **«Невозможно запустить это приложение на вашем ПК».** Так Windows пишет, когда файл собран под другой процессор. Открой Параметры, Система, О программе и посмотри «Тип системы». Для «процессор x64» нужен `sine-win-x64.exe`, для «процессор на базе ARM» нужен `sine-win-arm64.exe`. Скачай другой файл и запусти его.
- То же сообщение бывает, если файл скачался не целиком (весит 0 КБ или заметно меньше, чем на странице релиза) или его опустошил антивирус. Скачай заново.
- **«Система Windows защитила ваш компьютер»** (SmartScreen): нажми «Подробнее», потом «Выполнить в любом случае». У установщика нет цифровой подписи, поэтому Windows предупреждает о каждой новой версии.
- **Антивирус удаляет файл.** Это известное ложное срабатывание, см. [issue #506 у Sine](https://github.com/CosmoCreeper/Sine/issues/506). Верни файл из карантина и добавь в исключения или поставь Sine вручную.
- **После обновления Zen пропал раздел Sine Mods.** Запусти установщик ещё раз. Моды и их настройки остаются в профиле.

### Ручная установка Sine

Если установщик не работает совсем, Sine ставится руками ([официальная инструкция](https://github.com/sineorg/docs/blob/main/src/installation.md)):

1. Скачай `program.zip` и `profile.zip` из [релизов загрузчика](https://github.com/sineorg/bootloader/releases/latest) и `engine.zip` из [релизов Sine](https://github.com/CosmoCreeper/Sine/releases/latest).
2. Закрой Zen. Распакуй `program.zip` в папку, где установлен Zen, обычно `C:\Program Files\Zen Browser\`, с заменой файлов. Windows попросит права администратора.
3. Открой в Zen `about:support`, найди «Папка профиля» и нажми «Открыть папку». Внутри создай папку `chrome`, если её нет.
4. Распакуй в эту папку `chrome` сначала `profile.zip`, потом `engine.zip`.
5. В `about:support` нажми «Очистить кэш запуска», перезапусти Zen и продолжай с шага 4 инструкции выше.

## Установка без Sine

1. Открой `about:support`, затем «Папка профиля», и создай там папку `chrome`.
2. Скопируй в неё один из файлов `userChrome/*.css` из этой папки под именем `userChrome.css` или подключи его через `@import` из своего файла.
3. В `about:config` включи `toolkit.legacyUserProfileCustomizations.stylesheets` (значение `true`) и перезапусти Zen.

Так не будет ни настроек, ни обновлений: после нового релиза файл придётся скопировать заново.

## Новая вкладка

Цвета окна даёт этот мод, а новую вкладку с Мику даёт дополнение HatsuneMikuEditor для Firefox. Поставь его с addons.mozilla.org или из файла `hatsune-miku-editor-firefox-*.zip` в [релизах](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/releases/latest) через `about:debugging`, «Загрузить временное дополнение». Если дополнение стоит, его настройка «Красить и сам браузер» перекрашивает и окно, так что мод не обязателен.

## Как это устроено

Все файлы здесь, кроме двух readme, собирает `bun run build:browser` из `tools/jb-palette.json`. Поменял палитру, пересобрал, закоммитил. `bun test browser` упадёт, если файлы разойдутся с палитрой.
