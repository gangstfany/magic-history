import {COURSES, courseFromHash, courseURL, acceptCourseMessage} from './modules.mjs';
const choices = document.getElementById('courseChoices');
const frames = document.getElementById('courseFrames');
const status = document.getElementById('moduleStatus');
const retry = document.getElementById('moduleRetry');
const standalone = document.getElementById('courseStandalone');
const unavailable = document.getElementById('courseUnavailable');
const cache = new Map();
let active;
for (const course of COURSES) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'course-choice'; button.dataset.course = course.id;
  button.style.setProperty('--course-color', course.color);
  button.setAttribute('aria-controls', 'courseFrames');
  const short = document.createElement('span'); short.className='course-short'; short.textContent=course.short;
  const name = document.createElement('span'); name.className='course-name'; name.textContent=course.label;
  const state = document.createElement('span'); state.className='course-state'; state.textContent=course.entry ? '进入课程 →' : '准备中';
  const dot = document.createElement('span'); dot.className='course-dot'; dot.setAttribute('aria-hidden','true');
  button.append(short,name,state,dot);
  button.addEventListener('click',()=>navigate(course.id)); choices.append(button);
}
function navigate(id) {
  const hash='#course='+id;
  if(location.hash===hash) select(); else location.hash=hash;
}
function renderStatus() {
  const item = cache.get(active.id);
  status.textContent = !active.entry ? '' : item?.ready ? '' : item?.failed ? `${active.label}暂时没有加载完成。可以重试，或独立打开课程。` : `正在载入${active.label}…`;
  retry.hidden=!item?.failed;
  frames.setAttribute('aria-busy',String(Boolean(active.entry&&!item?.ready&&!item?.failed)));
}
function startTimer(item) {
  clearTimeout(item.timer);
  item.failed=false; item.ready=false;
  item.timer=setTimeout(()=>{ if(item.ready)return; item.failed=true; if(active.id===item.course.id)renderStatus(); },12000);
}
function markReady(item) {
  clearTimeout(item.timer); item.ready=true; item.failed=false;
  if(active.id===item.course.id)renderStatus();
}
function mount(course) {
  const frame=document.createElement('iframe');
  frame.className='course-frame'; frame.title=course.english+' · '+course.label;
  frame.dataset.course=course.id; frame.dataset.sizing=course.sizing;
  const item={course,frame,ready:false,failed:false,timer:0};
  cache.set(course.id,item);
  frame.addEventListener('error',()=>{clearTimeout(item.timer);item.failed=true;if(active.id===course.id)renderStatus();});
  startTimer(item); frame.src=courseURL(course,new URL(location.href)); frames.append(frame);
  return item;
}
function select() {
  active=courseFromHash(location.hash);
  document.title=active.label+' · Magic History';
  document.getElementById('courseTitle').textContent=active.label;
  document.getElementById('courseEnglish').textContent=active.english;
  choices.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.course===active.id)));
  unavailable.hidden=Boolean(active.entry);
  standalone.hidden=!active.entry;
  if(active.entry) {
    const url=new URL(courseURL(active,new URL(location.href)));url.searchParams.delete('embed');
    standalone.href=url.href;
    if(!cache.has(active.id))mount(active);
  } else standalone.removeAttribute('href');
  for(const item of cache.values()) {
    const hidden=item.course.id!==active.id;
    item.frame.hidden=hidden;item.frame.setAttribute('aria-hidden',String(hidden));
  }
  renderStatus();
}
window.addEventListener('message',event=>{
  for(const item of cache.values()) {
    const height=acceptCourseMessage(event,{origin:location.origin,source:item.frame.contentWindow,id:item.course.id});
    if(height===null)continue;
    if(item.course.sizing==='content')item.frame.style.height=height+'px';
    markReady(item); break;
  }
});
retry.addEventListener('click',()=>{
  const item=cache.get(active.id);if(!item)return;
  startTimer(item);item.frame.src=courseURL(active,new URL(location.href));renderStatus();
});
document.getElementById('returnToWorld').addEventListener('click',()=>navigate('world'));
window.addEventListener('hashchange',select);
select();
// Section links scroll within the shell without replacing the course URL.
document.addEventListener('click',event=>{
  const link=event.target.closest('a[href="#courses"],a[href="#about"]');
  if(!link)return;
  const target=document.getElementById(link.getAttribute('href').slice(1));
  if(!target)return;
  event.preventDefault();target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start'});
});
