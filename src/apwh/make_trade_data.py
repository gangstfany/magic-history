from pathlib import Path
import json
H=Path(__file__).resolve().parent

def site(pin,label,lon,lat,region,role,flow,impact):
 return dict(pin=pin,label=label,lon=lon,lat=lat,region=region,role=role,flow=flow,impact=impact)
def leg(flow,mechanism,via=[]):return dict(flow=flow,mechanism=mechanism,via=via)
def profile(id,name,category,period,icon,color,summary,exam,sites,legs,sources,bidirectional=False,note=''):
 return dict(id=id,name=name,category=category,period=period,icon=icon,color=color,summary=summary,exam=exam,sites=sites,legs=legs,sources=sources,bidirectional=bidirectional,schematic=True,note=(note or '代表性节点与交流方向示意；不是固定航线，也不表示所有旅人都走完全程。')+' 底图边界用于现代地理定位，不表示当时的政治疆域。')
routes=[
 profile('silk_road','丝绸之路 · Silk Roads','陆路贸易','c. 1200–1450','camel','#64806a','以东亚、蒙古高原、中亚和西亚的代表性节点理解陆路网络：商人分段接力，运输成本与政治环境共同影响交流。','用一个节点说明：政治保护如何降低交易风险，又为什么不能把整个时期写成持续和平。',[
 site(5,'Beijing · 北京',116.4,39.9,'asia','东亚市场与政治中心','丝绸、瓷器等高价值商品','城市需求与生产连接跨区域市场。'),
 site(8,'Karakorum · 哈拉和林',102.8,47.2,'asia','蒙古帝国的政治节点','商人、使节与知识','蒙古统治在部分时期加强跨区域交通保护。'),
 site(9,'Samarkand · 撒马尔罕',66.96,39.65,'mideast','中亚商路交汇城市','货物、工艺与宗教观念','接力交易与城市网络支持跨文化互动。'),
 site(3,'Baghdad · 巴格达',44.37,33.32,'mideast','西亚商品与知识交流中心','商品、技术与学术知识','城市是连接区域市场的节点，战争也会破坏网络。')],
 [leg('东亚商品与旅人向内亚流动','高价值、低体积商品较能承担陆路运输成本。'),leg('内亚与中亚之间的接力交易','政治保护、驿站和商旅设施降低部分交易风险。'),leg('中亚与西亚市场相连','交流依赖多个城市与中间商，不是单一商队的直达路线。')],
 ['https://www.unesco.org/en/silk-roads/about-silk-roads?hub=196704','https://en.unesco.org/silkroad/knowledge-bank/mongols-and-their-state-twelfth-thirteenth-century'],True),
 profile('indian_ocean','印度洋贸易 · Indian Ocean','海上贸易','c. 1200–1450','ship','#237e79','用广州、马六甲、卡利卡特和基尔瓦展示海上网络。季风、港口与商人社区共同组织交换；德里属于内陆市场，不作为海港。','比较印度洋与丝绸之路：运输条件怎样影响货物、商人停留和跨文化互动？',[
 site(15,'Guangzhou · 广州',113.26,23.13,'asia','中国南部海港','瓷器、丝织品与海外商品','海港连接中国生产与海上市场。'),
 site(2,'Malacca · 马六甲',102.25,2.19,'asia','连接印度洋与南海的海峡港口','转口商品、商人与宗教观念','海峡位置支持港口集散与文化接触。'),
 site(6,'Calicut · 卡利卡特',75.78,11.26,'asia','印度西南部的海上贸易港口','香料、纺织品与转口商品','季风航行使港口成为商人交换和停留的场所。'),
 site(85,'Kilwa · 基尔瓦',39.52,-8.96,'africa','东非斯瓦希里海岸的贸易城市','黄金等非洲商品与亚洲输入品','远程贸易支持东非沿海城市与跨文化联系。')],
 [leg('中国南部 ↔ 东南亚转口港','沿南海进入马六甲海峡；线条仅表达大致海上联系。',[[114,15],[108,6]]),leg('东南亚 ↔ 印度西南海岸','航行利用季风，但不是全年单向不变的风；这里只画一种教学顺序。',[[100,2],[94,5],[82,3],[76,5]]),leg('印度西岸 ↔ 东非港口','不同港口和商人分段连接海域，不代表一条固定的直达班船。',[[65,5],[52,-1],[43,-6]])],
 ['https://whc.unesco.org/en/list/144','https://sejarah-nusantara.anri.go.id/hartakarun/category/14/','https://fr.unesco.org/silkroad/sites/default/files/knowledge-bank-article/trade_contacts_with_the_indonesian_archipelago.pdf'],True),
 profile('galleon','白银与大帆船贸易 · Silver & Galleons','跨洋贸易','1565–1815','ship','#ae7930','补上美洲—马尼拉—中国一端：美洲白银向亚洲流动，亚洲商品向美洲流动。太平洋跨越地图两侧接续，不穿过欧洲。','解释中国的白银需求怎样与美洲开采、马尼拉转口和跨太平洋贸易相连。',[
 site(49,'Acapulco · 阿卡普尔科',-99.9,16.86,'americas','新西班牙的太平洋港口','白银向西，亚洲商品向东','大帆船贸易把美洲与亚洲市场连接起来。'),
 site(12,'Manila · 马尼拉',120.98,14.6,'asia','跨太平洋贸易与亚洲商人的转口点','美洲白银与亚洲商品交换','港口把不同贸易网络接在一起。'),
 site(15,'Guangzhou · 广州',113.26,23.13,'asia','代表中国南部市场的区域锚点','白银流入，丝织品与瓷器等流出','中国市场需求影响跨区域白银流向；中国与马尼拉的联系不只经广州。')],
 [leg('白银：美洲 → 马尼拉；亚洲商品反向流动','大帆船横渡太平洋。图的左右边缘相接，航向箭头仅示意。',[[-120,15],[-150,14],[170,14],[145,15]]),leg('白银：马尼拉 → 中国；中国商品反向流动','中国商人参与马尼拉贸易；广州是区域锚点，不表示全部贸易都经同一港口。',[[118,18],[115,21]])],
 ['https://blogs.loc.gov/international-collections/2021/10/negotiating-empire-part-i-from-magellan-to-the-founding-of-manila-16th-18th-centuries/','https://www.metmuseum.org/ja/essays/the-manila-galleon-trade-1565-1815'],True),
 profile('atlantic_triangle','大西洋贸易与奴隶制 · Atlantic Network','贸易与强迫迁移','c. 1500–1800s','ship','#845744','用欧洲、西非和加勒比海代表跨大西洋网络。三角形是教学概括，不表示每艘船都完成三段；被奴役者遭受的是强迫迁移。','把商品交换、暴力、种植园劳动和欧洲港口收益连起来解释，避免将被奴役者仅写成普通货物。',[
 site(39,'Liverpool · 利物浦',-2.98,53.41,'europe','欧洲港口与商业资本','制成品、船运与信贷','欧洲商人与港口从奴隶贸易及种植园产品中获利。'),
 site(87,'Elmina · 埃尔米纳',-1.35,5.08,'africa','西非沿海贸易据点之一','制成品交换与被俘者的买卖','当地权力、欧洲商人与暴力共同卷入奴隶贸易。'),
 site(59,'Bridgetown · 布里奇敦',-59.61,13.1,'americas','加勒比海种植园与出口港','被奴役的非洲人遭强迫迁移','种植园生产依赖剥削与强制劳动。'),
 site(39,'Liverpool · 利物浦',-2.98,53.41,'europe','欧洲消费与加工市场','糖、烟草等种植园产品','出口收益、加工和金融把网络再次接回欧洲。')],
 [leg('欧洲 → 西非：制成品','贸易与殖民权力、金融和沿海据点相互关联。',[[-15,48],[-22,20],[-10,6]]),leg('西非 → 美洲：中央航路上的强迫迁移','强调暴力、死亡与被奴役者的经历，不能把这一段等同于普通商品运输。',[[-25,7],[-45,11]]),leg('美洲 → 欧洲：种植园产品','三角图概括多个相互连接的航运网络，不是一艘船必走的固定环线。',[[-45,30],[-28,45],[-10,50]])],
 ['https://www.nationalarchives.gov.uk/explore-the-collection/explore-by-time-period/georgians/transatlantic-slave-trade/','https://openstax.org/books/world-history-volume-2/pages/5-4-the-atlantic-slave-trade']),
 profile('columbian_exchange','哥伦布大交换 · Columbian Exchange','生物与人口交流','1492年以后','ship','#a86674','以塞维利亚与伊斯帕尼奥拉岛代表跨大西洋接触。交换覆盖多条路线与更广地区，包括作物、动物、疾病与人口流动。','解释同一跨洋联系为什么带来不同地区的人口、环境与社会后果，避免把复杂变化归于单一因素。',[
 site(45,'Seville · 塞维利亚',-5.99,37.39,'europe','旧大陆一侧的代表性港口','牲畜、部分作物、病原等向美洲传播','不同生物与人类群体进入新的生态与社会环境。'),
 site(68,'Santo Domingo · 圣多明各',-69.93,18.49,'americas','加勒比接触区的代表性地点','美洲作物向旧大陆传播','疾病、征服、强制劳动和殖民统治共同改变原住民社会。')],
 [leg('双向生物交流；疾病与人口变化高度不对称','不是一条单独商路，也不是一次航行；本图仅表示接触区与交流方向。',[[-18,27],[-40,18],[-60,18]])],
 ['https://pubs.aeaweb.org/doi/10.1257/jep.24.2.163'],True),
 profile('mansa_musa_hajj','曼萨·穆萨朝觐 · Mansa Musa’s Hajj','朝觐','1324–1325','camel','#ad842d','从马里区域经开罗到麦加，展示宗教朝觐与跨区域联系。廷巴克图只是马里区域锚点，不据此断定准确出发城市。','说明朝觐如何显示统治者的财富与宗教身份，并加强马里与更广泛伊斯兰世界的联系。',[
 site(73,'Mali / Timbuktu · 马里区域',-3.0,16.77,'africa','区域锚点，非已考证的出发城市','统治者、随行人员与黄金','财富和宗教身份连接西非与伊斯兰世界。'),
 site(84,'Cairo · 开罗',31.24,30.04,'africa','朝觐途中重要停留地','消费、赠礼与政治接触','关于穆萨在开罗活动的记载扩大了马里的声誉。'),
 site(22,'Mecca · 麦加',39.83,21.42,'mideast','朝觐目的地','宗教仪式与跨地区交往','麦加而非开罗是这次朝觐的宗教终点。')],
 [leg('马里区域 → 开罗：跨撒哈拉旅程','地理连接为示意，不能据此推定商队走过的每一座城市。',[[10,22],[20,28]]),leg('开罗 → 麦加：继续前往圣地','这是一条朝觐联系，不把沿线赠礼等同于常规商业贸易。',[[33,28],[35,25]])],
 ['https://www.cambridge.org/core/journals/history-in-africa/article/abs/echos-darabie-le-pelerinage-a-la-mecque-de-mansa-musa-72472513241325-dapres-des-nouvelles-sources/6621DFBE19EDD839E80372C81529CF4A','https://www.metmuseum.org/fr/perspectives/visualizing-a-sahelian-past'])
]
(H/'trade-routes.json').write_text(json.dumps(routes,ensure_ascii=False,indent=2)+'\n')
