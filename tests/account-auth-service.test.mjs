import test from 'node:test';
import assert from 'node:assert/strict';

const moduleUrl = new URL('../assets/auth/auth-service.mjs', import.meta.url);
const api = await import(moduleUrl).catch(() => ({}));
const { validateAuthConfig, validateAuthFields, safeReturnUrl, createAuthService } = api;
const config = { supabaseUrl: 'https://example.supabase.co', publishableKey: 'sb_publishable_example', googleEnabled: true };
const siteUrl = 'https://study.example/course/';
const user = { id: 'u1', email: 'learner@example.com', role: 'admin', user_metadata: { secret: true } };
const credentials = { email: user.email, password: 'long-password-123', confirmPassword: 'long-password-123' };
const tick = () => new Promise(resolve => setTimeout(resolve, 15));
function fixture(overrides = {}) {
  let listener;
  const calls = [];
  const stored = new Map([['unrelated', 'preserved']]);
  const storage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) };
  const auth = {
    onAuthStateChange(fn) { listener = fn; return { data: { subscription: { unsubscribe() { calls.push(['unsubscribe']); } } } }; },
    async getUser() { calls.push(['getUser']); return { data: { user: null }, error: null }; },
    async signInWithPassword(fields) { calls.push(['signIn', fields]); return { data: { user, session: {} }, error: null }; },
    async signUp(fields) { calls.push(['signUp', fields]); return { data: { user, session: null }, error: null }; },
    async resetPasswordForEmail(...args) { calls.push(['reset', ...args]); return { data: {}, error: null }; },
    async signInWithOAuth(fields) { calls.push(['google', fields]); return { data: { url: `https://example.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(`${siteUrl}auth-callback.html`)}` }, error: null }; },
    async exchangeCodeForSession(code) { calls.push(['exchange', code]); return { data: { user, session: {} }, error: null }; },
    async updateUser(fields) { calls.push(['update', fields]); return { data: { user }, error: null }; },
    async signOut(options) { calls.push(['signOut', options]); return { error: null }; },
    stopAutoRefresh() { calls.push(['stopAutoRefresh']); },
    startAutoRefresh() { calls.push(['startAutoRefresh']); },
    ...overrides,
  };
  const service = createAuthService({ config, siteUrl, storage, createClient(url, key, options) { calls.push(['client', url, key, options]); return { auth }; } });
  return { service, auth, calls, stored, storage, emit: (event, session = { user }) => listener(event, session) };
}

test('configuration validates public keys and secure project origins', () => {
  assert.equal(typeof validateAuthConfig, 'function');
  assert.equal(validateAuthConfig(config).ok, true);
  assert.equal(validateAuthConfig({}).code, 'unconfigured');
  for (const supabaseUrl of ['http://example.com', 'javascript:alert(1)', 'https://u:p@example.com', 'https://example.com/path', 'https://example.com?x=1']) {
    assert.equal(validateAuthConfig({ ...config, supabaseUrl }).ok, false, supabaseUrl);
  }
  assert.equal(validateAuthConfig({ ...config, supabaseUrl: 'http://localhost:54321' }).ok, true);
  for (const publishableKey of ['sb_secret_bad', 'service_role', 'anything', jwt('service_role'), jwt('authenticated')]) {
    assert.equal(validateAuthConfig({ ...config, publishableKey }).ok, false);
  }
  assert.equal(validateAuthConfig({ ...config, publishableKey: jwt('anon') }).ok, true);
});
function jwt(role) { return ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify({ role })).toString('base64url'), 'signature'].join('.'); }

test('fields enforce new-password confirmation but permit existing short login passwords', () => {
  assert.equal(typeof validateAuthFields, 'function');
  assert.equal(validateAuthFields('login', { ...credentials, password: 'old' }).ok, true);
  assert.equal(validateAuthFields('login', { ...credentials, password: '' }).ok, false);
  assert.equal(validateAuthFields('signup', credentials).ok, true);
  assert.equal(validateAuthFields('signup', { ...credentials, password: 'short', confirmPassword: 'short' }).ok, false);
  assert.equal(validateAuthFields('reset-password', { ...credentials, confirmPassword: 'different' }).ok, false);
  assert.equal(validateAuthFields('forgot', { email: 'not-an-email' }).ok, false);
  assert.equal(validateAuthFields('forgot', { email: ' learner@example.com ' }).fields.email, user.email);
});

