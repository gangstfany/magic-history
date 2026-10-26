# AP World History

世界史课程维护分支为 `course/apwh`；本次模块拆分在 `feature/modular-site-shell` 验收，尚未合并回其他分支。

本分支中，公共首页是 `index.html`，独立世界史工作区是 `apwh.html`。从首页选择世界史会嵌入同一工作区，包含 Today’s Pick、学习卡、因果链、商路、练习及时间线。底层地图 `world-map.html` 由工作区载入。

世界史界面修改源：`src/apwh/workspace.template.html`；内容与地图源码：`src/apwh/`。运行 `python3 src/apwh/build.py` 只生成 `apwh.html` 和 `world-map.html`，不会改动公共首页。

公共壳源码属于 `src/site/` 和 `assets/site/`。课程间的切换、公共导航与账号按钮在壳中维护；不要再把世界史学习逻辑加回公共首页。

旧预览链接仍转回正式首页，审查与恢复记录保留。完整命令见根目录 README。
