// Public contract: course internals belong to their own entry pages.
export const COURSES = Object.freeze([
  {id:'world', label:'世界史', english:'World History', short:'APWH', entry:'apwh.html', sizing:'content', description:'地图、学习卡、因果链、商路与练习', color:'#d9a441'},
  {id:'us', label:'美国史', english:'US History', short:'APUSH', entry:'apush-map.html', sizing:'content', description:'按时期探索美国史地图与事件', color:'#c9714f'},
  {id:'euro', label:'欧洲史', english:'European History', short:'AP Euro', entry:null, sizing:'content', description:'课程正在准备中，完成后将在这里接入', color:'#8fa878'},
  {id:'art', label:'艺术史', english:'Art History', short:'AP Art', entry:'art-history-map.html', sizing:'content', description:'探索艺术作品、文化与历史背景', color:'#6f9bc7'},
].map(Object.freeze));
export function courseFromHash(hash) {
  const id = new URLSearchParams(hash.replace(/^#/, '')).get('course');
  return COURSES.find(course => course.id === id) || COURSES[0];
}
export function courseURL(course, base) {
  if (!course.entry) return null;
  const url = new URL(course.entry, base);
  url.searchParams.set('moduleRelease', '20261026-2');
  url.searchParams.set('embed', '1');
  if (course.id === 'art' && new URL(base).searchParams.get('privateMedia') === '1') url.searchParams.set('privateMedia', '1');
  return url.href;
}
export function acceptCourseMessage(event, expected) {
  const data = event.data;
  if (event.origin !== expected.origin || event.source !== expected.source ||
      !data || data.type !== 'magic-history:module' || data.course !== expected.id ||
      !Number.isFinite(data.height) || data.height < 200 || data.height > 30000) return null;
  return Math.ceil(data.height);
}
