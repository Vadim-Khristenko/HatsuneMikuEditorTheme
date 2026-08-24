# Hatsune Miku Theme for Neovim

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)

Neovim ≥0.8 port — 4 colorschemes, Treesitter + LSP + terminal ANSI. Part of [HatsuneMikuEditorTheme](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme) monorepo. All themes are distributed under the **same MIT license** (root `LICENSE`).

## Variants

- `hatsune-miku` — Miku Dark
- `hatsune-miku-light` — Miku Light
- `hatsune-miku-sakura` — Sakura Dark
- `hatsune-miku-sakura-light` — Sakura Light

## Installation

```bash
bun run package:neovim # → dist/neovim-*.zip
```

Copy `colors/*.lua` to `~/.config/nvim/colors/` (Linux/macOS) or `~/AppData/Local/nvim/colors/` (Windows):

```vim
:colorscheme hatsune-miku
```

lazy.nvim:
```lua
{ dir = "path/to/neovim", lazy = false, priority = 1000 }
```

Vim (non-Neovim) is not supported.

## Development

```bash
bun run check
bun tools/package.ts neovim
```

## Author

Vadim Khristenko — `vadim@vai-rice.space` — MIT
