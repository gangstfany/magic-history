# Canonical Site Entry Implementation Plan

**Goal:** 根目录 index.html 同时提供完整首页与最新世界史功能，源码和旧预览用途清楚。

**Architecture:** 在现有course/apwh工作区实施。src/site保存宿主模板，src/apwh保存审查后的源码及基线，scripts/build-site.py生成根目录index.html和world-map.html。旧入口保留重定向。

**Tech Stack:** 静态HTML/CSS/JavaScript、Python构建、Node/Python测试。

## Task 1 — 定义正式入口回归
- [x] 新增tests/canonical-site-entry.test.mjs，验证正式首页保留Today’s Pick和账号、同源地图提前加载、最新因果模块在正式入口可用、旧链接重定向。
- [x] 运行 `node --test tests/canonical-site-entry.test.mjs`，确认原根目录未整合导致失败。

## Task 2 — 迁移源码并统一构建
- [x] 将预览源码、数据、测试与基线迁到src/apwh，保留审查记录于旧预览目录；生成HTML只写根目录。
- [x] 将现有完整首页保存为src/site/index.template.html，应用审查过的宿主同步、卡片滚动和ResizeObserver修复，并加入共享样式。
- [x] 用scripts/build-site.py调用src/apwh/build.py；原预览入口及magic-history-map-keypoints.html重定向正式入口。
- [x] 调整原回归测试读取正式生成页面，保留原始ID、34项测试及内容断言。

## Task 3 — 完整功能验证与说明
- [x] 构建并运行新增入口测试、34项回归、原APWH数据测试和宿主/账号测试。
- [x] 浏览器检查Today’s Pick初始显示及点击、世界史卡片/因果链/商路/练习、艺术史切换、账号入口和手机宽度；修复实际问题。
- [x] 更新根README/APWH.md/BRANCHES.md，明确正式入口、源码、构建和归档用途；保存整合截图和验证记录。
