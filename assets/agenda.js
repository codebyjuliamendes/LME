/* Agenda pública: lê os próximos eventos publicados pela coordenação no Supabase.
   Sem Supabase configurado ou sem eventos, mostra um aviso em vez de datas inventadas. */
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../app/js/config.js';

const TZ = 'America/Fortaleza';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EMPTY = '<div class="card"><h3 class="h3">Próximas datas em breve</h3><p class="muted">A agenda oficial é publicada aqui assim que os encontros forem confirmados. Faça seu Perfil LME para receber os convites.</p><p><a class="btn secondary" href="participar.html">Fazer meu Perfil LME</a></p></div>';

function card(e) {
  const d = new Date(e.starts_at);
  const day = d.toLocaleDateString('pt-BR', { day: '2-digit', timeZone: TZ });
  const mon = d.toLocaleDateString('pt-BR', { month: 'short', timeZone: TZ }).replace('.', '').toUpperCase();
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).replace(':00', 'h').replace(':', 'h');
  const where = e.mode === 'Online' ? 'Online' : [e.place, e.city].filter(Boolean).join(', ');
  return `<article class="card event"><div class="date"><b>${day}</b><span>${mon}</span></div><div class="info"><span class="badge">${esc(e.format || 'Encontro')}</span><h3 class="h3">${esc(e.title)}</h3><p class="muted">${esc(where)} · ${time}</p></div><a class="btn secondary" href="app/#/agenda/${encodeURIComponent(e.id)}">Quero ir</a></article>`;
}

async function load(limit) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  const since = new Date(Date.now() - 3 * 3600000).toISOString();
  const url = `${SUPABASE_URL}/rest/v1/events?select=id,title,format,starts_at,place,city,mode&starts_at=gte.${encodeURIComponent(since)}&order=starts_at.asc&limit=${limit}`;
  const r = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
  if (!r.ok) throw new Error('agenda ' + r.status);
  return r.json();
}

for (const box of document.querySelectorAll('[data-agenda]')) {
  const n = +box.dataset.agenda || 3;
  load(n).then(list => {
    box.className = list.length ? 'grid' : 'grid';
    box.innerHTML = list.length ? list.map(card).join('') : EMPTY;
  }).catch(() => { box.innerHTML = EMPTY; });
}
