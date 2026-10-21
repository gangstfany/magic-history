import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const clearSizing = html.match(/function clearEmbeddedWorldSizing\(\) \{[\s\S]*?\n  \}/)?.[0];
assert.ok(clearSizing, 'native World sizing cleanup exists');

function exercise(selectedSubject) {
  const wrap = { style: { height: '817px' } };
  const split = { style: { height: '817px' } };
  const worldMapFrame = {
    style: { height: '500px' },
    closest: selector => selector === '.home-map-wrap' ? wrap : split,
  };
  const homeEvents = { style: { height: '500px' } };
  runInNewContext(`${clearSizing}; clearEmbeddedWorldSizing();`, {
    selectedSubject, worldMapFrame, homeEvents,
  });
  return { wrap, split, worldMapFrame, homeEvents };
}

test('late World cleanup preserves the active Art subject shared host sizing', () => {
  const { wrap, split, worldMapFrame, homeEvents } = exercise('art');
  assert.equal(wrap.style.height, '817px');
  assert.equal(split.style.height, '817px');
  assert.equal(worldMapFrame.style.height, '');
  assert.equal(homeEvents.style.height, '');
});

for (const subject of ['world', 'euro']) {
  test(`World cleanup releases shared sizing for ${subject}`, () => {
    const { wrap, split, worldMapFrame, homeEvents } = exercise(subject);
    for (const element of [wrap, split, worldMapFrame, homeEvents]) {
      assert.equal(element.style.height, '');
    }
  });
}
