(function publishUnit__UNIT__LocationStudy(root) {
  'use strict';
  const data = __DATA__;
  const key = 'APWH_U' + data.unit + '_LOCATION_STUDY';
  if (Object.prototype.hasOwnProperty.call(root, key)) throw new Error('Duplicate unit API: ' + key);
  const fail = message => { throw new Error('Corrected Unit ' + data.unit + ': ' + message); };
  const freeze = value => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze); Object.freeze(value);
    }
    return value;
  };
  const locations = new Map(data.locations.map(location => [String(location.number), location.name]));
  const byId = new Map(data.records.map(record => [record.id, record]));
  if (byId.size !== data.records.length) fail('duplicate record ID');
  const maxTopics = [0,7,7,4,8,10,8,9,9,9];
  for (const record of data.records) {
    if (!record.id.startsWith('apwh-u' + data.unit + '-')) fail('invalid ID ' + record.id);
    if (!locations.has(record.locationNumber)) fail('unknown location ' + record.id);
    if (!record.mainEventKey || record.startYear > record.endYear) fail('bad event/date ' + record.id);
    for (const field of ['title','summary','significance','examConnection','dateLabel']) {
      if (typeof record[field] !== 'string' || !record[field].trim()) fail('missing ' + field + ': ' + record.id);
    }
    if (!record.keyTerms.length || !record.keyPeople.length || record.evidence.length < 2) fail('incomplete body ' + record.id);
    for (const topic of record.topicCodes) {
      const [unit, number] = topic.split('.').map(Number);
      if (unit !== data.unit || number < 1 || number > maxTopics[unit]) fail('invalid topic ' + topic);
    }
    const fields = [['causeStudyPointIds','effectStudyPointIds'],['effectStudyPointIds','causeStudyPointIds'],['relatedStudyPointIds','relatedStudyPointIds']];
    const allTargets = fields.flatMap(([field]) => record[field]);
    if (new Set(allTargets).size !== allTargets.length) fail('duplicate or conflicting relation ' + record.id);
    for (const [field, reciprocal] of fields) for (const targetId of record[field]) {
      const target = byId.get(targetId);
      if (!target || targetId === record.id || !target[reciprocal].includes(record.id)) fail('broken reciprocal relation ' + record.id);
      if (!record.connectionNotes[targetId] || target.connectionNotes[record.id] !== record.connectionNotes[targetId]) fail('mismatched relation note ' + record.id);
    }
    if (Object.keys(record.connectionNotes).some(target => !allTargets.includes(target))) fail('orphan relation note ' + record.id);
    if (record.authorship === 'teacher-created' && !record.sourceUrls?.length) fail('missing new-card sources ' + record.id);
  }
  for (const kind of ['context','synthesis']) {
    const card = data[kind];
    if (card.kind !== kind || !card.summary || !card.takeaways.length) fail('missing unit card ' + kind);
  }
  const unitCards = {context:data.context, synthesis:data.synthesis};
  const compareRecords = (a,b) => (data.unit === 1 ? 0 : (a.sequence ?? 0) - (b.sequence ?? 0)) || a.startYear-b.startYear || a.endYear-b.endYear || a.id.localeCompare(b.id);
  const byLocation = new Map([...locations.keys()].map(number => [number, data.records.filter(r => r.locationNumber === number).sort(compareRecords)]));
  freeze(data); freeze(unitCards);
  const api = freeze({
    unitId:'u' + data.unit, unitNumber:data.unit,
    ...(data.connectionTimelineMode ? {connectionTimelineMode:data.connectionTimelineMode} : {}),
    locationNumbers:[...locations.keys()], records:data.records, unitCards, compareRecords,
    getByLocation(number) { return [...(byLocation.get(String(number)) || [])]; },
    getById(id) { return byId.get(String(id)) || null; },
    locationName(number) { return locations.get(String(number)) || null; },
    getUnitCard(id) { return unitCards[id] || Object.values(unitCards).find(card => card.id === id) || null; }
  });
  Object.defineProperty(root, key, {value:api,enumerable:true,configurable:false,writable:false});
})(typeof window !== 'undefined' ? window : globalThis);
