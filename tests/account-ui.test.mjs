import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('homepage exposes an account trigger and isolated module/style hooks', async () => {
  const html = await read('index.html');
  assert.match(html, /<button[^>]+data-account-trigger[^>]*>登录\s*\/\s*注册<\/button>/);
  assert.match(html, /href="assets\/auth\/account.css"/);
  assert.match(html, /type="module" src="assets\/auth\/account-bootstrap.mjs"/);
});
test('independent UI has labelled native dialog, visible labels and polite status', async () => {
  const source = await read('assets/auth/account-ui.mjs').catch(() => '');
  assert.match(source, /<dialog[^>]+aria-labelledby="account-title"/);
  assert.match(source, /<label for="account-email"/);
  assert.match(source, /autocomplete="current-password"/);
  assert.match(source, /role="status"/);
  assert.doesNotMatch(source, /user\.email\s*\}/);
});
test('callback captures and scrubs URL before boot and avoids third party assets', async () => {
  const html = await read('auth-callback.html').catch(() => '');
  assert.ok(html.indexOf('history.replaceState') >= 0);
  assert.ok(html.indexOf('history.replaceState') < html.indexOf('account-bootstrap.mjs'));
  assert.match(html, /no-referrer/);
  assert.doesNotMatch(html, /https:\/\/.*(?:script|stylesheet)/);
});
test('SDK loading has a bounded timeout before actionable failure', async () => {
  const source = await read('assets/auth/account-bootstrap.mjs');
  assert.match(source, /setTimeout\(/);
  assert.match(source, /clearTimeout\(/);
});
