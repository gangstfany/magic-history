import assert from 'node:assert/strict';
import { discoverPlaywright, discoverBrowser, startStaticServer } from './verify-art-history-browser.mjs';
const pw=await discoverPlaywright(), server=await startStaticServer();
const browser=await pw.chromium.launch({executablePath:await discoverBrowser(pw.chromium),headless:true});
try {
  for (const [width,height] of [[1440,1000],[900,1000],[390,1000],[390,500]]) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(server.baseUrl+'/index.html');
    await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('#worldMapFrame').contentWindow.__mapFilter);
    await page.locator('[data-subj="art"]').click();
    await page.waitForFunction(()=>document.querySelector('#artMapFrame').contentWindow.ArtHistoryMap);
    const art=page.frameLocator('#artMapFrame');
    await art.locator('#unitFilter').selectOption('2');
    await page.waitForTimeout(250);
    assert.deepEqual(await art.locator('.filter-pill').first().evaluate(e=>{
      const c=getComputedStyle(e);return [c.fontSize,c.fontWeight];}),['12.5px','700']);
    const canvas=width>900?500:300;
    assert.equal(await art.locator('.map-svg').evaluate(e=>Math.round(e.getBoundingClientRect().height)),canvas);
    for (const unit of ['1','2','6']) {
      await art.locator('#unitFilter').selectOption(unit);
      await page.waitForTimeout(250);
      assert.ok(await art.locator('body').evaluate(()=>{
        const a=window.ArtHistoryMap,t=a.state.transform;
        return a.filterWorks(a.ARTWORKS,a.state).map(a.toWorldCoordinates).every(p=>
          p.x*t.scale+t.x>=-1 && p.x*t.scale+t.x<=1601 && p.y*t.scale+t.y>=-1 && p.y*t.scale+t.y<=801);
      }),`U${unit} all anchors visible`);
    }
    await art.locator('body').evaluate(()=>window.ArtHistoryMap.selectComparison('ap15-seated-scribe'));
    assert.ok(await art.locator('body').evaluate(()=>window.ArtHistoryMap.state.transform.scale>1),'selected artwork focused');
    assert.deepEqual(await art.locator('.work-title-en').evaluate(e=>{
      const c=getComputedStyle(e);return [c.fontSize,c.fontWeight];}),['19px','800']);
    await art.locator('#resetView').click();
    await page.waitForTimeout(300);
    assert.equal(await art.locator('body').evaluate(()=>window.ArtHistoryMap.state.transform.scale),1);
    assert.ok(await art.locator('.map-svg').evaluate(e=>{
      const box=e.closest('.map-panel').getBoundingClientRect(),m=e.getScreenCTM();
      return m.e>=box.left-1 && m.e+1600*m.a<=box.right+1 && m.f>=box.top-1 && m.f+800*m.d<=box.bottom+1;
    }),'overview not cropped');
    await art.locator('#searchInput').fill('unmatched-xyz');
    await page.waitForTimeout(300);
    assert.ok(await art.locator('body').evaluate(()=>Object.values(window.ArtHistoryMap.state.transform).every(Number.isFinite)));
    await art.locator('#searchInput').fill('');
    await art.locator('#resetView').click();
    await page.waitForTimeout(300);
    assert.equal(await art.locator('body').evaluate(()=>window.ArtHistoryMap.state.transform.scale),1,'reset cancels pending search focus');
    await page.locator('[data-subj="world"]').click();
    await page.waitForTimeout(250);
    assert.equal(await page.frameLocator('#worldMapFrame').locator('.map-zone').evaluate(e=>Math.round(e.getBoundingClientRect().height)),canvas);
    await page.locator('[data-subj="art"]').click();
    await page.waitForTimeout(250);
    assert.equal(await art.locator('body').evaluate(()=>window.ArtHistoryMap.state.transform.scale),1,'subject switching preserves overview');
    assert.ok(await page.locator('html').evaluate(e=>e.scrollWidth<=e.clientWidth+1),'no outer horizontal overflow');
    await page.screenshot({path:`/tmp/production-map-ui-${width}-${height}.png`});
    assert.deepEqual(errors,[]);
    console.log(`${width}x${height}: typography, height, auto-focus, overview, filters and switching passed`);
    await page.close();
  }
} finally { await browser.close(); await server.close(); }
