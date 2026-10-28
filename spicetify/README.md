# Hatsune Miku for Spotify (Spicetify)

The Miku palette for the Spotify desktop app, through [Spicetify](https://spicetify.app). Eight schemes, one per look:

| Scheme | Look |
|---|---|
| `MikuDark`, `MikuLight` | Hatsune Miku |
| `SakuraDark`, `SakuraLight` | Sakura Miku |
| `SnowDark`, `SnowLight` | Snow Miku |
| `TetoDark`, `TetoLight` | Kasane Teto |

Teal glows on the play button and the progress bar, the second color of the look on likes, shuffle and explicit badges, and Spotify's own surfaces held to the palette, so album art no longer tints the home header grey or yellow.

## Install

1. Install Spicetify from [spicetify.app](https://spicetify.app/docs/getting-started) and run `spicetify backup apply` once.
2. Download `hatsune-miku-spicetify.zip` and unpack it into the Themes folder, so you get `Themes/HatsuneMiku/color.ini` and `Themes/HatsuneMiku/user.css`:
   - Windows: `%APPDATA%\spicetify\Themes`
   - Linux and macOS: `~/.config/spicetify/Themes`
   - Anywhere: `spicetify path userdata` prints the folder that holds `Themes`.
3. Pick a scheme and apply:

   ```sh
   spicetify config current_theme HatsuneMiku color_scheme MikuDark
   spicetify apply
   ```

To switch looks later, run the same two lines with another scheme.

## When something goes wrong

- **Windows: run as yourself, not as administrator.** Spicetify refuses to run elevated. Use the Spotify installer from spotify.com; the Microsoft Store version cannot be patched.
- **After Spotify updates itself** the theme disappears. Run `spicetify backup apply` to patch the new version.
- **Linux: Spotify in `/opt/spotify`** needs write access before Spicetify can patch it:

  ```sh
  sudo chmod a+wr /opt/spotify
  sudo chmod a+wr /opt/spotify/Apps -R
  ```

  Flatpak and Snap installs keep Spotify elsewhere; see the [Spicetify docs](https://spicetify.app/docs/advanced-usage/installation#spotify-installed-from-flatpak).
- **Colors look half applied:** check that `color.ini` and `user.css` sit directly inside `Themes/HatsuneMiku`, not one folder deeper.

Made and tested with Spicetify 2.46.4.

## How it is built

`color.ini` is generated from the palette by `tools/palette/build.ts`, so it never drifts from the other ports. `user.css` holds no colors of its own: every color goes through the `--spice-*` variables of the picked scheme.
