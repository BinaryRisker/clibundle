#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const { mainMenu } = require('../lib/ui');
const InitManager = require('../lib/init');
const ConfigManager = require('../lib/config');
const PackageManager = require('../lib/package-manager');

program
  .name('clibundle')
  .description('CLI Bundle Tool Manager')
  .version('1.0.0');

// Add init command
program
  .command('init')
  .description('Initialize configuration file')
  .action(async () => {
    const initManager = new InitManager();
    await initManager.init();
  });

// Add install command
program
  .command('install [toolName]')
  .description('Install CLI tools')
  .argument('[toolName]', 'Name of the tool to install')
  .option('-a, --all', 'Install all available tools')
  .action(async (toolName, options) => {
    const configManager = new ConfigManager();
    const packageManager = new PackageManager();
    
    if (options && options.all) {
      const uninstalledTools = configManager.getUninstalledTools();
      for (const tool of uninstalledTools) {
        await packageManager.install(tool.packageName);
      }
    } else if (toolName) {
      const tool = configManager.getToolById(toolName);
      if (tool) {
        await packageManager.install(tool.packageName);
      } else {
        console.error(`Tool "${toolName}" not found in configuration`);
      }
    } else {
      // Launch interactive install mode
      const { UI } = require('../lib/ui');
      const ui = new UI();
      await ui.installMode();
    }
  });

// Add update command
program
  .command('update [toolName]')
  .description('Update CLI tools')
  .argument('[toolName]', 'Name of the tool to update')
  .option('-a, --all', 'Update all installed tools')
  .action(async (toolName, options) => {
    const configManager = new ConfigManager();
    const packageManager = new PackageManager();
    
    if (options && options.all) {
      const installedTools = configManager.getInstalledTools();
      for (const tool of installedTools) {
        await packageManager.update(tool.packageName);
      }
    } else if (toolName) {
      const tool = configManager.getToolById(toolName);
      if (tool) {
        await packageManager.update(tool.packageName);
      } else {
        console.error(`Tool "${toolName}" not found in configuration`);
      }
    } else {
      // Launch interactive update mode
      const { UI } = require('../lib/ui');
      const ui = new UI();
      await ui.updateMode();
    }
  });

// Add uninstall command
program
  .command('uninstall [toolName]')
  .description('Uninstall CLI tools')
  .argument('[toolName]', 'Name of the tool to uninstall')
  .option('-a, --all', 'Uninstall all installed tools')
  .action(async (toolName, options) => {
    const configManager = new ConfigManager();
    const packageManager = new PackageManager();
    
    if (options && options.all) {
      const installedTools = configManager.getInstalledTools();
      for (const tool of installedTools) {
        await packageManager.uninstall(tool.packageName);
      }
    } else if (toolName) {
      const tool = configManager.getToolById(toolName);
      if (tool) {
        await packageManager.uninstall(tool.packageName);
      } else {
        console.error(`Tool "${toolName}" not found in configuration`);
      }
    } else {
      // Launch interactive uninstall mode
      const { UI } = require('../lib/ui');
      const ui = new UI();
      await ui.uninstallMode();
    }
  });

// Add list command
program
  .command('list')
  .description('List all available tools with their installation status')
  .action(() => {
    const configManager = new ConfigManager();
    const enabledTools = configManager.getEnabledTools();
    const installedTools = configManager.getInstalledTools();
    
    console.log('\nAvailable Tools:');
    console.log('================');
    
    for (const tool of enabledTools) {
      const isInstalled = installedTools.some(t => t.id === tool.id);
      const status = isInstalled ? '✓ Installed' : '✗ Not installed';
      console.log(`${tool.name} (${tool.id}): ${status}`);
    }
  });

// Launch main menu directly if no command provided
if (process.argv.length <= 2) {
  mainMenu();
} else {
  program.parse(process.argv);
}