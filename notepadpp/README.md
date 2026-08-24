# Hatsune Miku Theme for Notepad++

[![CI](https://img.shields.io/github/actions/workflow/status/Vadim-Khristenko/HatsuneMikuEditorTheme/ci.yml?label=CI&labelColor=0d0e1a&color=39c5bb&style=for-the-badge)](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme/actions/workflows/ci.yml)

Notepad++ port — 4 themes, 21 lexers + Global Styles. Part of [HatsuneMikuEditorTheme](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme) monorepo. All themes are distributed under the **same MIT license** (root `LICENSE`).

## Variants

- Hatsune Miku Dark (`HatsuneMikuDark.xml`)
- Hatsune Miku Light (`HatsuneMikuLight.xml`)
- Hatsune Miku Sakura Dark (`HatsuneMikuSakuraDark.xml`)
- Hatsune Miku Sakura Light (`HatsuneMikuSakuraLight.xml`)

Covers C++, Java, C#, Python, JavaScript, JSON, HTML, XML, CSS/SCSS, SQL, Bash, Ruby, PHP, Go, Rust, YAML, Markdown, INI, Makefile, Lua + Global Styles.

## Installation

1. Build: `bun run package:notepadpp` → `dist/notepadpp-*.zip`
2. Notepad++ → Settings → Import → Import style theme(s) → select XML file
3. Settings → Style Configurator → select theme (restart if needed)

Unlisted languages fall back to Default Style.

## Development

```bash
bun run check
bun tools/package.ts notepadpp
```

## Author

Vadim Khristenko — `vadim@vai-rice.space` — MIT
