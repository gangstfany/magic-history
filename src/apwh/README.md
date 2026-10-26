# 世界史维护源

本目录是世界史源码与审查数据，不是访客入口。正式首页和地图模块位于仓库根目录。

- `content-corrected.json` / `correction-ledger.json`：当前240张学习卡及内容修订记录。
- `chain-review-revisions.json`：因果链史实修订。
- `causal-*.js` / `causal-*.cjs` / `integrate_causal_workspace.py`：静态因果链及商路模块关联、返回状态。
- `trade-*.js` / `trade-*.cjs` / `trade-routes.json`：商路与交流网络。
- `cards.css` / `trade-panels.css` / `map-enhancements.*`：卡片及地图呈现。
- `source-map-snapshot.html` / `content-audit-data.json`：只读基线，用于重建和验证原始ID保留；不作为网页入口。
- `test*` / `verify-content.cjs`：测试正式生成页面及源数据。

在仓库根目录运行 `python3 scripts/build-site.py`。完整首页模板位于 `src/site/index.template.html`，构建同时注入宿主同步修复及共享样式。
