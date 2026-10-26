import assert from 'node:assert/strict';
import { discoverPlaywright, discoverBrowser, startStaticServer } from './verify-art-history-browser.mjs';

const playwright = await discoverPlaywright();
const server = await startStaticServer();
const browser = await playwright.chromium.launch({ executablePath: await discoverBrowser(playwright.chromium), headless: true });
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${server.baseUrl}/apwh.html`);
    await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#hostPeriod').options.length > 0);
    const directory = page.locator('#hostStudyDirectory');
    await directory.waitFor({ timeout: 5000 });
    assert.equal(await directory.getAttribute('open'), null);
    await directory.locator('summary').click();
    await page.locator('#hostPeriod').selectOption('');
    assert.equal(await directory.locator('[data-study-unit]').count(), 9);
    for (let n = 1; n <= 9; n++) {
      const unit = `u${n}`;
      await page.locator('#hostPeriod').selectOption(unit);
      const expected = await page.evaluate(unit => document.querySelector('#worldMapFrame').contentWindow[`APWH_${unit.toUpperCase()}_LOCATION_STUDY`].locationNumbers.length, unit);
      assert.equal(await directory.locator('.study-place').count(), expected, `${width} ${unit} real count`);
      await directory.locator('.study-place').first().click();
      await page.locator(`#home-events [data-location-study-view][data-location-study-unit="${unit}"]`).waitFor({ timeout: 5000 });
      assert.equal(await page.locator('[data-learning-view="map"]').getAttribute('aria-pressed'), 'true');
    }
    await page.locator('[data-learning-view="chain"]').click();
    await directory.locator('.study-place').first().click();
    await page.locator('#home-events .location-study-title').waitFor();
    await page.locator('[data-learning-view="practice"]').click();
    await directory.locator('.study-place').first().focus();
    await page.keyboard.press('Enter');
    await page.locator('#home-events .location-study-title').waitFor();
    assert.equal(await page.locator('[data-learning-view="map"]').getAttribute('aria-pressed'), 'true');
    await page.locator('[data-subj="art"]').click();
    assert.equal(await directory.isVisible(), false);
    await page.locator('[data-subj="world"]').click();
    await page.locator('#hostPeriod').selectOption('u1');
    assert.equal(await directory.locator('.study-place').count(), 8);
    await page.locator('#hostSearch').fill('Baghdad');
    await page.waitForFunction(() => document.querySelector('#worldMapFrame').contentWindow.__mapFilter.getState().query === 'Baghdad');
    const filterBefore = await page.evaluate(() => {
      const api = document.querySelector('#worldMapFrame').contentWindow.__mapFilter;
      api.toggleCat('ECN');
      return [...api.getState().cats].sort();
    });
    await directory.locator('.study-place').first().click();
    await page.locator('#home-events .location-study-title').waitFor();
    const filterAfter = await page.evaluate(() => {
      const state = document.querySelector('#worldMapFrame').contentWindow.__mapFilter.getState();
      return { query: state.query, cats: [...state.cats].sort() };
    });
    assert.equal(filterAfter.query, 'Baghdad');
    assert.deepEqual(filterAfter.cats, filterBefore);
    assert.ok(await page.locator('html').evaluate(e => e.scrollWidth - e.clientWidth) <= 1);
    assert.ok(await directory.locator('.study-place').first().evaluate(e => e.getBoundingClientRect().height) >= 44);
    await directory.locator('summary').click();
    assert.equal(await directory.locator('.study-place').first().isVisible(), false);
    assert.deepEqual(errors, []);
    console.log(`${width}: all nine units, study navigation, keyboard, subject and learning-mode switching passed`);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
