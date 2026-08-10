export function getUnitEvents(course, unitId) {
  return course.events
    .filter((event) => event.unitId === unitId)
    .sort((a, b) => a.order - b.order);
}

export function getNextEventId(course, unitId, eventId) {
  const events = getUnitEvents(course, unitId);
  const index = events.findIndex((event) => event.id === eventId);
  return index >= 0 && index < events.length - 1 ? events[index + 1].id : null;
}

export function validateCourse(course) {
  const errors = [];
  const units = course?.units;
  const events = course?.events;
  const periodBands = course?.periodBands;

  if (!Array.isArray(units)) errors.push('Course units must be an array');
  if (!Array.isArray(events)) errors.push('Course events must be an array');
  if (!Array.isArray(units) || !Array.isArray(events)) return errors;

  const expectedUnitIds = ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9'];
  const unitIds = new Set(units.map((unit) => unit?.id));
  if (units.length !== 9) errors.push('Course must contain nine units');
  if (
    unitIds.size !== expectedUnitIds.length
    || expectedUnitIds.some((id) => !unitIds.has(id))
  ) {
    errors.push('Course units must be exactly u1 through u9');
  }

  if (!Array.isArray(periodBands)) {
    errors.push('Course period bands must be an array');
  } else {
    for (const band of periodBands) {
      if (!band?.id || !band?.label || !Array.isArray(band.unitIds) || band.unitIds.length === 0) {
        errors.push('Invalid period band');
      } else if (band.unitIds.some((unitId) => !unitIds.has(unitId))) {
        errors.push(`Unknown unit in period band ${band.id}`);
      }
    }
  }

  const eventIds = new Set();
  const ordersByUnitId = new Map();
  for (const event of events) {
    if (typeof event?.id !== 'string' || !event.id.trim()) {
      errors.push('Missing event id');
      continue;
    }

    if (eventIds.has(event.id)) errors.push(`Duplicate event id ${event.id}`);
    eventIds.add(event.id);

    if (!unitIds.has(event.unitId)) errors.push(`Unknown unit for ${event.id}`);

    if (!Number.isFinite(event.order)) {
      errors.push(`Invalid order for ${event.id}`);
    } else {
      const unitOrders = ordersByUnitId.get(event.unitId) ?? new Set();
      if (unitOrders.has(event.order)) {
        errors.push(`Duplicate order ${event.order} for ${event.unitId}`);
      }
      unitOrders.add(event.order);
      ordersByUnitId.set(event.unitId, unitOrders);
    }

    const { primarySite } = event;
    if (primarySite != null) {
      if (!primarySite.label) errors.push(`Missing primary site for ${event.id}`);
      if (!primarySite.labelZh) errors.push(`Missing Chinese primary site label for ${event.id}`);
      const hasX = primarySite.x != null;
      const hasY = primarySite.y != null;
      if (hasX !== hasY || (hasX && (!Number.isFinite(primarySite.x) || !Number.isFinite(primarySite.y)))) {
        errors.push(`Invalid primary site coordinates for ${event.id}`);
      }
    }

    for (const key of ['what', 'why', 'consequence', 'recall']) {
      if (!event[key]) errors.push(`Missing ${key} for ${event.id}`);
    }

    if (!event.titleZh) errors.push(`Missing Chinese title for ${event.id}`);
    if (!Array.isArray(event.relatedSites)) {
      errors.push(`Related sites must be an array for ${event.id}`);
    } else {
      for (const site of event.relatedSites) {
        const hasX = site?.x != null;
        const hasY = site?.y != null;
        if (!site?.label || !site?.labelZh || hasX !== hasY
          || (hasX && (!Number.isFinite(site.x) || !Number.isFinite(site.y)))) {
          errors.push(`Invalid related site for ${event.id}`);
        }
      }
    }
  }

  return errors;
}

export function filterWeakEvents(events, masteryByEventId) {
  return events.filter((event) => masteryByEventId[event.id] === 'needs-review');
}
