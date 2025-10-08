# CLI Bundle

一个基于npm的CLI工具管理器，支持安装、更新和卸载多种编程工具，通过交互式菜单让用户选择具体操作。

## 功能特性

- 🔧 管理多种CLI工具的安装、更新和卸载
- 📦 基于npm的包管理
- 🎯 交互式命令行界面
- 📁 用户配置文件存储在 `~/.clibundle` 目录
- 🚀 支持批量操作

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