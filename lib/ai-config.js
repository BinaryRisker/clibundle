const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class AIConfigManager {
  constructor() {
    this.userConfigDir = path.join(os.homedir(), '.clibundle');
    this.aiConfigPath = path.join(this.userConfigDir, 'ai.json');
    this.defaultAiConfigPath = path.join(__dirname, '../config/ai.json');
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      if (!fs.existsSync(this.aiConfigPath)) {
        this.initUserAIConfig();
      }
      return fs.readJsonSync(this.aiConfigPath);
    } catch (error) {
      console.error('Failed to load AI configuration file:', error.message);
      process.exit(1);
    }
  }

  initUserAIConfig() {
    try {
      fs.ensureDirSync(this.userConfigDir);
      if (fs.existsSync(this.defaultAiConfigPath)) {
        fs.copySync(this.defaultAiConfigPath, this.aiConfigPath);
      } else {
        const defaultConfig = {
          version: '2.1.0',
          description: 'CLI Bundle AI configuration file - Multi-tool support',
          providers: [
            {
              name: 'OpenAI Official',
              type: 'openai',
              apiKey: '${OPENAI_API_KEY}',
              baseUrl: 'https://api.openai.com/v1',
              model: 'gpt-4o-mini'
            },
            {
              name: 'Anthropic Official',
              type: 'anthropic',
              apiKey: '${ANTHROPIC_API_KEY}',
              baseUrl: 'https://api.anthropic.com',
              model: 'claude-3-5-sonnet-latest'
            }
          ],
          tools: {
            'openai-codex': {
              provider: 'OpenAI Official',
              enabled: true
            },
            'claude-code': {
              provider: 'Anthropic Official',
              enabled: true
            }
          }
        };
        fs.writeJsonSync(this.aiConfigPath, defaultConfig, { spaces: 2 });
      }
    } catch (error) {
      console.error('Failed to initialize AI configuration file:', error.message);
      process.exit(1);
    }
  }

  saveConfig() {
    try {
      fs.writeJsonSync(this.aiConfigPath, this.config, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save AI configuration file:', error.message);
      process.exit(1);
    }
  }

  getProfiles() {
    // v2.0: providers, v1.0: profiles
    const providers = Array.isArray(this.config.providers) ? this.config.providers : [];
    if (providers.length > 0) return providers;
    return Array.isArray(this.config.profiles) ? this.config.profiles : [];
  }

  getProfileByName(name) {
    return this.getProfiles().find(p => p.name === name);
  }

  getActiveProfileName() {
    // v2.0: active (string), v1.0: active.profileName or activeProfile
    if (typeof this.config.active === 'string') return this.config.active;
    if (this.config.active && typeof this.config.active.profileName === 'string') return this.config.active.profileName;
    return this.config.activeProfile;
  }

  getActiveProfile() {
    const name = this.getActiveProfileName();
    return this.getProfileByName(name);
  }

  setActiveProfile(name) {
    const profile = this.getProfileByName(name);
    if (!profile) {
      throw new Error(`Profile not found: ${name}`);
    }
    // v2.0: active (string)
    this.config.active = name;
    // Keep backward compatibility
    this.config.activeProfile = name;
    this.saveConfig();
    return profile;
  }

  getCommon() {
    return this.config.common || {};
  }

  getResolvedProfile(optionalName) {
    const common = this.getCommon();
    const profile = optionalName ? this.getProfileByName(optionalName) : this.getActiveProfile();
    if (!profile) {
      throw new Error('Active AI profile not found');
    }
    const merged = { ...common, ...profile };
    if (common.extra || profile.extra) {
      merged.extra = { ...(common.extra || {}), ...(profile.extra || {}) };
    }
    return merged;
  }

  getTargets() {
    // v2.0: customTargets, v1.0: targets
    const list = [];
    if (Array.isArray(this.config.targets)) list.push(...this.config.targets);
    if (Array.isArray(this.config.customTargets)) list.push(...this.config.customTargets);
    return list;
  }

  // v2.0: Get provider by name (alias for getProfileByName)
  getProviderByName(name) {
    return this.getProfileByName(name);
  }

  // v2.0: Get active provider
  getActiveProvider() {
    return this.getActiveProfile();
  }

  // v2.1: Multi-tool support methods
  getToolsConfig() {
    return this.config.tools || {};
  }

  getEnabledTools() {
    const toolsConfig = this.getToolsConfig();
    return Object.keys(toolsConfig).filter(toolId => toolsConfig[toolId].enabled);
  }

  getToolProvider(toolId) {
    const toolsConfig = this.getToolsConfig();
    const toolConfig = toolsConfig[toolId];
    if (!toolConfig || !toolConfig.enabled) return null;
    return this.getProviderByName(toolConfig.provider);
  }

  setToolProvider(toolId, providerName) {
    const provider = this.getProviderByName(providerName);
    if (!provider) {
      throw new Error(`Provider not found: ${providerName}`);
    }
    
    if (!this.config.tools) this.config.tools = {};
    this.config.tools[toolId] = {
      provider: providerName,
      enabled: true
    };
    this.saveConfig();
    return provider;
  }

  enableTool(toolId, enabled = true) {
    if (!this.config.tools) this.config.tools = {};
    if (!this.config.tools[toolId]) {
      throw new Error(`Tool not configured: ${toolId}`);
    }
    this.config.tools[toolId].enabled = enabled;
    this.saveConfig();
  }

  getAllActiveProviders() {
    const toolsConfig = this.getToolsConfig();
    const activeProviders = new Map();
    
    for (const [toolId, toolConfig] of Object.entries(toolsConfig)) {
      if (toolConfig.enabled && toolConfig.provider) {
        const provider = this.getProviderByName(toolConfig.provider);
        if (provider) {
          activeProviders.set(toolId, provider);
        }
      }
    }
    
    return activeProviders;
  }

  // v2.0: Expand ${ENV_VAR} in provider fields
  resolveProviderEnvVars(provider) {
    const resolved = { ...provider };
    for (const key of Object.keys(resolved)) {
      if (typeof resolved[key] === 'string') {
        resolved[key] = resolved[key].replace(/\$\{([^}]+)\}/g, (_, envName) => process.env[envName] || '');
      }
    }
    return resolved;
  }
}

module.exports = AIConfigManager;



