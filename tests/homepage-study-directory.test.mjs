import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const file = new URL('../index.html', import.meta.url);

test('World History study directory uses a collapsed native disclosure and live status', async () => {
  const html = await readFile(file, 'utf8');
  const tag = html.match(/<details[^>]*id="hostStudyDirectory"[^>]*>/)?.[0];
  assert.ok(tag, 'missing study directory');
  assert.doesNotMatch(tag, /\sopen(?:\s|>|=)/);
  assert.match(html, /id="hostStudyStatus"[^>]*role="status"/);
  assert.match(html, /function renderHostStudyDirectory\(/);
  assert.match(html, /function openHostStudyLocation\(/);
});
