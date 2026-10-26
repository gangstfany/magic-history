# Magic History

**正式网站入口只有根目录的 `index.html`。**

当前世界史协作分支：`course/apwh`。完整首页包含 Today’s Pick、最新世界史学习卡、因果链、商路与练习，并保留艺术史和账号入口。美国史已有独立地图，可从首页 US History 入口打开；其他尚未完成的学科仍明确标注。

## 查看网站

在仓库根目录启动本地 HTTP 服务：

```sh
python3 -m http.server 8021 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8021/`。协作者可以拉取 `course/apwh` 后按同样方式查看；部署后则直接访问正式网址。页面和数据通过HTTP加载，不需要安装前端框架或运行npm构建。

## 文件用途

| 位置 | 用途 |
| --- | --- |
| `index.html` | 正式完整首页，由构建命令生成 |
| `world-map.html` | 审查后的世界史地图模块，由构建命令生成；首页自动载入 |
| `art-history-map.html` / `apush-map.html` | 各学科已有模块，保留独立实现 |
| `src/site/index.template.html` | 完整首页模板；修改首页从这里开始 |
| `src/apwh/` | 世界史源码、修订数据、样式、基线和测试 |
| `scripts/build-site.py` | 统一生成正式首页和世界史模块 |
| `assets/` | 共享界面、账号及静态资源 |
| `data/` | 其他学科与历史数据契约；世界史当前修订源见 `src/apwh/content-corrected.json` |
| `previews/world-keypoints-2026-10-25/` | 历史审查记录；旧页面链接会转回正式入口 |
| `docs/` / `tests/` | 设计、来源、部署说明和回归验证 |

`magic-history-map-keypoints.html` 是兼容旧链接的跳转页。`src/apwh/source-map-snapshot.html` 是只读构建基线，不是网站入口。

## 修改与构建

```sh
python3 scripts/build-site.py
node --test tests/canonical-site-entry.test.mjs
node --test src/apwh/test-*.cjs
(cd src/apwh && python3 -m unittest test_corrections.py test_preview.py)
node src/apwh/verify-content.cjs
```

构建后的 `index.html`、`world-map.html` 一同提交，静态托管可直接发布。不要直接编辑生成结果，重新构建会覆盖它们。

Today’s Pick 是每天轮换的历史推荐，未声称事件发生于当天月日。学习卡包括教师整理内容，保留来源与内容边界说明。

发布方法见 [部署说明](docs/deployment.md)。分支历史见 [分支说明](BRANCHES.md)。
