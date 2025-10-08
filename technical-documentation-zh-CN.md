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
│   └── clibundle.js        # CLI入口文件
├── lib/
│   ├── config.js               # 配置文件处理
│   ├── package-manager.js      # 包管理器操作
│   ├── ui.js                   # 用户界面
│   └── utils.js                # 工具函数
├── config/
│   └── tools.json              # 工具配置文件
├── package.json                # 项目配置
└── README.md                   # 项目文档
```

## 核心模块设计

### 1. CLI入口模块 (bin/clibundle.js)

```javascript
#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const { mainMenu } = require('../lib/ui');

program
  .name('clibundle')
  .description('CLI Bundle工具管理器')
  .version('1.0.0');

// 直接启动主菜单
if (process.argv.length <= 2) {
  mainMenu();
} else {
  program.parse(process.argv);
}
```

### 2. 配置管理模块 (lib/config.js)

```javascript
const fs = require('fs-extra');
const path = require('path');

class ConfigManager {
  constructor() {
    this.configPath = path.join(__dirname, '../config/tools.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      return fs.readJsonSync(this.configPath);
    } catch (error) {
      console.error('配置文件加载失败:', error.message);
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

### 3. 包管理器模块 (lib/package-manager.js)

```javascript
const { spawn } = require('child_process');
const ora = require('ora');
const chalk = require('chalk');

class PackageManager {
  constructor() {
    this.packageManager = 'npm';
  }

  async install(packageName) {
    const spinner = ora(`安装 ${packageName}`).start();
    
    try {
      await this.runCommand('install', ['-g', packageName, '--loglevel=error']);
      spinner.succeed(`${packageName} 安装成功`);
      return true;
    } catch (error) {
      spinner.fail(`${packageName} 安装失败`);
      console.error(chalk.red(error.message));
      return false;
    }
  }

  async update(packageName) {
    const spinner = ora(`更新 ${packageName}`).start();
    
    try {
      await this.runCommand('install', ['-g', packageName, '--loglevel=error']);
      spinner.succeed(`${packageName} 更新成功`);
      return true;
    } catch (error) {
      spinner.fail(`${packageName} 更新失败`);
      console.error(chalk.red(error.message));
      return false;
    }
  }

  async uninstall(packageName) {
    const spinner = ora(`卸载 ${packageName}`).start();
    
    try {
      await this.runCommand('uninstall', ['-g', packageName, '--loglevel=error']);
      spinner.succeed(`${packageName} 卸载成功`);
      return true;
    } catch (error) {
      spinner.fail(`${packageName} 卸载失败`);
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
          reject(new Error(`${this.packageManager} ${command} 失败，退出码: ${code}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }
}
```

### 4. 用户界面模块 (lib/ui.js)

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
    console.log(chalk.blue('  CLI Bundle工具管理器'));
    console.log(chalk.blue('========================================\n'));

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '请选择操作:',
        choices: [
          { name: '安装CLI Bundle工具', value: 'install' },
          { name: '更新CLI Bundle工具', value: 'update' },
          { name: '卸载CLI Bundle工具', value: 'uninstall' },
          { name: '退出', value: 'exit' }
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
        console.log('再见!');
        process.exit(0);
    }
  }

  async installMode() {
    const uninstalledTools = this.configManager.getUninstalledTools();
    
    if (uninstalledTools.length === 0) {
      console.log(chalk.yellow('所有工具都已安装!'));
      return this.mainMenu();
    }

    const choices = uninstalledTools.map(tool => ({
      name: `${tool.name} - ${tool.installType} 包`,
      value: tool.id
    }));
    
    choices.push(new inquirer.Separator());
    choices.push({ name: '安装所有工具', value: 'all' });
    choices.push({ name: '取消', value: 'cancel' });

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: '选择要安装的工具:',
        choices: choices,
        validate: function(answer) {
          if (answer.length < 1) {
            return '至少选择一个工具';
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
      console.log(chalk.yellow('没有已安装的工具!'));
      return this.mainMenu();
    }

    const choices = installedTools.map(tool => ({
      name: `${tool.name} - ${tool.installType} 包`,
      value: tool.id
    }));
    
    choices.push(new inquirer.Separator());
    choices.push({ name: '更新所有工具', value: 'all' });
    choices.push({ name: '取消', value: 'cancel' });

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: '选择要更新的工具:',
        choices: choices,
        validate: function(answer) {
          if (answer.length < 1) {
            return '至少选择一个工具';
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
      console.log(chalk.yellow('没有已安装的工具!'));
      return this.mainMenu();
    }

    const choices = installedTools.map(tool => ({
      name: `${tool.name} - ${tool.installType} 包`,
      value: tool.id
    }));
    
    choices.push(new inquirer.Separator());
    choices.push({ name: '取消', value: 'cancel' });

    const { selectedTools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedTools',
        message: '选择要卸载的工具:',
        choices: choices,
        validate: function(answer) {
          if (answer.length < 1) {
            return '至少选择一个工具';
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
        message: `确定要卸载以下工具吗?\n${toolNames.join('\n')}`,
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

    this.showSummary('安装', successCount, failCount);
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

    this.showSummary('更新', successCount, failCount);
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

    this.showSummary('卸载', successCount, failCount);
  }

  showSummary(operation, successCount, failCount) {
    console.log(chalk.blue('\n========================================'));
    console.log(chalk.blue('  操作摘要'));
    console.log(chalk.blue('========================================'));
    console.log(chalk.green(`  [成功] ${operation}: ${successCount}`));
    if (failCount > 0) {
      console.log(chalk.red(`  [失败] ${operation}: ${failCount}`));
    }
    console.log(chalk.blue('========================================\n'));
  }
}

module.exports = { UI, mainMenu };
```

## 配置文件设计

### config/tools.json

```json
{
  "version": "1.0.0",
  "description": CLI Bundle工具配置文件,
  "tools": [
    {
      "id": "claude-code",
      "name": "Claude Code",
      "command": "claude",
      "installType": "npm",
      "packageName": "@anthropic-ai/claude-code",
      "description": "Anthropic官方Claude CLI工具",
      "enabled": true
    },
    {
      "id": "iflow-cli",
      "name": "iFlow CLI",
      "command": "iflow",
      "installType": "npm",
      "packageName": "@iflow-ai/iflow-cli",
      "description": "iFlow CLI Bundle工具",
      "enabled": true
    }
  ]
}
```

## 部署和发布

### package.json配置

```json
{
  "name": "clibundle",
  "version": "1.0.0",
  "description": "CLI Bundle工具管理器",
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
    "inquirer": "^9.0.0",
    "chalk": "^5.0.0",
    "ora": "^6.0.0",
    "fs-extra": "^10.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "jest": "^28.0.0"
  },
  "keywords": [
    "ai",
    "cli",
    "tools",
    "manager"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```

### 发布到npm

```bash
# 登录npm
npm login

# 发布包
npm publish

# 全局安装测试
npm install -g clibundle
clibundle
```

## 扩展性考虑

1. **多包管理器支持**：可以扩展支持yarn、pnpm等包管理器
2. **插件系统**：支持第三方工具配置插件
3. **配置同步**：支持从远程URL加载配置文件
4. **版本锁定**：支持工具版本锁定和回滚
5. **批量操作**：支持配置文件预设的批量安装方案

## 开发流程

### 1. 初始化项目

```bash
mkdir clibundle
cd clibundle
npm init -y
```

### 2. 安装依赖

```bash
npm install commander inquirer chalk ora fs-extra
npm install --save-dev eslint jest
```

### 3. 创建目录结构

```bash
mkdir -p bin lib config
```

### 4. 创建入口文件

```bash
touch bin/clibundle.js
chmod +x bin/clibundle.js
```

### 5. 创建核心模块

```bash
touch lib/config.js lib/package-manager.js lib/ui.js lib/utils.js
touch config/tools.json
```

### 6. 测试和调试

```bash
# 本地测试
npm link
clibundle

# 运行测试
npm test

# 代码检查
npm run lint
```

## 使用示例

### 安装工具

```
========================================
  CLI Bundle工具管理器
========================================

? 请选择操作: 安装CLI Bundle工具
? 选择要安装的工具: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◉ Claude Code - npm 包
 ◉ iFlow CLI - npm package
 ◉ 安装所有工具
 ◯ 取消
```

### 更新工具

```
========================================
  CLI Bundle工具管理器
========================================

? 请选择操作: 更新CLI Bundle工具
? 选择要更新的工具: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◉ Claude Code - npm 包
 ◉ iFlow CLI - npm package
 ◉ 更新所有工具
 ◯ 取消
```

### 卸载工具

```
========================================
  CLI Bundle工具管理器
========================================

? 请选择操作: 卸载CLI Bundle工具
? 选择要卸载的工具: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◉ Claude Code - npm 包
 ◉ iFlow CLI - npm package
 ◯ 取消

? 确定要卸载以下工具吗?
Claude Code
iFlow CLI (y/N)
```

## 总结

这个基于npm的CLI Bundle工具管理器提供了完整的工具管理功能，包括安装、更新和卸载。通过模块化设计和配置文件管理，具有良好的扩展性和维护性。使用现代Node.js生态系统中的流行库，提供了友好的用户界面和良好的用户体验。

该实现可以作为CLI Bundle工具管理的标准化解决方案，也可以根据具体需求进行定制和扩展。