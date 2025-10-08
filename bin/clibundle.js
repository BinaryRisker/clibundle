#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const { mainMenu } = require('../lib/ui');
const InitManager = require('../lib/init');
const ConfigManager = require('../lib/config');
const PackageManager = require('../lib/package-manager');
const AIConfigManager = require('../lib/ai-config');
const { applyAIProfile } = require('../lib/ai-apply');

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

// AI: init
program
  .command('ai:init')
  .description('Initialize AI configuration file')
  .action(async () => {
    const initManager = new InitManager();
    await initManager.init();
  });

// AI: list providers and tools
program
  .command('ai:list')
  .description('List AI providers and tool configurations')
  .action(() => {
    const ai = new AIConfigManager();
    const providers = ai.getProfiles();
    
    console.log('\nAI Providers:');
    console.log('=============');
    for (const p of providers) {
      console.log(`- ${p.name}`);
      console.log(`    type: ${p.type}`);
      console.log(`    model: ${p.model}`);
      console.log(`    baseUrl: ${p.baseUrl}`);
      console.log(`    apiKey: ${p.apiKey || '(not set)'}`);
      console.log('');
    }

    const toolsConfig = ai.getToolsConfig();
    if (Object.keys(toolsConfig).length > 0) {
      console.log('Tool Configurations:');
      console.log('====================');
      for (const [toolId, config] of Object.entries(toolsConfig)) {
        const status = config.enabled ? '✓' : '✗';
        console.log(`${status} ${toolId} → ${config.provider}`);
      }
      console.log('');
    }
  });

// AI: switch profile (v2.0 compatibility)
program
  .command('ai:switch <profile>')
  .description('Switch active AI profile (applies to all tools)')
  .action((profile) => {
    try {
      const ai = new AIConfigManager();
      const p = ai.setActiveProfile(profile);
      console.log(`Active AI profile switched to: ${p.name}`);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

// AI: set tool provider (v2.1 new)
program
  .command('ai:set <toolId> <provider>')
  .description('Set provider for a specific tool')
  .action((toolId, provider) => {
    try {
      const ai = new AIConfigManager();
      const p = ai.setToolProvider(toolId, provider);
      console.log(`Tool ${toolId} now uses provider: ${p.name}`);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

// AI: enable/disable tool
program
  .command('ai:enable <toolId>')
  .description('Enable a tool')
  .action((toolId) => {
    try {
      const ai = new AIConfigManager();
      ai.enableTool(toolId, true);
      console.log(`Tool ${toolId} enabled`);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

program
  .command('ai:disable <toolId>')
  .description('Disable a tool')
  .action((toolId) => {
    try {
      const ai = new AIConfigManager();
      ai.enableTool(toolId, false);
      console.log(`Tool ${toolId} disabled`);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });


// AI: apply configurations
program
  .command('ai:apply')
  .description('Apply AI configurations to tools')
  .option('-p, --profile <name>', 'Apply single provider to all tools (v2.0 compatibility)')
  .option('-t, --tool <toolId>', 'Apply configuration for a specific tool only')
  .action(async (options) => {
    try {
      const { profile, tool } = options || {};
      const result = await applyAIProfile({ profileName: profile, toolId: tool });
      
      if (result.profile) {
        // v2.0 compatibility mode
        console.log(`\nApplied Provider: ${result.profile}`);
      } else {
        // v2.1 multi-tool mode
        console.log('\nApplied Tools:');
        for (const [toolId, providerName] of Object.entries(result.tools)) {
          console.log(`- ${toolId} → ${providerName}`);
        }
      }
      
      console.log('\nResults:');
      for (const r of result.results) {
        console.log(`- ${r.ok ? '✓' : '✗'} ${r.target} [${r.type}] -> ${r.file}${r.ok ? '' : `  (${r.error})`}`);
      }
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });

// Launch main menu directly if no command provided
if (process.argv.length <= 2) {
  mainMenu();
} else {
  program.parse(process.argv);
}