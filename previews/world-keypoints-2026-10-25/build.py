from pathlib import Path
import html, re, json

HERE = Path(__file__).resolve().parent
SOURCE = HERE / 'source-map-snapshot.html'
source = SOURCE.read_text()
match = re.search(r'(id="worldMapFrame"[^>]*srcdoc=")([^"]*)(")', source)
assert match, 'Missing embedded World map'
world = html.unescape(match[2])
corrected = json.loads((HERE / 'content-corrected.json').read_text())
template = (HERE / 'unit-api-template.js').read_text()
for unit in corrected:
    number = unit['unit']
    pattern = r'<script[^>]*>\s*\(function publishUnit' + str(number) + r'LocationStudy[\s\S]*?</script>'
    payload = json.dumps(unit, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    script = template.replace('__UNIT__', str(number)).replace('__DATA__', payload)
    world, count = re.subn(pattern, lambda _: '<script>\n' + script + '\n</script>', world)
    assert count == 1, f'Missing or duplicate Unit {number} data script'

# The reviewed timeline statements must agree with the revised card reader.
world = world.replace('Mississippian culture</span> — 北美最早大型文明,Great Sun 世袭酋长+matrilineal 母系继承', 'Mississippian culture</span> — 密西西比流域重要的土墩城市与酋邦文化，Cahokia是墨西哥以北最大的史前原住民城市')
world = world.replace('Mississippian 是 matrilineal society,社会身份由母亲一方决定 · Great Sun 死后位子传给姐妹之子而不是亲子', '部分北美东南部社会实行母系继嗣；后期Natchez的Great Sun继位规则是特定案例，不能代表全部Mississippian文化')
world = world.replace('Guru Nanak</span> 融 Hindu+<span class="hl">Islam</span>', 'Guru Nanak</span>在印度教与伊斯兰教互动背景下形成独立的锡克宗教传统')
world = world.replace('杂交(后来加基因工程)育出高产抗病的麦与稻,配灌溉、化肥、农药→产量猛增;但买不起化肥农药的小农被挤走、机械化减少雇工、重施化学品伤土壤', '高产品种配合适宜水肥与管理提高产量；土地、信贷和投入品获取影响受益分配，机械化并非普遍必备条件，集约种植也带来环境代价')

def replace_once(text, old, new):
    assert text.count(old) == 1, f'Expected one replacement: {old[:80]}'
    return text.replace(old, new, 1)

# Keep original authored content and all navigation APIs. Only the reader changes.
start = world.index('  function studyDetailHTML(record, api) {')
end = world.index('  function renderLocationStudy(', start)
world = world[:start] + '''  function studyDetailHTML(record, api) {
    const esc = escapeTimelineText;
    const section = (label, content) => content ? `<section class="preview-section" data-preview-section><h3>${label}</h3>${content}</section>` : '';
    const para = (label, value) => section(label, `<p>${esc(value)}</p>`);
    const list = values => `<ul>${values.map(value => `<li>${esc(value)}</li>`).join('')}</ul>`;
    const definitions = values => `<ul>${values.map(([label, value]) => `<li><strong>${esc(label)}</strong> — ${esc(value)}</li>`).join('')}</ul>`;
    const themes = record.themeIds.map(id => `<span class="location-study-theme" style="--study-theme-color:${CATEGORY_BY_ABBR[id]?.catColor || '#597f8b'}">${esc(id)}</span>`).join('');
    const connections = studyRelationshipGroupHTML(record, api, 'Cause · 原因', record.causeStudyPointIds)
      + studyRelationshipGroupHTML(record, api, 'Effect · 结果', record.effectStudyPointIds)
      + studyRelationshipGroupHTML(record, api, 'Related Event · 相关事件', record.relatedStudyPointIds);
    return `<div class="location-study-detail preview-reading" data-study-detail="${esc(record.id)}">`
      + `<div class="preview-tags">${themes}</div>` + studyExamSkillsHTML(record.examSkills)
      + (record.authorship === 'teacher-created' ? `<p class="preview-authorship">教师整理补充 · 非官方材料</p>` : '')
      + para('Region · 地区', record.regionLabel || studyRegionLabel(record, api))
      + para('Summary · 核心判断', record.summary)
      + para('Why It Matters · 历史意义', record.significance)
      + para('Use It on the Exam · 考试用途', record.examConnection)
      + (record.keyTerms.length ? section('Key Terms · 关键术语', definitions(record.keyTerms.map(t => [t.term, t.explanation]))) : '')
      + (record.evidence.length ? section('Evidence · 答题证据', list(record.evidence)) : '')
      + section('Connections · 因果与关联', connections)
      + (record.keyPeople.length ? section('People · 人物', definitions(record.keyPeople.map(p => [p.name, p.role]))) : '')
      + `</div>`;
  }

''' + world[end:]
world = replace_once(world, 'locationStudyState.expandedStudyId = records[0].id;', 'locationStudyState.expandedStudyId = null;')
world = replace_once(world, 'locationStudyState.expandedStudyId = id;\n    renderLocationStudy(locationNumber, { focusStudyId: focusToggle ? id : null });\n    return locationStudyState.expandedStudyId === id;', 'locationStudyState.expandedStudyId = locationStudyState.expandedStudyId === id ? null : id;\n    renderLocationStudy(locationNumber, { focusStudyId: focusToggle ? id : null });\n    return true;')
world = replace_once(world, '+ `<span class="location-study-date" data-study-date>${escapeTimelineText(record.dateLabel)}</span>`', '+ `<span class="preview-identity" data-preview-number>${api.records.findIndex(r => r.id === record.id) + 1}</span>`\n        + `<span class="location-study-date" data-study-date>${escapeTimelineText(record.dateLabel)} · Topic ${escapeTimelineText(record.topicCodes.join(" / "))}</span>`\n        + (record.empire && record.lens ? `<span class="preview-lens">${escapeTimelineText(record.empire)} · ${escapeTimelineText(record.lens)}</span>` : "")')
world = replace_once(world, '+ `<span class="location-study-summary">${escapeTimelineText(record.summary)}</span>`\n        + `<span class="location-study-main" data-study-main-event>`\n        + `Linked main event: ${escapeTimelineText(linkedMainEvent.titleEn)}</span></button>`', '+ `<span class="preview-expander" aria-hidden="true">${expanded ? "−" : "+"}</span></button>`')
world = replace_once(world, 'const linkedMainEvent = timelineEventByKey.get(record.mainEventKey);', '// Main-event binding remains in the canonical record.')
back_start = world.index('  function backLocationStudyConnection(')
back_end = world.index('\n  function ', back_start + 10)
back_fn = world[back_start:back_end]
back_fn = replace_once(back_fn, 'const current = activeStudyRecord();', 'const current = activeStudyRecord() || api.getById(frame?.invokerTargetId);')
world = world[:back_start] + back_fn + world[back_end:]
world = replace_once(world, '+ connectionBack\n      + `<button', '+ `<button type="button" class="rt-btn ghost location-study-back" data-preview-directory>← 返回学习卡目录</button>`\n      + connectionBack\n      + `<button')
css = (HERE / 'cards.css').read_text()
world = world.replace('</head>', '<style>' + css + '\n.split {grid-template-columns:minmax(0,1fr)!important;gap:0!important;} .map-study-view {width:100%;border:0;border-radius:0;}\n</style></head>', 1)
(HERE / 'world-map.html').write_text(world)
result = source[:match.start(2)] + html.escape(world, quote=True) + source[match.end(2):]
result = result.replace('</head>', '<style>' + css + '</style></head>', 1)
result = result.replace('Magic History · 世界史原版地图与卡片离线预览 · U1–U9 · 可直接切换单元、选择地点、展开卡片 · 内容快照 2026-10-21', '本地整改预览 · 世界史精选复习卡 · 240 个知识点（保留原231张，新增9张）· 非完整考纲的替代品 · 2026-10-25 · 未发布')
result = result.replace('Magic History · 原版地图与 Keypoint 卡片 · 离线版', '世界史 Keypoints · 美国史框架预览')
old = '''if (win.__mapFilter.toggleLocationStudy(studyId)) {
          syncHomeEvents();
          homeEvents.querySelector(`[data-study-event="${CSS.escape(studyId)}"]`)?.focus();
        }'''
new = '''const savedScroll = homeEvents.scrollTop;
        if (win.__mapFilter.toggleLocationStudy(studyId)) {
          syncHomeEvents();
          homeEvents.scrollTop = savedScroll;
          homeEvents.querySelector(`[data-study-event="${CSS.escape(studyId)}"]`)?.focus({preventScroll:true});
        }'''
result = replace_once(result, old, new)
result = result.replace("directory.open=true;", "directory.open=false;")
result = result.replace('</body>', '''<script>
document.getElementById('home-events').addEventListener('click', event => {
  if (!event.target.closest('[data-preview-directory]')) return;
  const directory = document.getElementById('hostStudyDirectory');
  directory.open = true;
  directory.querySelector('summary').focus({preventScroll:true});
  directory.scrollIntoView({block:'nearest', behavior:'auto'});
});
</script></body>''')
(HERE / 'index.html').write_text(result)
print(f'Built {HERE / "index.html"} ({len(result.encode()):,} bytes)')
