# Magic History UI 交接规格：APWH / AP Art History → APUSH

> 给美国史页面开发者的实施依据。日期：2026-10-21。
> 本文是**当前实现的规格提取**，不是重新设计方案。单位默认为 CSS px，浏览器缩放基准为 100%。

## 0. 使用范围与真源

- 来源：当前本地正式源文件 `index.html`、`world-map.html`、`art-history-map.html`、`assets/map-ui.css`，不采用 `prototypes/` 的实验版。
- 所在分支：`feature/ap-art-history-u6`；提取时 HEAD 为 `680ddb0`，工作区包含尚未提交的变化。因此本文不是“GitHub main 已部署版本”的证明。
- 浏览器实测：1440×1000 下，首页世界史 Study points 入口打开后的卡片、艺术史选中作品后的详情、两个地图画布及首页栏宽。
- **最后加载的 `assets/map-ui.css` 是统一字体和画布高度的真源。** 页面内旧的 22px、15px、`.95rem` 等定义不一定是最终值；必须看 CSS 覆盖顺序和 computed style。
- 只移植设计与交互模式。APUSH 的时期、地点、地图边界、Topic、主题、历史解释和来源必须独立编写；不要把 APWH 内容或艺术史 AP 作品编号直接复制成美国史内容。
- 本文不包含账号密钥、支付、认证配置或私人学习图片。不要把整个工作区打包交接；只传必要 UI 源文件和本文。

### 源文件导航（仓库内相对路径）

| 文件 / 定位字符串 | 负责内容 |
|---|---|
| `assets/map-ui.css` | 最终统一字号、字重、行高、艺术史画布高度 |
| `index.html`：`.map-card`、`.map-toolbar-host` | 首页外壳、科目入口、工具栏 |
| `index.html`：`.home-events .location-study-*` | 首页中镜像显示的 keypoint 卡片样式 |
| `index.html`：`styleEmbeddedMap`、`styleEmbeddedArt` | iframe 高度和地图 / 详情栏协作 |
| `index.html`：`.study-directory`、`renderHostStudyDirectory` | Study points 地点目录 |
| `world-map.html`：`.location-study-*`、`studyDetailHTML` | 世界史独立页卡片样式和结构 |
| `world-map.html`：`.event-card`、`.world-timeline-*` | 事件小卡与横向时间卡片 |
| `art-history-map.html`：`.detail-panel`、`.study-block` | 艺术史作品详情 |
| `art-history-map.html`：`REGION_COLOR_PALETTE`、`getMarkerMetrics` | 地图色彩规则、屏幕尺寸稳定的气泡 |
| `data/apwh-u1-location-study.js` 至 U9 对应文件 | 学习点字段、关系、单元 context / synthesis |

## 1. 整体视觉原则

### 协作者先看这里：卡片代码在哪个分支？

2026-10-21 核对远程后，Key Terms 及学习卡渲染和 U1–U9 数据**在 `main` 与 `feature/ap-art-history-u6` 上都有**；但最后统一字体的 `assets/map-ui.css` 在艺术史分支，提取同款 UI 请优先读取该分支。`Key Terms` 是学习卡内的折叠区，不是单独叫 `keyterms-card.html` 的页面。

