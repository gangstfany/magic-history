# Magic History · 账号入口

本分支：`feature/account-auth`。用于单独维护各课程共用的登录、注册、密码重置、Google 登录与验证回调。

世界史完整网站继续在 `course/apwh` 维护。本分支从 `shared/site` 建立，账号模块与拆分时的世界史版本一致；没有删除或修改世界史分支中的登录入口。

## 本地查看

在仓库根目录运行：

```bash
python3 -m http.server 8022 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8022/`，点击页面上的“登录 / 注册”。请使用 HTTP 服务访问，避免直接双击 HTML。

这里的首页用于查看公共网站外壳与账号入口。查看最新世界史全部功能时，请切换到 `course/apwh`，使用该分支的根目录 `index.html`。

## 账号模块文件

| 文件 | 用途 |
| --- | --- |
| `assets/auth/account-ui.mjs` | 登录、注册、重置密码和账号弹窗 |
| `assets/auth/account.css` | 独立账号样式 |
| `assets/auth/account-bootstrap.mjs` | 页面挂载与 SDK 加载 |
| `assets/auth/auth-service.mjs` | 认证状态、邮件登录、Google、退出与回调处理 |
| `assets/auth/auth-config.mjs` | 浏览器可公开的项目地址、publishable key 和 Google 开关 |
| `assets/vendor/supabase-js-2.118.0.js` | 固定版本的本地 SDK |
| `auth-callback.html` | 邮件验证、密码恢复与 OAuth 回调入口 |
| `docs/setup/accounts-supabase.md` | 服务端配置与联调说明 |
| `tests/account*.test.mjs` | 账号模块自动检查 |
| `scripts/verify-account-browser.mjs` | 浏览器交互验证脚本 |

Git 分支仍然保留共同基础文件，便于预览和后续合并；账号维护不需要改动课程内容、地图和题库。

## 接入课程页面

页面保留以下三个入口，账号逻辑无需复制到课程脚本：

```html
<link rel="stylesheet" href="assets/auth/account.css">
<script type="module" src="assets/auth/account-bootstrap.mjs"></script>
<button type="button" class="account-trigger" data-account-trigger aria-haspopup="dialog">登录 / 注册</button>
```

这些路径以仓库根目录页面为例。部署时同时发布账号目录、SDK 与回调页面。真实认证需要在 Supabase 中允许实际部署域名的回调地址；任意新本地端口或预览域名都不自动获得回调权限。密钥和邮件配置要求见配置说明。

## 检查与协作

```bash
node --test tests/account*.test.mjs
```

未来账号改动提交到本分支，经检查后按模块同步到 `shared/site` 和各课程。不要为了获取登录更新而整条合并某个课程分支。世界史首页已有入口，后续若需修改入口位置，应编辑 `course/apwh` 的 `src/site/index.template.html` 并运行构建。

2026-10-26 拆分时，34 项账号自动检查通过。此结果覆盖代码与模拟认证流程；不代表已验证真实邮件投递、Google 控制台配置或线上回调。
