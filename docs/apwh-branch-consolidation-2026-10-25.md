# 世界史分支整理 — 2026-10-25

世界史统一协作分支：`course/apwh`。

当前审查后的网页、独立地图、构建源码及测试：`previews/world-keypoints-2026-10-25/`，入口为该目录下 `index.html`。仓库根目录继续保存多学科共享站点的集成基线；本次操作不修改部署配置。

## 合并依据

- 从最新 `origin/course/world-history`（8937bd8）起步，保留新增的独立快照文件。
- 合并 `codex/world-keypoints-content-corrections` 的已审查内容归档，再同步此次因果链、商路与审查整改的最终源文件。
- 下列14条远端世界史分支的端点均已成为 `course/apwh` 的祖先。大多数原已包含在基线中，不重复应用补丁。
- U1旧分支的六条链、分组和布局已存在于新版；证据差异为后续地名英文化。U3旧分支的提交1a8c808与已合入的c5c113b稳定patch-id完全相同。两者通过保留现有树的历史合并纳入，避免把旧内容覆盖到新版。
- 本地 `feature/apwh-u1-study-sync-fixes`、`feature/apwh-u4-location-study`、`feature/embedded-timeline-dock` 的端点也已包含；其本地分支和工作区不在本次远端清理范围内。
- `feature/history-timeline-module-prototype` 内容为APUSH Period 1原型，保留在美国史范围，不混入世界史。

## 远端分支归档清单

清理前先推送下列归档标签。只有远端分支仍指向清单中的原SHA时才删除，避免覆盖协作者的新提交。

| 原分支 | 原提交 | 可恢复标签 |
| --- | --- | --- |
| `agent/apwh-integration` | `4171924` | `archive/apwh/2026-10-25/agent/apwh-integration` |
| `course/world-history` | `8937bd8` | `archive/apwh/2026-10-25/course/world-history` |
| `feature/apwh-all-units-card-timeline-dock` | `9790bb2` | `archive/apwh/2026-10-25/feature/apwh-all-units-card-timeline-dock` |
| `feature/apwh-exit-quiz-filter-restore` | `61bcf28` | `archive/apwh/2026-10-25/feature/apwh-exit-quiz-filter-restore` |
| `feature/apwh-u1-amsco-causal-chains` | `c3dd015` | `archive/apwh/2026-10-25/feature/apwh-u1-amsco-causal-chains` |
| `feature/apwh-u1-timeline-anchors` | `06bf210` | `archive/apwh/2026-10-25/feature/apwh-u1-timeline-anchors` |
| `feature/apwh-u2-amsco-chains` | `8aeb45c` | `archive/apwh/2026-10-25/feature/apwh-u2-amsco-chains` |
| `feature/apwh-u3-amsco-chains` | `1a8c808` | `archive/apwh/2026-10-25/feature/apwh-u3-amsco-chains` |
| `feature/apwh-u4-amsco-chains` | `af555ca` | `archive/apwh/2026-10-25/feature/apwh-u4-amsco-chains` |
| `feature/apwh-u5-amsco-chains` | `17da10d` | `archive/apwh/2026-10-25/feature/apwh-u5-amsco-chains` |
| `feature/apwh-u6-amsco-chains` | `9ab01f1` | `archive/apwh/2026-10-25/feature/apwh-u6-amsco-chains` |
| `feature/apwh-u7-amsco-chains` | `aeff8cf` | `archive/apwh/2026-10-25/feature/apwh-u7-amsco-chains` |
| `feature/apwh-u8-amsco-chains` | `9cce3ac` | `archive/apwh/2026-10-25/feature/apwh-u8-amsco-chains` |
| `feature/apwh-u9-amsco-chains` | `cab0b79` | `archive/apwh/2026-10-25/feature/apwh-u9-amsco-chains` |

归档标签保留完整提交历史；可在GitHub从标签新建分支，或本地执行 `git switch -c <恢复分支名> <归档标签>` 后推送。完整SHA及本地历史分支清单见同名JSON。

## 保留范围

`main`、`shared/site`、艺术史和APUSH分支均不在删除清单。仍被工作区使用的本地分支保持原样。此整理不代表把世界史内容合并到其他课程，也不改变默认分支。

## 验证

提交前实测通过：原APWH单元测试462项，当前预览Node测试26项、Python测试8项，共496项。240张学习卡和18张单元卡完整性校验通过；仓库内自包含构建成功，生成文件与本地已审查预览一致。
