export const PROGRESS_VERSION = 1;

function clamp(value, minimum = 0, maximum = 100) {
  return Math.min(maximum, Math.max(minimum, value));
}

function overlaps(candidate, position, minX, minY) {
  return Math.abs(candidate.x - position.x) < minX
    && Math.abs(candidate.y - position.y) < minY;
}

function candidatePositions(sourceX, sourceY, minX, minY, bounds) {
  const candidates = [{ x: sourceX, y: sourceY }];
  for (let ring = 1; ring <= 10; ring += 1) {
    for (let yStep = -ring; yStep <= ring; yStep += 1) {
      for (let xStep = -ring; xStep <= ring; xStep += 1) {
        if (Math.abs(xStep) !== ring && Math.abs(yStep) !== ring) continue;
        candidates.push({
          x: clamp(sourceX + xStep * minX, bounds.minX, bounds.maxX),
          y: clamp(sourceY + yStep * minY, bounds.minY, bounds.maxY),
        });
      }
    }
  }
  return candidates;
}

/** Resolve overlapping percentage coordinates without changing source event data. */
export function resolveMarkerLayout(events, options = {}) {
  const minX = Number.isFinite(options.minX) && options.minX > 0 ? options.minX : 14;
  const minY = Number.isFinite(options.minY) && options.minY > 0 ? options.minY : 20;
  const bounds = { minX: 8, maxX: 92, minY: 10, maxY: 90 };
  const positioned = [];

  for (const event of Array.isArray(events) ? events : []) {
    const sourceX = clamp(event.primarySite.x);
    const sourceY = clamp(event.primarySite.y);
    const layoutX = clamp(sourceX, bounds.minX, bounds.maxX);
    const layoutY = clamp(sourceY, bounds.minY, bounds.maxY);
    let resolved = candidatePositions(layoutX, layoutY, minX, minY, bounds)
      .find((candidate) => positioned.every((position) => !overlaps(candidate, position, minX, minY)));

    if (!resolved) {
      for (let y = bounds.minY; y <= bounds.maxY && !resolved; y += minY) {
        for (let x = bounds.minX; x <= bounds.maxX; x += minX) {
          const candidate = { x, y };
          if (positioned.every((position) => !overlaps(candidate, position, minX, minY))) {
            resolved = candidate;
            break;
          }
        }
      }
    }

    positioned.push({
      event,
      sourceX,
      sourceY,
      x: resolved?.x ?? layoutX,
      y: resolved?.y ?? layoutY,
    });
  }

  return positioned;
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** Upgrade stored progress and reconcile all references against the current course. */
export function reconcileProgress(progress, course, seed) {
  const source = isPlainObject(progress) ? progress : {};
  const units = Array.isArray(course?.units) ? course.units : [];
  const events = Array.isArray(course?.events) ? course.events : [];
  const unitById = new Map(units.map((unit) => [unit.id, unit]));
  const eventById = new Map(events.map((event) => [event.id, event]));
  const fallbackUnit = unitById.get(seed?.selectedUnitId) ?? units[0] ?? null;
  const selectedUnit = unitById.get(source.selectedUnitId) ?? fallbackUnit;
  const unitEvents = selectedUnit
    ? events.filter((event) => event.unitId === selectedUnit.id).sort((left, right) => left.order - right.order)
    : [];
  const requestedEvent = eventById.get(source.selectedEventId);
  const selectedEventId = !selectedUnit?.available
    ? null
    : requestedEvent?.unitId === selectedUnit.id
      ? requestedEvent.id
      : unitEvents[0]?.id ?? null;
  const completedEventIds = Array.isArray(source.completedEventIds)
    ? [...new Set(source.completedEventIds.filter((eventId) => eventById.has(eventId)))]
    : [];
  const masteryByEventId = {};
  if (isPlainObject(source.masteryByEventId)) {
    for (const [eventId, mastery] of Object.entries(source.masteryByEventId)) {
      if (eventById.has(eventId) && ['mastered', 'needs-review'].includes(mastery)) {
        masteryByEventId[eventId] = mastery;
      }
    }
  }
  const knownThemes = new Set(events.flatMap((event) => Array.isArray(event.themes) ? event.themes : []));
  const activeThemeIds = Array.isArray(source.activeThemeIds)
    ? [...new Set(source.activeThemeIds.filter((themeId) => knownThemes.has(themeId)))]
    : [];

  const reconciled = {
    version: PROGRESS_VERSION,
    selectedUnitId: selectedUnit?.id ?? seed?.selectedUnitId ?? null,
    selectedEventId,
    completedEventIds,
    masteryByEventId,
    activeThemeIds,
  };
  if (source.mode === 'learn' || source.mode === 'review') reconciled.mode = source.mode;
  if (typeof source.weakOnly === 'boolean') reconciled.weakOnly = source.weakOnly;
  return reconciled;
}

export function choosePostSubmitAction(actions) {
  const available = new Set(Array.isArray(actions) ? actions : []);
  if (available.has('next-event')) return 'next-event';
  if (available.has('select-unit')) return 'select-unit';
  return null;
}

export function markerFocusScrollOptions(reducedMotion) {
  return {
    block: 'nearest',
    inline: 'nearest',
    behavior: reducedMotion ? 'auto' : 'smooth',
  };
}

export function evaluateComprehensionResponse(value) {
  const response = String(value ?? '').trim();
  return { response, complete: response.length > 0 };
}

export function describeInitialSelection(state, course) {
  const unit = course?.units?.find((candidate) => candidate.id === state?.selectedUnitId);
  if (!unit) return 'Prototype ready.';
  if (!unit.available) {
    return `Prototype ready. ${unit.label} is selected; this unit is not included in the prototype.`;
  }
  const event = course?.events?.find((candidate) => candidate.id === state?.selectedEventId);
  return event
    ? `Prototype ready. ${unit.label} and ${event.title} are selected.`
    : `Prototype ready. ${unit.label} is selected.`;
}

export function resolveLearningAnchor(state, course) {
  const unit = course?.units?.find((candidate) => candidate.id === state?.selectedUnitId);
  if (!unit?.available) return null;
  const events = (course?.events ?? [])
    .filter((event) => event.unitId === unit.id)
    .sort((left, right) => left.order - right.order);
  return events.some((event) => event.id === state?.selectedEventId)
    ? state.selectedEventId
    : events[0]?.id ?? null;
}

export function resolveEventSelection(events, requestedEventId, previousEventId) {
  const event = (Array.isArray(events) ? events : [])
    .find((candidate) => candidate.id === requestedEventId) ?? null;
  return event
    ? { event, eventId: event.id, message: '' }
    : {
      event: null,
      eventId: previousEventId,
      message: 'That event is no longer available. Your previous selection was kept.',
    };
}

export function resolveWeakFilterSelection(selectedEventId, weakEvents) {
  const events = Array.isArray(weakEvents) ? weakEvents : [];
  if (events.length === 0 || events.some((event) => event.id === selectedEventId)) {
    return selectedEventId;
  }
  return events[0].id;
}

export function filterReviewEvents(events, state) {
  const safeEvents = Array.isArray(events) ? events : [];
  if (state?.mode !== 'review') return safeEvents;
  const activeThemes = Array.isArray(state.activeThemeIds) ? state.activeThemeIds : [];
  return safeEvents.filter((event) => {
    const weakMatch = !state.weakOnly
      || state.masteryByEventId?.[event.id] === 'needs-review';
    const themeMatch = activeThemes.length === 0
      || activeThemes.some((themeId) => event.themes?.includes(themeId));
    return weakMatch && themeMatch;
  });
}

export function resolveReviewFilterSelection(state, events) {
  const visible = filterReviewEvents(events, state);
  if (visible.length === 0 || visible.some((event) => event.id === state?.selectedEventId)) {
    return state?.selectedEventId ?? null;
  }
  return visible[0].id;
}

export function resolveRelatedMarkerLayout(primaryLayout, primary, relatedSites, geometry = {}) {
  if (!primary) return [];
  const width = Number.isFinite(geometry.width) && geometry.width > 0 ? geometry.width : 334;
  const height = Number.isFinite(geometry.height) && geometry.height > 0 ? geometry.height : 250;
  const markers = [{
    id: 'primary', kind: 'primary', size: 44,
    x: primary.x, y: primary.y,
    sourceX: primary.sourceX, sourceY: primary.sourceY,
  }];
  const obstacles = (Array.isArray(primaryLayout) ? primaryLayout : [])
    .map((marker) => ({
      id: marker.event?.id ?? 'primary',
      kind: 'primary',
      size: 44,
      x: marker.x,
      y: marker.y,
    }));

  for (const [index, site] of (Array.isArray(relatedSites) ? relatedSites : []).entries()) {
    const sourceX = clamp(site.x);
    const sourceY = clamp(site.y);
    const candidates = [];
    for (let radius = 0; radius <= 160; radius += 10) {
      const points = radius === 0 ? 1 : 16;
      for (let point = 0; point < points; point += 1) {
        const angle = (Math.PI * 2 * point) / points;
        const xPixels = clamp(sourceX / 100 * width + Math.cos(angle) * radius, 13, width - 13);
        const yPixels = clamp(sourceY / 100 * height + Math.sin(angle) * radius, 13, height - 13);
        candidates.push({ x: xPixels / width * 100, y: yPixels / height * 100 });
      }
    }
    const resolved = candidates.find((candidate) => [...obstacles, ...markers.filter((marker) => marker.kind === 'related')].every((marker) => {
      const dx = (candidate.x - marker.x) / 100 * width;
      const dy = (candidate.y - marker.y) / 100 * height;
      return Math.hypot(dx, dy) >= (18 + marker.size) / 2 + 4;
    })) ?? { x: sourceX, y: sourceY };
    markers.push({
      id: `related-${index + 1}`, kind: 'related', size: 18, site,
      sourceX, sourceY, x: resolved.x, y: resolved.y,
    });
  }
  return markers;
}

export function transitionWorkspaceNotice(currentNotice, successfulNavigation) {
  return successfulNavigation ? '' : String(currentNotice ?? '');
}

export function chooseMapFocusTarget(candidates) {
  const targets = Array.isArray(candidates) ? candidates : [];
  return targets.find((candidate) => candidate.kind === 'marker')
    ?? targets.find((candidate) => candidate.kind === 'key')
    ?? null;
}