test('return URL whitelist is same-origin and within the site base', () => {
  assert.equal(typeof safeReturnUrl, 'function');
  for (const value of ['world-map.html', 'art-history-map.html', '/course/index.html']) assert.equal(safeReturnUrl(value, siteUrl), new URL(value, siteUrl).href);
  for (const value of ['//evil.test/course/index.html', 'https://evil.test', 'https://u:p@study.example/course/index.html', '/index.html', 'account.html', 'javascript:alert(1)', 'world-map.html?token=x', 'world-map.html#x']) assert.equal(safeReturnUrl(value, siteUrl), `${siteUrl}index.html`, value);
});

test('missing configuration performs no SDK construction and exposes immediate immutable state', async () => {
  assert.equal(typeof createAuthService, 'function');
  const service = createAuthService({ config: {}, siteUrl, createClient() { assert.fail('must not construct'); } });
  let state;
  const unsubscribe = service.subscribe(value => { state = value; });
  assert.equal(state.status, 'unconfigured');
  assert.ok(Object.isFrozen(state));
  assert.equal((await service.initialize()).code, 'unconfigured');
  assert.equal((await service.signIn(credentials)).code, 'unconfigured');
  unsubscribe(); service.dispose();
});

test('initialization uses PKCE and verifies user rather than reading an untrusted session', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; } });
  assert.equal((await f.service.initialize()).ok, true);
  assert.deepEqual(f.calls[0][3].auth, { flowType: 'pkce', detectSessionInUrl: false, autoRefreshToken: true, persistSession: true, storage: f.storage, storageKey: 'magic-history-auth:example.supabase.co' });
  assert.deepEqual(f.service.getState().user, { id: 'u1', email: user.email });
  assert.equal(f.service.getState().status, 'authenticated');
  f.service.dispose();
});

test('login verifies provider identity and redacts raw errors', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; } });
  await f.service.initialize();
  assert.equal((await f.service.signIn(credentials)).ok, true);
  f.auth.signInWithPassword = async () => { throw new Error('raw secret provider stack'); };
  const result = await f.service.signIn(credentials);
  assert.equal(result.ok, false);
  assert.ok(!JSON.stringify(result).includes('raw secret'));
  f.service.dispose();
});

test('signup confirmation and reset-email responses do not expose account existence', async () => {
  const f = fixture(); await f.service.initialize();
  assert.equal((await f.service.signUp(credentials)).code, 'confirmation-required');
  assert.equal(f.service.getState().status, 'guest');
  assert.equal(f.calls.find(x => x[0] === 'signUp')[1].options.emailRedirectTo, `${siteUrl}auth-callback.html`);
  assert.equal((await f.service.requestPasswordReset({ email: user.email })).ok, true);
  assert.equal(f.calls.find(x => x[0] === 'reset')[2].redirectTo, `${siteUrl}auth-callback.html`);
  f.service.dispose();
});

test('OAuth returns a validated provider URL and never redirects inside the adapter', async () => {
  const f = fixture(); await f.service.initialize();
  assert.match((await f.service.signInGoogle()).url, /^https:\/\/example.supabase.co\/auth\/v1\/authorize\?/);
  assert.equal(f.calls.find(x => x[0] === 'google')[1].options.skipBrowserRedirect, true);
  f.auth.signInWithOAuth = async () => ({ data: { url: 'javascript:alert(1)' }, error: null });
  assert.equal((await f.service.signInGoogle()).ok, false);
  f.service.dispose();
});

test('PKCE callback exchanges once, verifies identity and rejects implicit/error/replayed callbacks', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; } });
  await f.service.initialize();
  assert.equal((await f.service.handleCallback({ search: '?code=one', hash: '' })).ok, true);
  assert.equal((await f.service.handleCallback({ search: '?code=one', hash: '' })).ok, false);
  for (const value of [{ search: '', hash: '#access_token=forged&type=recovery' }, { search: '?error=access_denied&error_description=secret', hash: '' }, { search: '', hash: '' }]) assert.equal((await f.service.handleCallback(value)).ok, false);
  assert.equal(f.calls.filter(x => x[0] === 'exchange').length, 1);
  f.service.dispose();
});

