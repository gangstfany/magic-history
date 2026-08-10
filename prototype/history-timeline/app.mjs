import { course } from './data/apush-u1.mjs';
import {
  chooseMapFocusTarget,
  choosePostSubmitAction,
  describeInitialSelection,
  evaluateComprehensionResponse,
  markerFocusScrollOptions,
  PROGRESS_VERSION,
  reconcileProgress,
  resolveEventSelection,
  resolveLearningAnchor,
  resolveReviewFilterSelection,
  transitionWorkspaceNotice,
} from './integration.mjs';
import { getNextEventId, getUnitEvents, validateCourse } from './model.mjs';
import { createStore, initialState, reducer } from './store.mjs';
import {
  renderCourseTimeline,
  renderModeSwitch,
  renderPeriodBands,
  renderThemeFilters,
  renderWorkspaceNotice,
  renderWorkspace,
} from './view.mjs';

const app = document.querySelector('#app');
const status = document.querySelector('#status');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const compactMap = window.matchMedia('(max-width: 760px)');
const responseDrafts = new Map();
const responseFeedback = new Map();
const revealedEventIds = new Set();
const inspectedRelatedEventIds = new Set();
let liveMessage = '';
let workspaceNotice = '';

function clearWorkspaceNotice() {
  workspaceNotice = transitionWorkspaceNotice(workspaceNotice, true);
}

function renderFatal(errors) {
  const panel = document.createElement('section');
  panel.className = 'fatal-error';
  panel.setAttribute('role', 'alert');

  const heading = document.createElement('h2');
  heading.textContent = 'The course data could not be loaded.';
  const guidance = document.createElement('p');
  guidance.textContent = 'Please correct the following data problems, then reload this page:';
  const list = document.createElement('ul');
  errors.forEach((error) => {
    const item = document.createElement('li');
    item.textContent = error;
    list.append(item);
  });

  panel.append(heading, guidance, list);
  app.replaceChildren(panel);
  status.textContent = `Course unavailable: ${errors.length} validation ${errors.length === 1 ? 'error' : 'errors'}.`;
}

const courseErrors = validateCourse(course);
if (courseErrors.length > 0) {
  renderFatal(courseErrors);
} else {
  startPrototype();
}

function getSafeStorage() {
  try {
    return window.localStorage;
  } catch {
    return {
      getItem() { throw new Error('Local storage unavailable.'); },
      setItem() { throw new Error('Local storage unavailable.'); },
    };
  }
}

