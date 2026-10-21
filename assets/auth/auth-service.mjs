const result = (ok, code, message, extra = {}) => ({ ok, code, message, ...extra });
const fail = (code = 'auth-failed', message = '操作未完成，请检查信息或稍后重试。') => result(false, code, message);

export function validateAuthConfig(raw = {}) {
  const supabaseUrl = typeof raw?.supabaseUrl === 'string' ? raw.supabaseUrl.trim() : '';
  const publishableKey = typeof raw?.publishableKey === 'string' ? raw.publishableKey.trim() : '';
  if (!supabaseUrl && !publishableKey) return fail('unconfigured', '账户服务尚未配置，请联系网站管理员。');
  try {
    const url = new URL(supabaseUrl);
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return fail('invalid-config', '账户服务配置无效。');
    let publicKey = /^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey);
    if (!publicKey && /^[\w-]+\.[\w-]+\.[\w-]+$/.test(publishableKey)) {
      const payload = publishableKey.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      publicKey = JSON.parse(atob(payload)).role === 'anon';
    }
    if (!publicKey) return fail('invalid-config', '必须使用公开 publishable 或 anon 密钥。');
    return result(true, 'configured', '', { config: Object.freeze({ supabaseUrl: url.origin, publishableKey, googleEnabled: raw.googleEnabled === true }) });
  } catch { return fail('invalid-config', '账户服务配置无效。'); }
}

