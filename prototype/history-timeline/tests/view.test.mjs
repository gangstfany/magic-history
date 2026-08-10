import assert from 'node:assert/strict';
import test from 'node:test';

import { course } from '../data/apush-u1.mjs';
import { getNextEventId, getUnitEvents } from '../model.mjs';
import {
  renderCourseTimeline,
  renderEventCard,
  renderMap,
  renderModeSwitch,
  renderUnitTimeline,
  renderWorkspace,
} from '../view.mjs';
import * as viewModule from '../view.mjs';

const learnState = {
  mode: 'learn', selectedUnitId: 'u1', selectedEventId: 'arrival',
  completedEventIds: ['indigenous-1491'], masteryByEventId: {}, weakOnly: false,
};
const reviewState = {
  ...learnState, mode: 'review', masteryByEventId: {
    'indigenous-1491': 'mastered', arrival: 'needs-review', exchange: 'not-assessed',
  },
};

test('course timeline renders every U1-U9 label, dates, and selected step', () => {
  const html = renderCourseTimeline(course, learnState);
  assert.match(html, /aria-label="Course timeline"/);
  assert.match(html, /<ol>/);
  assert.match(html, /<li>/);
  for (let index = 1; index <= 9; index += 1) {
    assert.match(html, new RegExp(`>U${index}<`));
    assert.match(html, new RegExp(`data-unit-id="u${index}"`));
  }
  assert.match(html, /data-unit-id="u1"[^>]*data-available="true"[^>]*aria-current="step"/);
  assert.match(html, /1491–1607/);
});

test('mode switch exposes pressed state and actions', () => {
  const html = renderModeSwitch(reviewState);
  assert.match(html, /data-action="set-mode"[^>]*data-mode="learn"[^>]*aria-pressed="false"/);
  assert.match(html, /data-action="set-mode"[^>]*data-mode="review"[^>]*aria-pressed="true"/);
});

test('unit timeline exposes selection, actions, learning labels, and review weak filtering', () => {
  const events = getUnitEvents(course, 'u1');
  const learnHtml = renderUnitTimeline(events, learnState);
  assert.match(learnHtml, /aria-label="Unit event timeline"/);
  assert.match(learnHtml, /<ol>/);
  assert.match(learnHtml, /<li>/);
  assert.match(learnHtml, /data-action="select-event"[^>]*data-origin="timeline"[^>]*data-event-id="arrival"[^>]*aria-current="step"/);
  assert.match(learnHtml, /✓ Completed/);
  assert.match(learnHtml, /● Current/);
  assert.match(learnHtml, /○ Not visited/);

  const weakHtml = renderUnitTimeline(events, { ...reviewState, weakOnly: true });
  assert.match(weakHtml, /European arrival/);
  assert.doesNotMatch(weakHtml, /Indigenous societies/);
  assert.match(weakHtml, /Needs review/);
  assert.match(renderUnitTimeline(events, { ...reviewState, weakOnly: true, masteryByEventId: {} }), /No events match current review filters/);
});

