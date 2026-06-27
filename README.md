# 💎 DeepSeek 余额查询 — Surge 模块

在 Surge 仪表盘显示 DeepSeek API 余额，余额低于阈值时自动推送通知。

![预览](https://img.shields.io/badge/Surge-模块-4ecdc4)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20macOS-blue)
![协议](https://img.shields.io/badge/API-RESTful-green)

---

## 功能

- **余额面板** — Surge 仪表盘直接显示 DeepSeek 账户余额（¥），支持赠送余额与充值余额分别展示
- **低余额通知** — 余额低于设定阈值时自动推送系统通知
- **定时刷新** — 每 6 小时自动查询一次
- **手动刷新** — 点击面板即可触发即时查询
- **进度条** — 直观展示余额消耗程度

---

## 文件说明

| 文件 | 作用 |
|------|------|
| `DeepSeek-Balance.sgmodule` | Surge 模块定义文件，导入 Surge 使用 |
| `deepseek-balance.js` | 定时查询脚本（Cron），每 6 小时自动查询余额 |
| `deepseek-panel.js` | 面板渲染脚本，在 Surge 仪表盘展示余额信息 |

---

## 安装与配置

### 前置条件

- Surge iOS 5.0+ 或 Surge Mac 5.0+
- DeepSeek API Key（从 [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) 获取）

### 安装方式（二选一）

#### 方式一：本地导入（推荐）

```bash
# 下载到本地（如果还没有）
git clone https://github.com/xiigggg/surge-modules.git
cd surge-modules/deepseek-balance
```

然后在 Surge 中操作：

1. 打开 Surge → **模块** 标签页
2. 点击右上角 **安装模块** → **从文件导入**
3. 选择 `DeepSeek-Balance.sgmodule`
4. 在弹出的参数配置页面填写（见下方 **参数说明**）

#### 方式二：远程链接（方便多设备同步）

将模块文件上传到自己的服务器或 Gist，在 Surge 中选择 **从 URL 下载安装**。

---

### 参数说明

安装模块时需要填写以下参数：

| 参数 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `API_KEY` | ✅ | — | DeepSeek API Key，从 [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) 获取 |
| `LOW_THRESHOLD` | ❌ | `5` | 低余额告警阈值，单位：元。余额低于此值时会推送通知 |

**填写格式示例：**

```
API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LOW_THRESHOLD=5
```

---

### Surge 中详细配置步骤

#### iOS / iPadOS

1. 打开 Surge App
2. 底部导航栏 **模块** → 点击右上角 **安装**
3. 选择本地的 `DeepSeek-Balance.sgmodule` 文件
4. 在弹出的编辑框中填写参数：
   ```
   API_KEY=你的DeepSeekAPIKey
   LOW_THRESHOLD=5
   ```
   > 注意：每行一个参数，`参数名=参数值` 格式，**不要**加引号或空格
5. 点击右上角 **完成** → 确认安装
6. 回到 **仪表盘** 页面，下拉刷新即可看到 **💎 DeepSeek 余额** 面板

#### macOS

1. 打开 Surge → **模块** 面板
2. 点击左下角 **+** → **从文件导入**
3. 选择 `DeepSeek-Balance.sgmodule`
4. 在弹出的对话框填写参数（同上）
5. 确认后模块即生效
6. 点击顶部 **仪表盘**，即可看到余额面板

---

### 模块参数修改方法

如需修改已安装模块的参数：

**iOS：** 模块列表 → 点击模块名称 → 编辑参数 → 保存

**macOS：** 模块列表 → 右键模块 → 编辑 → 修改参数 → 确定

---

## 面板展示说明

安装成功后，Surge 仪表盘会显示如下内容：

```
🟢 余额: ¥12.34

[████████████░░░░░░░░] 62%

🎁 赠送余额: ¥10.00
💰 充值余额: ¥2.34

⏰ 更新时间: 2026/06/26 15:30:00
```

- 余额充足（高于阈值）→ 🟢 绿色指示
- 余额不足（低于阈值）→ 🔴 红色指示 + 自动推送通知
- 进度条反映余额相对阈值的消耗程度

---

## 通知说明

| 场景 | 通知内容 |
|------|---------|
| 余额低于阈值 | `💎 DeepSeek 余额不足` — 显示当前余额及组成 |
| 未配置 API Key | `⚠️ 未配置 API Key` — 提示填写参数 |
| 账户不可用 | `⚠️ 账户不可用` — 检查 DeepSeek 账户状态 |
| 网络请求失败 | `❌ 网络请求失败` — 检查网络连接 |

---

## 自定义

### 修改查询频率

编辑 `DeepSeek-Balance.sgmodule` 中的 Cron 表达式：

```ini
DeepSeek-Balance-Cron = type=cron, cronexp="0 */6 * * *", ...
```

表达式含义：`分 时 日 月 周`
- `0 */6 * * *` = 每 6 小时执行一次（默认）
- `0 */3 * * *` = 每 3 小时执行一次
- `0 9 * * *` = 每天早上 9 点执行一次

> Cron 表达式可参考 [crontab.guru](https://crontab.guru/)

---

## 已知限制

- AnyTLS 节点在 Surge 中的兼容性问题与本模块无关，不影响余额查询
- 本模块通过 `$httpClient` 直连 API，无需 MITM

---

## 协议

MIT
