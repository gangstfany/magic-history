// Modules publish layout only; the shell never reads course DOM or learning APIs.
const script = document.querySelector('script[data-course]');
const course = script?.dataset.course;
const embedded = window.parent !== window && new URLSearchParams(location.search).get('embed') === '1';
if (embedded && course) {
  document.documentElement.classList.add('is-module-embedded');
  let pending = false;
  let previous = 0;
  function report() {
    pending = false;
    // Body bounds avoid a viewport-height floor and resize feedback loops.
    const height = Math.ceil(document.body.getBoundingClientRect().height);
    if (height < 200 || height === previous) return;
    previous = height;
    window.parent.postMessage({type:'magic-history:module', course, height}, location.origin);
  }
  const schedule = () => {
    if (!pending) { pending = true; requestAnimationFrame(report); }
  };
  new ResizeObserver(schedule).observe(document.body);
  window.addEventListener('load', schedule);
  window.addEventListener('resize', schedule);
  schedule();
}
