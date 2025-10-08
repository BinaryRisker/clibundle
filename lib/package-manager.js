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
      const { exec } = require('child_process');
      const cmd = `${this.packageManager} ${command} ${args.join(' ')}`;
      
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

module.exports = PackageManager;