test('a forged session event cannot authenticate without getUser verification', async () => {
  const f = fixture(); await f.service.initialize();
  f.emit('SIGNED_IN'); await tick();
  assert.equal(f.service.getState().user, null);
  assert.notEqual(f.service.getState().status, 'authenticated');
  f.service.dispose();
});

test('recovery requires a verified PASSWORD_RECOVERY event and is consumed after update', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; } });
  await f.service.initialize();
  assert.equal((await f.service.updatePassword(credentials)).ok, false);
  await f.service.handleCallback({ search: '?code=normal&type=recovery', hash: '' });
  assert.equal((await f.service.updatePassword(credentials)).ok, false);
  f.emit('PASSWORD_RECOVERY'); await tick();
  assert.equal(f.service.getState().status, 'recovery');
  assert.equal((await f.service.updatePassword(credentials)).ok, true);
  assert.equal(f.service.getState().recovery, false);
  assert.equal((await f.service.updatePassword(credentials)).ok, false);
  f.service.dispose();
});

test('expired recovery user cannot change a password', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; } });
  await f.service.initialize(); f.emit('PASSWORD_RECOVERY'); await tick();
  f.auth.getUser = async () => ({ data: { user: null }, error: { message: 'expired' } });
  assert.equal((await f.service.updatePassword(credentials)).ok, false);
  assert.equal(f.calls.filter(x => x[0] === 'update').length, 0);
  assert.equal(f.service.getState().recovery, false);
  f.service.dispose();
});

test('provider reads are scheduled outside the synchronous auth event lock', async () => {
  let locked = false;
  const f = fixture({ async getUser() { assert.equal(locked, false); return { data: { user }, error: null }; } });
  await f.service.initialize(); locked = true; f.emit('TOKEN_REFRESHED'); locked = false; await tick();
  assert.equal(f.service.getState().status, 'authenticated'); f.service.dispose();
});

test('signout clears local state and persisted session even when provider logout fails', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; }, async signOut(options) { f.calls.push(['signOut', options]); return { error: new Error('network raw') }; } });
  await f.service.initialize();
  f.stored.set('magic-history-auth:example.supabase.co', 'SDK token');
  f.stored.set('magic-history-auth:example.supabase.co-code-verifier', 'SDK verifier');
  const result = await f.service.signOut();
  assert.equal(result.ok, false); assert.equal(f.service.getState().status, 'guest');
  assert.deepEqual(f.calls.find(x => x[0] === 'signOut')[1], { scope: 'local' });
  assert.ok(f.calls.some(x => x[0] === 'stopAutoRefresh'));
  assert.deepEqual([...f.stored], [['unrelated', 'preserved']]);
  f.emit('TOKEN_REFRESHED'); await tick(); assert.equal(f.service.getState().user, null);
  f.service.dispose();
});

test('stale getUser cannot resurrect a signed-out or disposed user', async () => {
  for (const action of ['signOut', 'dispose']) {
    let resolve;
    const f = fixture({ getUser() { return new Promise(r => { resolve = r; }); } });
    const pending = f.service.initialize();
    await Promise.resolve();
    await f.service[action]();
    resolve({ data: { user }, error: null }); await pending;
    assert.equal(f.service.getState().user, null);
  }
});

test('SDK USER_UPDATED event does not cancel a successful password update or preserve recovery privilege', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; }, async updateUser() { f.emit('USER_UPDATED'); return { data: { user }, error: null }; } });
  await f.service.initialize(); f.emit('PASSWORD_RECOVERY'); await tick();
  assert.equal((await f.service.updatePassword(credentials)).ok, true);
  await tick();
  assert.equal(f.service.getState().recovery, false);
  assert.equal((await f.service.updatePassword(credentials)).ok, false);
  f.service.dispose();
});

