const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const ora = require('ora');

class InitManager {
  constructor() {
    this.userConfigDir = path.join(os.homedir(), '.clibundle');
    this.configPath = path.join(this.userConfigDir, 'tools.json');
    this.defaultConfigPath = path.join(__dirname, '../config/tools.json');
  }

  async init() {
    const spinner = ora('Initializing CLI Bundle configuration').start();
    
    try {
      // Check if already initialized
      if (fs.existsSync(this.configPath)) {
        spinner.warn('Configuration file already exists');
        const { overwrite } = await require('inquirer').prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: 'Do you want to overwrite the existing configuration file?',
            default: false
          }
        ]);
        
        if (!overwrite) {
          console.log(chalk.yellow('Initialization cancelled'));
          return;
        }
      }

      // Create .clibundle directory
      fs.ensureDirSync(this.userConfigDir);
      
      // Copy default configuration
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
      
      spinner.succeed('Configuration file initialization completed');
      console.log(chalk.green(`Configuration file location: ${this.configPath}`));
    } catch (error) {
      spinner.fail('Initialization failed');
      console.error(chalk.red(error.message));
    }
  }
}

module.exports = InitManager;