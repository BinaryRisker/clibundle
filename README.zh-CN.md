# CLI Bundle

一个基于npm的CLI工具管理器，支持安装、更新和卸载多种编程工具，通过交互式菜单让用户选择具体操作。

## 功能特性

- 🔧 管理多种CLI工具的安装、更新和卸载
- 📦 基于npm的包管理
- 🎯 交互式命令行界面
- 📁 用户配置文件存储在 `~/.clibundle` 目录
- 🚀 支持批量操作
- 🤖 支持大模型配置与切换，复用多工具映射

## 安装

```bash
npm install -g clibundle
```

## 使用方法

### 初始化配置

首次使用前，需要初始化配置文件：

```bash
clibundle init
```

这将在用户主目录下创建 `.clibundle` 目录和默认的 `tools.json` 配置文件。

### 启动管理器

直接运行命令启动交互式菜单：

```bash
clibundle
```

### 命令行选项

```bash
# 显示帮助信息
clibundle --help

# 显示版本号
clibundle --version

# 初始化配置文件
clibundle init

# 列出所有可用工具及其安装状态
clibundle list

# 安装指定工具
clibundle install <工具名称>

# 安装所有可用工具
clibundle install --all

# 更新指定工具
clibundle update <工具名称>

# 更新所有已安装工具
clibundle update --all

# 卸载指定工具
clibundle uninstall <工具名称>

# 卸载所有已安装工具
clibundle uninstall --all
```

### AI 模型与工具

初始化 AI 配置（在 `~/.clibundle/ai.json` 生成默认文件）：

```bash
clibundle ai:init
```

查看 AI 配置的提供商与工具状态：

```bash
clibundle ai:list
```

#### 多工具协作（v2.1 新功能）

为不同工具设置不同的提供商，实现多 AI 协作：

```bash
# 为 Claude Code 设置 Anthropic 提供商
clibundle ai:set claude-code "Anthropic Official"

# 为 Codex 设置 OpenAI 提供商  
clibundle ai:set openai-codex "OpenAI Official"

# 为 Gemini CLI 设置 Google 提供商
clibundle ai:set google-gemini "Google Gemini"

# 启用/禁用特定工具
clibundle ai:enable iflow-cli
clibundle ai:disable iflow-cli
```

应用配置：

```bash
# 应用所有启用工具的配置
clibundle ai:apply

# 仅应用特定工具的配置
clibundle ai:apply --tool claude-code

# 兼容模式：对所有工具应用同一提供商
clibundle ai:apply --profile "OpenAI Official"
```

#### 使用场景示例

**场景1：多 AI 协作开发**
- Claude Code → Anthropic（代码生成与重构）
- Codex → OpenAI（代码补全）
- Gemini → Google（文档与解释）

**场景2：不同账号分离**
- 个人项目 → 个人 OpenAI 账号
- 工作项目 → 公司 Azure OpenAI 账号
- 实验项目 → DeepSeek 免费账号

## 配置文件

配置文件位于 `~/.clibundle/tools.json`，格式如下：

```json
{
  "version": "1.0.0",
  "description": "CLI Bundle工具配置文件",
  "tools": [
    {
      "id": "claude-code",
      "name": "Claude Code",
      "command": "claude",
      "installType": "npm",
      "packageName": "@anthropic-ai/claude-code",
      "description": "Anthropic官方Claude CLI工具",
      "enabled": true
    },
    {
      "id": "iflow-cli",
      "name": "iFlow CLI",
      "command": "iflow",
      "installType": "npm",
      "packageName": "@iflow-ai/iflow-cli",
      "description": "iFlow AI CLI工具",
      "enabled": true
    },
    {
      "id": "openai-codex",
      "name": "OpenAI Codex",
      "command": "codex",
      "installType": "npm",
      "packageName": "@openai/codex",
      "description": "OpenAI Codex代码生成CLI工具",
      "enabled": true
    },
    {
      "id": "google-gemini",
      "name": "Google Gemini CLI",
      "command": "gemini",
      "installType": "npm",
      "packageName": "@google/gemini-cli",
      "description": "Google Gemini AI CLI工具",
      "enabled": true
    }
  ]
}
```

