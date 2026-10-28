# Palette 1.0

One palette, eight looks, every port generated from it.

| Look | Background | Text | Accent | Second color |
|---|---|---|---|---|
| Hatsune Miku Dark | `#0d0e1a` | `#ccd6f6` | `#39c5bb` | `#ff6a88` |
| Hatsune Miku Light | `#f0fafa` | `#1a3a3a` | `#007a72` | `#d40040` |
| Sakura Miku Dark | `#130d14` | `#f0d6e8` | `#e87ea1` | `#39c5bb` |
| Sakura Miku Light | `#fff5f8` | `#3a1428` | `#cc4477` | `#007865` |
| Snow Miku Dark | `#031121` | `#cce4fe` | `#95caed` | `#efa7b5` |
| Snow Miku Light | `#f5faff` | `#1a2836` | `#05598b` | `#b8456a` |
| Kasane Teto Dark | `#160e0e` | `#eedddb` | `#da646a` | `#e3b56a` |
| Kasane Teto Light | `#fff7f6` | `#2c2424` | `#c13c51` | `#8f6420` |

`palette.json` holds every role of every look (surfaces, text, accent, the color wheel). It is generated; do not edit it by hand.

## Where the colors come from

- **Hatsune Miku and Sakura Miku** keep the backgrounds, text and accent they always had; `#39c5bb` is Miku's official teal. Every color of the wheel (red, orange, yellow, green, cyan, blue, violet, pink) got as much color as its hue holds, by three rules: never less saturated than before; on light backgrounds never less contrast than before and at least 4.5:1; on dark ones at least 7:1 or what it had, whichever is lower.
- **Snow Miku** was sampled from the official key visuals 2019 to 2026 on snowmiku.com: snow white, ice blue `#95caed`, deep navy hair, strawberry pink `#efa7b5`. The neutrals lean to the navy of her hair.
- **Kasane Teto** was sampled from her official Synthesizer V art on kasaneteto.jp: hair `#c13c51` with the highlight `#da646a`, a warm pink-gray uniform, gold buttons. The neutrals are warm and nearly gray, like the uniform.

The new families keep Miku's hue angles for the wheel, tuned to their own background by the same rules, so an error is red and a string is warm in every look.

## How a port is made

`templates/` holds the hand-written v1 files of the four original looks: VS Code, Zed, Neovim, Sublime Text, Notepad++ and JetBrains. `bun run build:palette` (`tools/palette/build.ts`) turns them into every look:

1. A color that is a role of the template (background, accent, red) becomes the same role of the look.
2. Any other shade follows its neighbors: a neutral shifts the way the two neutrals around it shift, a colored shade keeps its lightness, chroma and hue offsets from the nearest colored role. A hover stays a hover, a dimmed red stays a dimmed red.
3. Names inside the files are rewritten for each port, and the VS Code list, the JetBrains providers, the Spicetify schemes and the browser palettes follow.

Snow Miku and Kasane Teto are drawn from the Hatsune Miku templates. `bun run check` fails when a generated file differs from what the templates give, so a fix always goes into a template.
