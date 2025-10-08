# Technical Implementation Document for npm-based CLI Bundle Tool Manager

## Project Overview

Implement a cross-platform CLI Bundle tool manager based on npm, supporting installation, updates, and uninstallation of various programming tools through an interactive menu.

## Technical Architecture

### Core Technology Stack
- **Node.js** - Runtime environment
- **npm** - Package manager and installation source
- **Commander.js** - Command-line interface framework
- **Inquirer.js** - Interactive command-line interface
- **Chalk** - Terminal color output
- **Ora** - Loading animation
- **fs-extra** - File system operations
- **semver** - Version comparison

### Project Structure
```
clibundle/
├── bin/
│   └── clibundle.js        # CLI entry file
├── lib/
│   ├── config.js               # Configuration file handling
│   ├── package-manager.js      # Package manager operations
│   ├── ui.js                   # User interface
│   └── utils.js                # Utility functions
├── config/
│   └── tools.json              # Tools configuration file
├── package.json                # Project configuration
└── README.md                   # Project documentation
```

## Core Module Design

### 1. CLI Entry Module (bin/clibundle.js)

```javascript
#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const { mainMenu } = require('../lib/ui');

program
  .name('clibundle')
  .description('CLI Bundle Tool Manager')
  .version('1.0.0');

// Launch main menu directly
if (process.argv.length <= 2) {
  mainMenu();
} else {
  program.parse(process.argv);
}
```

### 2. Configuration Management Module (lib/config.js)

```javascript
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    // .clibundle directory in user home directory
    this.userConfigDir = path.join(os.homedir(), '.clibundle');
    this.configPath = path.join(this.userConfigDir, 'tools.json');
    this.defaultConfigPath = path.join(__dirname, '../config/tools.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      // If user config file doesn't exist, try to create it
      if (!fs.existsSync(this.configPath)) {
        this.initUserConfig();
      }
      return fs.readJsonSync(this.configPath);
    } catch (error) {
      console.error('Failed to load configuration file:', error.message);
      process.exit(1);
    }
  }

  initUserConfig() {
    try {
      // Create .clibundle directory
      fs.ensureDirSync(this.userConfigDir);
      
      // If default config file exists, copy to user directory
      if (fs.existsSync(this.defaultConfigPath)) {
        fs.copySync(this.defaultConfigPath, this.configPath);
      } else {
        // Create default configuration file
        const defaultConfig = {
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
        };
        fs.writeJsonSync(this.configPath, defaultConfig, { spaces: 2 });
      }
    } catch (error) {
      console.error('Failed to initialize configuration file:', error.message);
      process.exit(1);
    }
  }

  getEnabledTools() {
    return this.config.tools.filter(tool => tool.enabled);
  }

  getToolById(id) {
    return this.config.tools.find(tool => tool.id === id);
  }

  getInstalledTools() {
    return this.getEnabledTools().filter(tool => this.isToolInstalled(tool));
  }

  getUninstalledTools() {
    return this.getEnabledTools().filter(tool => !this.isToolInstalled(tool));
  }

  isToolInstalled(tool) {
    try {
      require.resolve(tool.command);
      return true;
    } catch (error) {
      return false;
    }
  }
}
```

### 3. Package Manager Module (lib/package-manager.js)

```javascript
const { spawn } = require('child_process');
const ora = require('ora');
const chalk = require('chalk');

class PackageManager {
  constructor() {
    this.packageManager = 'npm';
  }

  async install(packageName) {
    const spinner = ora(`Installing ${packageName}`).start();
    
    try {
      await this.runCommand('install', ['-g', packageName, '--loglevel=error']);
      spinner.succeed(`${packageName} installed successfully`);
      return true;
    } catch (error) {
      spinner.fail(`${packageName} installation failed`);
      console.error(chalk.red(error.message));
      return false;
    }
  }

  async update(packageName) {
    const spinner = ora(`Updating ${packageName}`).start();
    
    try {
      await this.runCommand('install', ['-g', packageName, '--loglevel=error']);
      spinner.succeed(`${packageName} updated successfully`);
      return true;
    } catch (error) {
      spinner.fail(`${packageName} update failed`);
      console.error(chalk.red(error.message));
      return false;
    }
  }

  async uninstall(packageName) {
    const spinner = ora(`Uninstalling ${packageName}`).start();
    
    try {
      await this.runCommand('uninstall', ['-g', packageName, '--loglevel=error']);
      spinner.succeed(`${packageName} uninstalled successfully`);
      return true;
    } catch (error) {
      spinner.fail(`${packageName} uninstallation failed`);
      console.error(chalk.red(error.message));
      return false;
    }
  }

  runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const process = spawn(this.packageManager, [command, ...args]);
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`${this.packageManager} ${command} failed, exit code: ${code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }
}
```

### 4. User Interface Module (lib/ui.js)

```javascript
const inquirer = require('inquirer');
const chalk = require('chalk');
const ConfigManager = require('./config');
const PackageManager = require('./package-manager');

