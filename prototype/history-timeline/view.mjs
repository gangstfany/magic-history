import {
  filterReviewEvents,
  resolveMarkerLayout,
  resolveRelatedMarkerLayout,
} from './integration.mjs';

/** Escape every value that crosses from course/state data into HTML. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isReview(state) {
  return state?.mode === 'review';
}

function visibleEvents(events, state) {
  return filterReviewEvents(events, state);
}

function learningStatus(event, state) {
  if (state?.selectedEventId === event?.id) return '● Current';
  if (state?.completedEventIds?.includes(event?.id)) return '✓ Completed';
  return '○ Not visited';
}

function reviewStatus(event, state) {
  const mastery = state?.masteryByEventId?.[event?.id];
  if (mastery === 'mastered') return 'Mastered';
  if (mastery === 'needs-review') return 'Needs review';
  return 'Not assessed';
}

function statusFor(event, state) {
  return isReview(state) ? reviewStatus(event, state) : learningStatus(event, state);
}

function hasMapCoordinates(site) {
  return Number.isFinite(site?.x) && Number.isFinite(site?.y);
}

function domId(eventId) {
  const value = String(eventId ?? 'event');
  if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(value)) return value;
  return Array.from(value)
    .map((character) => character.codePointAt(0).toString(36))
    .join('-');
}

function emptyState(events, state) {
  if (isReview(state) && (state?.weakOnly || state?.activeThemeIds?.length > 0)) {
    return 'No events match current review filters.';
  }
  return 'No events are available for this unit.';
}

const THEME_LABELS = {
  ARC: 'American and Regional Culture',
  GEO: 'Geography and the Environment',
  MIG: 'Migration and Settlement',
  PCE: 'Politics and Power',
  SOC: 'Social Structures',
  WOR: 'America in the World',
  WXT: 'Work, Exchange, and Technology',
};

export function renderPeriodBands(course, state) {
  if (!isReview(state)) return '';
  const bands = Array.isArray(course?.periodBands) ? course.periodBands : [];
  return `<nav class="period-bands" aria-label="Review by historical period"><ol>${bands.map((band) => {
    const selected = band.unitIds?.includes(state?.selectedUnitId);
    const unitId = selected ? state.selectedUnitId : band.unitIds?.[0];
    return `<li><button type="button" data-action="select-period-band" data-period-id="${escapeHtml(band.id)}" data-unit-id="${escapeHtml(unitId)}"${selected ? ' aria-current="step"' : ''}><span>${escapeHtml(band.label)}</span><span>${escapeHtml(band.dates)}</span></button></li>`;
  }).join('')}</ol></nav>`;
}

export function renderThemeFilters(events, state) {
  if (!isReview(state)) return '';
  const themeIds = [...new Set((Array.isArray(events) ? events : [])
    .flatMap((event) => Array.isArray(event.themes) ? event.themes : []))].sort();
  const active = Array.isArray(state?.activeThemeIds) ? state.activeThemeIds : [];
  return `<section class="theme-filters" aria-label="Filter review by AP theme"><h3>AP themes</h3><div>${themeIds.map((themeId) => `<button type="button" data-action="toggle-theme" data-theme-id="${escapeHtml(themeId)}" aria-pressed="${active.includes(themeId)}"><span>${escapeHtml(themeId)}</span> ${escapeHtml(THEME_LABELS[themeId] ?? themeId)}</button>`).join('')}</div><button type="button" data-action="clear-themes"${active.length ? '' : ' disabled'}>Clear theme filters</button></section>`;
}

export function renderWorkspaceNotice(message) {
  return message ? `<p class="workspace-notice">${escapeHtml(message)}</p>` : '';
}

export function renderModeSwitch(state) {
  const mode = isReview(state) ? 'review' : 'learn';
  return `<section class="mode-switch" aria-label="Study mode">
    <button type="button" data-action="set-mode" data-mode="learn" aria-pressed="${mode === 'learn'}">Learn</button>
    <button type="button" data-action="set-mode" data-mode="review" aria-pressed="${mode === 'review'}">Review</button>
  </section>`;
}

export function renderCourseTimeline(course, state) {
  const units = Array.isArray(course?.units) ? course.units : [];
  return `<nav class="course-timeline" aria-label="Course timeline"><ol>${units.map((unit) => {
    const selected = unit?.id === state?.selectedUnitId;
    return `<li><button type="button" data-action="select-unit" data-unit-id="${escapeHtml(unit?.id)}" data-available="${Boolean(unit?.available)}"${selected ? ' aria-current="step"' : ''}>
      <span>${escapeHtml(unit?.label)}</span><span>${escapeHtml(unit?.dates)}</span>
    </button></li>`;
  }).join('')}</ol></nav>`;
}

export function renderUnitTimeline(events, state) {
  const shown = visibleEvents(events, state);
  return `<nav class="unit-timeline" aria-label="Unit event timeline">${shown.length
    ? `<ol>${shown.map((event) => `<li><button type="button" data-action="select-event" data-origin="timeline" data-event-id="${escapeHtml(event?.id)}"${state?.selectedEventId === event?.id ? ' aria-current="step"' : ''}>
        <span>${escapeHtml(event?.date)}</span><span>${escapeHtml(event?.shortTitle ?? event?.title)}</span><span class="event-status">${statusFor(event, state)}</span>
      </button></li>`).join('')}</ol>`
    : `<p class="empty-state">${emptyState(events, state)}</p>`}</nav>`;
}

export function renderMap(events, state) {
  const shown = visibleEvents(events, state);
  const markers = shown.filter((event) => hasMapCoordinates(event?.primarySite));
  const positioned = resolveMarkerLayout(markers);
  const nonGeographic = shown.filter((event) => !hasMapCoordinates(event?.primarySite));
  const selected = shown.find((event) => event.id === state?.selectedEventId);
  const selectedPrimary = positioned.find(({ event }) => event.id === selected?.id);
  const relatedLayout = resolveRelatedMarkerLayout(
    positioned,
    selectedPrimary,
    (selected?.relatedSites ?? []).filter((site) => hasMapCoordinates(site)),
  ).filter((marker) => marker.kind === 'related');
  return `<section class="event-map" aria-label="Historical event map">${shown.length
    ? `<div class="map-canvas" data-map-canvas="true"><div class="map-marker-layer">${positioned.map(({ event, sourceX, sourceY, x, y }, index) => {
      const site = event?.primarySite ?? {};
      const label = `${event?.title ?? 'Event'} / ${event?.titleZh ?? ''}, ${event?.date ?? ''}, ${site.label ?? 'location'} / ${site.labelZh ?? ''}`;
      const current = state?.selectedEventId === event?.id ? ' aria-current="location"' : '';
      return `<button type="button" class="map-marker" style="--x:${x}%; --y:${y}%" data-marker-layout="resolved" data-marker-index="${index + 1}" data-source-x="${sourceX}" data-source-y="${sourceY}" data-action="select-event" data-origin="map" data-event-id="${escapeHtml(event?.id)}"${current} aria-label="${escapeHtml(label)}"><span aria-hidden="true">•</span><span class="marker-label">${escapeHtml(site.label)}</span><span class="event-status">${statusFor(event, state)}</span></button>`;
    }).join('')}${relatedLayout.map((marker) => `<span class="secondary-marker" role="img" style="--x:${marker.x}%; --y:${marker.y}%" data-source-x="${marker.sourceX}" data-source-y="${marker.sourceY}" data-related-layout="resolved" aria-label="Related location: ${escapeHtml(marker.site.label)} / ${escapeHtml(marker.site.labelZh)}"><span aria-hidden="true"></span></span>`).join('')}</div></div><div class="map-marker-key" aria-label="Map location key"><p><strong>Map location key</strong><span>Select an event to locate it in the timeline and workspace.</span></p><ol>${positioned.map(({ event }, index) => {
      const site = event.primarySite;
      const current = state?.selectedEventId === event.id ? ' aria-current="location"' : '';
      return `<li><button type="button" data-map-key="true" data-action="select-event" data-origin="map-key" data-event-id="${escapeHtml(event.id)}"${current}><span class="map-key-index">${index + 1}</span><span><strong>${escapeHtml(site.label)}</strong><span>${escapeHtml(event.date)} · ${escapeHtml(event.shortTitle ?? event.title)}</span></span><span class="event-status">${statusFor(event, state)}</span></button></li>`;
    }).join('')}</ol></div>${nonGeographic.map((event) => `<p class="non-geographic">${escapeHtml(event?.title)}: No geographic marker is available.</p>`).join('')}`
    : `<p class="empty-state">${emptyState(events, state)}</p>`}</section>`;
}

export function renderEventCard(event, state, nextEventId, nextUnit = null) {
  if (!event) return '<section class="event-card unit-overview"><h2>Unit overview</h2><p>Select an event to begin.</p></section>';
  const eventId = escapeHtml(event.id);
  const safeId = domId(event.id);
  const hasLocation = hasMapCoordinates(event.primarySite);
  const relatedSites = Array.isArray(event.relatedSites) ? event.relatedSites : [];
  const locationLabel = event.primarySite?.label ?? 'Transregional';
  const header = `<p class="event-meta">${escapeHtml(event.date)} · ${escapeHtml(locationLabel)}</p><h2>${escapeHtml(event.title)}</h2>${hasLocation ? '' : '<p class="non-geographic">No geographic marker is available for this event.</p>'}`;
  const related = relatedSites.length ? `<section class="related-locations"><p>${relatedSites.length} related locations.</p><button type="button" data-action="inspect-related-locations" data-event-id="${eventId}" aria-controls="related-${safeId}" aria-expanded="false">Inspect related locations</button><ul id="related-${safeId}" data-related-locations data-event-id="${eventId}" hidden>${relatedSites.map((site) => `<li><span>${escapeHtml(site.label)}</span> <span lang="zh-CN">${escapeHtml(site.labelZh)}</span></li>`).join('')}</ul></section>` : '';
  if (isReview(state)) {
    return `<article class="event-card review-card">${header}
      <h3>Active recall</h3><p>${escapeHtml(event.recall)}</p>
      <button type="button" data-action="reveal-answer" data-event-id="${eventId}" aria-controls="answer-${safeId}" aria-expanded="false">Reveal answer</button>
      <div id="answer-${safeId}" data-answer hidden data-event-id="${eventId}">
        <h3>What happened?</h3><p>${escapeHtml(event.what)}</p>
        <h3>Why did it happen?</h3><p>${escapeHtml(event.why)}</p>
        <h3>What did it lead to?</h3><p>${escapeHtml(event.consequence)}</p>
      </div>
      <fieldset><legend>How well did you recall this?</legend>
        <button type="button" data-action="set-mastery" data-event-id="${eventId}" data-mastery="mastered" aria-pressed="${state?.masteryByEventId?.[event.id] === 'mastered'}">Mastered</button>
        <button type="button" data-action="set-mastery" data-event-id="${eventId}" data-mastery="needs-review" aria-pressed="${state?.masteryByEventId?.[event.id] === 'needs-review'}">Needs review</button>
      </fieldset>
      ${related}
    </article>`;
  }
  const completed = state?.completedEventIds?.includes(event.id);
  const nextControl = nextEventId
    ? `<button type="button" data-action="next-event" data-event-id="${escapeHtml(nextEventId)}"${completed ? '' : ' disabled'}>Next stop</button>`
    : (completed && nextUnit
      ? `<button type="button" data-action="select-unit" data-unit-id="${escapeHtml(nextUnit.id)}" data-available="${Boolean(nextUnit.available)}">Continue to ${escapeHtml(nextUnit.label)}</button>`
      : '<p>End of this unit.</p>');
  return `<article class="event-card learning-card">${header}
    <h3>What happened?</h3><p>${escapeHtml(event.what)}</p>
    <h3>Why did it happen?</h3><p>${escapeHtml(event.why)}</p>
    <h3>What did it lead to?</h3><p>${escapeHtml(event.consequence)}</p>
    <label for="comprehension-${safeId}">Write a brief explanation to check your understanding.</label>
    <textarea id="comprehension-${safeId}" name="comprehension-${safeId}"></textarea>
    <button type="button" data-action="submit-comprehension" data-event-id="${eventId}">Submit response</button>
    ${nextControl}
    ${related}
  </article>`;
}

export function renderWorkspace(course, state, helpers = {}) {
  const unit = Array.isArray(course?.units)
    ? course.units.find((candidate) => candidate?.id === state?.selectedUnitId)
    : null;
  if (!unit) return '<section class="workspace-error" role="alert">Unable to find the selected unit.</section>';
  const unitHeading = `<header><h1>${escapeHtml(unit.label)}: ${escapeHtml(unit.title)}</h1><p>${escapeHtml(unit.dates)}</p></header>`;
  if (!unit.available) return `<section class="workspace unavailable-unit">${unitHeading}<p>This unit is not included in this prototype.</p></section>`;
  const getEvents = typeof helpers.getUnitEvents === 'function' ? helpers.getUnitEvents : () => [];
  const getNext = typeof helpers.getNextEventId === 'function' ? helpers.getNextEventId : () => null;
  const events = getEvents(course, unit.id) ?? [];
  const event = events.find((candidate) => candidate?.id === state?.selectedEventId) ?? null;
  const nextEventId = event ? getNext(course, unit.id, event.id) : null;
  const unitIndex = course.units.indexOf(unit);
  const nextUnit = unitIndex >= 0 ? course.units[unitIndex + 1] ?? null : null;
  return `<section class="available-unit">${unitHeading}<div class="workspace">${renderMap(events, state)}${renderEventCard(event, state, nextEventId, nextUnit)}</div>${renderUnitTimeline(events, state)}</section>`;
}
