# Hatsune Miku Theme for Visual Studio Code

> Check out also the Zed Editor version of the Hatsune Miku theme: [Hatsune Miku Theme for Zed Editor](https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme-ZED)

This README provides instructions for Visual Studio Code users who want to install and use the Hatsune Miku theme files that are maintained in this repository. 

## Quick installation (VSIX)

1. Download the VSIX file from the repository root. The file is named in the format:
   - `hatsune-miku-by-vai-theme-<version>.vsix`

2. In Visual Studio Code:
   - Open the Extensions view.
   - Click the menu (three dots) in the top-right of the Extensions view.
   - Choose "Install from VSIX..." and select the downloaded `.vsix` file.
   - After installation, reload or restart VS Code if prompted.

3. Activate the theme:
   - Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
   - Run "Preferences: Color Theme" and choose the Hatsune Miku theme you installed.

## Alternative: use theme JSON files directly

If you prefer not to install a VSIX, you can inspect or adapt the JSON theme files located in the repository `themes/` directory. Note that copying raw JSON into VS Code requires packaging or using an existing extension structure; installing from VSIX is the recommended approach for most users.

## Changelog

A changelog for the project lives at the repository root in `CHANGELOG.md`. Recent updates relevant to VS Code users:
- Added this VS Code README and documented VSIX installation.

If `CHANGELOG.md` is not present locally, check the repository on GitHub for the latest release notes and entries.

## Contributing

If you create or update a theme variant for VS Code, please:
- Keep JSON formatting consistent.
- Test the theme by installing the packaged VSIX or by loading the extension in a development instance of VS Code.
- Open a pull request with a short description of the visual intent and any accessibility considerations.

## Author

Vadim Khristenko  
Email: `just@vai-prog.ru`  
Repository: `https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme-VSC`
