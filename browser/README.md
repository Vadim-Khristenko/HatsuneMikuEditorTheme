# HatsuneMikuEditor for browsers

The same four palettes, now for the browser. A new tab page with four layouts, real widgets and Helium style !bangs, plus browser frame themes for Chromium, Firefox and Zen.

## What is inside

| Package | For | What it does |
|---|---|---|
| HatsuneMikuEditor | Chrome, Helium, Edge, Brave, any Chromium | New tab: layouts, widgets, bangs, theme switcher, fonts |
| HatsuneMikuEditor (Colorful Browser) | Chromium | Colors the window itself: tabs, toolbar, address bar. One package per variant |
| HatsuneMikuEditor for Firefox | Firefox, Zen, Firefox for Android | The same new tab, and it recolors the whole window when you switch themes |
| Zen mod | Zen | Sidebar, tabs and URL bar styling, installed through Sine, see [zen/readme.md](zen/readme.md) |

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

Icons are preloaded and fade in. Settings, Shortcuts, Icons picks where they come from:

| Mode | Where the icon comes from |
|---|---|
| Automatic | The browser cache first (private, Chromium only), skipping Chromium's generic globe; then the site itself if you gave access to it; then DuckDuckGo |
| From the site itself | The shortcut's own page: the largest of its `<link rel="icon">`, `apple-touch-icon` and web app manifest icons, falling back to `/favicon.ico` |
| Browser cache only | Chromium's favicon cache, nothing leaves the browser |
| DuckDuckGo, Google | Their icon services; Google's are the sharpest |
| Letters | No pictures at all |

"From the site itself" asks the browser for access to the sites of your shortcuts, by name, the moment you pick it or add a shortcut. The page is fetched without cookies, and what it found is kept for a week. Remote icon services only ever see the domain. In Firefox they also wait for your consent in Firefox's own data prompt; until then tiles show letters.

## Wallpapers

The drawn Miku art, the bundled set (`wallpapers/`), or playlists: as many as you like, each mixing your own pictures (stored in IndexedDB) with the bundled ones, changing on every new tab or every 5 minutes, 15 minutes, hour or day, in order or shuffled, with a cross-fade and previous and next buttons in the corner.

## Languages

Russian, English and Chinese. Auto follows the browser, or pick one in settings.

## Fonts

The page ships Onest, Unbounded, JetBrains Mono and M PLUS Rounded 1c locally, no requests to Google. In Chromium the extension can also set the default fonts that websites use (standard, sans, serif, monospace) through `chrome.fontSettings`. Only fonts installed on your computer can be used there; that is a browser rule. Firefox has no such API.

## Install

- **Firefox and Zen:** from addons.mozilla.org once the listing is approved, or the `hatsune-miku-editor-firefox-*.zip` from [the releases](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/releases/latest) through `about:debugging`, Load Temporary Add-on.
- **Firefox for Android:** from addons.mozilla.org on the phone. Android does not let add-ons replace the new tab, so the page opens from the menu: Extensions, HatsuneMikuEditor. Browser search and window colors are desktop only there; the page searches with the engine picked in its settings.
- **Chrome, Helium, Edge, Brave:** unpack `hatsune-miku-editor-chromium-*.zip`, open `chrome://extensions`, turn on Developer mode, Load unpacked. For frame colors also load one `hatsune-miku-colorful-browser-*` package.
- **Zen window colors:** the Zen mod through Sine, step by step with fixes for a failing installer in [zen/readme.md](zen/readme.md) (по-русски: [zen/readme.ru.md](zen/readme.ru.md)).

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
| access to a site (optional) | "From the site itself" icons, asked per shortcut site |

No analytics, no remote code. Network requests: weather after you pick a city, shortcut icons from DuckDuckGo or Google only if the icon mode uses them, and the shortcut sites themselves in "From the site itself" mode.

In Firefox the add-on declares no required data collection. Weather (the city goes to Open-Meteo, `locationInfo`) and remote icons (site domains go to DuckDuckGo or Google, `browsingActivity`) are optional, and Firefox asks for each the first time you use it. You can withdraw either in `about:addons`, and the page goes back to letters and an empty weather card.

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
