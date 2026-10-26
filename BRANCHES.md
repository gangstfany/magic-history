# 分支与模块责任

2026-10-26 模块拆分候选分支：`feature/modular-site-shell`。该分支提供可一起预览与部署的完整目录；此次不自动合并 `main`、`shared/site` 或课程分支。

| 分支 | 责任 |
| --- | --- |
| `main` | 已审查的整合与正式发布历史 |
| `shared/site` | 公共网站外壳：首页、导航、课程注册表、嵌入契约和共享样式 |
| `feature/account-auth` | 登录、注册、密码恢复、Google 登录及验证回调的独立维护 |
| `course/apwh` | 世界史内容与工作区；本次拆分候选使用 `src/apwh/` → `apwh.html` / `world-map.html` |
| `course/art-history` | 艺术史页面、资源与内容验证 |
| `feature/apush-all-periods-timeline-dock` | 协作者的美国史现有维护分支，保持其开发历史 |

欧洲史暂无课程实现，先保留注册位置，不为占位内容额外创建空分支。

模块边界以源码和入口文件为准；Git 分支保留共同基础文件。未来同步某个模块时，只提交/同步它负责的改动，不整条覆盖其他课程分支。公共首页由 `scripts/build-shell.py` 构建；世界史由 `src/apwh/build.py` 独立构建。完整发布目录可运行 `scripts/build-site.py` 生成。

本次保留其他工作树、私人媒体和未提交的艺术史工作，不改动其他分支的内容。世界史旧分支恢复标签记录在 `docs/apwh-branch-consolidation-2026-10-25.md`。
