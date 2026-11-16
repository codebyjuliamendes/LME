/* Camada de dados. Duas implementações com a mesma interface:
   - demo: localStorage, com dados de exemplo (seed.js);
   - supabase: banco e login reais (supabase/schema.sql).
   Interface: list, get, insert, update, remove, auth.{current, onChange, signIn, signOut, demoUsers, demoSignIn}. */
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { seed } from './seed.js';

export const MODE = SUPABASE_URL && SUPABASE_ANON_KEY ? 'supabase' : 'demo';

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2));

function matches(row, eq) {
  return Object.entries(eq || {}).every(([k, v]) => (Array.isArray(row[k]) ? row[k].includes(v) : row[k] === v));
}
function sortRows(rows, order) {
  if (!order) return rows;
  const [field, dir] = order;
  const m = dir === 'desc' ? -1 : 1;
  return rows.slice().sort((a, b) => (a[field] > b[field] ? m : a[field] < b[field] ? -m : 0));
}

// ---------------- Demo (localStorage) ----------------
function demoStore() {
  const KEY = 'lme-demo-v1', SESSION = 'lme-demo-session';
  let mem = null;
  const load = () => {
    if (mem) return mem;
    try { mem = JSON.parse(localStorage.getItem(KEY)); } catch (e) { mem = null; }
    if (!mem || !mem.profiles) { mem = seed(); save(); }
    return mem;
  };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* armazenamento indisponível: segue em memória */ } };
  const table = t => { const d = load(); if (!d[t]) d[t] = []; return d[t]; };
  const listeners = new Set();
  let session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION)); } catch (e) { session = null; }
  const setSession = s => { session = s; try { s ? localStorage.setItem(SESSION, JSON.stringify(s)) : localStorage.removeItem(SESSION); } catch (e) {} listeners.forEach(fn => fn(session)); };

  return {
    async list(t, { eq, order, limit } = {}) { let r = table(t).filter(x => matches(x, eq)); r = sortRows(r, order); return structuredClone(limit ? r.slice(0, limit) : r); },
    async get(t, id) { const r = table(t).find(x => x.id === id); return r ? structuredClone(r) : null; },
    async insert(t, row) { const r = Object.assign({ id: uid(), created_at: new Date().toISOString() }, row); table(t).push(r); save(); return structuredClone(r); },
    async update(t, id, patch) { const r = table(t).find(x => x.id === id); if (!r) throw new Error('Registro não encontrado.'); Object.assign(r, patch); save(); return structuredClone(r); },
    async remove(t, id) { const d = load(); d[t] = table(t).filter(x => x.id !== id); save(); },
    reset() { mem = seed(); save(); setSession(null); },
    auth: {
      async current() { return session; },
      onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
      async signIn(email) {
        // No modo demonstração não há e-mail: quem já tem perfil entra direto; senão vai para o cadastro.
        const p = table('profiles').find(x => (x.email || '').toLowerCase() === email.toLowerCase());
        setSession({ id: p ? p.id : uid(), email });
        return { sent: false };
      },
      async signOut() { setSession(null); },
      async demoUsers() { return table('profiles').filter(p => p.demo_login); },
      async demoSignIn(id) { const p = table('profiles').find(x => x.id === id); setSession({ id: p.id, email: p.email }); }
    }
  };
}

// ---------------- Supabase ----------------
async function supabaseStore() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const run = async q => { const { data, error } = await q; if (error) throw new Error(error.message); return data; };
  return {
    async list(t, { eq, order, limit } = {}) {
      let q = sb.from(t).select('*');
      for (const [k, v] of Object.entries(eq || {})) q = Array.isArray(v) ? q.in(k, v) : q.eq(k, v);
      if (order) q = q.order(order[0], { ascending: order[1] !== 'desc' });
      if (limit) q = q.limit(limit);
      return run(q);
    },
    async get(t, id) { const d = await run(sb.from(t).select('*').eq('id', id).limit(1)); return d[0] || null; },
    async insert(t, row) { const d = await run(sb.from(t).insert(row).select()); return d[0]; },
    async update(t, id, patch) { const d = await run(sb.from(t).update(patch).eq('id', id).select()); return d[0]; },
    async remove(t, id) { await run(sb.from(t).delete().eq('id', id)); },
    auth: {
      async current() { const { data } = await sb.auth.getSession(); const u = data.session && data.session.user; return u ? { id: u.id, email: u.email } : null; },
      onChange(fn) { const { data } = sb.auth.onAuthStateChange((_e, s) => fn(s && s.user ? { id: s.user.id, email: s.user.email } : null)); return () => data.subscription.unsubscribe(); },
      async signIn(email) { const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } }); if (error) throw new Error(error.message); return { sent: true }; },
      async signOut() { await sb.auth.signOut(); },
      async demoUsers() { return []; },
      async demoSignIn() {}
    }
  };
}

export const db = MODE === 'supabase' ? await supabaseStore() : demoStore();
export { uid };
