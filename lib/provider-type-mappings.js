// Provider type to tool adapters mapping
// Defines which tools should be configured for each provider type

const PROVIDER_TYPE_MAPPINGS = {
  openai: {
    tools: ['openai-codex'],
    adapters: {
      'openai-codex': [
        {
          type: 'json',
          path: '~/.codex/auth.json',
          fields: {
            apiKey: 'OPENAI_API_KEY'
          }
        },
        {
          type: 'toml',
          path: '~/.codex/config.toml',
          fields: {
            baseUrl: 'api.base_url',
            model: 'chat.default_model'
          }
        }
      ]
    }
  },

  anthropic: {
    tools: ['claude-code'],
    adapters: {
      'claude-code': [
        {
          type: 'json',
          path: '~/.claude/settings.json',
          fields: {
            baseUrl: 'env.ANTHROPIC_BASE_URL',
            apiKey: 'env.ANTHROPIC_AUTH_TOKEN',
            model: 'claude.defaultModel'
          }
        }
      ]
    }
  },

  google: {
    tools: ['google-gemini'],
    adapters: {
      'google-gemini': [
        {
          type: 'json',
          path: '~/.gemini/settings.json',
          fields: {
            apiKey: 'apiKey',
            baseUrl: 'baseUrl',
            model: 'model'
          }
        }
      ]
    }
  },

  iflow: {
    tools: ['iflow-cli'],
    adapters: {
      'iflow-cli': [
        {
          type: 'json',
          path: '~/.iflow/settings.json',
          fields: {
            apiKey: 'apiKey',
            baseUrl: 'baseUrl',
            model: 'modelName',
            proxy: 'proxy'
          }
        }
      ]
    }
  }
};

function getAdaptersForProvider(provider) {
  const typeConfig = PROVIDER_TYPE_MAPPINGS[provider.type];
  if (!typeConfig) {
    return [];
  }

  const adapters = [];
  for (const toolId of typeConfig.tools) {
    const toolAdapters = typeConfig.adapters[toolId] || [];
    for (const adapter of toolAdapters) {
      adapters.push({
        toolId,
        type: adapter.type,
        path: adapter.path,
        fields: adapter.fields
      });
    }
  }
  return adapters;
}

function getSupportedProviderTypes() {
  return Object.keys(PROVIDER_TYPE_MAPPINGS);
}

module.exports = {
  PROVIDER_TYPE_MAPPINGS,
  getAdaptersForProvider,
  getSupportedProviderTypes
};

