import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const loadHtml = () => readFile(HTML_PATH, 'utf8');

function getFunctionSource(html, functionName) {
  const signature = `function ${functionName}(`;
  const start = html.indexOf(signature);
  assert.notEqual(start, -1, `missing ${functionName}()`);
  const openBrace = html.indexOf('{', start);
  let depth = 0;
  let end = -1;
  for (let index = openBrace; index < html.length; index += 1) {
    if (html[index] === '{') depth += 1;
    if (html[index] === '}') depth -= 1;
    if (depth === 0) {
      end = index + 1;
      break;
    }
  }
  assert.notEqual(end, -1, `unterminated ${functionName}()`);
  return html.slice(start, end);
}

function loadPureFunctions(html, functionNames) {
  const sources = functionNames.map((name) => getFunctionSource(html, name)).join('\n');
  const exports = functionNames.join(', ');
  return Function(`"use strict"; ${sources}; return { ${exports} };`)();
}

function getCssDeclarations(html, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = html.match(
    new RegExp(`(?:^|\\n)\\s*${escapedSelector}\\s*\\{([^}]*)\\}`, 's'),
  );
  assert.ok(match, `missing CSS rule for ${selector}`);
  return match[1];
}

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
  assert.match(
    html,
    /summary\.append\(heading,\s*chineseTitle,\s*meta,\s*imageButton,\s*imageCredit,\s*identity\)/,
    'detail summary must append English heading before the Chinese subtitle and metadata',
  );
  const englishTitleCss = getCssDeclarations(html, '.work-title-en');
  assert.match(englishTitleCss, /font-size:\s*22px/);
  assert.match(englishTitleCss, /font-weight:\s*800/);
  const chineseTitleCss = getCssDeclarations(html, '.work-title-zh');
  assert.match(chineseTitleCss, /font-size:\s*14px/);
  assert.match(chineseTitleCss, /font-weight:\s*600/);
  assert.match(getCssDeclarations(html, '.work-meta'), /font-size:\s*12px/);
  assert.match(
    html,
    /imageButton\.setAttribute\('aria-label',\s*`Open \$\{work\.titleEn\}（\$\{work\.titleZh\}）大图`\)/,
  );
  assert.match(html, /<dialog id="imageDialog"[^>]*aria-labelledby="dialogTitle"/);
  assert.match(
    html,
    /document\.getElementById\('dialogTitle'\)\.textContent = `\$\{work\.titleEn\} · \$\{work\.titleZh\}`/,
  );
});

test('all art map text inherits the World History font stack', async () => {
  const html = await loadHtml();
  assert.equal(
    (html.match(/font-family\s*:/g) || []).length,
    1,
    'only the page-level World History font stack may declare a font family',
  );
  assert.doesNotMatch(
    html,
    /font:\s*[^;}]*(?:ui-sans-serif|system-ui)/,
    'font shorthands must not override the page font family',
  );
  const markerLabelCss = getCssDeclarations(html, '.site-marker .marker-ap-label');
  assert.match(markerLabelCss, /font-weight:\s*700/);
  assert.match(markerLabelCss, /font-size:\s*17px/);
  const imageCreditCss = getCssDeclarations(html, '.image-credit');
  assert.match(imageCreditCss, /font-size:\s*\.78rem/);
  assert.match(imageCreditCss, /line-height:\s*1\.5/);
  assert.match(getCssDeclarations(html, '.legend'), /font-size:\s*\.86rem/);
});

test('compact AP number helpers preserve gaps and merge consecutive ranges', async () => {
  const html = await loadHtml();
  const { compactApNumbers, formatApGroupLabel } = loadPureFunctions(
    html,
    ['compactApNumbers', 'formatApGroupLabel'],
  );

  assert.equal(compactApNumbers([35, 39, 40]), '35, 39–40');
  assert.equal(compactApNumbers([41, 42, 43, 44, 45, 46, 47]), '41–47');
  assert.equal(
    formatApGroupLabel([{ apNumber: 40 }, { apNumber: 39 }, { apNumber: 35 }]),
    'AP 35, 39–40',
  );
});

test('map markers display AP numbers with circles for works and capsules for groups', async () => {
  const html = await loadHtml();

  assert.match(html, /works\.map\(\(work\) => work\.apNumber\)/);
  assert.match(html, /classList\.add\('marker-label-bg'\)/);
  assert.match(html, /classList\.add\('marker-ap-label'\)/);
  assert.match(
    html,
    /createElementNS\([^;]*group\.works\.length === 1 \? 'circle' : 'rect'\s*\)/,
  );
  assert.match(html, /label\.textContent = compactApNumbers\(apNumbers\)/);
  assert.doesNotMatch(html, /count\.textContent = (?:String\()?group\.works\.length/);
  assert.match(getCssDeclarations(html, '.site-marker .marker-label-bg'), /filter:\s*drop-shadow/);
  assert.match(
    getCssDeclarations(html, '.site-marker .marker-ap-label'),
    /dominant-baseline:\s*central/,
  );
});

test('detail images show the complete artwork without cover cropping', async () => {
  const html = await loadHtml();
  const detailImageCss = getCssDeclarations(html, '.artwork-image-button img');
  assert.match(detailImageCss, /object-fit:\s*contain/);
  assert.doesNotMatch(detailImageCss, /object-fit:\s*cover/);
  assert.match(detailImageCss, /(?:^|;)\s*height:\s*100%/);
  assert.match(detailImageCss, /(?:^|;)\s*max-height:\s*100%/);

  const imageButtonCss = getCssDeclarations(html, '.artwork-image-button');
  assert.match(imageButtonCss, /background:\s*var\(--surface-sunken\)/);
  assert.match(imageButtonCss, /box-sizing:\s*border-box/);
  assert.match(imageButtonCss, /(?:^|;)\s*height:\s*300px/);
  assert.match(imageButtonCss, /(?:^|;)\s*max-height:\s*300px/);
  assert.match(imageButtonCss, /(?:^|;)\s*padding:\s*10px/);
});
