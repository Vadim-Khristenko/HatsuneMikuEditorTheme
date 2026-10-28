# Changelog: Telegram

Every release of this port, newest first. Written from the commits that changed it.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [SemVer](https://semver.org/).

## [Unreleased]

## [0.4.0] - 2026-10-28

### Added

- Snow Miku and Kasane Teto for Android and Desktop
  - SnowMikuDark, SnowMikuLight, KasaneTetoDark and KasaneTetoLight, with the chat wallpaper drawn in each look's colors, Teto's in red and gold. Snow Miku is sampled from her official key visuals, Kasane Teto from her official Synthesizer V art.
  - Cloud themes for the new looks: SnowMikuEditorDark, SnowMikuEditorLight, KasaneTetoEditorDark and KasaneTetoEditorLight, one link for Android and Desktop.

### Changed

- Livelier colors in Hatsune Miku and Sakura Miku
  - Links, code blocks, peer names and status colors carry as much color as their hue holds without losing contrast. Backgrounds, text and the accent stay as they were.
- Voice and music seekbars keep 2:1 between the played part and the track in every look.

## [0.1.0] - 2026-10-27

### Added

- Themes for Telegram Android and Desktop
  - Android: an .attheme per variant with every color key the app reads (812) and the wallpaper embedded after WPS.
  - Desktop: a .tdesktop-theme per variant, a zip of colors.tdesktop-theme with all 586 keys and background.png.
  - The generator starts from Telegram's own day theme for the light looks and its night theme for the dark ones, then recolors every value: neutral shades by their place between background and text, Telegram blue into the accent, red, green and the rest into their palette hues. About two hundred keys that carry the look are set by hand: chat list, header, bubbles, compose bar, buttons, switches, badges, peer colors, and code blocks in the editor's own syntax colors.
  - Calm bubbles: incoming on the raised surface, outgoing on the secondary one, the accent stays on links, ticks and buttons.
  - The wallpaper is the drawn Miku art of the JetBrains plugin, painted in the colors of each variant, wide for Desktop and tall for Android.
  - tools/telegram/keys.json is a snapshot of Telegram's keys, defaults and night values; bun run sync:telegram refreshes it.
  - bun run check now also runs the Telegram tests: every key covered, every hex from the canonical palette of its variant, text contrast at WCAG AA, and the files read back the way Telegram reads them.
  - The release builds the Telegram themes next to the other ports and ships the files as they are, ready to open in Telegram.

### Fixed

- Android buttons, player and chat chrome readable
  - Rich message buttons were light on light. Telegram works their background out from the text color when a theme leaves the key out, and so it does for tables, dividers and code blocks in articles; the themes now leave those keys to it. Primary buttons get dark text on the accent.
  - A key whose fallback has a role takes that role, so media icons and progress rings are cut out of their bubble and archived chats follow the chat list.
  - Player: accent fill on a faint track, also in the outgoing bubble where both were the accent in the light looks.
  - Captions in bubbles (duration, file size, address) and record time no longer use the faint comment shade; any gray text key is at least the muted one.
  - The send button of the attach sheet, the emoji backspace, mute and pin icons, bot buttons and the undo toast hold their contrast.
  - A selected bubble steps only as far as its text still reads.
  - tools/telegram/pairs.json lists 120 text and icon keys with the key they are drawn on, read from Telegram's source; every pair is tested for 3:1 in all four looks.
- Visible text and message selection on Desktop
  - Telegram Desktop paints both a selected message and selected text with msgInBgSelected and msgOutBgSelected. They were the next ramp step, almost the bubble itself. Now each is the palette tint closest to the bubble that still stands apart from it (1.5:1) and keeps the text at 4.5:1, leaning toward the accent hue: #3d4470 in Miku Dark, #b0d8d5 and #a0c8c6 in Miku Light, #4a3050 and #6a4860 in Sakura Dark, #eab0c4 and #c088a0 in Sakura Light.
  - Captions, links and names of a selected message fall back to the text color wherever their own hue would not hold 3:1 on the selection.
- Visible hover and open chat on Desktop
  - The mention and command autocomplete marks the row under the mouse or the arrow keys with windowBgOver, which is not a key of its own in the palette. It was the next ramp step, about 1.04:1 against the window, so the choice was barely visible.
  - Hover now is an accent-leaning tint at 1.25:1 or more that keeps body text at 4.5:1 and captions at 3:1, the same family as the text selection: #252840 in Miku Dark, #c0e2e0 in Miku Light, #3a2244 in Sakura Dark, #f0d0dc in Sakura Light. Menus get the same on their own surface. Press, the open chat and the open folder take the stronger selection shade, so the open chat still stands out under the mouse; their captions fall back to the text color where they would not read.
- Readable toasts and media overlays on Desktop
  - A bot callback answer shows as a toast, and its text was invisible in the dark looks: Telegram writes toastFg as windowFgActive, the text on the accent, which is dark ink there, on a dark toast. The same mistake hid the media viewer menu and controls, the loader line, ticks on photos and the group call tooltip. They are plain white now.
  - In the light looks the toast was a muted gray at 4.44:1; it is the text color at 90% now, close to Telegram's own near black.
