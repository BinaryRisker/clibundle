# Windows 安装与使用指南

## 问题：全局命令版本不匹配

如果你遇到 `clibundle ai:list` 输出重复或异常，可能是全局安装的版本是旧版本。

### 解决方案 1：重新链接本地开发版本

```powershell
# 在项目目录下
cd D:\code\github\clibundle

# 安装依赖（如果还没安装）
npm install

# 链接到全局（会覆盖旧版本）
npm link

# 验证版本
clibundle --version

# 测试命令
clibundle ai:list
```

### 解决方案 2：直接使用 node 运行

```powershell
# 在项目目录下直接运行
node bin/clibundle.js ai:list
node bin/clibundle.js ai:switch "OpenAI Official"
node bin/clibundle.js ai:apply
```

### 解决方案 3：卸载后重新安装

```powershell
# 卸载全局版本
npm uninstall -g clibundle

# 在项目目录下重新链接
cd D:\code\github\clibundle
npm link
```

## Windows 路径兼容性

### ✅ 支持的路径格式

1. **波浪号（~）**：自动展开为用户主目录
   - `~/.codex/auth.json` → `C:\Users\YourName\.codex\auth.json`
   - `~/.claude/settings.json` → `C:\Users\YourName\.claude\settings.json`

2. **环境变量展开**：
   - `${USERPROFILE}/.config/app/config.json`
   - `%APPDATA%\app\config.json`

3. **绝对路径**：
   - `C:\Users\YourName\.codex\auth.json`

### Windows 下的默认配置路径

工具会自动写入以下路径（Windows 示例）：

- **OpenAI Codex**
  - `C:\Users\YourName\.codex\auth.json`
  - `C:\Users\YourName\.codex\config.toml`

- **Claude Code**
  - `C:\Users\YourName\.claude\settings.json`

- **iFlow CLI**
  - `C:\Users\YourName\.iflow\settings.json`

- **Google Gemini CLI**
  - `C:\Users\YourName\.gemini\settings.json`

- **CLIBundle 配置**
  - `C:\Users\YourName\.clibundle\ai.json`
  - `C:\Users\YourName\.clibundle\tools.json`

## 完整使用示例（Windows PowerShell）

```powershell
# 1. 设置环境变量
$env:OPENAI_API_KEY = "sk-your-key-here"
$env:ANTHROPIC_API_KEY = "sk-ant-your-key-here"

# 2. 初始化配置
clibundle init
clibundle ai:init

# 3. 查看提供商列表
clibundle ai:list

# 4. 切换提供商
clibundle ai:switch "OpenAI Official"

# 5. 应用配置到所有相关工具
clibundle ai:apply

# 6. 验证配置文件是否生成
Get-Content $env:USERPROFILE\.codex\auth.json
Get-Content $env:USERPROFILE\.codex\config.toml

# 7. 测试 Codex
codex --version
```

## 常见问题

### Q1: 如何永久设置环境变量？

**方法 1：用户级环境变量（推荐）**
```powershell
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-...', 'User')
```

**方法 2：系统设置界面**
1. Win + X → 系统 → 高级系统设置
2. 环境变量 → 用户变量 → 新建
3. 变量名：`OPENAI_API_KEY`
4. 变量值：`sk-...`

### Q2: 如何验证路径是否正确？

```powershell
# 检查配置文件是否存在
Test-Path $env:USERPROFILE\.clibundle\ai.json
Test-Path $env:USERPROFILE\.codex\auth.json

# 查看配置内容
Get-Content $env:USERPROFILE\.clibundle\ai.json
```

### Q3: 如何在 Windows 上编辑配置文件？

```powershell
# 用记事本打开
notepad $env:USERPROFILE\.clibundle\ai.json

# 或用 VS Code 打开
code $env:USERPROFILE\.clibundle\ai.json
```

## 开发调试

```powershell
# 查看 node_modules 安装情况
npm list --depth=0

# 重新安装依赖
Remove-Item node_modules -Recurse -Force
npm install

# 运行测试（如果有）
npm test

# 查看全局 npm 包位置
npm root -g
npm list -g clibundle
```

