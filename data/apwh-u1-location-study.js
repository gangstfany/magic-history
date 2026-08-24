(function publishUnit1LocationStudy(root) {
  'use strict';

  const TRIAL_LOCATIONS = Object.freeze({
    '1': 'Hangzhou',
    '2': 'Malacca',
    '3': 'Baghdad',
    '9': 'Samarkand',
    '73': 'Timbuktu',
  });
  const STUDY_EVENTS = Object.freeze([]);
  const byLocation = new Map(Object.keys(TRIAL_LOCATIONS).map(number => [number, []]));
  const api = Object.freeze({
    locationNumbers: Object.freeze(Object.keys(TRIAL_LOCATIONS)),
    locationName(number) { return TRIAL_LOCATIONS[String(number)] || null; },
    getByLocation(number) { return [...(byLocation.get(String(number)) || [])]; },
    records: STUDY_EVENTS,
  });

  Object.defineProperty(root, 'APWH_U1_LOCATION_STUDY', {
    configurable: false,
    enumerable: true,
    writable: false,
    value: api,
  });
})(globalThis);
