# Installation Guide

This guide will help you install the Learning Progress Plugin for Obsidian.

## Manual Installation

1. Download the latest release from the GitHub repository
2. Extract the ZIP file
3. Copy the extracted folder to your Obsidian vault's plugins folder:
   - On Windows: `C:\Users\YourUsername\AppData\Roaming\obsidian\YourVaultName\.obsidian\plugins\`
   - On macOS: `/Users/YourUsername/Library/Application Support/obsidian/YourVaultName/.obsidian/plugins/`
   - On Linux: `~/.obsidian/YourVaultName/.obsidian/plugins/`
4. Rename the folder to `learning-progress-tracker` (if it's not already named that)
5. Restart Obsidian
6. Go to Settings > Community plugins
7. Enable the "Learning Progress Tracker" plugin

## Required Files

The plugin consists of the following files:

- `main.js`: The main plugin code
- `manifest.json`: Plugin metadata
- `styles.css`: CSS styles for the plugin

Make sure all these files are in the plugin folder.

## Troubleshooting

If the plugin doesn't appear in your Community plugins list:

1. Check that all files are in the correct location
2. Verify that the plugin folder is named `learning-progress-tracker`
3. Restart Obsidian completely
4. Check the console for any error messages (Ctrl+Shift+I)

## Updating

To update the plugin:

1. Download the latest release
2. Delete the existing plugin folder
3. Follow the installation steps above with the new version

## Compatibility

- Requires Obsidian v0.15.0 or higher
- Compatible with all platforms (Windows, macOS, Linux)
- Works with both light and dark themes
