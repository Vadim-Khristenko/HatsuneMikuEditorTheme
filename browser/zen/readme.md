# HatsuneMikuEditor for Zen

Miku and Sakura colors for the Zen window: sidebar, tabs, toolbar, URL bar and menus. It pairs with the HatsuneMikuEditor new tab extension (the Firefox build works in Zen as is).

## Variants

Pick one in Zen Mods settings (`mod.hatsunemiku.variant`):

| Value | Look |
|---|---|
| `miku-auto` | Miku Dark or Miku Light, following the system |
| `sakura-auto` | Sakura Dark or Sakura Light, following the system |
| `miku-dark` | `#0d0e1a` with `#39c5bb` |
| `miku-light` | `#f0fafa` with `#007a72` |
| `sakura-dark` | `#130d14` with `#e87ea1` |
| `sakura-light` | `#fff5f8` with `#bd3b6e` |

## Install

The official Zen theme store repository was archived in July 2026, so for now the mod is installed by hand.

With a mod manager that reads the store format (for example Sine), point it at this folder: `theme.json`, `chrome.css`, `preferences.json`.

Without one:

1. Open `about:support`, then "Profile folder", and create a `chrome` folder there.
2. Copy one of `userChrome/*.css` into it as `userChrome.css` (or `@import` it from your own file).
3. In `about:config` set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true` and restart Zen.

## Editing

Every file here except this readme is generated from `tools/jb-palette.json` by `bun run build:browser`. Change the palette, rebuild, commit the result. `bun test browser` fails if the files drift.