function startPrototype() {
  let saveHealthMessage = '';
  const store = createStore(
    reducer,
    initialState,
    getSafeStorage(),
    (progress) => reconcileProgress(progress, course, initialState),
    (message) => { saveHealthMessage = message; },
    { courseId: course.id, schemaVersion: PROGRESS_VERSION },
  );
  saveHealthMessage = store.getSaveStatus();
  liveMessage = describeInitialSelection(store.getState(), course);

  function announce(message) {
    liveMessage = message;
  }

  function currentUnit(state = store.getState()) {
    return course.units.find((unit) => unit.id === state.selectedUnitId) ?? null;
  }

  function eventById(eventId, state = store.getState()) {
    const unit = currentUnit(state);
    if (!unit?.available) return null;
    return getUnitEvents(course, unit.id).find((event) => event.id === eventId) ?? null;
  }

  function actionElements(action) {
    return [...app.querySelectorAll('[data-action]')]
      .filter((element) => element.dataset.action === action);
  }

  function actionElement(action, key, value) {
    return actionElements(action).find((element) => element.dataset[key] === value) ?? null;
  }

  function renderReviewControl(state) {
    if (state.mode !== 'review') return '';
    return `<section class="review-tools" aria-label="Review filters">
      <p><strong>Review filter</strong><span>Focus the map and timeline on events you marked for another pass.</span></p>
      <button type="button" data-action="toggle-weak-only" aria-pressed="${state.weakOnly}">
        Needs-review only: ${state.weakOnly ? 'On' : 'Off'}
      </button>
    </section>`;
  }

  function applyEphemeralUi(state) {
    const selectedEventId = state.selectedEventId;
    if (selectedEventId) {
      const card = app.querySelector('.event-card');
      const textarea = card?.querySelector('textarea');
      const submitButton = card?.querySelector('[data-action="submit-comprehension"]');

      if (textarea && submitButton?.dataset.eventId === selectedEventId) {
        textarea.value = responseDrafts.get(selectedEventId) ?? '';
        const feedback = responseFeedback.get(selectedEventId);
        if (feedback) {
          const message = document.createElement('p');
          message.className = `form-feedback ${feedback.kind}`;
          message.id = `feedback-${textarea.id}`;
          message.textContent = feedback.message;
          textarea.setAttribute('aria-describedby', message.id);
          textarea.setAttribute('aria-invalid', String(feedback.kind === 'error'));
          textarea.insertAdjacentElement('afterend', message);
        }
      }
    }

    actionElements('reveal-answer').forEach((button) => {
      const eventId = button.dataset.eventId;
      const expanded = revealedEventIds.has(eventId);
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? 'Hide answer' : 'Reveal answer';
      const controlledId = button.getAttribute('aria-controls');
      const answer = controlledId ? document.getElementById(controlledId) : null;
      if (answer && app.contains(answer) && answer.dataset.eventId === eventId) {
        answer.hidden = !expanded;
      }
    });

    actionElements('inspect-related-locations').forEach((button) => {
      const eventId = button.dataset.eventId;
      const expanded = inspectedRelatedEventIds.has(eventId);
      button.setAttribute('aria-expanded', String(expanded));
      button.textContent = expanded ? 'Hide related locations' : 'Inspect related locations';
      const controlledId = button.getAttribute('aria-controls');
      const list = controlledId ? document.getElementById(controlledId) : null;
      if (list && app.contains(list) && list.dataset.eventId === eventId) list.hidden = !expanded;
    });
  }

  function render() {
    const state = store.getState();
    const unit = currentUnit(state);
    const unitEvents = unit?.available ? getUnitEvents(course, unit.id) : [];
    app.innerHTML = `<div class="app-shell">
      <section class="study-bar" aria-label="Study controls">
        <div>
          <p class="section-kicker">Study path</p>
          <h2>Choose how you want to work</h2>
        </div>
        ${renderModeSwitch(state)}
      </section>
      <p id="save-status" class="save-status" role="status" aria-live="polite" aria-atomic="true"${saveHealthMessage ? '' : ' hidden'}></p>
      <section class="course-strip" aria-labelledby="course-strip-title">
        <div class="section-heading">
          <div>
            <p class="section-kicker">1491 → Present</p>
            <h2 id="course-strip-title">APUSH course timeline</h2>
          </div>
          <p>U1 is interactive in this prototype. Select another unit to see its availability.</p>
        </div>
        ${renderCourseTimeline(course, state)}
      </section>
      ${renderReviewControl(state)}
      ${state.mode === 'review' ? `<section class="review-hierarchy" aria-labelledby="review-hierarchy-title"><h2 id="review-hierarchy-title">Review course structure</h2>${renderPeriodBands(course, state)}${renderThemeFilters(unitEvents, state)}</section>` : ''}
      ${renderWorkspaceNotice(workspaceNotice)}
      ${renderWorkspace(course, state, { getUnitEvents, getNextEventId })}
    </div>`;

    applyEphemeralUi(state);
    const saveStatus = app.querySelector('#save-status');
    if (saveStatus) saveStatus.textContent = saveHealthMessage;
    status.textContent = liveMessage || state.statusMessage || 'Ready.';
  }

  function scrollCurrentTimelineNode() {
    const current = app.querySelector('.unit-timeline [aria-current="step"]');
    current?.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }

  function focusEventHeading() {
    const heading = app.querySelector('.event-card h2');
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function focusMapMarker(eventId) {
    const marker = chooseMapFocusTarget(actionElements('select-event')
      .filter((element) => element.dataset.eventId === eventId)
      .map((element) => ({
        element,
        kind: element.classList.contains('map-marker')
          ? 'marker'
          : element.dataset.mapKey === 'true' ? 'key' : 'other',
      })))?.element;
    if (!marker) return;
    if (compactMap.matches) {
      marker.scrollIntoView(markerFocusScrollOptions(reducedMotion.matches));
      marker.focus();
    } else {
      marker.focus({ preventScroll: true });
    }
  }

  function focusUnitHeading() {
    const heading = app.querySelector('.available-unit > header h1, .unavailable-unit > header h1');
    if (!heading) return;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }

  function selectEvent(eventId, origin, message) {
    const unit = currentUnit();
    const events = unit?.available ? getUnitEvents(course, unit.id) : [];
    const resolution = resolveEventSelection(events, eventId, store.getState().selectedEventId);
    const event = resolution.event;
    if (!event) {
      workspaceNotice = resolution.message;
      announce(resolution.message);
      render();
      return;
    }
    clearWorkspaceNotice();
    const source = origin === 'map' || origin === 'map-key'
      ? 'map'
      : origin === 'timeline' ? 'timeline' : 'navigation';
    announce(message ?? `Selected ${event.title} from the ${source}.`);
    store.dispatch({ type: 'SELECT_EVENT', eventId: event.id, message: liveMessage });
    scrollCurrentTimelineNode();
    if (origin === 'timeline') focusMapMarker(event.id);
    else focusEventHeading();
  }

  function alignReviewSelection() {
    const state = store.getState();
    if (state.mode !== 'review' || !currentUnit(state)?.available) return;
    const events = getUnitEvents(course, state.selectedUnitId);
    const nextEventId = resolveReviewFilterSelection(state, events);
    if (nextEventId !== state.selectedEventId) {
      store.dispatch({
        type: 'SELECT_EVENT',
        eventId: nextEventId,
        message: liveMessage,
      });
    }
  }

  function selectUnit(unitId, overview = false) {
    const unit = course.units.find((candidate) => candidate.id === unitId);
    if (!unit) return;
    clearWorkspaceNotice();
    const available = Boolean(unit.available);
    const firstEventId = available && !overview ? getUnitEvents(course, unit.id)[0]?.id ?? null : null;
    announce(available
      ? `${unit.label} selected. ${unit.title}, ${unit.dates}.`
      : `${unit.label} is not included in this prototype.`);
    store.dispatch({ type: 'SELECT_UNIT', unitId: unit.id, available, firstEventId });
    if (!overview) alignReviewSelection();
    scrollCurrentTimelineNode();
    focusUnitHeading();
  }

  function submitComprehension(button) {
    const eventId = button.dataset.eventId;
    const event = eventById(eventId);
    const card = button.closest('.event-card');
    const textarea = card?.querySelector('textarea');
    const label = textarea ? [...card.querySelectorAll('label')].find((item) => item.htmlFor === textarea.id) : null;
    if (!event || !textarea || !label) return;

    const outcome = evaluateComprehensionResponse(textarea.value);
    responseDrafts.set(event.id, textarea.value);
    if (!outcome.complete) {
      responseFeedback.set(event.id, {
        kind: 'error',
        message: 'Write a brief response before continuing.',
      });
      announce(`Response needed for ${event.title}. Write a brief explanation, then submit again.`);
      render();
      const refreshed = app.querySelector('.event-card textarea');
      refreshed?.focus({ preventScroll: true });
      return;
    }

    responseFeedback.set(event.id, {
      kind: 'success',
      message: 'Response saved for this session. The next stop is now unlocked.',
    });
    announce(`Response recorded for ${event.title}. Next stop unlocked.`);
    store.dispatch({ type: 'COMPLETE_EVENT', eventId: event.id });
    const postSubmitControls = [...app.querySelectorAll('.event-card [data-action]')]
      .filter((control) => !control.disabled);
    const focusAction = choosePostSubmitAction(
      postSubmitControls.map((control) => control.dataset.action),
    );
    const nextControl = postSubmitControls.find((control) => control.dataset.action === focusAction);
    if (nextControl) {
      nextControl.focus({ preventScroll: true });
    } else {
      const feedback = app.querySelector('.event-card .form-feedback');
      if (feedback) {
        feedback.setAttribute('tabindex', '-1');
        feedback.focus({ preventScroll: true });
      } else {
        focusEventHeading();
      }
    }
  }

  function toggleAnswer(button) {
    const eventId = button.dataset.eventId;
    const event = eventById(eventId);
    if (!event || store.getState().mode !== 'review') return;

    const willReveal = !revealedEventIds.has(event.id);
    if (willReveal) revealedEventIds.add(event.id);
    else revealedEventIds.delete(event.id);
    announce(`${willReveal ? 'Answer revealed' : 'Answer hidden'} for ${event.title}.`);
    render();
    actionElement('reveal-answer', 'eventId', event.id)?.focus({ preventScroll: true });
  }

  function toggleRelatedLocations(button) {
    const eventId = button.dataset.eventId;
    const event = eventById(eventId);
    if (!event) return;
    const expanded = !inspectedRelatedEventIds.has(event.id);
    if (expanded) inspectedRelatedEventIds.add(event.id);
    else inspectedRelatedEventIds.delete(event.id);
    announce(`${expanded ? 'Showing' : 'Hiding'} related locations for ${event.title}.`);
    render();
    actionElement('inspect-related-locations', 'eventId', event.id)?.focus({ preventScroll: true });
  }

  function toggleTheme(themeId) {
    const availableThemes = new Set(getUnitEvents(course, store.getState().selectedUnitId)
      .flatMap((event) => event.themes));
    if (store.getState().mode !== 'review' || !availableThemes.has(themeId)) return;
    clearWorkspaceNotice();
    announce(`Theme filter ${store.getState().activeThemeIds.includes(themeId) ? 'removed' : 'applied'}: ${themeId}.`);
    store.dispatch({ type: 'TOGGLE_THEME', themeId });
    alignReviewSelection();
    actionElement('toggle-theme', 'themeId', themeId)?.focus({ preventScroll: true });
  }

  function ensureLearningAnchor() {
    const state = store.getState();
    if (state.mode !== 'learn') return;
    const eventId = resolveLearningAnchor(state, course);
    if (eventId && eventId !== state.selectedEventId) {
      store.dispatch({ type: 'SELECT_EVENT', eventId, message: liveMessage });
    }
  }

  function setMastery(button) {
    const eventId = button.dataset.eventId;
    const mastery = button.dataset.mastery;
    const event = eventById(eventId);
    if (!event || !['mastered', 'needs-review'].includes(mastery)) return;
    clearWorkspaceNotice();
    announce(`${event.title} marked ${mastery === 'mastered' ? 'Mastered' : 'Needs review'}.`);
    store.dispatch({ type: 'SET_MASTERY', eventId: event.id, mastery });
    alignReviewSelection();
    if (store.getState().selectedEventId === event.id) {
      actionElements('set-mastery')
        .find((control) => control.dataset.eventId === event.id && control.dataset.mastery === mastery)
        ?.focus({ preventScroll: true });
    } else {
      focusEventHeading();
    }
  }

  function toggleWeakOnly() {
    const before = store.getState();
    if (before.mode !== 'review') return;
    clearWorkspaceNotice();
    announce(before.weakOnly ? 'Showing all Unit 1 review events.' : 'Showing only events marked Needs review.');
    store.dispatch({ type: 'TOGGLE_WEAK_ONLY' });
    alignReviewSelection();
    scrollCurrentTimelineNode();
    actionElements('toggle-weak-only')[0]?.focus({ preventScroll: true });
  }

  app.addEventListener('input', (event) => {
    const textarea = event.target.closest('textarea');
    const card = textarea?.closest('.event-card');
    const button = card?.querySelector('[data-action="submit-comprehension"]');
    const eventId = button?.dataset.eventId;
    if (textarea && eventId) {
      responseDrafts.set(eventId, textarea.value);
      if (responseFeedback.delete(eventId)) {
        const feedbackId = textarea.getAttribute('aria-describedby');
        const feedback = feedbackId ? document.getElementById(feedbackId) : null;
        if (feedback && card.contains(feedback)) feedback.remove();
        textarea.removeAttribute('aria-describedby');
        textarea.removeAttribute('aria-invalid');
      }
    }
  });

  app.addEventListener('click', (event) => {
    const control = event.target.closest('[data-action]');
    if (!control || !app.contains(control)) return;

    switch (control.dataset.action) {
      case 'set-mode': {
        const mode = control.dataset.mode;
        if (!['learn', 'review'].includes(mode)) return;
        clearWorkspaceNotice();
        announce(`${mode === 'learn' ? 'Learn' : 'Review'} mode selected.`);
        store.dispatch({ type: 'SET_MODE', mode });
        ensureLearningAnchor();
        alignReviewSelection();
        actionElement('set-mode', 'mode', mode)?.focus({ preventScroll: true });
        break;
      }
      case 'select-unit':
        selectUnit(control.dataset.unitId);
        break;
      case 'select-period-band':
        selectUnit(control.dataset.unitId, true);
        break;
      case 'select-event':
        selectEvent(control.dataset.eventId, control.dataset.origin);
        break;
      case 'next-event':
        selectEvent(control.dataset.eventId, 'next', `Moved to the next event.`);
        break;
      case 'submit-comprehension':
        submitComprehension(control);
        break;
      case 'reveal-answer':
        toggleAnswer(control);
        break;
      case 'inspect-related-locations':
        toggleRelatedLocations(control);
        break;
      case 'set-mastery':
        setMastery(control);
        break;
      case 'toggle-weak-only':
        toggleWeakOnly();
        break;
      case 'toggle-theme':
        toggleTheme(control.dataset.themeId);
        break;
      case 'clear-themes':
        if (store.getState().mode === 'review') {
          clearWorkspaceNotice();
          announce('Theme filters cleared.');
          store.dispatch({ type: 'CLEAR_THEMES' });
          alignReviewSelection();
          actionElements('clear-themes')[0]?.focus({ preventScroll: true });
        }
        break;
      default:
        break;
    }
  });

  store.subscribe(render);
  const hydratedUnit = currentUnit();
  if (!hydratedUnit) {
    const fallbackUnit = course.units[0];
    store.dispatch({
      type: 'SELECT_UNIT',
      unitId: fallbackUnit.id,
      available: Boolean(fallbackUnit.available),
      firstEventId: getUnitEvents(course, fallbackUnit.id)[0]?.id ?? null,
    });
    alignReviewSelection();
  } else {
    render();
    alignReviewSelection();
  }
  liveMessage = describeInitialSelection(store.getState(), course);
  status.textContent = liveMessage;
}
