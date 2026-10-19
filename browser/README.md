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

Plain queries go to the search engine the browser already uses, or to the one picked in settings. Settings also take your own engines (any URL with `%s`), your own bangs (they win over built-in ones, and a bang without `%s` works as a bookmark: `!home`), and "open results in a new tab".

## Widgets

Clock, weather (Open-Meteo, no key, only after you choose a city), calendar with events, shortcuts, tasks, now playing (audible tabs: jump to the tab or mute it; titles need the optional "tabs" permission, asked on click), focus timer, note, line of the day.

## It feels alive

- Greetings come from banks per time of day, with special lines for Mondays, Fridays and weekends, late nights, New Year, Miku's birthday (August 31), Miku Day (3/9) and Halloween. Every new tab picks again.
- Add your birthday (the year is optional) and the page congratulates you, knows your age, rains confetti, and counts down the last week before it.
- Soft entrances, a minute flip on the clock, cross-fades between themes and layouts (View Transitions). One switch turns all motion off, and the system "reduce motion" setting is respected.

## Shortcut icons

Icons are preloaded and fade in. Automatic mode asks the browser cache first (private) and skips Chromium's generic globe, then DuckDuckGo's icon service. Google (sharpest), cache only, DuckDuckGo only and plain letters are there too. Remote services only ever see the domain.

## Wallpapers

The drawn Miku art, the bundled set (`wallpapers/`), or playlists: as many as you like, each mixing your own pictures (stored in IndexedDB) with the bundled ones, changing on every new tab or every 5 minutes, 15 minutes, hour or day, in order or shuffled, with a cross-fade and previous and next buttons in the corner.

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

No analytics, no remote code. Network requests: weather after you pick a city, and shortcut icons from DuckDuckGo or Google only if the icon mode uses them.

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
  wallpapers/        optional bundled wallpapers
  test/              bun test browser
```

`bun test browser` checks the bang logic, custom engines and bangs, settings migration, every locale key and greeting bank, birthdays and occasions, the wallpaper carousel, contrast in all four themes, and that the committed Zen mod matches the palette. `bun run typecheck:browser` runs strict TypeScript. Both are part of `bun run validate`.