export function validateAuthFields(mode, fields = {}) {
  if (!['login', 'signup', 'forgot', 'reset-password'].includes(mode)) return fail('invalid-mode', '未知账户操作。');
  const email = typeof fields.email === 'string' ? fields.email.trim() : '';
  const password = typeof fields.password === 'string' ? fields.password : '';
  if (mode !== 'reset-password' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('invalid-email', '请输入有效的电子邮箱。');
  if (mode === 'login' && !password) return fail('password-required', '请输入密码。');
  if (['signup', 'reset-password'].includes(mode)) {
    if ([...password].length < 12) return fail('password-too-short', '新密码至少需要 12 个字符。');
    if (fields.confirmPassword !== password) return fail('password-mismatch', '两次输入的密码不一致。');
  }
  return result(true, 'valid', '', { fields: mode === 'forgot' ? { email } : mode === 'reset-password' ? { password } : { email, password } });
}

export function safeReturnUrl(value, siteUrl) {
  const base = new URL('.', siteUrl);
  const fallback = new URL('index.html', base).href;
  try {
    if (typeof value !== 'string' || !value || value.startsWith('//')) return fallback;
    const url = new URL(value, base);
    const allowed = ['index.html', 'world-map.html', 'art-history-map.html'].map(path => new URL(path, base).pathname);
    return url.origin === base.origin && !url.username && !url.password && !url.search && !url.hash && allowed.includes(url.pathname) ? url.href : fallback;
  } catch { return fallback; }
}

// storage is the SDK's own persistence adapter (normally window.localStorage).
// We never persist passwords or copy tokens; only remove our exact SDK keys on logout.
export function createAuthService({ config, createClient, siteUrl, storage } = {}) {
  const checked = validateAuthConfig(config);
  let state = Object.freeze({ status: checked.ok ? 'loading' : checked.code === 'unconfigured' ? 'unconfigured' : 'error', user: null, recovery: false, message: checked.message });
  let client;
  let subscription;
  let disposed = false;
  let suppressed = false;
  let generation = 0;
  let recoveryUserId = null;
  let initialization;
  let loggingOut = false;
  let pendingRecoveryVerification = null;
  const listeners = new Set();
  const timers = new Set();
  const pendingEvents = new Set();
  const mutations = new Set();
  const usedCodes = new Set();
  const callbackUrl = () => new URL('auth-callback.html', new URL('.', siteUrl)).href;
  const storageKey = checked.ok ? `magic-history-auth:${new URL(checked.config.supabaseUrl).hostname}` : '';
  const publish = (next) => {
    if (disposed) return;
    state = Object.freeze({ ...state, ...next });
    for (const fn of listeners) { try { fn(state); } catch { /* Subscriber failures must not break authentication. */ } }
  };
  const guest = message => { recoveryUserId = null; publish({ status: 'guest', user: null, recovery: false, message: message || '' }); };
  const available = () => disposed ? fail('disposed', '账户服务已关闭。') : !checked.ok ? checked : loggingOut ? fail('busy', '正在退出登录，请稍候。') : !client ? fail('not-initialized', '账户服务尚未初始化。') : null;
  const mutate = async operation => {
    const pending = Promise.resolve().then(operation);
    mutations.add(pending);
    try { return await pending; } finally { mutations.delete(pending); }
  };
  const verifiedUser = async () => {
    const response = await client.auth.getUser();
    const value = response?.data?.user;
    return !response?.error && value && typeof value.id === 'string' && value.id ? Object.freeze({ id: value.id, email: typeof value.email === 'string' ? value.email : '' }) : null;
  };
  const verify = async (ticket, recovery = false, restoreRefresh = false) => {
    const user = await verifiedUser();
    if (disposed || suppressed || ticket !== generation) return fail('cancelled', '账户状态已变化，请重试。');
    if (!user) { guest(); return fail('session-unverified', '登录状态已失效，请重新登录。'); }
    if (restoreRefresh) {
      // signOut deliberately stops the SDK ticker. Saving a later session does
      // not restart it, so explicit server-verified authentication must do so.
      // Track the restart with SDK writes so logout/disposal can stop it last.
      await mutate(() => client.auth.startAutoRefresh?.());
      if (disposed || suppressed || ticket !== generation) return fail('cancelled', '账户状态已变化，请重试。');
    }
    if (recovery) recoveryUserId = user.id;
    const hasRecovery = recoveryUserId === user.id;
    publish({ status: hasRecovery ? 'recovery' : 'authenticated', user, recovery: hasRecovery, message: '' });
    return result(true, hasRecovery ? 'recovery' : 'authenticated', '账户验证成功。');
  };
  const run = async operation => {
    const unavailable = available();
    if (unavailable) return unavailable;
    try { return await operation(); } catch { return fail(); }
  };
  const service = {
    getState: () => state,
    subscribe(listener) { listeners.add(listener); listener(state); return () => listeners.delete(listener); },
    initialize() {
      if (disposed) return Promise.resolve(fail('disposed', '账户服务已关闭。'));
      if (!checked.ok) return Promise.resolve(checked);
      if (initialization) return initialization;
      initialization = (async () => {
        const ticket = ++generation;
        try {
          const authOptions = { flowType: 'pkce', detectSessionInUrl: false, autoRefreshToken: true, persistSession: true, storageKey };
          if (storage) authOptions.storage = storage;
          client = createClient(checked.config.supabaseUrl, checked.config.publishableKey, { auth: authOptions });
          subscription = client.auth.onAuthStateChange((event) => {
            if (disposed || suppressed) return;
            // initialize() already performs a server-verified read. The SDK's
            // asynchronously emitted initial snapshot is not new identity proof.
            if (event === 'INITIAL_SESSION') return;
            if (event === 'SIGNED_OUT') { ++generation; guest(); return; }
            const eventTicket = event === 'USER_UPDATED' ? generation : ++generation;
            const pendingEvent = new Promise(resolve => {
              pendingEvents.add(resolve);
              const timer = setTimeout(async () => {
                timers.delete(timer);
                try {
                  if (disposed || suppressed || eventTicket !== generation) { resolve(fail('cancelled')); return; }
                  resolve(await verify(eventTicket, event === 'PASSWORD_RECOVERY'));
                } catch {
                  if (!disposed && eventTicket === generation) guest('无法验证账户，请重新登录。');
                  resolve(fail('session-unverified'));
                } finally { pendingEvents.delete(resolve); }
              }, 0);
              timers.add(timer);
            });
            if (event === 'PASSWORD_RECOVERY') pendingRecoveryVerification = pendingEvent;
          })?.data?.subscription;
          const value = await verify(ticket);
          return value.code === 'session-unverified' ? result(true, 'guest', '') : value;
        } catch {
          if (ticket === generation) publish({ status: 'error', user: null, recovery: false, message: '无法连接账户服务，请稍后重试。' });
          return fail();
        }
      })();
      return initialization;
    },
    signIn(fields) { return run(async () => {
      const valid = validateAuthFields('login', fields); if (!valid.ok) return valid;
      suppressed = false; recoveryUserId = null; const ticket = ++generation;
      const response = await mutate(() => client.auth.signInWithPassword(valid.fields));
      if (response?.error) return fail('login-failed', '邮箱或密码不正确，或服务暂时不可用。');
      return verify(generation === ticket ? ticket : generation, false, true);
    }); },
    signUp(fields) { return run(async () => {
      const valid = validateAuthFields('signup', fields); if (!valid.ok) return valid;
      suppressed = false; recoveryUserId = null; ++generation;
      const response = await mutate(() => client.auth.signUp({ ...valid.fields, options: { emailRedirectTo: callbackUrl() } }));
      if (response?.error) return fail('signup-failed', '暂时无法注册，请检查信息或稍后重试。');
      if (!response?.data?.session) { guest(); return result(true, 'confirmation-required', '如该邮箱可以注册，请查看邮箱中的验证邮件。'); }
      return verify(generation, false, true);
    }); },
    requestPasswordReset(fields) { return run(async () => {
      const valid = validateAuthFields('forgot', fields); if (!valid.ok) return valid;
      const response = await mutate(() => client.auth.resetPasswordForEmail(valid.fields.email, { redirectTo: callbackUrl() }));
      if (response?.error) return fail('reset-email-failed', '暂时无法发送邮件，请稍后重试。');
      return result(true, 'reset-email-sent', '如果该邮箱已注册，你将收到密码重置邮件。');
    }); },
    signInGoogle() { return run(async () => {
      if (!checked.config.googleEnabled) return fail('google-disabled', 'Google 登录尚未启用。');
      const response = await mutate(() => client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callbackUrl(), skipBrowserRedirect: true } }));
      if (response?.error) return fail('oauth-failed');
      const url = new URL(response?.data?.url);
      const projectEndpoint = url.origin === new URL(checked.config.supabaseUrl).origin && url.pathname === '/auth/v1/authorize';
      const fixedCallback = url.searchParams.getAll('redirect_to').length === 1 && url.searchParams.get('redirect_to') === callbackUrl();
      if (url.protocol !== 'https:' || url.username || url.password || url.hash || !projectEndpoint || !fixedCallback) return fail('oauth-invalid-url');
      return result(true, 'oauth-redirect', '即将前往 Google 登录。', { url: url.href });
    }); },
    handleCallback({ search = '', hash = '' } = {}) { return run(async () => {
      const params = new URLSearchParams(search);
      const fragment = new URLSearchParams(hash.replace(/^#/, ''));
      if (params.has('error') || fragment.has('error') || fragment.has('access_token') || fragment.has('refresh_token')) return fail('callback-invalid', '验证链接无效或已取消，请重新发起登录。');
      const code = params.get('code');
      if (!code || params.getAll('code').length !== 1 || usedCodes.has(code)) return fail('callback-invalid', '验证链接无效或已使用，请重新发起登录。');
      usedCodes.add(code); suppressed = false; recoveryUserId = null; pendingRecoveryVerification = null; ++generation;
      const response = await mutate(() => client.auth.exchangeCodeForSession(code));
      if (response?.error) return fail('callback-failed', '验证链接已失效，请重新发起邮件验证。');
      // PASSWORD_RECOVERY is emitted by the SDK during exchange; let its queued
      // verification finish before deciding the resulting state.
      await new Promise(resolve => setTimeout(resolve, 0));
      if (pendingRecoveryVerification) await pendingRecoveryVerification;
      return verify(generation, false, true);
    }); },
    updatePassword(fields) { return run(async () => {
      const valid = validateAuthFields('reset-password', fields); if (!valid.ok) return valid;
      if (!recoveryUserId || suppressed) return fail('recovery-required', '请先通过密码重置邮件重新验证。');
      const ticket = generation;
      let user;
      try { user = await verifiedUser(); } catch {
        if (ticket === generation && !disposed) guest();
        return fail('recovery-expired', '无法验证账户，请重新发送密码重置邮件。');
      }
      if (ticket !== generation || suppressed || disposed) return fail('cancelled');
      if (!user || user.id !== recoveryUserId) { guest(); return fail('recovery-expired', '验证已失效，请重新发送密码重置邮件。'); }
      const response = await mutate(() => client.auth.updateUser(valid.fields));
      if (response?.error) return fail('password-update-failed', '密码更新失败，请重新验证或稍后重试。');
      if (ticket !== generation || suppressed || disposed) return fail('cancelled');
      recoveryUserId = null;
      publish({ status: 'authenticated', user, recovery: false, message: '密码已更新。' });
      return result(true, 'password-updated', '密码已更新。');
    }); },
    signOut() { return run(async () => {
      loggingOut = true; suppressed = true; ++generation; guest();
      try {
      // A late SDK login response can write tokens even after UI invalidation.
      // Wait for owned SDK writes, then revoke locally and clear persistence.
      await Promise.allSettled([...mutations]);
      let failed = false;
      try { failed = Boolean((await client.auth.signOut({ scope: 'local' }))?.error); } catch { failed = true; }
      try { await client.auth.stopAutoRefresh?.(); } catch { failed = true; }
      try { if (storage) { await storage.removeItem(storageKey); await storage.removeItem(`${storageKey}-code-verifier`); } else if (failed) return fail('logout-failed', '本页已退出，但无法确认本机登录凭据已清除，请关闭浏览器并清理本站数据。'); } catch { return fail('logout-failed', '本页已退出，但本机登录凭据清理失败，请清理本站数据。'); }
      return failed ? fail('logout-failed', '本机已退出；服务器退出请求未完成，请稍后重试。') : result(true, 'signed-out', '已退出登录。');
      } finally { loggingOut = false; }
    }); },
    async dispose() {
      if (disposed) return result(true, 'disposed', '账户服务已关闭。');
      ++generation; suppressed = true; recoveryUserId = null;
      publish({ status: 'guest', user: null, recovery: false, message: '' });
      disposed = true; for (const timer of timers) clearTimeout(timer); timers.clear();
      for (const resolve of pendingEvents) resolve(fail('cancelled'));
      pendingEvents.clear();
      listeners.clear();
      // Disposal releases this page's resources; unlike logout, it deliberately
      // leaves the SDK's normal persisted session intact for another page.
      let failed = false;
      try { subscription?.unsubscribe(); } catch { failed = true; }
      await Promise.allSettled([...mutations]);
      try { await client?.auth.stopAutoRefresh?.(); } catch { failed = true; }
      return failed ? fail('dispose-failed', '账户服务已关闭，但部分后台资源未能正常停止。') : result(true, 'disposed', '账户服务已关闭。');
    },
  };
  return Object.freeze(service);
}
