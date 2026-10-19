# HatsuneMikuEditor for browsers

The same four palettes, now for the browser. A new tab page with four layouts, real widgets and Helium style !bangs, plus browser frame themes for Chromium, Firefox and Zen.

## What is inside

| Package | For | What it does |
|---|---|---|
| HatsuneMikuEditor | Chrome, Helium, Edge, Brave, any Chromium | New tab: layouts, widgets, bangs, theme switcher, fonts |
| HatsuneMikuEditor (Colorful Browser) | Chromium | Colors the window itself: tabs, toolbar, address bar. One package per variant |
| HatsuneMikuEditor for Firefox | Firefox, Zen | The same new tab, and it recolors the whole window when you switch themes |
| Zen mod | Zen | Sidebar, tabs and URL bar styling, see `zen/readme.md` |

Why two Chromium packages: Chromium only lets a theme package recolor the browser frame, and a theme package cannot contain any code. So the new tab is one extension and the frame colors are a second, tiny one. Firefox has no such limit, so there it is a single extension.

## Layouts

- **Stage.** A big clock as the song title, an equalizer, the search, shortcuts as a numbered setlist, three small widgets at the bottom.
- **Score.** Your day on a music staff: hours run left to right, the playhead is now, every event is a note. Shortcuts are piano keys.
- **Bento.** A grid of widgets. Press Edit to drag them around, hide some, bring others back.
- **Zen.** Wallpaper first. Clock in the corner, a single search line, widgets wait in a drawer.

## Search and bangs

Type a query, an address, or a bang. `!ttv lofi` opens Twitch, `!w Miku` opens Wikipedia, `!gh` alone opens GitHub. The list is the one Helium ships (more than 10 000 bangs, MIT, Kagi and imput), built in, so it works offline. The bang can sit anywhere: `lofi girl !ttv` works too.

While typing `!tt` a list of matching bangs appears. Arrows pick, Tab completes, Enter goes, Ctrl+Enter opens a new tab. Press `/` anywhere to jump into the search.

Plain queries go to the search engine the browser already uses, or to the one picked in settings.

## Widgets

Clock, weather (Open-Meteo, no key, only after you choose a city), calendar with events, shortcuts, tasks, now playing (audible tabs: jump to the tab or mute it; titles need the optional "tabs" permission, asked on click), focus timer, note, line of the day.

## Languages

Russian, English and Chinese. Auto follows the browser, or pick one in settings.

## Fonts

The page ships Onest, Unbounded, JetBrains Mono and M PLUS Rounded 1c locally, no requests to Google. In Chromium the extension can also set the default fonts that websites use (standard, sans, serif, monospace) through `chrome.fontSettings`. Only fonts installed on your computer can be used there; that is a browser rule. Firefox has no such API.

## Install from source

```bash
bun install --frozen-lockfile
bun run build:browser          # unpacked folders in browser/build/
bun run package:browser        # zips in dist/
```

- Chromium or Helium: `chrome://extensions`, Developer mode, Load unpacked, pick `browser/build/chromium`. For frame colors also load `browser/build/colorful-miku-dark` (or another variant).
- Firefox or Zen: `about:debugging#/runtime/this-firefox`, Load Temporary Add-on, pick `browser/build/firefox/manifest.json`. Permanent installs need the signed build from addons.mozilla.org.

## Permissions

| Permission | Why |
|---|---|
| storage | Settings, tasks, notes |
| search | Hand plain queries to the browser's own search engine |
| fontSettings (Chromium) | Optional website fonts in settings |
| favicon (Chromium) | Optional site icons on shortcuts |
| theme (Firefox) | Recolor the window when you switch themes |
| tabs (optional) | Track titles in Now playing, asked only when you click |

No analytics, no remote code. Weather is the only network request and only after you pick a city.

## Development

```
browser/
  build.ts           builds every package
  src/               TypeScript, no framework
    palette.ts       tokens from tools/jb-palette.json, WCAG checked in tests
    bangs.ts         Helium bang format and matching
    ui/              layouts, widgets, settings panel
  static/            html, css, fonts, icons
  data/bangs.json    snapshot, refresh with: bun browser/tools/update-bangs.ts
  zen/               generated Zen mod, committed
  wallpapers/        optional bundled wallpapers and the prompts for them
  test/              bun test browser
```

`bun test browser` checks the bang logic, settings migration, every locale key, contrast in all four themes, and that the committed Zen mod matches the palette.
