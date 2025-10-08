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
      name: `${tool.name} - ${tool.installType} 包`,
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
      name: `${tool.name} - ${tool.installType} 包`,
      value: tool.id
    }));
    
    choices.push(new inquirer.Separator());
    choices.push({ name: 'Update all tools', value: 'all' });
    choices.push({ name: '取消', value: 'cancel' });

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
      name: `${tool.name} - ${tool.installType} 包`,
      value: tool.id
    }));
    
    choices.push(new inquirer.Separator());
    choices.push({ name: '取消', value: 'cancel' });

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
        message: `Are you sure you want to uninstall the following tools?
${toolNames.join('\n')}`,
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

// 导出主菜单函数和UI类
async function mainMenu() {
  const ui = new UI();
  await ui.mainMenu();
}

module.exports = { UI, mainMenu };