// 内置工具适配器：为常见 AI 工具提供默认 live 配置文件与字段映射
// 注意：源侧支持特殊键 'env:@apiKey'，表示从 profile.extra.apiKeyEnv 对应的环境变量读取实际值

const BUILTIN_ADAPTERS = {
  'openai-codex': [
    {
      type: 'json',
      path: '~/.codex/auth.json',
      mapping: {
        'env:@apiKey': 'OPENAI_API_KEY'
      }
    },
    {
      type: 'toml',
      path: '~/.codex/config.toml',
      mapping: {
        'apiBase': 'api.base_url',
        'model': 'chat.default_model'
      }
    }
  ],
  'claude-code': [
    {
      type: 'json',
      path: '~/.claude/settings.json',
      mapping: {
        'apiBase': 'env.ANTHROPIC_BASE_URL',
        'env:@apiKey': 'env.ANTHROPIC_AUTH_TOKEN',
        'model': 'claude.defaultModel'
      }
    }
  ],
  'iflow-cli': [
    {
      type: 'json',
      path: '~/.iflow/settings.json',
      mapping: {
        'apiBase': 'baseUrl',
        'env:@apiKey': 'apiKey',
        'model': 'modelName',
        'proxy': 'proxy'
      }
    }
  ],
  'google-gemini': [
    {
      type: 'toml',
      path: '~/.config/gemini/config.toml',
      mapping: {
        'env:@apiKey': 'api_key',
        'apiBase': 'api_endpoint',
        'model': 'model'
      }
    }
  ]
};

function getBuiltinTargetsForTool(toolId) {
  return BUILTIN_ADAPTERS[toolId] || [];
}

function getSupportedToolIds() {
  return Object.keys(BUILTIN_ADAPTERS);
}

module.exports = { BUILTIN_ADAPTERS, getBuiltinTargetsForTool, getSupportedToolIds };


