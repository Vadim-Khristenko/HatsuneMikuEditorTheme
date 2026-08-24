# Hatsune Miku Editor Themes

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?branch=main&label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Vadim-Khristenko/HatsuneMikuEditorTheme?label=release&labelColor=0d0e1a&color=ff6e8a&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/releases)
[![License](https://img.shields.io/github/license/Vadim-Khristenko/HatsuneMikuEditorTheme?label=license&labelColor=0d0e1a&color=86a8ff&style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.0.3-ffd580?style=for-the-badge&labelColor=0d0e1a)](package.json)

Monorepo for Hatsune Miku themes — 4 variants (Miku Dark/Light, Sakura Dark/Light) for 6 editors. All themes share a single **MIT** license and a single palette contract (`vsc/themes/*.json` is canonical). No per-editor license differences — one license for the whole collection.

[Русская версия](README.ru.md)

## Features

- **Unified palette** — one contract, six ports: VS Code, Zed, JetBrains, Neovim, Sublime Text, Notepad++
- **Four variants** tuned for contrast and eye comfort, validated via `tools/check-themes.mjs`
- **Modern tooling** — `bun` workspaces, `archiver`-based packaging in `tools/package.ts`, `tools/validate.ts` for dry-run
- **CI/CD** — `ci.yml` validates every push, `release.yml` publishes tagged `v*` releases with all artifacts

## Variants

| Variant | Background | Accent | Mood |
|---|---|---|---|
| **Miku Dark** | `#0d0e1a` | `#39c5bb` | deep navy, Miku teal |
| **Miku Light** | `#f0fafa` | `#007a72` | airy cyan, daylight |
| **Sakura Dark** | `#130d14` | `#e87ea1` | sakura night |
| **Sakura Light** | `#fff5f8` | `#cc4477` | sakura dawn |

## Editors

| Editor | Folder | Artifact | Install |
|---|---|---|---|
| VS Code | `vsc/` | `dist/hatsune-miku-vsc-*.vsix` | Install from VSIX or `bun run package:vsc` |
| Zed | `zed/` | `dist/zed-*.zip` | Zed → Install Dev Extension → pick folder |
| JetBrains | `jetbrains/` | `dist/jetbrains-*.zip` | Settings → Plugins → Install Plugin from Disk |
| Neovim | `neovim/` | `dist/neovim-*.zip` | `~/.config/nvim/colors/` → `:colorscheme hatsune-miku` |
| Sublime Text | `sublime/` | `dist/sublime-*.zip` | Preferences → Color Scheme |
| Notepad++ | `notepadpp/` | `dist/notepadpp-*.zip` | Settings → Import → Import style theme(s) |

Each theme in every folder is distributed under the **same MIT license** — see root `LICENSE`. No additional restrictions.

## Development

```bash
bun install --frozen-lockfile
bun run check      # palette + JSON validation (tools/check-themes.mjs)
bun run validate   # check + dry package via tools/validate.ts (archiver)
bun run package:all # dist/*.zip + .vsix (tools/package.ts)
```

Package scripts are TypeScript (`tools/package.ts`, `tools/validate.ts`) — no hardcoded shell, validated and testable.

## Releases

Tag `v*` (e.g. `v0.0.4`) → GitHub Release with 6 artifacts. Optional publishing to Open VSX (`OVSX_TOKEN`) and JetBrains Marketplace (`JB_TOKEN`) via secrets; VS Marketplace is skipped until account is ready.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep `vsc/themes/*.json` canonical, run `bun run validate` before PR.

## Author

Vadim Khristenko — `vadim@vai-rice.space` — MIT — https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme
