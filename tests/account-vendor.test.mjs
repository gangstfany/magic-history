import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

test('pinned Supabase browser SDK is same-origin, intact and exposes createClient',()=>{
 const code=readFileSync(new URL('../assets/vendor/supabase-js-2.118.0.js',import.meta.url));
 assert.equal(createHash('sha256').update(code).digest('hex'),'ee3be8de192b97cb1d73d1e95d6b82bb1f6b658c0f97c4ef757fc331996ed3d3');
 const context=vm.createContext({console,URL,URLSearchParams,TextEncoder,TextDecoder,AbortController,fetch,setTimeout,clearTimeout,setInterval,clearInterval,crypto:globalThis.crypto});
 vm.runInContext(code.toString(),context);
 assert.equal(typeof context.supabase.createClient,'function');
 const license=readFileSync(new URL('../assets/vendor/SUPABASE-LICENSE',import.meta.url),'utf8');
 assert.match(license,/MIT License/);assert.match(license,/Supabase/);
});
