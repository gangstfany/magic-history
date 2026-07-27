import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const HTML_PATH = new URL('../art-history-map.html', import.meta.url);
const SOURCE_WORKSHEET_PATH = new URL(
  '../docs/data-sources/u2-missing-works.md',
  import.meta.url,
);
const EXPECTED_CED_SOURCE = '[College Board AP Art History CED](https://apcentral.collegeboard.org/media/pdf/ap-art-history-course-and-exam-description.pdf)';
const ORIGINAL_ARTWORK_IDS = [
  'ap13-palette-of-king-narmer',
  'ap15-seated-scribe',
  'ap17-great-pyramids-giza',
  'ap18-king-menkaura-and-queen',
  'ap20-temple-of-amun-re-karnak',
  'ap21-mortuary-temple-hatshepsut',
  'ap22-akhenaten-nefertiti-daughters',
  'ap23-tutankhamun-innermost-coffin',
  'ap24-last-judgment-of-hunefer',
  'ap26-athenian-agora',
  'ap27-anavysos-kouros',
  'ap28-peplos-kore',
  'ap33-niobides-krater',
  'ap34-doryphoros',
  'ap35-athenian-acropolis',
  'ap36-grave-stele-hegeso',
  'ap37-winged-victory-samothrace',
  'ap38-great-altar-pergamon',
  'ap39-house-of-the-vettii',
  'ap40-alexander-mosaic',
  'ap41-seated-boxer',
  'ap42-head-of-a-roman-patrician',
  'ap43-augustus-prima-porta',
  'ap44-colosseum',
  'ap45-forum-of-trajan',
  'ap46-pantheon',
  'ap47-ludovisi-battle-sarcophagus',
];
const NEW_ARTWORK_IDS = [
  'ap12-white-temple-ziggurat',
  'ap14-statues-votive-figures',
  'ap16-standard-of-ur',
  'ap19-code-of-hammurabi',
  'ap25-lamassu-sargon-ii',
  'ap29-sarcophagus-of-the-spouses',
  'ap30-apadana-darius-xerxes',
  'ap31-temple-minerva-apollo',
  'ap32-tomb-of-the-triclinium',
];
const EXPECTED_NEW_ARTWORK_MEDIA = {
  'ap12-white-temple-ziggurat': {
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Uruk_(3).jpg',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Uruk_(3).jpg',
    creatorOrInstitution: '摄影：tobeytravels；来源机构：Wikimedia Commons',
    licenseName: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
  },
  'ap14-statues-votive-figures': {
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Sumerian_Status_from_Tell_Asmar,_part_of_the_Tell_Asmar_Hoard.jpg',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Sumerian_Status_from_Tell_Asmar,_part_of_the_Tell_Asmar_Hoard.jpg',
    creatorOrInstitution: '摄影：Osama Shukir Muhammed Amin FRCP(Glasg)；来源机构：Wikimedia Commons',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  'ap16-standard-of-ur': {
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Denis_Bourez_-_British_Museum,_London_(8747049029)_(2).jpg',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Denis_Bourez_-_British_Museum,_London_(8747049029)_(2).jpg',
    creatorOrInstitution: '摄影：Denis Bourez；来源机构：Wikimedia Commons / British Museum',
    licenseName: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
  },
  'ap19-code-of-hammurabi': {
    imageUrl: 'https://www.worldhistory.org/image/14341/code-of-hammurabi/download/',
    imageSourceUrl: 'https://www.worldhistory.org/image/14341/code-of-hammurabi/',
    creatorOrInstitution: '摄影：Larry Koester；来源机构：World History Encyclopedia / Louvre Museum',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  'ap25-lamassu-sargon-ii': {
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Lamassu_(Winged_Bull)_of_Throne_Room_of_Palace_of_Sargon_II,_Khorsabad,_Assyria_(28218791021).jpg',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Lamassu_(Winged_Bull)_of_Throne_Room_of_Palace_of_Sargon_II,_Khorsabad,_Assyria_(28218791021).jpg',
    creatorOrInstitution: '摄影：Gary Todd；来源机构：Wikimedia Commons / Louvre Museum',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  'ap29-sarcophagus-of-the-spouses': {
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Sarcofago_degli_Sposi_Villa_Giulia.jpg',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Sarcofago_degli_Sposi_Villa_Giulia.jpg',
    creatorOrInstitution: '摄影：Tutorialwiki；来源机构：Wikimedia Commons / Museo Nazionale Etrusco di Villa Giulia',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  'ap30-apadana-darius-xerxes': {
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Persepolis_-_Apadana_01.jpg',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Persepolis_-_Apadana_01.jpg',
    creatorOrInstitution: '摄影：Bernard Gagnon；来源机构：Wikimedia Commons',
    licenseName: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  'ap31-temple-minerva-apollo': {
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Reconstruction_of_the_Apollo_temple_from_the_Portonaccio_sanctuary.jpg',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Reconstruction_of_the_Apollo_temple_from_the_Portonaccio_sanctuary.jpg',
    creatorOrInstitution: '作者：unknown；来源机构：Wikimedia Commons / tDAR',
    licenseName: 'Public domain (PD-ineligible)',
    licenseUrl: 'https://commons.wikimedia.org/wiki/File:Reconstruction_of_the_Apollo_temple_from_the_Portonaccio_sanctuary.jpg',
  },
  'ap32-tomb-of-the-triclinium': {
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pittore_forse_attico,_affreschi_della_tomba_del_triclinio,_500-475_ac_ca,_01.jpg',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:Pittore_forse_attico,_affreschi_della_tomba_del_triclinio,_500-475_ac_ca,_01.jpg',
    creatorOrInstitution: '摄影：Sailko；来源机构：Wikimedia Commons / Museo Archeologico Nazionale di Tarquinia；许可提示：个人/学习用途允许，其他用途（尤其商业再利用）须另行获得意大利文化遗产主管部门授权',
    licenseName: 'CC BY 3.0；另受意大利文化遗产再利用授权限制',
    licenseUrl: 'https://commons.wikimedia.org/wiki/File:Pittore_forse_attico,_affreschi_della_tomba_del_triclinio,_500-475_ac_ca,_01.jpg',
  },
};
const EXPECTED_SOURCE_WORKSHEET_ROWS = [
  {
    ap: '12',
    id: '`ap12-white-temple-ziggurat`',
    study: '`APAH notes.pdf`, p. 6<br>[Smarthistory — White Temple and ziggurat](https://smarthistory.org/white-temple-and-ziggurat-uruk/)',
    image: '[Uncropped White Temple and ziggurat view](https://commons.wikimedia.org/wiki/File:Uruk_(3).jpg)',
    creator: 'tobeytravels / Wikimedia Commons',
    license: '[CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/)',
    visual: 'complete subject visible; identity cross-checked with CED and Smarthistory',
  },
  {
    ap: '14',
    id: '`ap14-statues-votive-figures`',
    study: '`APAH notes.pdf`, p. 7<br>[Smarthistory — Standing Male Worshipper (Tell Asmar)](https://smarthistory.org/standing-male-worshipper-from-the-square-temple-at-eshnunna-tell-asmar/)',
    image: '[Tell Asmar votive figures](https://commons.wikimedia.org/wiki/File:Sumerian_Status_from_Tell_Asmar,_part_of_the_Tell_Asmar_Hoard.jpg)',
    creator: 'Osama Shukir Muhammed Amin FRCP(Glasg) / Wikimedia Commons',
    license: '[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)',
  },
  {
    ap: '16',
    id: '`ap16-standard-of-ur`',
    study: '`APAH notes.pdf`, pp. 8–9<br>[Smarthistory — Standard of Ur](https://smarthistory.org/standard-of-ur-2/)',
    image: '[Standard of Ur — complete object view](https://commons.wikimedia.org/wiki/File:Denis_Bourez_-_British_Museum,_London_(8747049029)_(2).jpg)',
    creator: 'Denis Bourez / Wikimedia Commons / British Museum',
    license: '[CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)',
  },
  {
    ap: '19',
    id: '`ap19-code-of-hammurabi`',
    study: '`APAH notes.pdf`, pp. 10–11<br>[Smarthistory — Law Code Stele of King Hammurabi](https://smarthistory.org/hammurabi-2/)',
    image: '[Code of Hammurabi](https://www.worldhistory.org/image/14341/code-of-hammurabi/)',
    creator: 'Larry Koester / World History Encyclopedia / Louvre Museum',
    license: '[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)',
  },
  {
    ap: '25',
    id: '`ap25-lamassu-sargon-ii`',
    study: '`APAH notes.pdf`, pp. 14–15<br>[Smarthistory — Lamassu from the citadel of Sargon II](https://smarthistory.org/lamassu-from-the-citadel-of-sargon-ii/)',
    image: '[Lamassu from Sargon II’s palace](https://commons.wikimedia.org/wiki/File:Lamassu_%28Winged_Bull%29_of_Throne_Room_of_Palace_of_Sargon_II,_Khorsabad,_Assyria_%2828218791021%29.jpg)',
    creator: 'Gary Todd / Wikimedia Commons / Louvre Museum',
    license: '[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)',
  },
  {
    ap: '29',
    id: '`ap29-sarcophagus-of-the-spouses`',
    study: '`APAH notes.pdf`, p. 16<br>[Smarthistory — Sarcophagus of the Spouses (Rome)](https://smarthistory.org/sarcophagus-of-the-spouses-rome/)',
    image: '[Sarcophagus of the Spouses](https://commons.wikimedia.org/wiki/File:Sarcofago_degli_Sposi_Villa_Giulia.jpg)',
    creator: 'Tutorialwiki / Wikimedia Commons / Museo Nazionale Etrusco di Villa Giulia',
    license: '[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)',
  },
  {
    ap: '30',
    id: '`ap30-apadana-darius-xerxes`',
    study: '`APAH notes.pdf`, p. 17<br>[Smarthistory — Persepolis: The Audience Hall of Darius and Xerxes](https://smarthistory.org/persepolis-the-audience-hall-of-darius-and-xerxes/)',
    image: '[Persepolis — Apadana](https://commons.wikimedia.org/wiki/File:Persepolis_-_Apadana_01.jpg)',
    creator: 'Bernard Gagnon / Wikimedia Commons',
    license: '[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)',
  },
  {
    ap: '31',
    id: '`ap31-temple-minerva-apollo`',
    study: '`APAH notes.pdf`, pp. 17–18<br>[Smarthistory — Temple of Minerva and the sculpture of Apollo (Veii)](https://smarthistory.org/temple-of-minerva-and-the-sculpture-of-apollo-veii/)',
    image: '[Portonaccio Apollo temple reconstruction](https://commons.wikimedia.org/wiki/File:Reconstruction_of_the_Apollo_temple_from_the_Portonaccio_sanctuary.jpg)',
    creator: 'unknown / Wikimedia Commons / tDAR',
    license: '[Public domain (PD-ineligible)](https://commons.wikimedia.org/wiki/File:Reconstruction_of_the_Apollo_temple_from_the_Portonaccio_sanctuary.jpg)',
    visual: 'temple architecture and rooftop Apollo ensemble visible in one image',
  },
  {
    ap: '32',
    id: '`ap32-tomb-of-the-triclinium`',
    study: '`APAH notes.pdf`, pp. 18–19<br>[Smarthistory — Tomb of the Triclinium](https://smarthistory.org/tomb-of-the-triclinium/)',
    image: '[Tomb of the Triclinium frescoes](https://commons.wikimedia.org/wiki/File:Pittore_forse_attico,_affreschi_della_tomba_del_triclinio,_500-475_ac_ca,_01.jpg)',
    creator: 'Sailko / Wikimedia Commons / Museo Archeologico Nazionale di Tarquinia',
    license: '[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/); Italian cultural-heritage rules permit personal/study use, but require further authorization for other uses, especially commercial reuse ([Commons warning](https://commons.wikimedia.org/wiki/File:Pittore_forse_attico,_affreschi_della_tomba_del_triclinio,_500-475_ac_ca,_01.jpg))',
  },
];

async function loadHtml() {
  return readFile(HTML_PATH, 'utf8');
}

function parseJsonBlock(html, id) {
  const match = html.match(new RegExp(
    `<script id="${id}" type="application/json">([\\s\\S]*?)<\\/script>`,
  ));
  assert.ok(match, `missing ${id} JSON block`);
  return JSON.parse(match[1]);
}

function getFunctionSource(html, functionName) {
  const signature = `function ${functionName}(`;
  const start = html.indexOf(signature);
  assert.notEqual(start, -1, `missing ${functionName}()`);
  const openBrace = html.indexOf('{', html.indexOf(')', start));
  let depth = 0;
  for (let index = openBrace; index < html.length; index += 1) {
    if (html[index] === '{') depth += 1;
    if (html[index] === '}') depth -= 1;
    if (depth === 0) return html.slice(start, index + 1);
  }
  assert.fail(`unterminated ${functionName}()`);
}

class FakeNode {
  constructor(tagName = '#text', ownerDocument = null, value = '') {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.listeners = {};
    this.parentNode = null;
    this.className = '';
    this.id = '';
    this._textContent = value;
  }

  get textContent() {
    return this.children.length
      ? this.children.map((child) => child.textContent).join('')
      : this._textContent;
  }

  set textContent(value) {
    this.children = [];
    this._textContent = String(value);
  }

  append(...nodes) {
    for (const node of nodes) {
      const child = typeof node === 'string'
        ? new FakeNode('#text', this.ownerDocument, node)
        : node;
      child.parentNode = this;
      this.children.push(child);
    }
  }

  replaceChildren(...nodes) {
    this.children = [];
    this._textContent = '';
    this.append(...nodes);
  }

  replaceWith(node) {
    if (!this.parentNode) return;
    const index = this.parentNode.children.indexOf(this);
    this.parentNode.children.splice(index, 1, node);
    node.parentNode = this.parentNode;
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  addEventListener(type, listener) {
    (this.listeners[type] ||= []).push(listener);
  }

  click() {
    this.onclick?.({ target:this });
    for (const listener of this.listeners.click ?? []) listener({ target:this });
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  get classList() {
    return {
      contains: (name) => this.className.split(/\s+/).includes(name),
    };
  }

  querySelectorAll(selector) {
    const matches = [];
    const visit = (node) => {
      const className = selector.startsWith('.') ? selector.slice(1) : null;
      const role = selector.match(/^\[role="([^"]+)"\]$/)?.[1];
      const tagName = /^[a-z]+$/i.test(selector) ? selector.toUpperCase() : null;
      if (
        (className && node.classList.contains(className))
        || (role && node.getAttribute('role') === role)
        || (tagName && node.tagName === tagName)
      ) matches.push(node);
      node.children.forEach(visit);
    };
    this.children.forEach(visit);
    return matches;
  }

  querySelector(selector) {
    const dataTab = selector.match(/^\[data-tab="([^"]+)"\]$/)?.[1];
    if (dataTab) {
      return this.find((node) => node.dataset.tab === dataTab);
    }
    return this.querySelectorAll(selector)[0] ?? null;
  }

  find(predicate) {
    if (predicate(this)) return this;
    for (const child of this.children) {
      const result = child.find?.(predicate);
      if (result) return result;
    }
    return null;
  }
}

function createDetailHarness(html, artworks, credits) {
  const elements = new Map();
  const document = {
    activeElement:null,
    createElement(tagName) {
      return new FakeNode(tagName, document);
    },
    createTextNode(value) {
      return new FakeNode('#text', document, value);
    },
    getElementById(id) {
      return elements.get(id);
    },
  };
  for (const [id, tagName] of [
    ['dialogMedia', 'div'],
    ['dialogTitle', 'h2'],
    ['dialogCaption', 'p'],
    ['dialogCredit', 'p'],
    ['dialogLicense', 'a'],
    ['dialogSource', 'a'],
    ['dialogClose', 'button'],
  ]) {
    const element = document.createElement(tagName);
    element.id = id;
    elements.set(id, element);
  }
  const imageDialog = document.createElement('dialog');
  imageDialog.showModal = () => {
    imageDialog.open = true;
  };
  const state = { activeDetailTab:'quick', selectedSiteIndex:0 };
  const sources = [
    getFunctionSource(html, 'installImageFallback'),
    getFunctionSource(html, 'getArtworkImages'),
    getFunctionSource(html, 'getArtworkImageCredits'),
    getFunctionSource(html, 'createImageCredit'),
    getFunctionSource(html, 'openImageDialog'),
    getFunctionSource(html, 'renderArtworkDetails'),
  ].join('\n');
  return Function(
    'document',
    'IMAGE_CREDITS',
    'ARTWORKS',
    'imageDialog',
    'state',
    `"use strict";
      let imageDialogTrigger = null;
      const formatArtworkMeta = () => 'meta';
      const createStudyBlock = (title, ...paragraphs) => {
        const block = document.createElement('section');
        block.textContent = [title, ...paragraphs].join(' ');
        return block;
      };
      const cycleSite = () => {};
      const createComparisonAngle = () => '';
      const selectComparison = () => {};
      ${sources}
      return {
        getArtworkImages,
        getArtworkImageCredits,
        renderArtworkDetails,
        getDialogTrigger: () => imageDialogTrigger,
      };`,
  )(document, credits, artworks, imageDialog, state);
}

function parseSourceWorksheet(markdown) {
  return markdown
    .split('\n')
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => {
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());
      assert.equal(cells.length, 8, `worksheet row must have exactly 8 cells: ${line}`);
      const [ap, id, identifying, study, image, creator, license, visual] = cells;
      return { ap, id, identifying, study, image, creator, license, visual };
    });
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
  const selectComparison = html.match(
    /function selectComparison\(comparisonId\) \{([\s\S]*?)\n    \}/,
  )?.[1];

  assert.match(html, /function selectComparison\(/);
  assert.ok(selectComparison, 'missing selectComparison() body');
  assert.match(selectComparison, /expandedSiteToken:\s*null/);
  assert.match(html, /comparisonIds/);
  assert.match(html, /dataset\.comparisonId/);
  assert.match(html, /function createComparisonAngle\(/);
  assert.match(html, /形式：/);
  assert.match(html, /功能：/);
  assert.match(html, /语境：/);
});

test('image dialog supports labelled media, attribution, and focus restoration', async () => {
  const html = await loadHtml();

  assert.match(html, /<dialog id="imageDialog"[^>]*aria-labelledby="dialogTitle"/);
  assert.match(html, /id="dialogTitle"/);
  assert.match(html, /id="dialogImage"/);
  assert.match(html, /id="dialogSource"/);
  assert.match(html, /id="dialogCredit"/);
  assert.match(html, /id="dialogLicense"/);
  assert.match(html, /function openImageDialog\(/);
  assert.match(html, /imageDialogTrigger\?\.isConnected/);
  assert.match(html, /detailPanel\.querySelector\('\.artwork-image-button'\)/);
  assert.match(html, /focusTarget\?\.focus\(\)/);
});

test('normalizes legacy single images and preserves explicit image arrays', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');
  const harness = createDetailHarness(html, artworks, credits);
  const stonehenge = artworks.find(({ id }) => id === 'ap8-stonehenge');
  const single = artworks.find(({ unit }) => unit === 2);

  assert.strictEqual(harness.getArtworkImages(stonehenge), stonehenge.images);
  assert.equal(harness.getArtworkImages(stonehenge).length, 2);
  assert.deepEqual(harness.getArtworkImages(single), [{
    label:'Primary view',
    imageUrl:single.imageUrl,
    imageAlt:single.imageAlt,
    imageSourceName:single.imageSourceName,
    imageSourceUrl:single.imageSourceUrl,
  }]);
  assert.deepEqual(harness.getArtworkImageCredits(stonehenge), credits[stonehenge.id]);
  assert.deepEqual(harness.getArtworkImageCredits(single), [credits[single.id]]);
});

test('Stonehenge view buttons synchronize image, attribution, dialog, and pressed state', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');
  const harness = createDetailHarness(html, artworks, credits);
  const stonehenge = artworks.find(({ id }) => id === 'ap8-stonehenge');
  const summary = harness.renderArtworkDetails(stonehenge, { works:[stonehenge] });
  const imageButton = summary.querySelector('.artwork-image-button');
  const switcher = summary.querySelector('.image-view-switcher');
  const creditHost = summary.querySelector('.image-credit-host');
  const viewButtons = switcher.querySelectorAll('button');

  assert.equal(switcher.getAttribute('role'), 'group');
  assert.equal(switcher.getAttribute('aria-label'), 'Choose artwork image view');
  assert.deepEqual(viewButtons.map(({ textContent }) => textContent), [
    'Aerial overview',
    'Ground-level view',
  ]);
  assert.equal(viewButtons[0].getAttribute('aria-pressed'), 'true');
  assert.equal(viewButtons[1].getAttribute('aria-pressed'), 'false');
  assert.equal(imageButton.children[0].src, stonehenge.images[0].imageUrl);

  viewButtons[1].click();
  assert.equal(viewButtons[0].getAttribute('aria-pressed'), 'false');
  assert.equal(viewButtons[1].getAttribute('aria-pressed'), 'true');
  assert.equal(imageButton.children[0].src, stonehenge.images[1].imageUrl);
  assert.equal(imageButton.children[0].alt, stonehenge.images[1].imageAlt);
  assert.match(imageButton.getAttribute('aria-label'), /Stonehenge.*Ground-level view/);
  assert.match(creditHost.textContent, new RegExp(credits[stonehenge.id][1].creatorOrInstitution));
  const creditLinks = creditHost.querySelectorAll('a');
  assert.equal(creditLinks[0].href, credits[stonehenge.id][1].licenseUrl);
  assert.equal(creditLinks[1].href, stonehenge.images[1].imageSourceUrl);
  assert.equal(creditLinks[1].textContent, stonehenge.images[1].imageSourceName);

  imageButton.click();
  assert.equal(harness.getDialogTrigger(), imageButton);
  assert.equal(imageButton.ownerDocument.getElementById('dialogMedia').children[0].src, stonehenge.images[1].imageUrl);
  assert.equal(imageButton.ownerDocument.getElementById('dialogMedia').children[0].alt, stonehenge.images[1].imageAlt);
  assert.equal(imageButton.ownerDocument.getElementById('dialogCaption').textContent, stonehenge.images[1].imageAlt);
  assert.match(
    imageButton.ownerDocument.getElementById('dialogCredit').textContent,
    new RegExp(credits[stonehenge.id][1].creatorOrInstitution),
  );
  assert.equal(
    imageButton.ownerDocument.getElementById('dialogLicense').href,
    credits[stonehenge.id][1].licenseUrl,
  );
  assert.equal(
    imageButton.ownerDocument.getElementById('dialogSource').href,
    stonehenge.images[1].imageSourceUrl,
  );
  assert.equal(
    imageButton.ownerDocument.getElementById('dialogSource').textContent,
    stonehenge.images[1].imageSourceName,
  );
  assert.equal(
    imageButton.ownerDocument.activeElement,
    imageButton.ownerDocument.getElementById('dialogClose'),
  );
});

test('single-image Unit 2 details preserve one image and render no empty view switcher', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');
  const harness = createDetailHarness(html, artworks, credits);
  const single = artworks.find(({ unit }) => unit === 2);
  const summary = harness.renderArtworkDetails(single, { works:[single] });

  assert.equal(summary.querySelectorAll('.artwork-image-button').length, 1);
  assert.equal(summary.querySelector('.image-view-switcher'), null);
  assert.equal(summary.querySelectorAll('.image-credit-host').length, 1);
});

test('AP 15 uses the Louvre E 3023 Seated Scribe image and matching credit', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');
  const seatedScribe = artworks.find(({ id }) => id === 'ap15-seated-scribe');

  assert.ok(seatedScribe, 'missing AP 15 Seated Scribe');
  assert.equal(
    seatedScribe.imageUrl,
    'https://commons.wikimedia.org/wiki/Special:Redirect/file/Le_Scribe_accroupi_-_Mus%C3%A9e_du_Louvre_Antiquit%C3%A9s_%C3%A9gyptiennes_E_3023.jpg',
  );
  assert.equal(
    seatedScribe.imageSourceUrl,
    'https://commons.wikimedia.org/wiki/File:Le_Scribe_accroupi_-_Mus%C3%A9e_du_Louvre_Antiquit%C3%A9s_%C3%A9gyptiennes_E_3023.jpg',
  );
  assert.equal(seatedScribe.imageAlt, '卢浮宫 E 3023 坐姿书记官彩绘石灰岩像');
  assert.deepEqual(credits['ap15-seated-scribe'], {
    creatorOrInstitution: '摄影：Shonagon；来源机构：Wikimedia Commons',
    licenseName: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  });
});

test('nine imported works use the exact verified image sources and credits', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');

  for (const [id, expected] of Object.entries(EXPECTED_NEW_ARTWORK_MEDIA)) {
    const artwork = artworks.find((candidate) => candidate.id === id);
    assert.ok(artwork, `missing ${id}`);
    assert.equal(artwork.imageUrl, expected.imageUrl, `${id} image URL`);
    assert.equal(artwork.imageSourceUrl, expected.imageSourceUrl, `${id} source URL`);
    assert.deepEqual(
      credits[id],
      {
        creatorOrInstitution: expected.creatorOrInstitution,
        licenseName: expected.licenseName,
        licenseUrl: expected.licenseUrl,
      },
      `${id} image credit`,
    );
  }
});

test('Unit 2 source worksheet has nine exact verified rows and study links', async () => {
  const markdown = await readFile(SOURCE_WORKSHEET_PATH, 'utf8');
  const rows = parseSourceWorksheet(markdown);

  assert.equal(rows.length, 9);
  assert.deepEqual(
    rows.map(({ id }) => id),
    NEW_ARTWORK_IDS.map((id) => `\`${id}\``),
  );
  for (const [index, expected] of EXPECTED_SOURCE_WORKSHEET_ROWS.entries()) {
    const row = rows[index];
    assert.equal(row.ap, expected.ap, `${expected.id} AP number`);
    assert.equal(row.id, expected.id, `${expected.id} id`);
    assert.equal(row.identifying, EXPECTED_CED_SOURCE, `${expected.id} CED source`);
    assert.equal(row.study, expected.study, `${expected.id} study sources`);
    assert.equal(row.image, expected.image, `${expected.id} image source`);
    assert.equal(row.creator, expected.creator, `${expected.id} creator`);
    assert.equal(row.license, expected.license, `${expected.id} license`);
    assert.equal(
      row.visual,
      expected.visual ?? 'complete subject visible',
      `${expected.id} visual check`,
    );
    assert.match(row.study, /https:\/\/smarthistory\.org\//, `${expected.id} Smarthistory URL`);
    assert.ok(row.image, `${expected.id} needs an image source`);
    assert.ok(row.license, `${expected.id} needs a license`);
  }
});

test('source worksheet parser rejects rows with missing or extra cells', () => {
  const valid = '| 12 | id | identifying | study | image | creator | license | visual |';
  assert.equal(parseSourceWorksheet(valid).length, 1);
  assert.throws(
    () => parseSourceWorksheet(`${valid} extra |`),
    /exactly 8 cells/,
  );
  assert.throws(
    () => parseSourceWorksheet('| 12 | id | identifying | study | image | creator | license |'),
    /exactly 8 cells/,
  );
});

test('keeps all 47 loaded works, the complete Unit 2 id set, and one credit per image', async () => {
  const html = await loadHtml();
  const artworks = parseJsonBlock(html, 'artwork-data');
  const credits = parseJsonBlock(html, 'image-credit-data');
  const artworkIds = artworks.map(({ id }) => id);

  assert.equal(artworks.length, 47);
  for (const id of ORIGINAL_ARTWORK_IDS) {
    assert.ok(artworkIds.includes(id), `missing original artwork ${id}`);
  }
  for (const id of NEW_ARTWORK_IDS) {
    assert.ok(artworkIds.includes(id), `missing imported artwork ${id}`);
  }

  assert.deepEqual(Object.keys(credits).sort(), artworks.map(({ id }) => id).sort());
  for (const artwork of artworks) {
    const mediaItems = artwork.images ?? [artwork];
    const creditItems = Array.isArray(credits[artwork.id])
      ? credits[artwork.id]
      : [credits[artwork.id]];
    assert.equal(creditItems.length, mediaItems.length, `${artwork.id} needs one credit per image`);
    mediaItems.forEach((media, index) => {
      assert.equal(typeof media.imageUrl, 'string', `${artwork.id} image ${index + 1} needs a URL`);
      assert.ok(media.imageUrl.trim(), `${artwork.id} image ${index + 1} needs a non-empty URL`);
      const credit = creditItems[index];
      assert.ok(credit.creatorOrInstitution, `${artwork.id} missing creator or institution`);
      assert.ok(credit.licenseName, `${artwork.id} missing license name`);
      assert.match(credit.licenseUrl, /^https:\/\//, `${artwork.id} needs a linked license`);
    });
    if (artwork.unit === 2) {
      assert.equal(
        Object.hasOwn(artwork, 'images'),
        false,
        `${artwork.id} must preserve the Unit 2 single-image model`,
      );
    }
  }

  assert.match(html, /function createImageCredit\(/);
  assert.match(html, /rel = 'noopener noreferrer'/);
});

test('comparison navigation moves focus to the newly selected title', async () => {
  const html = await loadHtml();

  assert.match(html, /heading\.tabIndex = -1/);
  assert.match(html, /function focusSelectedArtworkHeading\(/);
  assert.match(html, /document\.activeElement !== heading/);
});

test('group marker accessible labels include both English hierarchy lines', async () => {
  const html = await loadHtml();

  assert.match(
    html,
    /marker\.setAttribute\('aria-label', `\$\{groupText\.title\} · \$\{groupText\.subtitle\}`\)/,
  );
  assert.doesNotMatch(html, /marker\.setAttribute\('aria-label',[^\n]*artworkNames/);
  assert.match(html, /marker\.setAttribute\('role', 'button'\)/);
  assert.match(html, /marker\.setAttribute\('tabindex', '0'\)/);
  assert.match(html, /expandSiteGroup\(group, true\)/);
});

test('map panning owns touch gestures only on the interactive pan surface', async () => {
  const html = await loadHtml();

  assert.match(html, /#panSurface\s*\{[^}]*touch-action:\s*none/s);
  assert.doesNotMatch(html, /(?:body|\.art-workspace|\.map-panel)\s*\{[^}]*touch-action:\s*none/s);
  assert.match(html, /if \(event\.cancelable\) event\.preventDefault\(\)/);
  assert.match(html, /addEventListener\('pointercancel', stopPan\)/);
  assert.match(html, /addEventListener\('lostpointercapture', stopPan\)/);
});

test('clearing filters also restores the overview transform', async () => {
  const html = await loadHtml();
  const clearFilters = html.match(/function clearFilters\(\) \{([\s\S]*?)\n    \}/)?.[1];

  assert.ok(clearFilters, 'missing clearFilters()');
  assert.match(clearFilters, /transform:\s*\{\s*x:0,\s*y:0,\s*scale:1\s*\}/);
  assert.match(clearFilters, /applyTransform\(\)/);
});

test('images install a named fallback and never inject dataset HTML', async () => {
  const html = await loadHtml();

  assert.match(html, /function installImageFallback\(/);
  assert.match(html, /className = 'image-fallback'/);
  assert.doesNotMatch(html, /innerHTML\s*=/);
});
