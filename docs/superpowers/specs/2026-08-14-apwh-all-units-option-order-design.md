# APWH “全部 Units”选项顺序设计

## 目标

在 AP World 地图模式的 Unit 下拉菜单中，把“全部 Units（事件总数）”从列表末尾移到第一项，之后依次显示 Unit 1–Unit 9。

## 行为

- 菜单顺序固定为：全部 Units、Unit 1、Unit 2……Unit 9。
- 页面初始选择仍为 Unit 1，不因选项顺序变化而改变。
- 选择“全部 Units”仍只表示取消地图、搜索结果和 Timeline Dock 的 Unit 筛选。
- 不修改人工 Unit 映射、事件数量、因果链内容或九单元主线。

## 实现范围

- 在 `world-map.html` 生成 `periodOptions` 时，把“全部 Units”对象放在数组首位。
- 在 `scripts/verify-world-timeline.mjs` 增加选项顺序断言，并保留默认选中 Unit 1 的既有断言。

## 验证

- 先运行新增断言，确认旧顺序导致失败。
- 修改选项顺序后运行完整 AP World 浏览器回归。
- 确认首页嵌入与独立 APWH 页面使用相同顺序。
