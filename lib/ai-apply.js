const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const TOML = require('@iarna/toml');
const AIConfigManager = require('./ai-config');
const { getAdaptersForProvider } = require('./provider-type-mappings');

function expandHome(p) {
  if (!p) return p;
  if (p.startsWith('~')) return path.join(os.homedir(), p.slice(1));
  return p;
}

function expandEnv(p) {
  if (!p) return p;
  // ${VAR}
  p = p.replace(/\$\{([^}]+)\}/g, (_, name) => process.env[name] || '');
  // %VAR%
  p = p.replace(/%([^%]+)%/g, (_, name) => process.env[name] || '');
  return p;
}

function resolvePath(p) {
  const expanded = expandEnv(expandHome(p));
  return path.resolve(expanded);
}

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    return fs.readJsonSync(filePath);
  } catch (_e) {
    return {};
  }
}

function readTomlSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf8');
    return TOML.parse(content);
  } catch (_e) {
    return {};
  }
}

function setByPath(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof cur[k] !== 'object' || cur[k] === null) {
      cur[k] = {};
    }
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

function writeJsonPretty(filePath, obj) {
  fs.ensureDirSync(path.dirname(filePath));
  const tmp = `${filePath}.tmp`;
  fs.writeJsonSync(tmp, obj, { spaces: 2 });
  fs.moveSync(tmp, filePath, { overwrite: true });
}

function writeTomlPretty(filePath, obj) {
  fs.ensureDirSync(path.dirname(filePath));
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, TOML.stringify(obj), 'utf8');
  fs.moveSync(tmp, filePath, { overwrite: true });
}

// Apply provider configuration to a single adapter target
async function applyProviderToAdapter(provider, adapter) {
  const targetPath = resolvePath(adapter.path);
  const type = adapter.type || 'json';

  let current = {};
  if (type === 'json') {
    current = readJsonSafe(targetPath);
  } else if (type === 'toml') {
    current = readTomlSafe(targetPath);
  } else {
    return {
      target: adapter.toolId || targetPath,
      file: targetPath,
      type,
      ok: false,
      error: `Unsupported type: ${type}`
    };
  }

  // Apply field mappings
  for (const [providerField, targetField] of Object.entries(adapter.fields)) {
    let value;
    if (providerField === 'apiKey') {
      // Special handling: resolve ${ENV_VAR} or direct value
      value = provider.apiKey;
      if (value && value.startsWith('${') && value.endsWith('}')) {
        const envName = value.slice(2, -1);
        value = process.env[envName] || '';
      }
    } else {
      value = provider[providerField];
    }

    if (value !== undefined && value !== '') {
      setByPath(current, targetField, value);
    }
  }

  // Write back
  try {
    if (type === 'json') {
      writeJsonPretty(targetPath, current);
    } else if (type === 'toml') {
      writeTomlPretty(targetPath, current);
    }
    return {
      target: adapter.toolId || targetPath,
      file: targetPath,
      type,
      ok: true
    };
  } catch (error) {
    return {
      target: adapter.toolId || targetPath,
      file: targetPath,
      type,
      ok: false,
      error: error.message
    };
  }
}

// v2.1: Apply all enabled tools with their respective providers
async function applyAIProfile({ profileName, toolId, allTools = false } = {}) {
  const aiConfig = new AIConfigManager();

  if (profileName) {
    // v2.0 compatibility: apply single provider to all tools
    let provider = aiConfig.getProviderByName(profileName);
    if (!provider) {
      throw new Error(`Provider not found: ${profileName}`);
    }
    provider = aiConfig.resolveProviderEnvVars(provider);

    const adapters = getAdaptersForProvider(provider);
    const customTargets = aiConfig.getTargets();

    const results = [];

    for (const adapter of adapters) {
      // eslint-disable-next-line no-await-in-loop
      const result = await applyProviderToAdapter(provider, adapter);
      results.push(result);
    }

    for (const target of customTargets) {
      const adapter = {
        toolId: target.toolId || target.name,
        type: target.type,
        path: target.path,
        fields: target.mapping || {}
      };
      // eslint-disable-next-line no-await-in-loop
      const result = await applyProviderToAdapter(provider, adapter);
      results.push(result);
    }

    return { profile: provider.name, results };
  }

  // v2.1: Multi-tool support - apply each tool with its configured provider
  const activeProviders = aiConfig.getAllActiveProviders();
  const results = [];

  if (toolId) {
    // Apply single tool
    const provider = aiConfig.getToolProvider(toolId);
    if (!provider) {
      throw new Error(`Tool not configured or disabled: ${toolId}`);
    }
    
    const resolvedProvider = aiConfig.resolveProviderEnvVars(provider);
    const adapters = getAdaptersForProvider(resolvedProvider).filter(a => a.toolId === toolId);
    
    for (const adapter of adapters) {
      // eslint-disable-next-line no-await-in-loop
      const result = await applyProviderToAdapter(resolvedProvider, adapter);
      results.push(result);
    }

    return { 
      tools: { [toolId]: resolvedProvider.name },
      results 
    };
  }

  // Apply all enabled tools
  const appliedTools = {};
  for (const [toolId, provider] of activeProviders) {
    const resolvedProvider = aiConfig.resolveProviderEnvVars(provider);
    const adapters = getAdaptersForProvider(resolvedProvider).filter(a => a.toolId === toolId);
    
    appliedTools[toolId] = resolvedProvider.name;

    for (const adapter of adapters) {
      // eslint-disable-next-line no-await-in-loop
      const result = await applyProviderToAdapter(resolvedProvider, adapter);
      results.push(result);
    }
  }

  // Also apply custom targets
  const customTargets = aiConfig.getTargets();
  for (const target of customTargets) {
    // For custom targets, use the first available provider of compatible type
    const compatibleProvider = Array.from(activeProviders.values()).find(p => 
      getAdaptersForProvider(p).some(a => a.type === target.type)
    );
    
    if (compatibleProvider) {
      const resolvedProvider = aiConfig.resolveProviderEnvVars(compatibleProvider);
      const adapter = {
        toolId: target.toolId || target.name,
        type: target.type,
        path: target.path,
        fields: target.mapping || {}
      };
      // eslint-disable-next-line no-await-in-loop
      const result = await applyProviderToAdapter(resolvedProvider, adapter);
      results.push(result);
    }
  }

  return {
    tools: appliedTools,
    results
  };
}

module.exports = { applyAIProfile, applyProviderToAdapter };