- [完整学习卡渲染与独立页样式：world-map.html](https://github.com/gangstfany/magic-history/blob/feature/ap-art-history-u6/world-map.html) — 搜索 `studyDetailHTML`、`Key Terms`、`.location-study-term-grid`。
- [首页中卡片的样式镜像：index.html](https://github.com/gangstfany/magic-history/blob/feature/ap-art-history-u6/index.html) — 搜索 `.home-events .location-study-`。
- [最终统一字体：assets/map-ui.css](https://github.com/gangstfany/magic-history/blob/feature/ap-art-history-u6/assets/map-ui.css)。
- [U1 学习点 / Key Terms 数据](https://github.com/gangstfany/magic-history/blob/feature/ap-art-history-u6/data/apwh-u1-location-study.js)；U2–U9 使用同目录同名模式。

如果协作者在旧 APUSH 分支，先 `git fetch origin`，然后可只读查看 `git show origin/feature/ap-art-history-u6:assets/map-ui.css`。不要在有未保存改动时直接切分支或整包覆盖；只移植必要的 UI 与结构，保留 APUSH 数据。

暖纸色背景、深棕黑正文、低饱和地理分区、细边框、小幅圆角、轻阴影；地图是主要学习工作区，不是装饰背景。标题、正文和控制项必须保持清晰层级。

- 不换成默认 Arial / Times，不把正文全部改成衬线体。
- 不为了“统一”把全站字体全部设成一个字号 / 字重。
- 不用额外鲜艳配色区分每一张知识卡。地理色、学科主题色和选中状态各有不同职责。
- 不做覆盖地图标点的悬浮学习面板；优先使用既有侧栏或窄屏下方详情区。

## 2. 字体、字号、粗细、行高

### 2.1 字体栈

```css
font-family: "PingFang SC", "Hiragino Sans GB", -apple-system,
             "Helvetica Neue", sans-serif;
```

覆盖页面正文、按钮、输入框、下拉框；页面使用 `-webkit-font-smoothing: antialiased`。同一字体栈在 Windows、macOS 上实际字形可能不同，交接时不能声称包含了某个专有字体文件。

首页品牌 Hero 是例外：`.serif` 使用 `"Big Caslon", "Iowan Old Style", Georgia, "Palatino Linotype", "Songti SC", serif`，标题 `clamp(28px,4.6vw,48px)`、500 字重。**不要把 Hero 的大号衬线体带入 keypoint / 地图详情。**

### 2.2 统一层级：最终生效值

| 层级 | 字号 | 字重 | 行高 | 现有 selector / 用途 |
|---|---:|---:|---:|---|
| 详情主标题 | 19 | 800 | 1.3 | `.work-title-en`、`.event-head .city-name`、`.location-study-title`、`.location-study-detail-title` |
| 区块 / 子卡标题 | 13.5 | 700 | 1.55 | `.study-block h3`、`.location-study-core h3`、`.location-study-name`、`.location-study-unit-title`、`.comparison-card strong` |
| 知识正文 | 13.5 | 600 | 1.55 | `.study-block p`、`.anchor-list li`、`.identity-row`、`.ec-trig`、`.location-study-detail p/li/dd`、`.location-study-unit-body p/li` |
| 副标题 / 元信息 | 12 | 600 | 1.55 | `.work-title-zh`、`.work-meta`、`.result-count`、`.image-credit`、`.location-study-context`、`.location-study-summary`、`.location-study-region` |
| 药丸 / 标签页 / 常规按钮 | 12.5 | 700 | 1.35 | `.filter-pill`、`.detail-tab`、`.hdr-btn`、`.map-panel-tabs button`、`.rt-btn` |
| 搜索 / 下拉内容 | 13 | 600 | 1.35 | 地图工具栏的 `select`、`input` |
| 复位 / 1:1 控件 | 11 | 700 | 1 | `.zoom-reset`、`.overview-button`；APWH `.zoom-btn.reset` 有自身旧规则，不能假设匹配此 selector |

注意：`.location-study-region` 虽是 `<p>`，但最后的元信息规则优先，最终是 **12 / 600 / 1.55**，不是正文的 13.5。

### 2.3 当前保留的小层级例外

这些不是遗漏，精确复刻当前页面时不要一律放大：

| 元素 | 当前字号 / 字重 | 说明 |
|---|---|---|
| 首页地图卡标题 `.map-card-head` | 15 / 800 | 色 `#8b3a2f`；不同于详情里的 19px 标题 |
| 单元 context / synthesis 摘要 `.location-study-unit-summary` | 12.5 / 500，行高 1.6 | 与事件折叠行摘要 `.location-study-summary` 的 12 / 600 不同 |
| 日期 `.location-study-date`、`.location-study-detail-date` | 12 / 800 | 等宽数字 `tabular-nums` |
| 事件年份 `.ec-yr` | 13.5 / 800 | 等宽数字 |
| 折叠小节标题 `.location-study-disclosure summary` | 12.5 / 850 | 源码未统一指定数值行高；不要误报为共享标题层级 |
| Topic / Theme / Exam skill 标签 | 11 / 800 | 最小高 26；这是标签，不是正文 |
| `.location-study-eyebrow` | 11 / 850 | 大写、字距 `.08em` |
| Linked main event 提示 | 11.5 / 800 | 色 `#176369`，行高 1.45 |
| Key Terms / People 的 `<dt>` | 12.5 / 850 | `<dd>` 才采用正文 13.5 / 600 |

浏览器可能用可用字体近似 850 字重；不要额外购买字体来“制造”这个数值。

## 3. 颜色 Tokens

### 3.1 地图独立页共用底色

| Token / 职责 | 色值 |
|---|---|
| `--ink` 主文字 | `#211f1c` |
| `--ink-soft` 次文字（地图页） | `#6b6558` |
| `--ink-faint` 弱信息 | `#9b9382` |
| `--paper` 整页纸色 | `#f9f4e8` |
| `--surface`（APWH）/ `--card`（艺术史）白暖卡底 | `#fffdf8` |
| `--surface-sunken` 图像凹面 | `#f2e9d8` |
| `--line` 细边 | `#e7dcc6` |
| `--line-strong` 加强边 | `#d8c9a8` |
| `--accent` 深红 | `#8b1a1a` |
| 海洋 / SVG 底矩形 | `#f0e6d6` |
| 焦点环 | `#28708a` |

### 3.2 首页变量与地图页不是完全同名同值

- 首页 `--frame:#f2d3ce`（外框粉色）；`--card:#f9f4e8`（首页纸色卡片）。
- 首页 `--ink-soft:#6b6456`，`--line:rgba(33,31,28,.12)`，`--terracotta:#c9714f`。
- 首页事件卡底是 `#fff`，世界史独立页事件卡底是 `#fffdf8`。
- 首页事件日期为 `--terracotta`；独立世界史页日期为 `--accent`。
- `.location-study-detail-title:#4b271c`；核心小标题 / 折叠小节标题 `#5a2c20`；艺术史 `.study-block h3:#765438`。
- 这表示**字体层级已经统一，不代表所有组件每一个颜色完全相同**。APUSH 接入首页时沿用首页语义变量，不要把全局 `--card` 改成地图独立页的含义。

### 3.3 地理色（不是学科主题色）

| 大区 | 固定色相 |
|---|---|
| Asia | `#d9a441` |
| Europe | `#6f9bc7` |
| Africa | `#c9714f` |
| Americas | `#e0949a` |
| Middle East | `#8fa878` |
| Oceania / Pacific（艺术史增加） | `#a597bd` |

- 世界史：普通激活大区透明度 `0.55`，聚焦时其他大区 `0.22`，单个国家聚焦 `0.88`。普通未激活路径存在 `#cec2a4 / 0.35` 底色状态，不要把全部初始状态写成 0.22。
- 艺术史：固定色相，**相关区域 0.55，其他 0.22**；随 Unit 和筛选后的作品集合变化；零结果时全部淡化，不残留旧高亮；不使用 0.88 强聚光。
- 颜色仅是导航提示，不是历史疆界。APUSH 不应把“整个美洲粉色”当作美国内部各区的既定分类；新地理分区的语义需单独定义，但保持同一低饱和视觉体系。
- 现有 APWH 主题色是另一组：GOV `#8b1a1a`、ECN `#0b6623`、CDI `#5a2d7a`、SIO `#a0620b`、TEC `#2c4a5e`。APUSH 应建立自身主题映射，不把这些缩写误作 APUSH 官方分类。

## 4. 页面、地图与响应式布局

### 4.1 首页外壳

- 主 `.card`：`width:100%`、`max-width:1280px`、圆角 22；外层 padding `clamp(14px,2vw,24px)`。
- 世界史 / 艺术史地图卡：`width:calc(100% - 32px)`，`max-width:none`，圆角 18，1px 边框。**满宽是相对父卡片，不是无条件铺满浏览器。**
- 地图卡表头：padding `11px 20px`，暖白底，下边线；右侧模式按钮 gap 6，最小高 32，左右 padding 12，胶囊角。
- 世界史首页工具栏：三列 `minmax(168px,220px) minmax(240px,1fr) auto`，gap `12px 16px`，padding `14px 18px`；≤720px 改为一列，输入项铺满。
- 科目切换：13px / 700，胶囊 `7px 15px`，gap 8；9px 色点；选中使用科目色底白字。

### 4.2 地图画布与详情

| 场景 | 当前实现 |
|---|---|
| 桌面地图画布 | 500px |
| 首页宽度 ≤900px 地图画布 | 300px（由 host 给 iframe 内页面设置） |
| 独立艺术史宽度 ≤900px | 300px，共享 CSS 覆盖 |
| 独立 APWH | 基础 `.map-zone` 是 500px；首页嵌入时 host 再设 500 / 300；不要假设独立页也有完全相同的宽度规则 |
| 首页世界史 >1050px | 左地图 + 右详情；右栏 `clamp(380px,34%,430px)` |
| 首页世界史 901–1050px | 上下叠放，保持详情可读 |
| 首页 ≤900px | 上下布局；普通世界史详情栏 46vh，内部滚动 |
| 独立 APWH ≤850px | `.split` 改为单列 |
| 艺术史桌面内部 | `minmax(0,2fr) minmax(275px,1fr)` |
| 艺术史 ≤664px | 地图在上、详情在下；详情高 360px，内部滚动 |

**不要把整个地图卡设为 500px。** 表头、筛选栏、世界史时间轴需要另算；艺术史手机还要容纳下方 360px 详情栏。

首页世界史实际测量 `#mapStudyView` 的高度，给 iframe 和右栏同步高度；艺术史测量 `toolbar + workspace`，并用 `ResizeObserver` 更新。切换科目必须清除上一科的 inline height，不能让晚到的 world resize 覆盖当前 art 高度。

艺术史不是“外层右栏再套内层右栏”：作品详情本来就在 art iframe 中；首页 `.home-events` 对艺术史隐藏。APUSH 应选择一种详情所有权，不要同时显示两套侧栏。

### 4.3 地图比例、相机与控件

- 两张现有底图的 SVG 坐标系是 `0 0 1600 800`。艺术史明确 `preserveAspectRatio="xMidYMid meet"`。
- 不用 `preserveAspectRatio="none"` 拉伸地图，也不用 `slice` 靠裁切掩盖上下海洋空白。
- 容器背景与 SVG 内底矩形保持同一个 `#f0e6d6`，避免 letterbox 出现异色横条。
- 艺术史自动聚焦筛选后的作品、选中作品及比较目标；保留边距，自动 fit scale 限于 1–3；非有限坐标不可进入 transform。
- `1:1` 复位回完整世界范围 / scale 1；手动缩放、拖动、复位应取消待执行的搜索聚焦，不能复位后又被旧搜索定时器拉走。
- 右上角缩放组距上 / 右各 12，纵向 gap 6。桌面控件 30×30，白底、1.5px `#ccc` 边、圆角 6、阴影 `0 2px 6px rgba(0,0,0,.15)`；艺术史 ≤520px 改为 44×44。
- 现有 SVG 边界多为白线、0.4 SVG 单位；更换美国底图时应保留相同视觉细度，但不能照搬世界底图路径索引。

## 5. 地图标点与模块气泡

### 世界史

- 编号表示地点，不是 AP 作品编号；点击地点显示该站事件。
- 原始 `BASE_R=11`、`HOVER_R=14`、透明触摸热区 `HIT_R=20`，会受既有 pin 屏幕缩放逻辑影响。不要把原始 SVG 半径当成所有分辨率下的 CSS 像素承诺。
- 选中 / timeline 关联用描边等状态，不仅依赖颜色。隐藏标点使用 `visibility:hidden` 配合 opacity，防止不可见标点继续进入 Tab 序。

### 艺术史

- 标记层级是 Unit → Region → Site → Artwork；作品使用既定 AP 编号，地区 / 数量副标签使用英文，例如 `21 pieces`。
- 普通气泡填充 `#597f8b`；Unit 气泡填充 `--unit-marker:#8b1a1a`；文字白色；白边 2，选中白边 3。
- 单作品圆点屏幕视觉直径 22；数字文字目标 10；展开的独立作品点同为 22。普通触摸热区至少 44×44。
- 地区 / 地点普通两行气泡目标高 38，标题 11 / 700、副标题 10 / 600；宽随文字计算，最小 48，不固定挤成圆形。
- compact 气泡目标高 22，宽 `max(38,min(108,文字长度×6.4+16))`；dense fallback 104×50，标题 9、副标题 8，热区 110×50。
- 上述是屏幕目标值；实现通过除以 `screenScale` 转成 SVG 单位。保留防碰撞、leader line 和窄屏列表 fallback，不能只贴静态 rect。
- APUSH 可复用“地点 → 事件组”的分组方式，但**不得冒用艺术史 AP #1–250 编号体系**。

## 6. Keypoint Card：世界史完整规格（APUSH 主要复用对象）

本项目中 keypoint 对应 `.location-study-*` 学习卡，不等于地图普通 `.event-card`。

### 6.1 进入与层级

```text
Study points 地点目录 / 地点事件中的学习入口
  → 地点名 · Unit + 区域 / 学习点数量
    → Unit Context 卡（可折叠）
    → 学习点卡列表（当前学习点展开）
    → Unit Synthesis 卡（可折叠）
```

- 选择地点后第一条有效学习点默认展开；一次保留一个展开的学习点。
- 折叠行始终可见：日期、英文事件标题、简短摘要、Linked main event。
- 展开态 `.location-study-detail` 内容：
  1. Unit / eyebrow、Topic、Theme、Exam Skills、标题、日期；
  2. **Region、Summary、Why It Matters、Use It on the Exam** 常驻；
  3. **Key Terms、Evidence、Connections、People、Source** 渐进展开。
- 小节带数量；空数据不渲染空小节。Connections 内按 Cause / Effect / Related Event 分组。
- 关联跳转能返回原卡，恢复滚动和展开状态。不是简单“所有文本塞进一个固定高 div”。

### 6.2 关键几何尺寸

| 组件 | 当前几何 / 底色 |
|---|---|
| 首页学习视图容器 | padding `16px 18px 22px`，grid gap 14 |
| 学习点列表 | gap 10 |
| 外卡 `.location-study-item` | 1px 边、圆角 11、轻阴影、overflow hidden |
| 折叠按钮 `.location-study-toggle` | 宽100%，最小高44，padding `13px 15px`；日期列最小82，列 gap12、行 gap5 |
| 折叠行 hover / expanded | `#fffaf0` / `#f7efe0` |
| 展开区 `.location-study-detail` | padding `18px 17px 20px`，gap16，顶边2px `#b85e3c`，底 `#fffaf0` |
| 展开区 header | gap7，底 padding14，1px `#decfbd` 分隔 |
| 常驻核心区 | grid gap13；各 section gap5 |
| Region 框 | padding `9px 11px`，1px `#d8bba7`，圆角8，底 `#fffdf8` |
| Exam 框 | padding `11px 12px`，左边4px `#28708a`，圆角7，底 `#edf6f7` |
| 折叠小节 summary | 最小高44，padding `7px 2px`，gap9；22px 圆形 + / − |
| 小节展开正文 | padding `2px 2px 14px 33px`；≤560px 左缩进改2 |
| Terms / People 行 | padding `9px 10px`，圆角7，1px `#e2d4c4`，底 `#fffdf8`，行 gap8 |
| Terms 的左右列 | `minmax(105px,.42fr) minmax(0,1fr)`，gap14；容器≤300px变单列 gap4 |
| Connections 按钮 | 最小高44，padding `9px 10px`，圆角8，1px `#bd765b`，底 `#fffdf8` |
| Context / Synthesis 卡 | 圆角11，1px细边，左边4px：Context蓝 `#28708a` / Synthesis赭 `#b85e3c` |
| 单元卡 summary | 最小高44，padding `12px 46px 13px 14px`，gap5；右侧24px + / − |

≤560px 首页学习视图 padding 变为 `14px 14px 20px`；学习点折叠行从日期+文本两列改为单列，长标题自然换行。

### 6.3 标签规格

- Topic：底 `#fff4e7`、边 `#d7b299`、字 `#874228`。
- Theme：语义主题色实底、白字，边为主题色与白色混合。
- Exam skill：底 `#edf6f7`、边 `#91bec1`、字 `#176369`。
- 三者均胶囊角，padding `3px 8px`，最小高26，gap6，可换行；不能把整排锁死单行导致溢出。

### 6.4 数据与内容约束

复用字段结构，不复用 APWH 的内容或编号：

```js
// APUSH 结构示意，不是官方题目、不是已完成的美国史内容。
{
  id: 'apush-<period>-<place>-<topic>',
  locationNumber: '<美国史自己的地点ID>',
  mainEventKey: '<美国史主事件稳定key>',
  title: '<英文标题>', dateLabel: '<日期范围>',
  topicCodes: [], themeIds: [], examSkills: [],
  summary: '<是什么>', significance: '<为什么重要>',
  examConnection: '<如何作为证据用于论证，不只是重复摘要>',
  keyTerms: [{ term: '<术语>', explanation: '<解释>' }],
  evidence: ['<具体、可核查证据>'],
  keyPeople: [{ name: '<人物>', role: '<在这一问题中的作用>' }],
  causeStudyPointIds: [], effectStudyPointIds: [], relatedStudyPointIds: [],
  connectionNotes: { '<目标学习点ID>': '<因果机制或比较连接说明>' },
  source: { id: '<实际来源>', locator: '<章节/页码/可定位位置>' }
}
```

- 不杜撰教材页码，不把示意年份当官方内容，不把普通“相关”关系写成因果。
- 图上的地点 ID、内容 ID、事件 key、筛选结果和目录计数必须相互对应。
- 标题优先英文，解释可中英结合；艺术史中文副标题另走元信息层级，不做两个同等大的主标题。

## 7. Study points 目录（更直接发现学习点的入口）

这是首页工具栏下的折叠目录，不是遮住地图的弹窗。

- 原生 `<details>`，默认收起；summary 为胶囊，最小高44、padding左右14、gap9，12.5 / 700。
- 数量标签底 `#f2e9d8`，padding `3px 8px`，11px。
- 目录内容最大高260，内部纵向滚动；按 Unit 分组，组间距16。
- 地点卡桌面4列，≤900px两列，≤450px一列；gap8。
- 地点卡最小高60，padding `10px 12px`，圆角11，1px边，数字圆徽27px，地点名13 / 700、副信息11.5 / 500。
- 选中边 `#597f8b`、底 `#edf4f4`；普通数字徽 `#426b93` 白字。计数来自当前真实可用学习数据，不写死。
- 点击地点会选择合适 Unit 并进入该地点学习点；不要求学生先找对某个地图标点。

## 8. 普通事件小卡与横向时间卡：不要与 Keypoint 混用

### 普通事件小卡 `.event-card`

- padding `13px 16px`，圆角10，1px边，左侧4px主题色条；独立页卡间距14，首页12。
- 顶行 gap9、下间距7；年份13.5 / 800，类别10 / 700 靠右；内容13.5 / 600 / 1.55。
- 英文关键词 `.hl` 底 `#fff3bf`、padding `1px 4px`、圆角3、700字重；不是整段黄色背景。
- 轻阴影 `0 1px 2px rgba(33,31,28,.06)`；hover 可用中阴影和上移1px，reduced motion 禁止位移动画。

### 世界史 Timeline Dock

- 放在地图画布下方、同一学习区域内；不从500px画布中挤出高度。
- 横向滚动，gap10；卡宽220、最小高88、padding `10px 12px`、圆角10；≤720px卡宽210。
- 日期12 / 800、英文13 / 800、中文12；选中底 `#f7dfc2`、边及外环 `#9b542f`。
- 和地图标点、当前事件同步，不能维护互相矛盾的第二套选中事件。
- 当前 `art-history-map.html` 没有同款 Timeline Dock 的实际渲染，不能因为历史讨论过 timeline 就在交接中声称两科都有。

## 9. 艺术史详情卡可复用的部分

- 详情栏 padding18，底 `#fffaf2`，桌面左边线，窄屏改顶边线；独立滚动。
- 作品英文主标题19 / 800；中文副标题12 / 600；AP编号、文化、时期等元信息12 / 600。
- 身份信息 `<dl>` 使用 `5.3em minmax(0,1fr)`，gap7，字段说明色为次文字。
- 图片按钮高300，padding10，圆角10；图片内容高278，**`object-fit:contain; object-position:center`**，不裁掉头部、边缘或建筑全貌。
- 多视图按钮可换行，gap6；当前视图深底白字。不能用错误对象的相似图片顶替指定作品 / 视角。
- 四个详情 tab 是**速览 / 形式 / 语境 / 比较**（`quick/form/context/compare`）：速览显示核心功能与识别锚点；形式显示形式与内容；语境显示历史语境与图像内容；比较显示关联作品及比较角度。不把艺术史的内容结构强塞给美国史；复用的是视觉和可访问交互。
- `.detail-tabs` 四等分，gap4、底边线；tab最小高34、padding `6px 4px`；选中底 `#eee2cf`，底部内阴影3px `#8a5c39`。
- 学习块 gap5；标题13.5 / 700 / `#765438`；正文13.5 / 600。
- 比较卡 padding11、圆角10、1px边、底 `#fffaf0`、gap3；比较角度要说明“比较什么”，不是只列另一个名称。
- 大图原生 dialog 宽 `min(920px,calc(100% - 28px))`，圆角16；图片最大高70vh，contain；44×44关闭键，关闭恢复原图按钮焦点。
- 授权占位和加载失败状态必须真实，不把缺图假装成已加载。APUSH 若加入图片，也保留来源与许可字段。

## 10. APUSH 最小移植方式

1. 保留 APUSH 自身的数据、地图投影和时期导航；先只替换 visual tokens 与组件外观。
2. 在美国史文档内也加载字体规则。**父页面 CSS 不会自动进入 iframe。** 如果复用 `assets/map-ui.css`，先检查其宽泛的 `.map-panel` / `.map-svg` 规则是否会影响美国史布局；不能直接覆盖共享文件来迁就 APUSH。
3. 新 class 名需要加入明确的语义映射；只定义 `--ty-*` 变量而没有匹配 selector，不会自动获得同款字体。
4. 先做一套完整样本：地点目录 → 事件 → 一个可展开 keypoint → context / synthesis → connection 返回，再批量填充内容。
5. 单独验证首页嵌入和独立页；不要将 `.home-events` 的 CSS 镜像遗漏。
6. APUSH 页面若已有 timeline，沿用现有数据关系并调整外观，不再创建第二套重复时间轴。

### 可复制的基础 Token（需由 APUSH 自己的 selector 消费）

```css
:root {
  --ink:#211f1c; --ink-soft:#6b6558; --ink-faint:#9b9382;
  --paper:#f9f4e8; --surface:#fffdf8; --surface-sunken:#f2e9d8;
  --line:#e7dcc6; --line-strong:#d8c9a8;
  --accent:#8b1a1a; --ocean:#f0e6d6;
  --ty-title:19px; --ty-section:13.5px; --ty-body:13.5px;
  --ty-meta:12px; --ty-control:12.5px;
  --shadow-sm:0 1px 2px rgba(33,31,28,.06);
  --shadow-md:0 6px 20px rgba(33,31,28,.10);
  --shadow-lg:0 14px 34px rgba(33,31,28,.16);
}
html,body,button,input,select {
  font-family:"PingFang SC","Hiragino Sans GB",-apple-system,
              "Helvetica Neue",sans-serif;
}
/* 以下为 APUSH 适配示例，不代表原项目已经存在这些 class。 */
.apush-detail-title { font-size:var(--ty-title);font-weight:800;line-height:1.3; }
.apush-section-title { font-size:var(--ty-section);font-weight:700;line-height:1.55; }
.apush-body { font-size:var(--ty-body);font-weight:600;line-height:1.55; }
.apush-meta { font-size:var(--ty-meta);font-weight:600;line-height:1.55;color:var(--ink-soft); }
.apush-control { font-size:var(--ty-control);font-weight:700;line-height:1.35; }
```

## 11. 验收清单（交付前逐项检查）

- [ ] 在1440×1000、900×1000、390×1000、390×500，以及手机横屏检查独立页与首页嵌入页。
- [ ] 用 DevTools **Computed** 核对标题19/800、区块13.5/700、正文13.5/600、元信息12/600，不只检查源码里出现过相同数字。
- [ ] 桌面 / 窄屏画布500 / 300逻辑与外壳同步；工具栏、timeline、详情不被裁切；页面没有意外横向滚动。
- [ ] 浏览器缩放 / 200%文字放大后允许内容换行、滚动，不能隐藏正文或让按钮覆盖文本。
- [ ] 标点视觉尺寸和触摸尺寸区分；缩放后字号可读、分组气泡不严重遮挡；极密集情况有列表 fallback。
- [ ] 地理底色透明度正确，筛选零结果清除高亮；底图和外框海洋颜色一致。
- [ ] Study points 目录可直接发现学习点，数量与当前数据一致；卡片展开 / 返回 / 关联跳转不丢状态。
- [ ] keypoint 的4个核心说明常驻，其余小节按需展开；缺失数据不生成假 Source 或空按钮。
- [ ] 时间轴、地图与侧栏只有一个一致的选择状态；切科目再回来不残留另一科的高度或详情。
- [ ] Tab、Enter / Space、清晰焦点环可用；折叠按钮维护 `aria-expanded`，标签页维护选中状态；隐藏元素不进入键盘焦点序。
- [ ] 保留 `prefers-reduced-motion`；不能仅靠 hover 或颜色传达核心信息；不要新加 emoji 代替必要图标语义。
- [ ] 图片 contain、指定对象与视角正确，来源 / 许可状态真实；大图可键盘关闭并回到触发点。
- [ ] 检查控制台错误、无匹配搜索、长标题、多语言、缺图和加载失败，不把“看得到页面”当全部验收完成。
- [ ] 样式改动不修改 APWH / 艺术史内容、权限、账号功能，也不未经确认覆盖共享样式或推送远程。

## 12. 可以直接交给 partner / 编程助手的任务说明

> 请按照本文件将 APUSH 的 UI 对齐当前 Magic History 的 APWH / AP Art History。先复用字体层级、纸色 palette、细边框圆角、画布高度和 keypoint 的渐进展开结构；保留 APUSH 自己的时期、地理、主题和内容来源。不用重建整个网站，不引入新的字体系统，不复制艺术史 AP 编号，也不把父页 CSS 当成 iframe 内样式。请先完成一个完整的地点与学习卡样本，展示独立页和首页嵌入页的电脑 / 手机对比，再扩展到全部时期。所有“对齐完成”结论都应附 computed style 与真实交互验证。

### 文档边界

本次仅创建交接 Markdown，未改网页、地图、数据、字号或账号入口位置；未推送 GitHub。本文件提取的界面结构不是 APUSH 官方内容规范，教学内容与题目类型需另行核验。
