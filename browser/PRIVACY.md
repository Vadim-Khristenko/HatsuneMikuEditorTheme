# Privacy policy: HatsuneMikuEditor new tab

Last updated: 2026-10-20.

HatsuneMikuEditor is a new tab page. It has no account, no analytics, no ads and no server of its own. The author receives nothing from it.

## What stays in your browser

Settings, shortcuts and their uploaded pictures, tasks, notes, calendar events, your birthday and your own wallpapers are kept in the browser's extension storage and IndexedDB on your device. They are never sent anywhere. Removing the add-on removes them.

## What can leave your browser, and when

Only these requests exist, and only after you turn the matching feature on:

| Feature | Sent to | What is sent | When |
|---|---|---|---|
| Weather | Open-Meteo (open-meteo.com) | The city name you type, then its coordinates | After you search for a city in settings |
| Icons: DuckDuckGo or Google | DuckDuckGo or Google icon services | The domain of each shortcut, for example `github.com` | Only in those icon modes |
| Icons: from the site itself | The shortcut's own site | An ordinary request for its page and icon, without cookies | Only in that mode, for sites you gave access to |
| A shortcut picture by link | The address you typed for that picture | An ordinary image request | Only if you link a picture instead of uploading one |
| Search | The search engine you chose | Your query | When you search, like any search box |

In Firefox and Zen the location (`locationInfo`) and site domains (`browsingActivity`) are optional data permissions. Firefox asks you before the first request of each kind, and you can withdraw them at any time in `about:addons`; the add-on then stops those requests. Access to shortcut sites is asked per site and can be withdrawn the same way.

The services above have their own privacy policies. The add-on sends them nothing beyond what is listed.

## Contact

Questions go to the issue tracker: https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/issues