test('map renders bilingual valid markers and omits invalid-coordinate markers safely', () => {
  const valid = renderMap([course.events[0]], learnState);
  assert.match(valid, /style="--x:31%; --y:41%"/);
  assert.match(valid, /Indigenous societies in 1491.*1491年原住民社会/);
  const clamped = renderMap([{ ...course.events[0], primarySite: { ...course.events[0].primarySite, x: 200, y: -10 } }], learnState);
  assert.match(clamped, /style="--x:92%; --y:10%"/);
  assert.match(clamped, /data-source-x="100" data-source-y="0"/);
  const event = {
    ...course.events[0], id: 'x"><img onerror=alert(1)>', title: '<script>alert(1)</script>',
    primarySite: { x: '10; color:red', y: '<img onerror=alert(1)>', label: 'A "quoted" <site>' },
  };
  const html = renderMap([event], { ...learnState, selectedEventId: event.id });
  assert.match(html, /aria-label="Historical event map"/);
  assert.doesNotMatch(html, /<button[^>]*class="map-marker"|data-origin="map"/);
  assert.match(html, /No geographic marker is available/);
  assert.match(renderEventCard(event, learnState, null), /No geographic marker is available for this event/);
  assert.doesNotMatch(html, /color:red/);
  assert.doesNotMatch(html, /<script>|<img onerror/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(renderMap([event], { ...reviewState, weakOnly: true }), /No events match current review filters/);
});

test('map exposes resolved desktop positions, compact mobile keys, and location semantics', () => {
  const clustered = course.events.slice(0, 4).map((event) => ({
    ...event,
    primarySite: { ...event.primarySite, x: 50, y: 50 },
  }));
  const html = renderMap(clustered, { ...learnState, selectedEventId: clustered[0].id });

  assert.equal((html.match(/data-marker-layout="resolved"/g) ?? []).length, clustered.length);
  assert.equal((html.match(/data-map-key="true"/g) ?? []).length, clustered.length);
  assert.match(html, /class="map-marker-key"/);
  assert.match(html, /data-origin="map-key"/);
  assert.match(html, /aria-current="location"/);
  assert.doesNotMatch(html, /class="map-marker"[^>]*aria-pressed/);
});

test('map rejects non-number coordinates without fabricating a marker', () => {
  for (const [x, y] of [[null, 20], ['', 20], [true, 20], [20, null], [20, ''], [20, false]]) {
    const event = { ...course.events[0], primarySite: { ...course.events[0].primarySite, x, y } };
    const map = renderMap([event], learnState);
    assert.doesNotMatch(map, /<button[^>]*class="map-marker"/);
    assert.match(map, /No geographic marker is available/);
    assert.match(renderEventCard(event, learnState, null), /No geographic marker is available for this event/);
  }
});

test('learning card requires a response submission and gates the next event', () => {
  const event = course.events[1];
  const html = renderEventCard(event, learnState, 'exchange');
  assert.match(html, /What happened\?/);
  assert.match(html, /Why did it happen\?/);
  assert.match(html, /What did it lead to\?/);
  assert.match(html, /<label[^>]*for="comprehension-arrival"/);
  assert.match(html, /id="comprehension-arrival"/);
  assert.match(html, /data-action="submit-comprehension"[^>]*data-event-id="arrival"/);
  assert.doesNotMatch(html, /data-action="complete-event"/);
  assert.match(html, /data-action="next-event"[^>]*disabled/);
  const completeHtml = renderEventCard(event, { ...learnState, completedEventIds: ['arrival'] }, 'exchange');
  assert.match(completeHtml, /data-action="next-event"[^>]*data-event-id="exchange"(?![^>]*disabled)/);
  assert.match(renderEventCard(event, { ...learnState, completedEventIds: ['arrival'] }, null), /End of this unit/);
});

test('review card links reveal control to a stable hidden answer and exposes exclusive mastery state', () => {
  const html = renderEventCard(course.events[1], reviewState, 'exchange');
  assert.match(html, /Which European goals encouraged Atlantic exploration\?/);
  assert.match(html, /data-action="reveal-answer"[^>]*aria-controls="answer-arrival"[^>]*aria-expanded="false"/);
  assert.match(html, /id="answer-arrival" data-answer hidden/);
  assert.match(html, /data-action="set-mastery"[^>]*data-mastery="mastered"[^>]*aria-pressed="false"/);
  assert.match(html, /data-action="set-mastery"[^>]*data-mastery="needs-review"[^>]*aria-pressed="true"/);
  const mastered = renderEventCard(course.events[1], { ...reviewState, masteryByEventId: { arrival: 'mastered' } }, null);
  assert.match(mastered, /data-mastery="mastered"[^>]*aria-pressed="true"/);
  assert.match(mastered, /data-mastery="needs-review"[^>]*aria-pressed="false"/);
  const unassessed = renderEventCard(course.events[1], { ...reviewState, masteryByEventId: {} }, null);
  assert.match(unassessed, /data-mastery="mastered"[^>]*aria-pressed="false"/);
  assert.match(unassessed, /data-mastery="needs-review"[^>]*aria-pressed="false"/);
});

test('null event card gives a unit overview prompt', () => {
  assert.match(renderEventCard(null, learnState, null), /Unit overview/);
  assert.match(renderEventCard(null, learnState, null), /Select an event to begin\./);
});

test('course, card, and workspace escape malicious course text', () => {
  const maliciousCourse = {
    ...course,
    units: course.units.map((unit) => unit.id === 'u1'
      ? { ...unit, label: '<script>alert(1)</script>', title: '<img onerror=alert(1)>', dates: '" onfocus=alert(1)' }
      : unit),
    events: course.events.map((event) => event.id === 'arrival'
      ? {
        ...event,
        title: '<script>alert(1)</script>',
        what: '<img onerror=alert(1)>',
        primarySite: { ...event.primarySite, label: '<img onerror=alert(1)>' },
        relatedSites: [{ x: 20, y: 20, label: '<script>related</script>', labelZh: '<img onerror=alert(1)>' }],
      }
      : event),
  };
  const helpers = { getUnitEvents, getNextEventId };
  for (const html of [
    renderCourseTimeline(maliciousCourse, learnState),
    renderEventCard(maliciousCourse.events[1], learnState, null),
    renderWorkspace(maliciousCourse, learnState, helpers),
  ]) {
    assert.doesNotMatch(html, /<script>|<img onerror/);
    assert.match(html, /&lt;(script|img)/);
  }
});

test('workspace handles unavailable and missing selected units safely', () => {
  const helpers = { getUnitEvents, getNextEventId };
  const unavailable = renderWorkspace(course, { ...learnState, selectedUnitId: 'u2', selectedEventId: null }, helpers);
  assert.match(unavailable, /1607–1754/);
  assert.match(unavailable, /This unit is not included in this prototype\./);
  assert.doesNotThrow(() => renderWorkspace(course, { ...learnState, selectedUnitId: 'missing' }, helpers));
  assert.match(renderWorkspace(course, { ...learnState, selectedUnitId: 'missing' }, helpers), /Unable to find the selected unit/);
});

test('workspace places map and card before the local timeline and offers the next unit at an eligible end', () => {
  const helpers = { getUnitEvents, getNextEventId };
  const endState = { ...learnState, selectedEventId: 'borderlands', completedEventIds: ['borderlands'] };
  const html = renderWorkspace(course, endState, helpers);
  assert.ok(html.indexOf('event-map') < html.indexOf('learning-card'));
  assert.ok(html.indexOf('learning-card') < html.indexOf('unit-timeline'));
  assert.match(html, /data-action="select-unit"[^>]*data-unit-id="u2"/);
});

test('empty learn maps and timelines are explicit', () => {
  assert.match(renderUnitTimeline([], learnState), /No events are available for this unit/);
  assert.match(renderMap([], learnState), /No events are available for this unit/);
});

test('review period and theme controls derive accessible labels from course data', () => {
  const renderPeriods = viewModule.renderPeriodBands ?? (() => '');
  const renderThemes = viewModule.renderThemeFilters ?? (() => '');
  const periodHtml = renderPeriods(course, reviewState);
  const themeHtml = renderThemes(getUnitEvents(course, 'u1'), {
    ...reviewState,
    activeThemeIds: ['GEO'],
  });

  assert.match(periodHtml, /data-action="select-period-band"/);
  assert.match(periodHtml, /Period 1/);
  assert.match(themeHtml, /Geography and the Environment/);
  assert.match(themeHtml, /data-action="toggle-theme"[^>]*data-theme-id="GEO"[^>]*aria-pressed="true"/);
  assert.match(themeHtml, /data-action="clear-themes"/);
});

test('review themes compose with weak-only across map and local timeline', () => {
  const events = getUnitEvents(course, 'u1');
  const state = {
    ...reviewState,
    weakOnly: true,
    activeThemeIds: ['WOR'],
    masteryByEventId: { arrival: 'needs-review', exchange: 'needs-review' },
  };
  const timeline = renderUnitTimeline(events, state);
  const map = renderMap(events, state);

  assert.match(timeline, /European arrival/);
  assert.doesNotMatch(timeline, /Columbian Exchange/);
  assert.match(map, /European arrival/);
  assert.doesNotMatch(map, /Columbian Exchange/);
  assert.match(renderUnitTimeline(events, { ...state, activeThemeIds: ['SOC'] }), /No events match current review filters/);
});

test('selected event renders related-location detail and secondary map locations without duplicate event actions', () => {
  const event = course.events[0];
  const card = renderEventCard(event, learnState, 'arrival');
  const map = renderMap(getUnitEvents(course, 'u1'), { ...learnState, selectedEventId: event.id });

  assert.match(card, /4 related locations/);
  assert.match(card, /data-action="inspect-related-locations"/);
  assert.match(card, /data-related-locations/);
  assert.match(map, /class="secondary-marker"/);
  assert.equal((map.match(new RegExp(`data-event-id="${event.id}"`, 'g')) ?? []).length, 2);
});

test('workspace notice is nonfatal, escaped, and remains outside the event card', () => {
  const renderNotice = viewModule.renderWorkspaceNotice ?? (() => '');
  const html = renderNotice('Missing <event>');

  assert.match(html, /class="workspace-notice"/);
  assert.match(html, /Missing &lt;event&gt;/);
  assert.doesNotMatch(html, /role="alert"|role="status"/);
});
