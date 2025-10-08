const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
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
      // Try to resolve the command globally
      const { execSync } = require('child_process');
      const cmd = process.platform === 'win32' ? 'where' : 'which';
      try {
        execSync(`${cmd} ${tool.command}`, { stdio: 'ignore' });
        return true;
      } catch (error) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

module.exports = ConfigManager;