test('initial-session notification cannot race initialization into a cancelled result', async () => {
  let listener;
  const f = fixture({ onAuthStateChange(fn) { listener = fn; queueMicrotask(() => listener('INITIAL_SESSION', { user })); return { data: { subscription: { unsubscribe() {} } } }; }, async getUser() { await Promise.resolve(); return { data: { user }, error: null }; } });
  assert.equal((await f.service.initialize()).ok, true);
  f.service.dispose();
});

test('cross-reload SDK persistence is empty after failed logout and unrelated data survives', async () => {
  const f = fixture({ async signOut() { throw new Error('offline'); } });
  await f.service.initialize();
  const key = f.calls[0][3].auth.storageKey;
  f.storage.setItem(key, 'SDK session');
  await f.service.signOut(); f.service.dispose();
  const reloaded = createAuthService({ config, siteUrl, storage: f.storage, createClient(url, publicKey, options) {
    return { auth: { ...f.auth, async getUser() { return { data: { user: options.auth.storage.getItem(options.auth.storageKey) ? user : null }, error: null }; } } };
  } });
  await reloaded.initialize();
  assert.equal(reloaded.getState().status, 'guest');
  assert.equal(f.storage.getItem('unrelated'), 'preserved');
  reloaded.dispose();
});

test('callback awaits server-verified recovery proof before returning', async () => {
  let reads = 0;
  const f = fixture({ async getUser() { if (++reads === 2) await tick(); return { data: { user }, error: null }; }, async exchangeCodeForSession() { f.emit('PASSWORD_RECOVERY'); return { data: { user, session: {} }, error: null }; } });
  await f.service.initialize();
  const result = await f.service.handleCallback({ search: '?code=recover-once' });
  assert.equal(result.code, 'recovery');
  assert.equal(f.service.getState().status, 'recovery');
  f.service.dispose();
});

test('logout waits for pending SDK token writes before clearing owned persistence', async () => {
  let finishLogin;
  const f = fixture({ signInWithPassword() { return new Promise(resolve => { finishLogin = () => { f.storage.setItem('magic-history-auth:example.supabase.co', 'late SDK session'); resolve({ data: { user, session: {} }, error: null }); }; }); } });
  await f.service.initialize();
  const login = f.service.signIn(credentials);
  const logout = f.service.signOut();
  await Promise.resolve(); finishLogin();
  await Promise.all([login, logout]);
  assert.equal(f.storage.getItem('magic-history-auth:example.supabase.co'), null);
  assert.equal(f.service.getState().user, null);
  f.service.dispose();
});

test('OAuth redirect must match the provider origin and authorization endpoint', async () => {
  const f = fixture(); await f.service.initialize();
  for (const url of ['https://example.supabase.co:444/auth/v1/authorize', 'https://example.supabase.co/arbitrary-path', 'https://accounts.google.com:444/o/oauth2/auth', 'https://accounts.google.com/arbitrary-path', 'https://evil.test/auth/v1/authorize']) {
    f.auth.signInWithOAuth = async () => ({ data: { url }, error: null });
    assert.equal((await f.service.signInGoogle()).ok, false, url);
  }
  f.auth.signInWithOAuth = async () => ({ data: { url: `https://example.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(`${siteUrl}auth-callback.html`)}` }, error: null });
  assert.equal((await f.service.signInGoogle()).ok, true);
  f.service.dispose();
});

test('a recovery verification exception clears in-memory reset privilege', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; } });
  await f.service.initialize(); f.emit('PASSWORD_RECOVERY'); await tick();
  f.auth.getUser = async () => { throw new Error('offline secrets'); };
  const result = await f.service.updatePassword(credentials);
  assert.equal(result.ok, false);
  assert.equal(f.service.getState().recovery, false);
  assert.equal(f.calls.filter(x => x[0] === 'update').length, 0);
  f.service.dispose();
});

test('recovery privilege is never restored from an ordinary persisted user after reload', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; } });
  await f.service.initialize();
  assert.equal(f.service.getState().recovery, false);
  assert.equal((await f.service.updatePassword(credentials)).code, 'recovery-required');
  f.service.dispose();
});