class UI {
  constructor() {
    this.configManager = new ConfigManager();
    this.packageManager = new PackageManager();
  }

  async mainMenu() {
    console.log(chalk.blue('\n========================================'));
    console.log(chalk.blue('  CLI Bundle Tool Manager'));
    console.log(chalk.blue('========================================\n'));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Please select an action:',
        choices: [
          { name: 'Install CLI Bundle Tools', value: 'install' },
          { name: 'Update CLI Bundle Tools', value: 'update' },
          { name: 'Uninstall CLI Bundle Tools', value: 'uninstall' },
          { name: 'Exit', value: 'exit' }
        ]
      }
    ]);

    switch (action) {
      case 'install':
        await this.installMode();
        break;
      case 'update':
        await this.updateMode();
        break;
      case 'uninstall':
        await this.uninstallMode();
        break;
      case 'exit':
        console.log('Goodbye!');
        process.exit(0);
    }
  }

  async installMode() {
    const uninstalledTools = this.configManager.getUninstalledTools();
    
    if (uninstalledTools.length === 0) {
      console.log(chalk.yellow('All tools are already installed!'));
      return this.mainMenu();
    }

    const choices = uninstalledTools.map(tool => ({
      name: `${tool.name} - ${tool.installType} package`,
      value: tool.id
    }));
    
    choices.push(new inquirer.Separator());
    choices.push({ name: 'Install all tools', value: 'all' });
    choices.push({ name: 'Cancel', value: 'cancel' });

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: 'Select tools to install:',
        choices: choices,
        validate: function(answer) {
          if (answer.length < 1) {
            return 'Please select at least one tool';
          }
          return true;
        }
      }
    ]);

    if (selectedTools.includes('cancel')) {
      return this.mainMenu();
    }

    let toolsToInstall = selectedTools;
    if (selectedTools.includes('all')) {
      toolsToInstall = uninstalledTools.map(tool => tool.id);
    }

    await this.installTools(toolsToInstall);
    this.mainMenu();
  }

  async updateMode() {
    const installedTools = this.configManager.getInstalledTools();
    
    if (installedTools.length === 0) {
      console.log(chalk.yellow('No installed tools found!'));
      return this.mainMenu();
    }

    const choices = installedTools.map(tool => ({
      name: `${tool.name} - ${tool.installType} package`,
      value: tool.id
    }));
    
    choices.push(new inquirer.Separator());
    choices.push({ name: 'Update all tools', value: 'all' });
    choices.push({ name: 'Cancel', value: 'cancel' });

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: 'Select tools to update:',
        choices: choices,
        validate: function(answer) {
          if (answer.length < 1) {
            return 'Please select at least one tool';
          }
          return true;
        }
      }
    ]);

    if (selectedTools.includes('cancel')) {
      return this.mainMenu();
    }

    let toolsToUpdate = selectedTools;
    if (selectedTools.includes('all')) {
      toolsToUpdate = installedTools.map(tool => tool.id);
    }

    await this.updateTools(toolsToUpdate);
    this.mainMenu();
  }

  async uninstallMode() {
    const installedTools = this.configManager.getInstalledTools();
    
    if (installedTools.length === 0) {
      console.log(chalk.yellow('No installed tools found!'));
      return this.mainMenu();
    }

    const choices = installedTools.map(tool => ({
      name: `${tool.name} - ${tool.installType} package`,
      value: tool.id
    }));
    
    choices.push(new inquirer.Separator());
    choices.push({ name: 'Cancel', value: 'cancel' });

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: 'Select tools to uninstall:',
        choices: choices,
        validate: function(answer) {
          if (answer.length < 1) {
            return 'Please select at least one tool';
          }
          return true;
        }
      }
    ]);

    if (selectedTools.includes('cancel')) {
      return this.mainMenu();
    }

    const toolNames = selectedTools.map(id => {
      const tool = this.configManager.getToolById(id);
      return tool.name;
    });

    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Are you sure you want to uninstall the following tools?\n${toolNames.join('\n')}`,
        default: false
      }
    ]);

    if (confirmed) {
      await this.uninstallTools(selectedTools);
    }

    this.mainMenu();
  }

  async installTools(toolIds) {
    let successCount = 0;
    let failCount = 0;

    for (const toolId of toolIds) {
      const tool = this.configManager.getToolById(toolId);
      if (await this.packageManager.install(tool.packageName)) {
        successCount++;
      } else {
        failCount++;
      }
    }

    this.showSummary('Installation', successCount, failCount);
  }

  async updateTools(toolIds) {
    let successCount = 0;
    let failCount = 0;

    for (const toolId of toolIds) {
      const tool = this.configManager.getToolById(toolId);
      if (await this.packageManager.update(tool.packageName)) {
        successCount++;
      } else {
        failCount++;
      }
    }

    this.showSummary('Update', successCount, failCount);
  }

  async uninstallTools(toolIds) {
    let successCount = 0;
    let failCount = 0;

    for (const toolId of toolIds) {
      const tool = this.configManager.getToolById(toolId);
      if (await this.packageManager.uninstall(tool.packageName)) {
        successCount++;
      } else {
        failCount++;
      }
    }

    this.showSummary('Uninstallation', successCount, failCount);
  }

  showSummary(operation, successCount, failCount) {
    console.log(chalk.blue('\n========================================'));
    console.log(chalk.blue('  Operation Summary'));
    console.log(chalk.blue('========================================'));
    console.log(chalk.green(`  [Success] ${operation}: ${successCount}`));
    if (failCount > 0) {
      console.log(chalk.red(`  [Failed] ${operation}: ${failCount}`));
    }
    console.log(chalk.blue('========================================\n'));
  }
}

// Export main menu function and UI class
async function mainMenu() {
  const ui = new UI();
  await ui.mainMenu();
}

module.exports = { UI, mainMenu };
```

