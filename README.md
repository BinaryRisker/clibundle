# CLI Bundle

An npm-based CLI tool manager that supports installing, updating, and uninstalling various programming tools through an interactive menu.

## Features

- 🔧 Manage installation, updates, and uninstallation of multiple CLI tools
- 📦 npm-based package management
- 🎯 Interactive command-line interface
- 📁 User configuration files stored in `~/.clibundle` directory
- 🚀 Support for batch operations

## Installation

```bash
npm install -g clibundle
```

## Usage

### Initialize Configuration

Before first use, you need to initialize the configuration file:

```bash
clibundle init
```

This will create a `.clibundle` directory and a default `tools.json` configuration file in your home directory.

### Launch Manager

Run the command directly to start the interactive menu:

```bash
clibundle
```

### Command Line Options

```bash
# Show help information
clibundle --help

# Show version number
clibundle --version

# Initialize configuration file
clibundle init

# List all available tools with their installation status
clibundle list

# Install a specific tool
clibundle install <tool-name>

# Install all available tools
clibundle install --all

# Update a specific tool
clibundle update <tool-name>

# Update all installed tools
clibundle update --all

# Uninstall a specific tool
clibundle uninstall <tool-name>

# Uninstall all installed tools
clibundle uninstall --all
```

## Configuration File

The configuration file is located at `~/.clibundle/tools.json` with the following format:

```json
{
  "version": "1.0.0",
  "description": "CLI Bundle tools configuration file",
  "tools": [
    {
      "id": "claude-code",
      "name": "Claude Code",
      "command": "claude",
      "installType": "npm",
      "packageName": "@anthropic-ai/claude-code",
      "description": "Anthropic official Claude CLI tool",
      "enabled": true
    },
    {
      "id": "iflow-cli",
      "name": "iFlow CLI",
      "command": "iflow",
      "installType": "npm",
      "packageName": "@iflow-ai/iflow-cli",
      "description": "iFlow AI CLI tool",
      "enabled": true
    }
  ]
}
```

### Configuration Field Descriptions

- `id`: Unique identifier for the tool
- `name`: Display name of the tool
- `command`: Command-line command name
- `installType`: Installation type (currently supports "npm")
- `packageName`: npm package name
- `description`: Tool description
- `enabled`: Whether the tool is enabled

## Development

### Local Installation

```bash
# Clone repository
git clone <repository-url>
cd clibundle

# Install dependencies
npm install

# Link to global
npm link

# Run
clibundle
```

### Project Structure

```
clibundle/
├── bin/
│   └── clibundle.js          # CLI entry file
├── lib/
│   ├── config.js             # Configuration file handling
│   ├── init.js               # Initialization management
│   ├── package-manager.js    # Package manager operations
│   ├── ui.js                 # User interface
│   └── utils.js              # Utility functions
├── config/
│   └── tools.json            # Default tools configuration file
├── package.json              # Project configuration
└── README.md                 # Project documentation
```

## License

MIT