import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);

async function loadHtml() {
  return readFile(HTML_PATH, 'utf8');
}

test('detail view exposes four accessible study tabs', async () => {
  const html = await loadHtml();

  assert.match(html, /setAttribute\(['"]role['"], ['"]tablist['"]\)/);
  assert.match(html, /setAttribute\(['"]role['"], ['"]tab['"]\)/);
  assert.match(html, /setAttribute\(['"]aria-selected['"]/);
  assert.match(html, /setAttribute\(['"]aria-controls['"], ['"]detail-tabpanel['"]\)/);
  for (const label of ['速览', '形式', '语境', '比较']) {
    assert.ok(html.includes(label), `missing ${label} tab`);
  }
});

test('comparison navigation resolves targets without rewriting artwork data', async () => {
  const html = await loadHtml();

  assert.match(html, /function selectComparison\(/);
  assert.match(html, /comparisonIds/);
  assert.match(html, /dataset\.comparisonId/);
});

test('image dialog supports labelled media, attribution, and focus restoration', async () => {
  const html = await loadHtml();

  assert.match(html, /<dialog id="imageDialog"[^>]*aria-labelledby="dialogTitle"/);
  assert.match(html, /id="dialogTitle"/);
  assert.match(html, /id="dialogImage"/);
  assert.match(html, /id="dialogSource"/);
  assert.match(html, /function openImageDialog\(/);
  assert.match(html, /imageDialogTrigger\?\.focus\(\)/);
});

test('images install a named fallback and never inject dataset HTML', async () => {
  const html = await loadHtml();

  assert.match(html, /function installImageFallback\(/);
  assert.match(html, /className = 'image-fallback'/);
  assert.doesNotMatch(html, /innerHTML\s*=/);
});
