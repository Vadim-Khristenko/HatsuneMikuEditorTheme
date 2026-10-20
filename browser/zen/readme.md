# HatsuneMikuEditor for Zen

Miku and Sakura colors for the Zen window: sidebar, tabs, toolbar, URL bar and menus. It pairs with the HatsuneMikuEditor new tab, the Firefox add-on, which works in Zen as is.

По-русски: [readme.ru.md](readme.ru.md).

## Variants

Pick one in the mod settings (`mod.hatsunemiku.variant`):

| Value | Look |
|---|---|
| `miku-auto` | Miku Dark or Miku Light, following the system |
| `sakura-auto` | Sakura Dark or Sakura Light, following the system |
| `miku-dark` | `#0d0e1a` with `#39c5bb` |
| `miku-light` | `#f0fafa` with `#007a72` |
| `sakura-dark` | `#130d14` with `#e87ea1` |
| `sakura-light` | `#fff5f8` with `#bd3b6e` |

## Install with Sine (recommended)

Zen's own mod store was archived in July 2026. [Sine](https://github.com/CosmoCreeper/Sine) is the mod manager people use now, and it installs this mod straight from GitHub and keeps it updated.

1. Close Zen.
2. Download the Sine installer from [the latest release](https://github.com/CosmoCreeper/Sine/releases/latest). Pick the file for your processor:
   - Windows on Intel or AMD: `sine-win-x64.exe`
   - Windows on ARM (Snapdragon and the like): `sine-win-arm64.exe`
   - macOS: `sine-osx-arm64` (Apple silicon) or `sine-osx-x64` (Intel)
   - Linux: `sine-linux-x64` or `sine-linux-arm64`
3. Run it. When it asks, choose Zen and the profile you actually use. Do not pick one under "Show unused profiles".
4. Start Zen, open Settings, then **Sine Mods**.
5. In the field for installing from GitHub, paste the path below and install:

   ```
   Vadim-Khristenko/HatsuneMikuEditorTheme/tree/master/browser/zen
   ```

   The `tree/master/browser/zen` part matters. Without it Sine looks for the `main` branch at the top of the repository and finds nothing.
6. Open the mod's settings and pick a variant.

On macOS the installer needs Full Disk Access for Terminal, and then:

```bash
xattr -d com.apple.quarantine ./sine-osx-arm64
chmod +x ./sine-osx-arm64
./sine-osx-arm64
```

On Linux: `chmod +x ./sine-linux-x64 && ./sine-linux-x64`. Flatpak Zen needs the manual install below.

### When the installer will not start (Windows)

- **"This app can't run on your PC".** Windows says this when the file was built for another processor. Open Settings, System, About and look at "System type". "x64-based processor" needs `sine-win-x64.exe`, "ARM-based processor" needs `sine-win-arm64.exe`. Download the other file and run it.
- The same message also shows when the download is broken (the file is 0 KB or much smaller than on the release page) or when an antivirus emptied it. Download it again.
- **"Windows protected your PC"** (SmartScreen): click "More info", then "Run anyway". The installer is not signed, so Windows warns about every new version.
- **The antivirus deletes it.** This is a known false positive, see [Sine issue #506](https://github.com/CosmoCreeper/Sine/issues/506). Restore the file from quarantine and allow it, or use the manual install.
- **Sine Mods disappeared after a Zen update.** Run the installer again. Your mods and their settings stay in the profile.

### Manual install of Sine

If the installer does not work at all, Sine can be set up by hand ([official guide](https://github.com/sineorg/docs/blob/main/src/installation.md)):

1. Download `program.zip` and `profile.zip` from the [bootloader releases](https://github.com/sineorg/bootloader/releases/latest), and `engine.zip` from the [Sine releases](https://github.com/CosmoCreeper/Sine/releases/latest).
2. Close Zen. Unpack `program.zip` into the Zen install folder, usually `C:\Program Files\Zen Browser\`, and replace files if asked. Windows asks for administrator rights here.
3. Open `about:support` in Zen, find "Profile Folder" and click "Open Folder". Create a `chrome` folder inside if there is none.
4. Unpack `profile.zip` and then `engine.zip` into that `chrome` folder.
5. In `about:support` click "Clear startup cache", then restart Zen and continue from step 4 above.

## Install without Sine

1. Open `about:support`, then "Profile Folder", and create a `chrome` folder there.
2. Copy one of `userChrome/*.css` from this folder into it as `userChrome.css`, or `@import` it from your own file.
3. In `about:config` set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true` and restart Zen.

This way there are no settings and no updates; copy the file again after a new release.

## The new tab

The window colors come from this mod; the Miku new tab comes from the HatsuneMikuEditor add-on for Firefox. Install it from addons.mozilla.org, or from the `hatsune-miku-editor-firefox-*.zip` in the [releases](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/releases/latest) through `about:debugging`, Load Temporary Add-on. With the add-on installed, "Paint the browser too" in its settings recolors the window too, so the mod is optional.

## Editing

Every file here except the two readmes is generated from `tools/jb-palette.json` by `bun run build:browser`. Change the palette, rebuild, commit the result. `bun test browser` fails if the files drift.