test('invalid configuration constructs no provider client and all actions fail safely', async () => {
  const service = createAuthService({ config: { ...config, publishableKey: 'sb_secret_forbidden' }, siteUrl, createClient() { assert.fail('secret config must not be used'); } });
  assert.equal(service.getState().status, 'error');
  assert.equal((await service.initialize()).ok, false);
  for (const operation of ['signIn', 'signUp', 'requestPasswordReset', 'signInGoogle', 'handleCallback', 'updatePassword', 'signOut']) assert.equal((await service[operation](credentials)).ok, false);
  service.dispose();
});

test('OAuth rejects direct Google endpoints and missing, duplicate or changed callback destinations', async () => {
  const f = fixture(); await f.service.initialize();
  for (const url of [
    'https://accounts.google.com/o/oauth2/auth',
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://example.supabase.co/auth/v1/authorize?provider=google',
    'https://example.supabase.co/auth/v1/authorize?redirect_to=https%3A%2F%2Fevil.test%2F',
    `https://example.supabase.co/auth/v1/authorize?redirect_to=${encodeURIComponent(`${siteUrl}auth-callback.html`)}&redirect_to=${encodeURIComponent(`${siteUrl}auth-callback.html`)}`,
  ]) {
    f.auth.signInWithOAuth = async () => ({ data: { url }, error: null });
    assert.equal((await f.service.signInGoogle()).ok, false, url);
  }
  f.service.dispose();
});

test('dispose returns a structured result, stops refresh and preserves normal SDK persistence', async () => {
  const f = fixture({ async getUser() { return { data: { user }, error: null }; } });
  await f.service.initialize();
  f.storage.setItem('magic-history-auth:example.supabase.co', 'retained SDK session');
  const result = await f.service.dispose();
  assert.equal(result.ok, true);
  assert.equal(result.code, 'disposed');
  assert.equal(typeof result.message, 'string');
  assert.ok(f.calls.some(x => x[0] === 'stopAutoRefresh'));
  assert.equal(f.storage.getItem('magic-history-auth:example.supabase.co'), 'retained SDK session');
  assert.equal(f.calls.filter(x => x[0] === 'signOut').length, 0);
  assert.equal((await f.service.dispose()).ok, true);
});

test('verified explicit login, immediate signup and callback restart refresh after logout', async () => {
  for (const action of ['signIn', 'signUp', 'handleCallback']) {
    const f = fixture({
      async getUser() { return { data: { user }, error: null }; },
      async signUp() { return { data: { user, session: {} }, error: null }; },
    });
    await f.service.initialize(); await f.service.signOut();
    const before = f.calls.filter(x => x[0] === 'startAutoRefresh').length;
    const outcome = await f.service[action](action === 'handleCallback' ? { search: '?code=new-login' } : credentials);
    assert.equal(outcome.ok, true, action);
    assert.equal(f.calls.filter(x => x[0] === 'startAutoRefresh').length, before + 1, action);
    await f.service.dispose();
  }
});

test('unverified login never restarts refresh after logout', async () => {
  const f = fixture(); await f.service.initialize(); await f.service.signOut();
  assert.equal((await f.service.signIn(credentials)).ok, false);
  assert.equal(f.calls.filter(x => x[0] === 'startAutoRefresh').length, 0);
  await f.service.dispose();
});

test('logout and disposal stop a concurrent delayed refresh restart', async () => {
  for (const action of ['signOut', 'dispose']) {
    let finishStart;
    let active = false;
    const f = fixture({
      async getUser() { return { data: { user }, error: null }; },
      startAutoRefresh() { return new Promise(resolve => { finishStart = () => { active = true; resolve(); }; }); },
      stopAutoRefresh() { active = false; },
    });
    await f.service.initialize();
    const login = f.service.signIn(credentials);
    for (let attempt = 0; attempt < 20 && !finishStart; attempt++) await Promise.resolve();
    assert.equal(typeof finishStart, 'function');
    const cleanup = f.service[action]();
    finishStart(); await Promise.all([login, cleanup]);
    assert.equal(active, false, action);
    assert.equal(f.service.getState().user, null, action);
    await f.service.dispose();
  }
});
