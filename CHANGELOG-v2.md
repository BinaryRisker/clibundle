# CLI Bundle v2.0.0 更新日志

## 🎉 重大更新：配置大幅简化

### 核心改进

#### 1. **极简配置文件（v2.0）**

**之前需要理解的概念**：
- `common` 通用配置
- `profiles` 配置文件列表
- `targets` 目标列表
- `mapping` 字段映射
- `tools` 工具列表
- `vendors` 供应商
- `liveFiles` 实时文件

**现在只需要**：
```json
{
  "providers": [...],  // 提供商列表
  "active": "名称"      // 当前使用哪个
}
```

#### 2. **内置适配器**

根据 `provider.type` 自动配置对应工具：
- `openai` → Codex (`~/.codex/`)
- `anthropic` → Claude Code (`~/.claude/`)
- `google` → Gemini CLI (`~/.gemini/`)
- `iflow` → iFlow CLI (`~/.iflow/`)

#### 3. **3步完成配置**

```bash
# 1. 设置 API Key
$env:OPENAI_API_KEY = "sk-..."

# 2. 切换提供商
clibundle ai:switch "OpenAI Official"

# 3. 应用配置
clibundle ai:apply
```

#### 4. **跨平台路径支持**

✅ **Windows**：
- `~/.codex/auth.json` → `C:\Users\YourName\.codex\auth.json`
- 支持 `${VAR}` 和 `%VAR%` 环境变量展开

✅ **macOS/Linux**：
- `~/.codex/auth.json` → `/Users/YourName/.codex/auth.json`
- 支持 `${VAR}` 环境变量展开

### 新增文件

1. **lib/provider-type-mappings.js**
   - 内置适配器定义
   - 提供商类型到工具的映射

2. **lib/ai-apply.js** (重构)
   - 基于 provider.type 自动选择适配器
   - 支持 JSON/TOML/ENV 文件写入
   - 原子写入 + 临时文件机制

3. **lib/ai-config.js** (增强)
   - 支持 v1.0 和 v2.0 配置格式
   - 环境变量展开（`${ENV_VAR}`）
   - 向后兼容

4. **WINDOWS-SETUP.md**
   - Windows 安装与使用指南
   - 路径兼容性说明
   - 常见问题解答

### 修复的问题

✅ **Codex 配置路径**
- 修正：`~/.codex/auth.json` + `~/.codex/config.toml`
- 之前错误：`~/.config/openai/config.json`

✅ **Gemini CLI 配置路径**
- 修正：`~/.gemini/settings.json`
- 之前错误：`~/.config/gemini/config.toml`

✅ **命令输出重复问题**
- 原因：全局命令版本不匹配
- 解决：运行 `npm link` 重新链接

### 命令变更

#### 简化的命令

**保留**：
- `clibundle ai:init` - 初始化配置
- `clibundle ai:list` - 列出提供商
- `clibundle ai:switch <name>` - 切换提供商
- `clibundle ai:apply` - 应用配置

**移除**（简化）：
- ❌ `ai:switch-vendor` - 不再需要
- ❌ `ai:apply --tool` - 自动识别
- ❌ `ai:apply --target` - 自动应用
- ❌ `ai:apply --all` - 默认行为

### 兼容性

#### 向后兼容
- ✅ 仍支持 v1.0 配置格式
- ✅ 自动识别 `profiles` 或 `providers`
- ✅ 自动识别 `activeProfile` 或 `active`
- ✅ 支持 `customTargets` 自定义映射

#### 高级用户
可通过 `customTargets` 添加自定义映射：
```json
{
  "customTargets": [
    {
      "type": "json",
      "path": "~/custom/config.json",
      "mapping": {
        "apiKey": "auth.key",
        "baseUrl": "api.url"
      }
    }
  ]
}
```

### 支持的工具配置

根据社区实现参考：

1. **OpenAI Codex** - [CC Switch](https://github.com/farion1231/cc-switch)
2. **Claude Code** - [CC Switch](https://github.com/farion1231/cc-switch)
3. **iFlow CLI** - [官方文档](https://platform.iflow.cn/cli/configuration/settings)
4. **Google Gemini CLI** - [官方文档](https://github.com/google-gemini/gemini-cli)

### 依赖更新

新增：
- `@iarna/toml@^3.0.0` - TOML 文件读写支持

### 测试验证

✅ Windows 10 PowerShell
✅ 路径展开（`~` 和环境变量）
✅ JSON 配置写入
✅ TOML 配置写入
✅ 环境变量注入（`${VAR}`）

### 迁移指南

从 v1.0 升级：

1. **不需要手动迁移**
   - v2.0 自动兼容 v1.0 配置

2. **推荐（可选）**：
   ```bash
   # 备份旧配置
   cp ~/.clibundle/ai.json ~/.clibundle/ai.json.v1.backup
   
   # 重新初始化为 v2.0 格式
   clibundle ai:init
   
   # 手动复制提供商配置（如果需要）
   ```

3. **删除不需要的字段**（可选）：
   - `common` - 不再需要
   - `targets` - 已内置
   - `tools` - 已内置
   - `extra` - 简化为顶级字段

---

**Breaking Changes**: None（完全向后兼容）

**Contributors**: @BinaryRisker

**Date**: 2025-10-08

