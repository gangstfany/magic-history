import { validateAuthFields, safeReturnUrl } from './auth-service.mjs';

export function mountAccountUI({ document, service, callbackMode = false, googleEnabled = false }) {
  const host = document.createElement('div');
  host.className = 'account-root';
  // This template is constant. Account data and service messages use textContent only.
  host.innerHTML = `<dialog class="account-dialog" aria-labelledby="account-title" aria-describedby="account-intro">
    <div class="account-heading"><div><p class="account-eyebrow">MAGIC HISTORY · 账号</p><h2 id="account-title">欢迎回来</h2></div><button type="button" class="account-close" aria-label="关闭账号窗口">×</button></div>
    <p class="account-intro" id="account-intro">用邮箱继续探索历史。账号服务与地图浏览相互独立。</p>
    <div class="account-tabs" role="tablist" aria-label="账号操作"><button type="button" role="tab" id="account-login-tab" aria-controls="account-form-panel" aria-selected="true" data-account-mode="login">登录</button><button type="button" role="tab" id="account-signup-tab" aria-controls="account-form-panel" aria-selected="false" tabindex="-1" data-account-mode="signup">注册</button></div>
    <section id="account-form-panel" role="tabpanel" aria-labelledby="account-login-tab">
      <form class="account-form" novalidate>
        <div class="account-field" data-field="email"><label for="account-email">电子邮箱</label><input id="account-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="account-email-error"><p class="account-field-error" id="account-email-error"></p></div>
        <div class="account-field" data-field="password"><label for="account-password">密码</label><div class="account-password-row"><input id="account-password" name="password" type="password" autocomplete="current-password" required aria-describedby="account-password-hint account-password-error"><button type="button" class="account-visibility" aria-controls="account-password" aria-pressed="false">显示密码</button></div><p id="account-password-hint" class="account-hint" hidden>新密码至少 12 个字符。</p><p class="account-field-error" id="account-password-error"></p></div>
        <div class="account-field" data-field="confirm" hidden><label for="account-confirm">确认密码</label><div class="account-password-row"><input id="account-confirm" name="confirmPassword" type="password" autocomplete="new-password" aria-describedby="account-confirm-error"><button type="button" class="account-visibility" aria-controls="account-confirm" aria-pressed="false">显示确认密码</button></div><p class="account-field-error" id="account-confirm-error"></p></div>
        <button class="account-submit account-primary" type="submit">登录</button>
      </form>
      <div class="account-secondary"><button type="button" class="account-forgot">忘记密码？</button><button type="button" class="account-back" hidden>返回登录</button></div>
      <button type="button" class="account-google">使用 Google 登录</button>
    </section>
    <section class="account-profile" hidden><p class="account-hint">当前登录邮箱</p><p class="account-user"></p><button type="button" class="account-logout">退出登录</button></section>
    <p class="account-status" role="status" aria-live="polite" aria-atomic="true"></p>
    <p class="account-notice">当前为账号基础接入阶段；不会改变地图访问权限。正式开放前仍需完成隐私说明、邮件及区域网络测试。</p>
    <a class="account-return" hidden>返回地图首页</a>
  </dialog>`;
  document.body.append(host);
  const $ = selector => host.querySelector(selector);
  const dialog = $('.account-dialog');
  const trigger = document.querySelector('[data-account-trigger]');
  const form = $('.account-form');
  const inputs = { email: $('#account-email'), password: $('#account-password'), confirm: $('#account-confirm') };
  const status = $('.account-status');
  let mode = 'login';
  let state = service.getState();
  let busy = false;
  let ticket = 0;
  let disposed = false;
  const unavailable = () => ['unconfigured', 'loading', 'error'].includes(state.status);
  const fields = () => ({ email: inputs.email.value, password: inputs.password.value, confirmPassword: inputs.confirm.value });
  const clearSecrets = () => {
    inputs.password.value = ''; inputs.confirm.value = '';
    for (const name of ['password', 'confirm']) {
      inputs[name].type = 'password';
      const button = $(`[aria-controls="account-${name}"]`);
      button.textContent = name === 'password' ? '显示密码' : '显示确认密码';
      button.setAttribute('aria-pressed', 'false');
    }
  };
  const error = (name, message = '') => {
    $(`#account-${name}-error`).textContent = message;
    inputs[name].setAttribute('aria-invalid', message ? 'true' : 'false');
  };
  const validate = (only) => {
    const data = fields();
    const errors = { email: '', password: '', confirm: '' };
    if (mode !== 'reset-password' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = '请输入有效的电子邮箱。';
    if (mode === 'login' && !data.password) errors.password = '请输入密码。';
    if (['signup','reset-password'].includes(mode)) {
      if ([...data.password].length < 12) errors.password = '新密码至少需要 12 个字符。';
      if (data.confirmPassword !== data.password) errors.confirm = '两次输入的密码不一致。';
    }
    for (const name of only ? [only] : Object.keys(errors)) error(name, errors[name]);
    return validateAuthFields(mode, data);
  };
  const render = () => {
    const recovery = state.status === 'recovery' && state.recovery === true;
    if (recovery) mode = 'reset-password';
    else if (mode === 'reset-password') mode = 'login';
    const authenticated = state.status === 'authenticated' && Boolean(state.user);
    const titles = {login:'欢迎回来',signup:'创建你的账号',forgot:'找回密码','reset-password':'设置新密码'};
    $('#account-title').textContent = authenticated ? '你的账号' : titles[mode];
    $('.account-tabs').hidden = authenticated || mode === 'reset-password' || mode === 'forgot';
    $('#account-form-panel').hidden = authenticated;
    $('.account-profile').hidden = !authenticated;
    $('.account-user').textContent = state.user?.email || '';
    if (trigger) {
      trigger.textContent = authenticated ? state.user.email || '我的账号' : '登录 / 注册';
      trigger.title = authenticated ? state.user.email || '我的账号' : '登录 / 注册';
    }
    $('[data-field="email"]').hidden = mode === 'reset-password';
    $('[data-field="password"]').hidden = mode === 'forgot';
    $('[data-field="confirm"]').hidden = !['signup','reset-password'].includes(mode);
    inputs.email.disabled = mode === 'reset-password' || busy;
    inputs.password.disabled = mode === 'forgot' || busy;
    inputs.confirm.disabled = !['signup','reset-password'].includes(mode) || busy;
    inputs.password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    $('#account-password-hint').hidden = !['signup','reset-password'].includes(mode);
    $('.account-forgot').hidden = ['forgot','reset-password'].includes(mode);
    $('.account-back').hidden = mode !== 'forgot';
    $('.account-google').hidden = ['forgot','reset-password'].includes(mode);
    $('.account-google').textContent = googleEnabled ? '使用 Google 登录' : 'Google 登录尚未启用';
    $('.account-google').disabled = busy || unavailable() || !googleEnabled;
    $('.account-submit').textContent = busy ? '处理中…' : {login:'登录',signup:'注册',forgot:'发送重置邮件','reset-password':'更新密码'}[mode];
    $('.account-submit').disabled = busy || unavailable();
    $('.account-logout').disabled = busy;
    for (const tab of host.querySelectorAll('[role="tab"]')) {
      tab.setAttribute('aria-selected',String(tab.dataset.accountMode === mode));
      tab.tabIndex = tab.dataset.accountMode === mode ? 0 : -1;
      tab.disabled = busy;
    }
    $('#account-form-panel').setAttribute('aria-labelledby', mode === 'signup' ? 'account-signup-tab' : mode === 'login' ? 'account-login-tab' : 'account-title');
    form.setAttribute('aria-busy',String(busy));
    if (state.status === 'unconfigured') status.textContent = '暂未连接账号服务。请联系网站管理员完成配置；当前无法登录或注册。';
    else if (state.status === 'loading') status.textContent = '正在连接账号服务…';
    else if (state.status === 'error') status.textContent = state.message || '无法连接账号服务，请刷新页面重试。';
  };
  const switchMode = next => {
    if (busy || mode === 'reset-password') return;
    mode = next; clearSecrets();
    for (const name of Object.keys(inputs)) error(name);
    status.textContent = ''; render();
  };
  const perform = async operation => {
    if (busy || unavailable() || disposed) return;
    const current = ++ticket;
    busy = true; status.textContent = '处理中，请稍候…'; render();
    let response;
    try { response = await operation(); } catch { response = {ok:false,message:'暂时无法连接账号服务，请稍后重试。'}; }
    if (disposed) return;
    if (ticket !== current) { busy = false; render(); return; }
    busy = false; render();
    status.textContent = response.message || (response.ok ? '操作已完成。' : '操作失败，请重试。');
    if (response.ok) clearSecrets();
    if (response.ok && response.code === 'oauth-redirect' && response.url) document.defaultView.location.assign(response.url);
  };
  form.addEventListener('submit', event => {
    event.preventDefault(); if (busy || unavailable()) return;
    if (!validate().ok) { Object.values(inputs).find(input=>input.getAttribute('aria-invalid')==='true')?.focus(); return; }
    const methods = {login:'signIn',signup:'signUp',forgot:'requestPasswordReset','reset-password':'updatePassword'};
    void perform(()=>service[methods[mode]](fields()));
  });
  for (const [name,input] of Object.entries(inputs)) {
    input.addEventListener('blur',()=>validate(name));
    input.addEventListener('input',()=>{if(input.getAttribute('aria-invalid')==='true')validate(name);});
  }
  for (const button of host.querySelectorAll('.account-visibility')) button.addEventListener('click',()=>{
    const input = $('#'+button.getAttribute('aria-controls'));
    const visible = input.type === 'password'; input.type = visible ? 'text' : 'password';
    button.textContent = (visible ? '隐藏' : '显示') + (input === inputs.confirm ? '确认密码' : '密码');
    button.setAttribute('aria-pressed',String(visible));
  });
  const tabs = [...host.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>switchMode(tab.dataset.accountMode));
    tab.addEventListener('keydown',event=>{
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault(); const next = tabs[event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1-index];
      switchMode(next.dataset.accountMode); next.focus();
    });
  });
  $('.account-forgot').addEventListener('click',()=>switchMode('forgot'));
  $('.account-back').addEventListener('click',()=>switchMode('login'));
  $('.account-google').addEventListener('click',()=>{if(googleEnabled)void perform(()=>service.signInGoogle());});
  $('.account-logout').addEventListener('click',()=>void perform(()=>service.signOut()));
  const open = () => { if (!disposed && !dialog.open) {render();dialog.showModal();} };
  const onClose = () => { ++ticket; clearSecrets(); render(); trigger?.focus(); };
  $('.account-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',onClose);
  trigger?.addEventListener('click',open);
  const unsubscribe = service.subscribe(next=>{
    const finishedConnecting = state.status === 'loading' && next.status !== 'loading';
    state=next;
    if (finishedConnecting) status.textContent = next.message || '';
    render();
  });
  if (callbackMode) {
    const returnLink = $('.account-return'); returnLink.hidden = false;
    returnLink.href = safeReturnUrl('index.html',document.defaultView.location.href);
    open();
  }
  return Object.freeze({open,showMessage(message){status.textContent=message;},dispose(){disposed=true;++ticket;unsubscribe();trigger?.removeEventListener('click',open);dialog.close();host.remove();}});
}
