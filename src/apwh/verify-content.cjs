const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const world = fs.readFileSync(path.join(__dirname, '../../world-map.html'), 'utf8');
const context = vm.createContext({});
const scripts = [...world.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
for (const script of scripts.filter(s => /function publishUnit\dLocationStudy/.test(s))) vm.runInContext(script, context);
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
context.escapeTimelineText = esc;
context.studyRegionLabel = (record, api) => api.locationName(record.locationNumber);
context.CATEGORY_BY_ABBR = {};
for (const name of ['studyRelationshipGroupHTML', 'studyExamSkillsHTML', 'studyDetailHTML']) {
  const start = world.indexOf('  function ' + name + '(');
  const end = world.indexOf('\n  function ', start + 10);
  vm.runInContext(world.slice(start, end), context);
}
let total = 0, bookends = 0;
for (let unit = 1; unit <= 9; unit++) {
  const api = context[`APWH_U${unit}_LOCATION_STUDY`];
  assert(Object.isFrozen(api)); assert(Object.isFrozen(api.records));
  if (unit === 1) for (const loc of api.locationNumbers) {
    const cards=api.getByLocation(loc);
    for(let i=1;i<cards.length;i++)assert(cards[i-1].startYear<=cards[i].startYear,'Unit 1 chronology');
  }
  for (const kind of ['context', 'synthesis']) {assert(api.getUnitCard(kind)); bookends++;}
  for (const record of api.records) {
    const rendered = context.studyDetailHTML(record, api);
    for (const value of [record.summary, record.significance, record.examConnection, ...record.evidence,
      ...record.keyTerms.flatMap(t => [t.term, t.explanation]), ...record.keyPeople.flatMap(p => [p.name, p.role]),
      ...Object.values(record.connectionNotes)]) assert(rendered.includes(esc(value)), `Lost content: ${record.id}: ${value}`);
    for (const id of [...record.causeStudyPointIds, ...record.effectStudyPointIds, ...record.relatedStudyPointIds]) assert(api.getById(id), `Broken target: ${id}`);
    assert(!rendered.includes('<details'), `Nested disclosure: ${record.id}`);
    total++;
  }
}
assert.equal(total, 240); assert.equal(bookends, 18);
assert(!world.includes('北美最早大型文明'));
assert(world.includes('record.empire && record.lens'));
console.log(`Verified all ${total} rendered cards, ${bookends} unit cards, full teaching text and all relation targets.`);
