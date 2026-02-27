# Hatsune Miku Theme for Zed Editor

## Description

This repository contains theme files for the Zed editor. The themes provide a balanced color palette and readable syntax highlighting intended to improve focus and reduce eye strain while coding. Files in the `themes/` directory are ready to be used by Zed as custom themes.

## Contents

- `extension.toml` - Extension metadata used by Zed.
- `themes/` - JSON theme files. Example: `themes/mikuv1.json`.
- `LICENSE` - Project license (MIT).
- `.gitignore` - Recommended ignore rules for development.

## Installation

1. Clone the repository:
   - `git clone https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme-ZED.git`

2. Install the theme in Zed:
   - Open Zed and go to the Extensions section.
   - Click "Install Dev Extension" and point it to this repository.
   - Zed will immediately prompt you to choose a theme from those available in the repository; select the theme you want to use.

In the future, the theme may be published to Zed Extensions so it can be installed more easily.

3. Restart Zed if it does not immediately detect the new theme files.

## Usage

- Open Zed appearance settings.
- Select the installed Hatsune Miku theme from the theme list.
- If multiple theme variants are present, choose the variant that best matches your contrast and color preferences.

## Adding or Updating Themes

- Create or edit a JSON file inside the `themes/` directory following Zed's theme schema.
- Validate the JSON syntax before adding the file.
- Open a pull request describing the change if you want to contribute it to the main repository.

## Contributing

Contributions are welcome and appreciated. Typical workflow:

1. Fork the repository.
2. Create a descriptive branch for your change.
3. Make your changes and verify they work in Zed.
4. Open a pull request with a clear title and description of what you changed and why.

When contributing theme files:
- Keep JSON formatting consistent.
- Include a short comment in the PR describing the visual intent and any accessibility considerations.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Author

Vadim Khristenko  
Email: `just@vai-prog.ru`  
Repository: `https://github.com/Vadim-Khristenko/HatsuneMikuEditorTheme-ZED`
