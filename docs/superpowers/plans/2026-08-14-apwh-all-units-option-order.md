# APWH “全部 Units”选项顺序 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 APWH 地图筛选器的“全部 Units”选项移到 Unit 1–9 之前，同时保持默认选择 Unit 1。

**Architecture:** 保留现有 `periodOptions` 单一数据源，只改变数组拼接顺序；首页继续通过 iframe API 读取同一组选项。浏览器回归直接验证独立页和首页使用的真实菜单顺序。

**Tech Stack:** 原生 HTML/CSS/JavaScript、Node.js、Playwright、`node:assert/strict`

---

### Task 1: 固定 Unit 菜单顺序

**Files:**
- Modify: `scripts/verify-world-timeline.mjs`
- Modify: `world-map.html`

- [ ] **Step 1: Write the failing test**

在 `verifyTimeline()` 读取 `getPeriodOptions()` 后增加：

```js
assert.deepEqual(periods.map(({ value }) => value), ['', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'],
  'AP World Unit options must place All Units first, followed by Unit 1 through Unit 9');
```

并将既有九个非空 Unit 断言改为从 `periods.filter(({ value }) => value)` 读取，避免把“全部 Units”计作课程单元。

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' scripts/verify-world-timeline.mjs
```

Expected: FAIL，实际顺序为 `u1`–`u9` 后接空值。

- [ ] **Step 3: Write minimal implementation**

在 `world-map.html` 将：

```js
const periodOptions = PERIODS.map(p => ({ value: p.id, label: `${p.label} (${periodCount(p)})` }))
  .concat([{ value: '', label: `全部 Units (${totalEvents})` }]);
```

改为：

```js
const periodOptions = [{ value: '', label: `全部 Units (${totalEvents})` }]
  .concat(PERIODS.map(p => ({ value: p.id, label: `${p.label} (${periodCount(p)})` })));
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
'/Users/tiffanyxu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node' scripts/verify-world-timeline.mjs
```

Expected: `AP World Timeline browser verification passed`。

- [ ] **Step 5: Verify the patch**

Run:

```bash
git diff --check
```

Expected: exit code 0，无输出。保留现有默认 Unit 1、跨 Unit 跳转和首页接缝样式断言全部通过。
