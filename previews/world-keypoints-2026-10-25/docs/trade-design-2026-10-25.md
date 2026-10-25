# 商路与交流网络优化

基于用户对现有商路的优化请求，保留六个入口，在原世界史离线预览中实现；不推送 GitHub。

## 交互

路线目录按类型、时期和站数展示。站点统一用行程序号，与地图和右侧内容对应。默认保留整条网络，让学生看见沿途关系；可聚焦本站、还原网络。船舶或陆路图标按示意线路移动，途中隐藏到站卡；抵达后显示地点、流动内容、历史影响。自动播放每站停留5.5秒，支持途中暂停与继续；切换路线或学习模式取消旧动画。沿用已验证的因果链动画时钟，不引入新图片资产。

标签与说明避开站点、图标、高亮地块、缩放/播放控件和地图边界。放不下时说明进入地图下方栏；地点短标签可省略，完整地点仍在行程面板与当前站说明中。原学习卡、因果链、练习题和错题机制保留。

## 地理与内容

- 印度洋改用广州、马六甲、卡利卡特、基尔瓦的海港节点，不把德里作为海港。
- 白银贸易补充阿卡普尔科—马尼拉—中国市场联系，跨太平洋路径在地图两侧续接，避免穿过欧亚大陆。广州注明是中国南部区域锚点，不等于全部贸易唯一港口。
- 大西洋网络补上返回欧洲的环节；三角形注明是多个航运网络的教学概括。中央航路使用“强迫迁移”，不将被奴役者写成普通商品。
- 哥伦布大交换单独标为生物与人口交流，以加勒比接触区表示跨洋联系，说明疾病、征服、强制劳动和殖民统治共同改变社会。
- 曼萨·穆萨朝觐补到麦加；廷巴克图只代表马里区域，不宣称已考证的出发城市。
- 丝绸之路标为多节点网络，不声称同一支商队固定走完全程，也不声称蒙古时期一直和平。

全部线条明确标记为教学示意；海上中间点用于表达大致地理联系，不声称复原历史船舶航迹。站点坐标为现代城市近似位置，不用于精确导航。

`trade-routes.json` 是新增说明的内容来源，`make_trade_data.py` 生成数据。`pin` 字段仅兼容原系统的学习上下文；贸易地图的真实显示位置独立采用 `lon/lat`，不据兼容编号调用原城市的全部历史事件。

## 资料

- [UNESCO：Silk Roads](https://www.unesco.org/en/silk-roads/about-silk-roads?hub=196704)
- [UNESCO：蒙古与丝路保护](https://en.unesco.org/silkroad/knowledge-bank/mongols-and-their-state-twelfth-thirteenth-century)
- [UNESCO：Kilwa Kisiwani](https://whc.unesco.org/en/list/144)
- [印度尼西亚国家档案馆：Malabar 与 Calicut](https://sejarah-nusantara.anri.go.id/hartakarun/category/14/)
- [UNESCO 研讨文集：季风与印度—印尼交流](https://fr.unesco.org/silkroad/sites/default/files/knowledge-bank-article/trade_contacts_with_the_indonesian_archipelago.pdf)
- [美国国会图书馆：马尼拉与大帆船贸易](https://blogs.loc.gov/international-collections/2021/10/negotiating-empire-part-i-from-magellan-to-the-founding-of-manila-16th-18th-centuries/)
- [Met：Manila Galleon Trade](https://www.metmuseum.org/ja/essays/the-manila-galleon-trade-1565-1815)
- [英国国家档案馆：跨大西洋奴隶贸易](https://www.nationalarchives.gov.uk/explore-the-collection/explore-by-time-period/georgians/transatlantic-slave-trade/)
- [OpenStax：Atlantic Slave Trade](https://openstax.org/books/world-history-volume-2/pages/5-4-the-atlantic-slave-trade)
- [Nunn & Qian：The Columbian Exchange](https://pubs.aeaweb.org/doi/10.1257/jep.24.2.163)
- [History in Africa：曼萨·穆萨朝觐的开罗—麦加阶段](https://www.cambridge.org/core/journals/history-in-africa/article/abs/echos-darabie-le-pelerinage-a-la-mecque-de-mansa-musa-72472513241325-dapres-des-nouvelles-sources/6621DFBE19EDD839E80372C81529CF4A)

新增说明是教师整理，不冒充原教科书逐字材料。内容更改范围为六张交流网络图，不替代完整课程内容审查。

## 验证

跨日期变更线的路径分割与图标插值、海上中间点、地点短标签的碰撞约束、六张数据的节点/终点与说明完整性；浏览器逐张检查站数、地图说明与右栏一致性、暂停、自动到站、手机319px无横向溢出与说明栏回退。另运行既有地图布局与因果动画测试、学习卡与内容回归。

最终增加了沿路线段分段采样的保护区：说明与短标签也避开商路线条，而不是只保护地点和控件。浏览器逐张采样核验六张图，初始说明与线条的交叠均为0；319px宽度无横向溢出。数据说明同时指出现代底图边界不等于历史疆域。

## 样式同步修复

用户截图显示商路目录退回浏览器默认灰色按钮，元信息、标题与站数连在同一行。原因是宿主页只复制 iframe 的面板 HTML，新增的商路 CSS 却只注入 iframe。修复为将面板样式移到 `trade-panels.css`，由构建器向两份文档头部注入同一份样式；地图覆盖层仍留在地图样式文件。目录把中文标题、英文名、类型/时期与站数分为独立行，沿用网站的 PingFang/系统字体，统一字重、字号与留白。新增回归检查保证两份文档的共享面板样式一致。浏览器确认宿主页的 grid 卡片、12px圆角、左对齐及各行字号实际生效，390px无横向溢出。
