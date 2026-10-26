import assert from 'node:assert/strict';
import { discoverPlaywright, discoverBrowser, startStaticServer } from './verify-art-history-browser.mjs';

const playwright = await discoverPlaywright();
const server = await startStaticServer();
const browser = await playwright.chromium.launch({ executablePath: await discoverBrowser(playwright.chromium), headless:true });
const failures = [];
const only = process.env.REFINEMENT_CASE;
async function check(name, test) {
  if (only && !name.includes(only)) return;
  try { await test(); console.log(`PASS ${name}`); }
  catch (error) { failures.push(name); console.error(`FAIL ${name}: ${error.message}`); }
}
async function home(width) {
  const page = await browser.newPage({ viewport:{ width,height:900 }, reducedMotion:'reduce' });
  await page.goto(`${server.baseUrl}/apwh.html`);
  await page.locator('#home-map-embed').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('#worldMapFrame').contentWindow.__mapFilter);
  await page.waitForFunction(() => document.querySelector('#hostPeriod').options.length > 0);
  return page;
}
try {
  for (const width of [1440,390]) {
    await check(`${width} exact Today Pick`, async () => {
      const page = await home(width);
      try {
        const expected = await page.evaluate(() => {
          const doc = document.querySelector('#worldMapFrame').contentDocument;
          const ordinals = {}; const entries = [];
          doc.querySelectorAll('.panel .entry').forEach(e => {
            if (!e.querySelector('.citynum') || !e.querySelector('.yr') || !e.querySelector('.city2')) return;
            const num = e.querySelector('.citynum').textContent.trim();
            const id=`${num}:${ordinals[num] || 0}`; ordinals[num] = (ordinals[num] || 0) + 1;
            if (!doc.defaultView.__mapFilter.getEventKeyBySourceId || doc.defaultView.__mapFilter.getEventKeyBySourceId(id)) entries.push(id);
          });
          const now = new Date(); const day = Math.floor((now - new Date(now.getFullYear(),0,0))/86400000);
          return entries[day % entries.length];
        });
        assert.equal(await page.locator('#todayPick').getAttribute('data-source-id'), expected);
        await page.locator('[data-learning-view="chain"]').click();
        await page.locator('#todayPick').click();
        await page.waitForTimeout(250);
        const state = await page.evaluate(() => {
          const api = document.querySelector('#worldMapFrame').contentWindow.__mapFilter;
          return { learning:api.getLearningState(), timeline:api.getTimelineState(), key:api.getEventKeyBySourceId(document.querySelector('#todayPick').dataset.sourceId) };
        });
        assert.equal(state.learning.view,'map');
        assert.equal(state.timeline.selectedEventKey,state.key);
        assert.ok(state.timeline.visibleEvents.some(e => e.key === state.key && e.unit === state.timeline.unit));
        await page.evaluate(() => {
          const api=document.querySelector('#worldMapFrame').contentWindow.__mapFilter;
          api.setQuery('not-an-event'); api.getCats().forEach(c=>api.toggleCat(c.abbr));
        });
        await page.locator('#todayPick').click(); await page.waitForTimeout(250);
        assert.equal(await page.evaluate(() => document.querySelector('#worldMapFrame').contentWindow.__mapFilter.getTimelineState().selectedEventKey),state.key,'pick remains exact with conflicting query/themes');
      } finally { await page.close(); }
    });
    await check(`${width} directory keyboard focus`, async () => {
      const page = await home(width);
      try {
        await page.locator('#hostStudyDirectory summary').click();
        await page.locator('#hostPeriod').selectOption('');
        await page.locator('.study-place').first().focus(); await page.keyboard.press('Enter');
        await page.locator('#home-events .location-study-title').waitFor();
        await page.waitForTimeout(250);
        assert.equal(await page.evaluate(() => document.activeElement.matches('#home-events .location-study-title')),true);
        if (width < 720) assert.equal(await page.locator('#home-events .location-study-title').evaluate(e => { const r=e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }),true);
      } finally { await page.close(); }
    });
    await check(`${width} pending query before directory transition`, async () => {
      const page = await home(width);
      try {
        await page.locator('#hostStudyDirectory summary').click();
        await page.locator('#hostSearch').fill('Baghdad');
        // Same browser task: deliberately before the debounce callback can run.
        await page.evaluate(() => document.querySelector('.study-place').click());
        assert.equal(await page.locator('#hostSearch').inputValue(),'Baghdad');
        assert.equal(await page.evaluate(() => document.querySelector('#worldMapFrame').contentWindow.__mapFilter.getState().query),'Baghdad');
      } finally { await page.close(); }
    });
  }
  await check('Today Pick clears every region conflict on desktop and mobile',async()=>{
    for (const width of [1440,390]) {
      const page=await home(width);
      try {
        const expected=await page.evaluate(()=>{
          const api=document.querySelector('#worldMapFrame').contentWindow.__mapFilter;
          return api.getEventKeyBySourceId(document.querySelector('#todayPick').dataset.sourceId);
        });
        for(const region of ['mideast','europe','americas','africa','asia']) {
          await page.evaluate(()=>{
            const api=document.querySelector('#worldMapFrame').contentWindow.__mapFilter;
            api.setLearningView('map'); api.reset(); api.setPeriod('');
          });
          const anchor=page.frameLocator('#worldMapFrame').locator(`.region-path[role="button"][data-region="${region}"]`);
          await anchor.focus(); await page.keyboard.press('Enter');
          assert.equal(await page.evaluate(()=>document.querySelector('#worldMapFrame').contentWindow.__mapFilter.getState().region),region);
          // The normal Reset contract must continue to retain selected region.
          await page.evaluate(()=>document.querySelector('#worldMapFrame').contentWindow.__mapFilter.reset());
          assert.equal(await page.evaluate(()=>document.querySelector('#worldMapFrame').contentWindow.__mapFilter.getState().region),region);
          await page.locator('#todayPick').click(); await page.waitForTimeout(250);
          const actual=await page.evaluate(()=>{
            const api=document.querySelector('#worldMapFrame').contentWindow.__mapFilter;
            return {key:api.getTimelineState().selectedEventKey,region:api.getState().region};
          });
          assert.equal(actual.key,expected,`${width} pick remains exact after ${region}`);
          assert.equal(actual.region,null,`${width} pick explicitly clears ${region} scope`);
        }
      } finally {await page.close();}
    }
  });
  await check('truthful caption and directory counts', async () => {
    const page = await home(1440);
    try {
      const counts = await page.evaluate(() => document.querySelector('#worldMapFrame').contentWindow.__mapFilter.getMapCounts?.());
      assert.ok(counts,'source-backed map counts API');
      const expected=await page.evaluate(() => {
        const doc=document.querySelector('#worldMapFrame').contentDocument;
        return {events:[...doc.querySelectorAll('.panel .entry')].filter(e=>e.querySelector('.citynum')&&e.querySelector('.yr')&&e.querySelector('.city2')).length,
          pins:doc.querySelectorAll('.pin-group').length,regions:new Set([...doc.querySelectorAll('.pin-group')].map(e=>e.dataset.region)).size,
          routes:doc.defaultView.__mapFilter.getRoutes().length};
      });
      assert.deepEqual(counts,expected);
      assert.equal(await page.locator('#homeMapCaption').innerText(),`${counts.regions} regions · ${counts.events} source events · ${counts.pins} pins · ${counts.routes} trade routes`);
      await page.locator('#hostStudyDirectory summary').click();
      await page.locator('#hostPeriod').selectOption('');
      assert.match(await page.locator('#hostStudyLabel').innerText(),/unit\/location entries.*unique places/);
    } finally { await page.close(); }
  });
  for (const width of [1440,390]) await check(`${width} public course keyboard selection`, async () => {
    const page = await browser.newPage({viewport:{width,height:900}});
    try {
      await page.goto(`${server.baseUrl}/index.html`);
      const choice=page.locator('button.course-choice[data-course="art"]');
      await choice.focus(); await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('#courseTitle').textContent === '艺术史');
      assert.equal(await choice.getAttribute('aria-pressed'),'true');
      assert.equal(await page.evaluate(() => document.activeElement.dataset.course),'art');
    } finally { await page.close(); }
  });
  for (const review of [false,true]) await check(`single-event ${review ? 'review' : 'filtered'} term options`, async () => {
    const page = await browser.newPage();
    try {
      await page.goto(`${server.baseUrl}/world-map.html`);
      await page.waitForFunction(() => window.__mapFilter);
      await page.evaluate(review => {
        const entry=[...document.querySelectorAll('.panel .entry')].find(e => /Delhi Sultanate/.test(e.textContent));
        if (review) {
          const num=entry.querySelector('.citynum').textContent.trim(); const yr=entry.querySelector('.yr').textContent.trim();
          const plain=entry.querySelector('.trig').innerHTML.replace(/<[^>]*>/g,'').trim().slice(0,24);
          localStorage.setItem('mh.quiz.v1',JSON.stringify({ [`${num}|${yr}|${plain}`]:{miss:1,streak:0} }));
        }
        window.__mapFilter.setQuery('Delhi Sultanate');
        // Flat order ends with term; deterministic shuffle retains that final term at queue head.
        let first=true; Math.random=()=>{ if(first){ first=false; return 0; } return 0.999; };
        window.__mapFilter.startQuiz(review ? 'review' : 'all');
      },review);
      const options=await page.locator('[data-quiz-term]').allTextContents();
      assert.equal(options.length,4); assert.equal(new Set(options).size,4);
      const correct=await page.evaluate(() => {
        const e=[...document.querySelectorAll('.panel .entry')].find(e=>/Delhi Sultanate/.test(e.textContent));
        return e.querySelector('.trig').textContent.trim().split(/\s*[—–]\s*/).slice(1).join(' ').trim();
      });
      assert.equal(options.filter(o=>o===correct).length,1);
    } finally { await page.close(); }
  });
  await check('mirrored Practice result ignores stale non-pending search input',async()=>{
    const page=await home(1440);
    try {
      await page.locator('[data-learning-view="practice"]').click();
      await page.evaluate(()=>{
        const win=document.querySelector('#worldMapFrame').contentWindow;
        const e=[...win.document.querySelectorAll('.panel .entry')].find(e=>/Delhi Sultanate/.test(e.textContent));
        const num=e.querySelector('.citynum').textContent.trim(),yr=e.querySelector('.yr').textContent.trim();
        const plain=e.querySelector('.trig').innerHTML.replace(/<[^>]*>/g,'').trim().slice(0,24);
        win.localStorage.setItem('mh.quiz.v1',JSON.stringify({[`${num}|${yr}|${plain}`]:{miss:1,streak:0}}));
        win.__mapFilter.setQuery(''); win.__mapFilter.quizBook();
        const input=document.querySelector('#hostSearch'); input.focus(); input.value='not-an-event';
      });
      const result=page.locator('#home-events .event-card.is-result').first();
      const key=await result.getAttribute('data-event-key'); assert.ok(key);
      await result.click(); await page.waitForTimeout(250);
      assert.equal(await page.evaluate(()=>document.querySelector('#worldMapFrame').contentWindow.__mapFilter.getTimelineState().selectedEventKey),key);
    } finally {await page.close();}
  });
  await check('native keyboard zoom reset', async () => {
    const page=await browser.newPage({reducedMotion:'reduce'});
    try {
      await page.goto(`${server.baseUrl}/world-map.html`); await page.waitForFunction(()=>window.__mapFilter);
      assert.equal(await page.locator('.zoom-in').evaluate(e=>e.tagName),'BUTTON');
      await page.locator('.zoom-reset').click();
      await page.locator('.zoom-in').focus(); await page.keyboard.press('Enter');
      assert.match(await page.locator('#zoom-layer').getAttribute('transform'),/scale\(1\.35\)/);
      assert.ok(await page.locator('.zoom-in').evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth))>=3,'keyboard focus is visible');
      await page.locator('.zoom-reset').focus(); await page.keyboard.press('Space');
      assert.equal(await page.locator('#zoom-layer').getAttribute('transform'),'translate(0,0) scale(1)');
    } finally { await page.close(); }
  });
  await check('trusted mobile touch pan and pinch', async () => {
    const page=await browser.newPage({viewport:{width:390,height:900},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
    try {
      await page.goto(`${server.baseUrl}/world-map.html`); await page.waitForFunction(()=>window.__mapFilter);
      await page.locator('.zoom-in').click();
      const box=await page.locator('.worldmap').boundingBox(); const x=box.x+box.width/2,y=box.y+box.height/2;
      const cdp=await page.context().newCDPSession(page);
      const touch=async(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id])=>({x,y,id,radiusX:2,radiusY:2,force:1}))});
      const before=await page.locator('#zoom-layer').getAttribute('transform');
      const selectedBefore=await page.evaluate(()=>window.__mapFilter.getTimelineState().selectedEventKey);
      await touch('touchStart',[[x,y,1]]); await touch('touchMove',[[x-45,y-25,1]]); await touch('touchEnd',[]);
      assert.notEqual(await page.locator('#zoom-layer').getAttribute('transform'),before,'touch drag pans');
      assert.equal(await page.evaluate(()=>window.__mapFilter.getState().region),null,'drag did not activate region');
      assert.equal((await page.locator('#zoom-layer').getAttribute('transform')).match(/scale\(([^)]+)/)[1],before.match(/scale\(([^)]+)/)[1],'pan does not zoom');
      const pan=await page.locator('#zoom-layer').getAttribute('transform');
      await touch('touchStart',[[x-25,y,1],[x+25,y,2]]); await touch('touchMove',[[x-65,y,1],[x+65,y,2]]); await touch('touchEnd',[]);
      assert.notEqual(await page.locator('#zoom-layer').getAttribute('transform'),pan,'pinch zooms');
      assert.equal(await page.evaluate(()=>window.__mapFilter.getState().region),null,'gesture did not select region');
      assert.equal(await page.evaluate(()=>window.__mapFilter.getTimelineState().selectedEventKey),selectedBefore,'gesture did not select a pin event');
      await touch('touchStart',[[x,y,1]]); await touch('touchMove',[[x-10,y-10,1]]); await touch('touchCancel',[]);
      const cancelled=await page.locator('#zoom-layer').getAttribute('transform');
      await touch('touchStart',[[x,y,1]]); await touch('touchMove',[[x-25,y-15,1]]); await touch('touchEnd',[]);
      assert.notEqual(await page.locator('#zoom-layer').getAttribute('transform'),cancelled,'cancel releases pointer and next gesture works');
      await page.locator('.zoom-reset').click();
      assert.equal(await page.locator('.mapstage').evaluate(e=>getComputedStyle(e).touchAction),'pan-y');
      const unzoomedBox=await page.locator('.worldmap').boundingBox(); const ux=unzoomedBox.x+unzoomedBox.width/2,uy=unzoomedBox.y+unzoomedBox.height/2;
      const scrollBefore=await page.evaluate(()=>scrollY);
      await touch('touchStart',[[ux,uy,1]]);
      for(let n=1;n<=5;n++) { await touch('touchMove',[[ux,uy-n*20,1]]); await page.waitForTimeout(20); }
      await touch('touchEnd',[]); await page.waitForTimeout(150);
      assert.ok(await page.evaluate(()=>scrollY)>scrollBefore,'unzoomed vertical gesture scrolls page');
      await page.evaluate(()=>{ window.__mapFilter.setLearningView('map'); window.__mapFilter.reset(); });
      await page.locator('.zoom-reset').click();
      const region=page.locator('.region-path[data-region="africa"][role="button"]');
      await region.tap();
      assert.equal(await page.evaluate(()=>window.__mapFilter.getState().region),'africa','ordinary tap still opens region after cancellation');
    } finally { await page.close(); }
  });
  await check('mouse pan suppresses region click',async()=>{
    const page=await browser.newPage({reducedMotion:'reduce'});
    try {
      await page.goto(`${server.baseUrl}/world-map.html`); await page.waitForFunction(()=>window.__mapFilter);
      await page.evaluate(()=>window.__mapFilter.setLearningView('map'));
      await page.locator('.zoom-reset').click(); await page.locator('.zoom-in').click();
      const box=await page.locator('.worldmap').boundingBox(); const x=box.x+box.width/2,y=box.y+box.height/2;
      const before=await page.locator('#zoom-layer').getAttribute('transform');
      await page.mouse.move(x,y); await page.mouse.down(); await page.mouse.move(x-45,y-25,{steps:5}); await page.mouse.up();
      assert.notEqual(await page.locator('#zoom-layer').getAttribute('transform'),before);
      assert.equal(await page.evaluate(()=>window.__mapFilter.getState().region),null);
    } finally { await page.close(); }
  });
  for (const width of [1440,390]) {
    await check(`${width} late World message preserves active Art sizing`, async () => {
      const page = await browser.newPage({viewport:{width,height:900}});
      try {
        await page.goto(`${server.baseUrl}/index.html`);
        await page.locator('button.course-choice[data-course="art"]').click();
        const art=page.locator('iframe.course-frame[data-course="art"]');
        await page.waitForFunction(() => document.querySelector('iframe.course-frame[data-course="art"]')?.style.height !== '');
        const before=await art.evaluate(frame=>frame.getBoundingClientRect().height);
        await page.evaluate(() => {
          const world=document.querySelector('iframe.course-frame[data-course="world"]');
          window.dispatchEvent(new MessageEvent('message',{origin:location.origin,source:world.contentWindow,data:{type:'magic-history:module',course:'world',height:900}}));
        });
        assert.equal(await art.evaluate(frame=>frame.getBoundingClientRect().height),before);
        await page.locator('button.course-choice[data-course="world"]').click();
        await page.waitForFunction(() => document.querySelector('#courseTitle').textContent === '世界史');
        assert.equal(await art.getAttribute('aria-hidden'),'true');
      } finally { await page.close(); }
    });
  }
} finally { await browser.close(); await server.close(); }
assert.deepEqual(failures,[],`Regression failures: ${failures.join(', ')}`);
