# CLI Bundle

An npm-based CLI tool manager that supports installing, updating, and uninstalling various programming tools through an interactive menu.

## Features

- 🔧 Manage installation, updates, and uninstallation of multiple CLI tools
- 📦 npm-based package management
- 🎯 Interactive command-line interface
- 📁 User configuration files stored in `~/.clibundle` directory
- 🚀 Support for batch operations
- 🤖 AI profiles and model switching with reusable multi-tool mappings

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

### AI Model & Tools

Initialize AI configuration (creates `~/.clibundle/ai.json` with defaults):

```bash
clibundle ai:init
```

List AI profiles and configured targets:

```bash
clibundle ai:list
```

Switch active AI profile:

```bash
clibundle ai:switch <profile-name>
```

Apply active/selected profile values (api base, model, etc.) to target config files:

```bash
# apply active profile to all targets
clibundle ai:apply

# apply a specific profile
clibundle ai:apply --profile anthopic-claude-3-5-sonnet

# apply to a single target by name/toolId
clibundle ai:apply --target openai-node-sdk
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
    },
    {
      "id": "openai-codex",
      "name": "OpenAI Codex",
      "command": "codex",
      "installType": "npm",
      "packageName": "@openai/codex",
      "description": "OpenAI Codex CLI tool for code generation",
      "enabled": true
    },
    {
      "id": "google-gemini",
      "name": "Google Gemini CLI",
      "command": "gemini",
      "installType": "npm",
      "packageName": "@google/gemini-cli",
      "description": "Google Gemini AI CLI tool",
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

## AI Configuration (ai.json)

Location: `~/.clibundle/ai.json`

### Simplified Configuration (v2.0)

Just configure providers and the active one:

```json
{
  "version": "2.0.0",
  "providers": [
    {
      "name": "OpenAI Official",
      "type": "openai",
      "apiKey": "${OPENAI_API_KEY}",
      "baseUrl": "https://api.openai.com/v1",
      "model": "gpt-4o-mini"
    },
    {
      "name": "Anthropic Official",
      "type": "anthropic",
      "apiKey": "${ANTHROPIC_API_KEY}",
      "baseUrl": "https://api.anthropic.com",
      "model": "claude-3-5-sonnet-latest"
    },
    {
      "name": "Google Gemini",
      "type": "google",
      "apiKey": "${GEMINI_API_KEY}",
      "model": "gemini-1.5-pro"
    },
    {
      "name": "iFlow Official",
      "type": "iflow",
      "apiKey": "${IFLOW_API_KEY}",
      "baseUrl": "https://api.iflow.cn/v1",
      "model": "iflow-default"
    }
  ],
  "active": "OpenAI Official"
}
```

### Configuration Fields

- **providers**: List of AI providers, each contains:
  - `name`: Provider name (custom)
  - `type`: Provider type (`openai`/`anthropic`/`google`/`iflow`)
  - `apiKey`: API key, supports `${ENV_VAR}` syntax
  - `baseUrl`: API base URL
  - `model`: Model name
- **active**: Currently active provider name

### Built-in Adapters

The tool automatically configures corresponding CLI tools based on `provider.type`:

- `openai` → Auto-configure `~/.codex/auth.json` and `~/.codex/config.toml`
- `anthropic` → Auto-configure `~/.claude/settings.json`
- `google` → Auto-configure `~/.gemini/settings.json`
- `iflow` → Auto-configure `~/.iflow/settings.json`

### Quick Start (3 Steps)

1. Set environment variable (Windows PowerShell):
```powershell
$env:OPENAI_API_KEY = "sk-..."
```

2. Switch provider:
```bash
clibundle ai:switch "OpenAI Official"
```

3. Apply configuration:
```bash
clibundle ai:apply
```

### Supported Tools

Automatically writes to these configuration files:

- **OpenAI Codex**: Reference [CC Switch](https://github.com/farion1231/cc-switch)
  - `~/.codex/auth.json`
  - `~/.codex/config.toml`

- **Claude Code**: Reference [CC Switch](https://github.com/farion1231/cc-switch)
  - `~/.claude/settings.json`

- **iFlow CLI**: Reference [iFlow Configuration](https://platform.iflow.cn/cli/configuration/settings)
  - `~/.iflow/settings.json`

- **Google Gemini CLI**: Reference [Gemini CLI Configuration](https://github.com/google-gemini/gemini-cli)
  - `~/.gemini/settings.json`

### Advanced: Custom Mappings (Optional)

To add custom mappings or support other tools, add `customTargets` field:

```json
{
  "customTargets": [
    {
      "type": "json",
      "path": "~/custom/path/config.json",
      "mapping": {
        "apiKey": "auth.key",
        "baseUrl": "api.endpoint"
      }
    }
  ]
}
```

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