# Magic History

本分支 `feature/modular-site-shell` 将公共首页与课程工作区分开。统一访问根目录 `index.html`，在首页选择课程；各课程也可以独立打开。

## 查看

```sh
python3 -m http.server 8021 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8021/`。课程深链接使用 `#course=world`、`#course=us`、`#course=euro`、`#course=art`。切换课程保留已打开页面及其筛选和学习状态；刷新页面后重新加载课程。

| 模块 | 入口 | 源码与责任 |
| --- | --- | --- |
| 公共外壳 | `index.html` | `src/site/index.template.html`、`assets/site/shell.css`、`shell.mjs`；品牌、公共导航、课程切换、账号入口 |
| 世界史 | `apwh.html` | `src/apwh/workspace.template.html`、`src/apwh/`；Today’s Pick、筛选、学习卡、因果链、商路、练习与时间线 |
| 世界史底层地图 | `world-map.html` | 世界史内部使用，保留原独立地图链接 |
| 美国史 | `apush-map.html` | 美国史现有页面及 `data/apush-*`，不复制到公共壳 |
| 艺术史 | `art-history-map.html` | 艺术史现有页面与资源；`assets/site/art-embed.css` 仅处理自然高度的嵌入布局 |
| 欧洲史 | 尚未上线 | 首页明确显示准备中；待有真实内容后注册入口 |
| 账号 | `assets/auth/`、`auth-callback.html` | 各课程共用；独立维护分支 `feature/account-auth` |

首页不读取课程内部 DOM、学习 API 或内容数据。世界史的学习卡、地图同步逻辑只存在于世界史工作区，其他课程不会受到其筛选或样式影响。网站仍使用静态文件，无需安装前端框架。

## 构建与检查

```sh
# 只构建公共外壳，不依赖世界史内容
python3 scripts/build-shell.py
# 只构建世界史，不写公共首页
python3 src/apwh/build.py
# 一起构建完整发布目录
python3 scripts/build-site.py

node --test tests/site-*.test.mjs tests/account*.test.mjs tests/apwh-*.test.mjs tests/homepage*.test.mjs tests/canonical-site-entry.test.mjs
node --test src/apwh/test-*.cjs
(cd src/apwh && python3 -m unittest test_corrections.py test_preview.py)
node src/apwh/verify-content.cjs
```

生成的 `index.html`、`apwh.html`、`world-map.html` 一同提交。不要直接编辑生成页面。

## 接入新课程

在 `assets/site/modules.mjs` 注册课程入口。入口支持 `?embed=1`，并加入一个桥接脚本：

```html
<script type="module" src="assets/site/module-bridge.mjs" data-course="euro"></script>
```

页面可以自行隐藏重复的标题与返回导航，但应保持独立打开时可用。让嵌入页面使用内容自然高度，避免 body 或外层容器 `min-height:100vh` 造成高度循环。桥接脚本只上报课程标识和高度；父页面核对 origin、窗口来源及数据范围，不跨页面调用课程学习方法。

每次修改课程入口的嵌入契约时，更新 `courseURL` 中的 `moduleRelease`，避免浏览器继续使用不含桥接脚本的旧 HTML。正常课程内容维护仍在自己的源码中进行。

完整设计见 `docs/superpowers/specs/2026-10-26-modular-site-shell-design.md`，验收记录见 `docs/modular-site-shell-verification-2026-10-26.md`。部署见 `docs/deployment.md`，分工见 `BRANCHES.md`。
