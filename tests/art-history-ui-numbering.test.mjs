import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const loadHtml = () => readFile(HTML_PATH, 'utf8');

test('art map reuses World History typography and compact detail hierarchy', async () => {
  const html = await loadHtml();
  assert.match(
    html,
    /font-family:\s*"PingFang SC",\s*"Hiragino Sans GB",\s*-apple-system,\s*"Helvetica Neue",\s*sans-serif/,
  );
  assert.match(html, /heading\.className = 'work-title-en'/);
  assert.match(html, /heading\.textContent = work\.titleEn/);
  assert.match(html, /chineseTitle\.className = 'work-title-zh'/);
  assert.match(html, /chineseTitle\.textContent = work\.titleZh/);
  assert.ok(
    html.indexOf("heading.textContent = work.titleEn")
      < html.indexOf("chineseTitle.textContent = work.titleZh"),
    'English title must be created before the Chinese subtitle',
  );
});
