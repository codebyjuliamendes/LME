import { test } from 'node:test';
import assert from 'node:assert/strict';
import { suggestMatches, journey, indicators, toCsv, tokens } from '../app/js/logic.js';
import { seed } from '../app/js/seed.js';

const d = seed();
const byId = id => d.profiles.find(p => p.id === id);

test('tokens remove acentos e palavras vazias', () => {
  assert.deepEqual(tokens('Um sócio técnico para validar'), ['socio', 'tecnico', 'validar']);
});

test('LME Connect sugere quem oferece o que foi pedido', () => {
  const julia = byId('u-julia');
  const out = suggestMatches({ text: 'Um sócio técnico para validar um app de agendamento', type: 'Founder + Founder' }, julia, d.profiles, d.connections);
  assert.ok(out.length > 0 && out.length <= 3);
  const ids = out.map(o => o.profile.id);
  assert.ok(ids.includes('u-mateus'), 'Mateus oferece desenvolvimento mobile e MVP');
  assert.ok(!ids.includes('u-julia'), 'não sugere quem pediu');
  assert.ok(!ids.includes('u-beatriz'), 'não sugere quem já está conectado');
  assert.match(out[0].reason, /Posso ajudar|competência/);
});

test('LME Connect não inventa sugestão quando ninguém oferece o tema', () => {
  const out = suggestMatches({ text: 'astronomia quântica medieval', type: '' }, byId('u-julia'), d.profiles, d.connections);
  assert.equal(out.length, 0);
});

test('jornada conta etapas a partir da atividade real', () => {
  const j = journey(byId('u-julia'), d);
  assert.equal(j.done.length, 10);
  assert.equal(j.done[0], true);
  assert.equal(j.done[1], true, 'perfil completo');
  assert.equal(j.done[2], true, 'confirmou o encontro de boas-vindas');
  assert.equal(j.done[4], true, 'pediu conexões');
  assert.equal(j.count, j.done.filter(Boolean).length);
  const fresh = { id: 'novo', onboarded: false };
  const jf = journey(fresh, d);
  assert.equal(jf.count, 1);
  assert.equal(jf.next.step, 'Fez o Perfil LME');
});

test('indicadores somam valor gerado e contam membros por perfil', () => {
  const k = indicators(d);
  assert.equal(k.members, d.profiles.length);
  assert.equal(k.value.savings, 180 + 900 + 540);
  assert.equal(k.value.impact, 3000 + 4800);
  assert.equal(k.value.total, k.value.savings + k.value.impact);
  assert.equal(k.byProfile['Explorador'], 1);
  assert.equal(k.connections, 3);
  assert.equal(k.connectionsFromRequests, 1);
  assert.equal(k.pendingRequests, 3);
  assert.ok(k.activeRate >= 0 && k.activeRate <= 100);
  assert.equal(k.cities[0][0], 'São Luís');
});

test('CSV escapa aspas e junta listas', () => {
  const csv = toCsv([{ a: 'x "y"', b: ['1', '2'] }], [['a', 'A'], ['b', 'B']]);
  assert.equal(csv, '﻿"A","B"\n"x ""y""","1; 2"');
});