### 配置字段说明

- `id`: 工具的唯一标识符
- `name`: 工具的显示名称
- `command`: 命令行命令名称
- `installType`: 安装类型（目前支持 "npm"）
- `packageName`: npm包名
- `description`: 工具描述
- `enabled`: 是否启用该工具

## AI 配置（ai.json）

位置：`~/.clibundle/ai.json`

### 简化配置（v2.1 - 多工具协作）

支持为不同工具配置不同提供商，实现多 AI 协作：

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
      "name": "Anthropic Official",
      "type": "anthropic", 
      "apiKey": "${ANTHROPIC_API_KEY}",
      "baseUrl": "https://api.anthropic.com",
      "model": "claude-3-5-sonnet-latest"
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
    },
    "google-gemini": {
      "provider": "Google Gemini",
      "enabled": true
    },
    "iflow-cli": {
      "provider": "iFlow Official",
      "enabled": false
    }
  }
}
```

### 配置说明

- **providers**: 提供商列表，每个提供商包含：
  - `name`: 提供商名称（自定义）
  - `type`: 提供商类型（`openai`/`anthropic`/`google`/`iflow`）
  - `apiKey`: API密钥，支持 `${ENV_VAR}` 从环境变量读取
  - `baseUrl`: API 基础地址
  - `model`: 模型名称
- **tools**: 工具配置，每个工具包含：
  - `provider`: 使用的提供商名称
  - `enabled`: 是否启用该工具

### 使用步骤（多工具协作）

1. 设置环境变量（Windows PowerShell）：
```powershell
$env:OPENAI_API_KEY = "sk-..."
$env:ANTHROPIC_API_KEY = "sk-ant-..."
$env:DEEPSEEK_API_KEY = "sk-..."
```

2. 配置工具提供商：
```bash
clibundle ai:set claude-code "Anthropic Official"
clibundle ai:set openai-codex "OpenAI Official"
clibundle ai:set google-gemini "Google Gemini"
```

3. 应用配置：
```bash
clibundle ai:apply
```

### 支持的工具配置

工具会自动写入以下配置文件：

- **OpenAI Codex**
  - `~/.codex/auth.json`
  - `~/.codex/config.toml`

- **Claude Code**
  - `~/.claude/settings.json`

- **iFlow CLI**: 参考 [iFlow 配置文档](https://platform.iflow.cn/cli/configuration/settings)
  - `~/.iflow/settings.json`

- **Google Gemini CLI**: 参考 [Gemini CLI 配置](https://github.com/google-gemini/gemini-cli)
  - `~/.gemini/settings.json`

### 高级：自定义映射（可选）

如需自定义映射或支持其他工具，可添加 `customTargets` 字段：

```json
{
  "customTargets": [
    {
      "type": "json",
      "path": "~/custom/path/config.json",
      "mapping": {
        "apiKey": "auth.key",
        "baseUrl": "api.endpoint"
      }
    }
  ]
}
```

## 开发

### 本地安装

```bash
# 克隆仓库
git clone <repository-url>
cd clibundle

# 安装依赖
npm install

# 链接到全局
npm link

# 运行
clibundle
```

### 项目结构

```
clibundle/
├── bin/
│   └── clibundle.js          # CLI入口文件
├── lib/
│   ├── config.js             # 配置文件处理
│   ├── init.js               # 初始化管理
│   ├── package-manager.js    # 包管理器操作
│   ├── ui.js                 # 用户界面
│   └── utils.js              # 工具函数
├── config/
│   └── tools.json            # 默认工具配置文件
├── package.json              # 项目配置
└── README.md                 # 项目文档
```

## 许可证

MIT