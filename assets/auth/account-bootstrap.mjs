import { AUTH_CONFIG } from './auth-config.mjs';
import { createAuthService, validateAuthConfig } from './auth-service.mjs';
import { mountAccountUI } from './account-ui.mjs';

const callbackMode = document.body.hasAttribute('data-account-callback');
// The callback page captures these synchronously before any module is requested.
const captured = callbackMode ? window.__accountCallback : null;
if (callbackMode) delete window.__accountCallback;
const checked = validateAuthConfig(AUTH_CONFIG);
const failedService = message => {
  const state = Object.freeze({status:'error',user:null,recovery:false,message});
  return {getState:()=>state,subscribe(fn){fn(state);return()=>{};}};
};
async function boot() {
  let service;
  try {
    if (checked.ok) {
      await new Promise((resolve,reject)=>{
        const script=document.createElement('script');
        script.src=new URL('../vendor/supabase-js-2.118.0.js',import.meta.url).href;
        const timeout=setTimeout(()=>{script.remove();reject(new Error('SDK timeout'));},8000);
        script.onload=()=>{clearTimeout(timeout);resolve();};
        script.onerror=()=>{clearTimeout(timeout);reject(new Error('SDK unavailable'));};
        document.head.append(script);
      });
      if (typeof window.supabase?.createClient !== 'function') throw new Error('SDK unavailable');
      const storage=window.localStorage;
      service=createAuthService({config:checked.config,createClient:window.supabase.createClient,siteUrl:window.location.href,storage});
    } else {
      service=createAuthService({config:AUTH_CONFIG,siteUrl:window.location.href});
    }
  } catch {
    service=failedService('账号组件未能连接。请检查浏览器存储权限与网络，然后刷新页面；仍可继续浏览地图。');
  }
  const ui=mountAccountUI({document,service,callbackMode,googleEnabled:checked.ok && checked.config.googleEnabled});
  try {
    if (service.initialize) await service.initialize();
    if (callbackMode && checked.ok && service.handleCallback) {
      const response=await service.handleCallback(captured || {});
      ui.showMessage(response.message || (response.ok ? '账户验证成功，可以返回地图。' : '验证未完成，请重新发起登录。'));
    }
  } catch {ui.showMessage('账号验证未完成。请重新登录或稍后刷新重试。');}
}
void boot();