## Configuration File Design

### config/tools.json

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

## Deployment and Publishing

### package.json Configuration

```json
{
  "name": "clibundle",
  "version": "1.0.0",
  "description": "CLI Bundle Tool Manager",
  "main": "lib/ui.js",
  "bin": {
    "clibundle": "./bin/clibundle.js"
  },
  "scripts": {
    "start": "node bin/clibundle.js",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "commander": "^9.0.0",
    "inquirer": "^8.2.5",
    "chalk": "^4.1.2",
    "ora": "^5.4.1",
    "fs-extra": "^10.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "jest": "^28.0.0"
  },
  "keywords": [
    "cli",
    "tools",
    "manager",
    "bundle"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

### Publishing to npm

```bash
# Login to npm
npm login

# Publish package
npm publish

# Global installation test
npm install -g clibundle
clibundle
```

## Extensibility Considerations

1. **Multi-package manager support**: Can be extended to support yarn, pnpm and other package managers
2. **Plugin system**: Support third-party tool configuration plugins
3. **Configuration synchronization**: Support loading configuration files from remote URLs
4. **Version locking**: Support tool version locking and rollback
5. **Batch operations**: Support batch installation solutions preset in configuration files

## Development Workflow

### 1. Initialize Project

```bash
mkdir clibundle
cd clibundle
npm init -y
```

### 2. Install Dependencies

```bash
npm install commander inquirer chalk ora fs-extra
npm install --save-dev eslint jest
```

### 3. Create Directory Structure

```bash
mkdir -p bin lib config
```

### 4. Create Entry File

```bash
touch bin/clibundle.js
chmod +x bin/clibundle.js
```

### 5. Create Core Modules

```bash
touch lib/config.js lib/package-manager.js lib/ui.js lib/utils.js
touch config/tools.json
```

### 6. Testing and Debugging

```bash
# Local testing
npm link
clibundle

# Run tests
npm test

# Code checking
npm run lint
```

## Usage Examples

### Installing Tools

```
========================================
  CLI Bundle Tool Manager
========================================

? Please select an action: Install CLI Bundle Tools
? Select tools to install: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◉ Claude Code - npm package
 ◉ iFlow CLI - npm package
 ◉ Install all tools
 ◯ Cancel
```

### Updating Tools

```
========================================
  CLI Bundle Tool Manager
========================================

? Please select an action: Update CLI Bundle Tools
? Select tools to update: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◉ Claude Code - npm package
 ◉ iFlow CLI - npm package
 ◉ Update all tools
 ◯ Cancel
```

### Uninstalling Tools

```
========================================
  CLI Bundle Tool Manager
========================================

? Please select an action: Uninstall CLI Bundle Tools
? Select tools to uninstall: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◉ Claude Code - npm package
 ◉ iFlow CLI - npm package
 ◯ Cancel

? Are you sure you want to uninstall the following tools?
Claude Code
iFlow CLI (y/N)
```

## Summary

This npm-based CLI Bundle tool manager provides complete tool management functionality, including installation, updates, and uninstallation. Through modular design and configuration file management, it has good extensibility and maintainability. Using popular libraries in the modern Node.js ecosystem, it provides a friendly user interface and good user experience.

This implementation can serve as a standardized solution for CLI Bundle tool management, and can also be customized and expanded according to specific needs.