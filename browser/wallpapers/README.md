# Bundled wallpapers

Pictures in this folder ship inside the extension, next to the drawn backgrounds. They show up in Settings, Wallpaper:

- "From the set" picks the file named after the current theme (`miku-dark.webp`, `miku-light.webp`, `sakura-dark.webp`, `sakura-light.webp`), else the first one.
- Playlists can add the whole set with one button and mix it with your own pictures.

Keep them light: about 2560 px wide, WebP at quality around 82, roughly 300 KB each.

```powershell
magick miku-dark.png -resize 2560x -quality 82 miku-dark.webp
```

Hatsune Miku is a character of Crypton Future Media. Fan art in a free, non commercial project falls under the Piapro Character License; keep the credit in `../THIRD_PARTY.md`.
