# CLI Bundle v2.1.0 更新日志 - 多工具协作支持

## 🚀 重大更新：多工具协作

### 核心改进

#### 1. **多工具独立配置**

**之前（v2.0）**：同一时间只能激活一个提供商，所有工具共享
```json
{
  "providers": [...],
  "active": "OpenAI Official"  // 全局唯一
}
```

**现在（v2.1）**：每个工具可以配置不同的提供商
```json
{
  "providers": [...],
  "tools": {
    "openai-codex": { "provider": "OpenAI Official", "enabled": true },
    "claude-code": { "provider": "Anthropic Official", "enabled": true },
    "google-gemini": { "provider": "Google Gemini", "enabled": true },
    "iflow-cli": { "provider": "iFlow Official", "enabled": false }
  }
}
```

#### 2. **新增命令**

```bash
# 为特定工具设置提供商
clibundle ai:set <toolId> <providerName>

# 启用/禁用工具
clibundle ai:enable <toolId>
clibundle ai:disable <toolId>

# 应用特定工具配置
clibundle ai:apply --tool <toolId>
```

#### 3. **使用场景**

**多 AI 协作开发**：
- Claude Code → Anthropic（代码生成与重构）
- Codex → OpenAI（代码补全）
- Gemini → Google（文档与解释）
- iFlow → iFlow（中文对话）

**不同账号分离**：
- 个人项目 → 个人 OpenAI 账号
- 工作项目 → 公司 Azure OpenAI 账号
- 实验项目 → DeepSeek 免费账号

### 实际使用示例

#### 场景1：多厂商协作

```bash
# 设置环境变量
$env:OPENAI_API_KEY = "sk-proj-..."
$env:ANTHROPIC_API_KEY = "sk-ant-..."
$env:GEMINI_API_KEY = "AIza..."

# 配置不同工具使用不同提供商
clibundle ai:set openai-codex "OpenAI Official"
clibundle ai:set claude-code "Anthropic Official"
clibundle ai:set google-gemini "Google Gemini"

# 一次性应用所有配置
clibundle ai:apply

# 结果：
# ✓ openai-codex → OpenAI Official
# ✓ claude-code → Anthropic Official  
# ✓ google-gemini → Google Gemini
```

#### 场景2：同类型不同账号

```bash
# 添加多个 OpenAI 兼容提供商
# config/ai.json:
{
  "providers": [
    {
      "name": "OpenAI Personal",
      "type": "openai",
      "apiKey": "${OPENAI_PERSONAL_KEY}",
      "baseUrl": "https://api.openai.com/v1"
    },
    {
      "name": "Azure OpenAI Work", 
      "type": "openai",
      "apiKey": "${AZURE_OPENAI_KEY}",
      "baseUrl": "https://company.openai.azure.com/v1"
    },
    {
      "name": "DeepSeek Free",
      "type": "openai", 
      "apiKey": "${DEEPSEEK_API_KEY}",
      "baseUrl": "https://api.deepseek.com/v1"
    }
  ]
}

# 为不同项目配置不同账号
clibundle ai:set openai-codex "OpenAI Personal"    # 个人项目
clibundle ai:set claude-code "Azure OpenAI Work"   # 工作项目（假设 Claude 支持 OpenAI 格式）
```

### 配置文件变更

#### v2.1 新结构

```json
{
  "version": "2.1.0",
  "providers": [
    {
      "name": "OpenAI Official",
      "type": "openai",
      "apiKey": "${OPENAI_API_KEY}",
      "baseUrl": "https://api.openai.com/v1",
      "model": "gpt-4o-mini"
    },
    {
      "name": "DeepSeek V3",
      "type": "openai",
      "apiKey": "${DEEPSEEK_API_KEY}", 
      "baseUrl": "https://api.deepseek.com/v1",
      "model": "deepseek-coder"
    }
  ],
  "tools": {
    "openai-codex": {
      "provider": "OpenAI Official",
      "enabled": true
    },
    "claude-code": {
      "provider": "DeepSeek V3",
      "enabled": true
    }
  }
}
```

### 兼容性

#### 向后兼容
- ✅ 支持 v2.0 的 `active` 字段（兼容模式）
- ✅ 支持 `ai:switch` 命令（应用到所有工具）
- ✅ 支持 `ai:apply --profile` 参数

#### 迁移路径
1. **自动迁移**：v2.0 配置自动兼容，无需手动修改
2. **渐进升级**：可以逐步将工具迁移到独立配置
3. **混合使用**：可以同时使用全局和独立配置

### 新增功能测试

```bash
# 查看当前配置
clibundle ai:list

# 输出示例：
# AI Providers:
# =============
# - OpenAI Official (type: openai, model: gpt-4o-mini)
# - Anthropic Official (type: anthropic, model: claude-3-5-sonnet-latest)
#
# Tool Configurations:
# ====================
# ✓ openai-codex → OpenAI Official
# ✓ claude-code → Anthropic Official
# ✗ iflow-cli → iFlow Official (disabled)

# 修改配置
clibundle ai:set claude-code "OpenAI Official"
clibundle ai:enable iflow-cli

# 应用配置
clibundle ai:apply

# 输出示例：
# Applied Tools:
# - openai-codex → OpenAI Official
# - claude-code → OpenAI Official  
# - iflow-cli → iFlow Official
#
# Results:
# - ✓ openai-codex [json] -> ~/.codex/auth.json
# - ✓ openai-codex [toml] -> ~/.codex/config.toml
# - ✓ iflow-cli [json] -> ~/.iflow/settings.json
```

### 技术实现

#### 新增方法（AIConfigManager）

```javascript
// 获取工具配置
getToolsConfig()
getEnabledTools()
getToolProvider(toolId)

// 设置工具配置
setToolProvider(toolId, providerName)
enableTool(toolId, enabled)

// 获取所有活跃提供商
getAllActiveProviders() // Map<toolId, provider>
```

#### 新增应用逻辑（ai-apply.js）

```javascript
// v2.1: 多工具支持
async function applyAIProfile({ profileName, toolId }) {
  if (profileName) {
    // v2.0 兼容：单一提供商应用到所有工具
  } else {
    // v2.1: 每个工具使用各自配置的提供商
    const activeProviders = aiConfig.getAllActiveProviders();
    for (const [toolId, provider] of activeProviders) {
      // 应用配置...
    }
  }
}
```

### 优势

1. **灵活性**：不同工具可以使用最适合的 AI 提供商
2. **成本优化**：可以为不同场景选择不同价格的服务
3. **账号隔离**：工作和个人项目使用不同账号
4. **备份方案**：主要服务不可用时快速切换到备用服务
5. **功能互补**：利用不同 AI 的特长（如 Claude 的代码能力，GPT 的通用能力）

### 下一步计划

- [ ] 添加配置模板（preset）功能
- [ ] 支持工具组（tool groups）批量操作
- [ ] 添加使用统计和成本追踪
- [ ] 支持条件配置（基于项目类型自动选择提供商）
- [ ] 添加配置验证和健康检查

---

**Breaking Changes**: None（完全向后兼容）

**Contributors**: @BinaryRisker

**Date**: 2025-10-08
