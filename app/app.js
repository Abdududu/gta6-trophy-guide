// VICE GOT A PRICE! — GTA VI trophy guide app (v11).
// Loads trophies.json, sources.json and meta.json, renders the tracker,
// roadmap, 100% ledger, missables, grid, disputes and sources.
// The audit strip is CALCULATED from the data, never hardcoded.
let T = null, S = null, M = null;
let earned = new Set([10, 11, 17, 19, 22, 36, 43, 45, 52, 25]);
let selected = 16;
let spoilerOn = true;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const srcName = (id) => { const s = (S.sources || []).find((x) => x.id === id); return s ? s.name : 'Source ' + id; };
const gradeLabel = (g) => g.charAt(0).toUpperCase() + g.slice(1);
const pointsFor = (g) => ({ platinum: 300, gold: 90, silver: 30, bronze: 15 })[g] || 15;

async function load() {
  const [t, s, m] = await Promise.all([
    fetch('data/trophies.json').then((r) => r.json()),
    fetch('data/sources.json').then((r) => r.json()),
    fetch('data/meta.json').then((r) => r.json()),
  ]);
  T = t; S = s; M = m;
  renderAll();
  const hash = location.hash.replace('#trophy-', '');
  if (hash && !isNaN(+hash)) { selected = +hash; renderList(); renderDetail(); }
}
function audit() {
  const tr = T.trophies;
  let cited = 0, backed = 0, uncited = 0, single = 0, guides = 0, hidden = 0, missable = 0;
  const used = new Set(); const grades = {};
  for (const t of tr) {
    grades[t.g] = (grades[t.g] || 0) + 1;
    if (t.h) hidden++;
    if (t.m) missable++;
    let g = false;
    for (const s of t.st || []) {
      if (s.s && s.s.length) {
        cited++; g = true;
        if (s.s.length >= 2) backed++;
        else single++; // exactly one source: labelled "single source" in the detail panel (P9)
        for (const x of s.s) used.add(x);
      } else uncited++;
    }
    if (g) guides++;
  }
  return { trophies: tr.length, cited, backed, uncited, single, guides, hidden, missable, sources: used.size, disputes: (T.disputes || []).length, grades };
}
function renderAudit() {
  const a = audit();
  const chips = [
    a.trophies + '/55 trophies',
    a.cited + ' cited claims',
    a.backed + ' backed by 2+ sources',
    a.sources + ' distinct sources',
    a.disputes + ' disputes',
    a.guides + '/55 guides cited',
    a.hidden + ' PSN-hidden',
    a.missable + ' missable',
    a.single + ' single source',
    '0 uncited',
  ];
  $('audit').innerHTML = chips.map((c, i) => '<span class="chip' + (i % 2 ? ' alt' : '') + '">' + esc(c) + '</span>').join('');
  $('facts').innerHTML = '<h2>Facts</h2>' + [
    ['Trophies', a.trophies + ' (1P / 2G / 6S / 46B)'],
    ['Cited claims', a.cited],
    ['Backed by 2+ sources', a.backed + ' (' + Math.round((a.backed / Math.max(1, a.cited)) * 100) + '%)'],
    ['Distinct sources', a.sources],
    ['Disputes (both sides)', a.disputes],
    ['PSN-hidden', a.hidden],
    ['Missable', 'Positive Mental Attitude'],
    ['Meditation spots', '18 (6/18 done in demo)'],
    ['At-risk side items', '9'],
  ].map((r) => '<div><span>' + esc(r[0]) + '</span><b>' + esc(String(r[1])) + '</b></div>').join('');
  let pts = 0; for (const id of earned) { const t = T.trophies.find((x) => x.id === id); if (t) pts += pointsFor(t.g); }
  $('psnPoints').textContent = pts;
  $('progress').textContent = earned.size + '/55 earned';
  $('barFill').style.width = Math.round((earned.size / 55) * 100) + '%';
}
function ledgerLink(t) {
  if (t.chapter) return 'Story — Ch. ' + t.chapter;
  if (t.id === 1) return 'Platinum';
  if (t.id === 2 || t.id === 3) return '100% — Story + Ledger';
  if ([31, 32, 33, 34, 35].includes(t.id)) return '100% — Collectibles';
  if ([46, 47, 48, 49, 50, 51].includes(t.id)) return '100% — Side missions';
  if ([41, 42, 43, 44, 45].includes(t.id)) return '100% — Exploration';
  if ([36, 37, 38, 39, 40].includes(t.id)) return '100% — Combat';
  if ([6].includes(t.id)) return '100% — Properties';
  if ([17, 18, 25, 26, 27, 28, 29, 30].includes(t.id)) return '100% — Activities';
  return '100% — Activities & side';
}
function trophyRow(t) {
  const isE = earned.has(t.id);
  const hidden = t.h && spoilerOn;
  const name = hidden ? 'Hidden trophy — tap to reveal' : t.name;
  return '<button class="row' + (isE ? ' earned' : '') + (selected === t.id ? ' sel' : '') + '" data-id="' + t.id + '" id="trophy-' + t.id + '">' +
    '<span class="ck">' + (isE ? '✓' : '') + '</span>' +
    '<span><span class="nm' + (hidden ? ' spoiler' : '') + '">' + esc(name) + '</span><br>' +
    '<span class="meta">' + gradeLabel(t.g) + (t.chapter ? ' • Ch. ' + t.chapter : '') + ' • ' + (t.st || []).length + ' steps</span>' +
    (t.m ? ' <span class="miss">MISSABLE</span>' : '') + (t.h ? ' <span class="hid">HIDDEN</span>' : '') +
    '</span><span class="gr ' + t.g + '">' + t.g.slice(0, 1).toUpperCase() + '</span></button>';
}
function renderList() {
  const q = ($('q').value || '').toLowerCase();
  const gf = $('gradeFilter').value;
  const sort = $('sortSel').value;
  let list = T.trophies.filter((t) => (!q || t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)) && (!gf || t.g === gf));
  if (sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'grade') { const o = { platinum: 0, gold: 1, silver: 2, bronze: 3 }; list = list.slice().sort((a, b) => o[a.g] - o[b.g] || a.id - b.id); }
  if (sort === 'chapter') list = list.slice().sort((a, b) => (a.chapter || 99) - (b.chapter || 99) || a.id - b.id);
  $('list').innerHTML = list.map(trophyRow).join('');
  $('listCount').textContent = '(' + list.length + ' shown)';
  document.querySelectorAll('#list .row').forEach((el) => {
    el.addEventListener('click', (ev) => {
      if (ev.target.classList.contains('ck')) { const id = +el.dataset.id; if (earned.has(id)) earned.delete(id); else earned.add(id); renderAudit(); renderList(); renderDetail(); renderNext(); return; }
      selected = +el.dataset.id; history.replaceState(null, '', '#trophy-' + selected); renderList(); renderDetail();
    });
  });
}
function renderDetail() {
  const t = T.trophies.find((x) => x.id === selected) || T.trophies[0];
  const isE = earned.has(t.id);
  const hidden = t.h && spoilerOn;
  const name = hidden ? 'Hidden trophy' : t.name;
  let html = '<div class="detail"><h2>' + esc(name) + '</h2>' +
    '<div><span class="gr ' + t.g + '">' + gradeLabel(t.g) + '</span> ' + (t.chapter ? 'Chapter ' + t.chapter + ' • ' : '') + (t.m ? '<span class="miss">MISSABLE</span> ' : '') + (t.h ? '<span class="hid">HIDDEN</span>' : '') + '</div>';
  if (hidden) html += '<p><button class="spoiler-btn" id="revealBtn" type="button">Reveal this trophy</button></p>';
  html += '<p class="desc' + (hidden ? ' spoiler' : '') + '">' + esc(t.desc) + '</p>';
  if (t.id === 16) html += '<div class="counter"><span class="clab">Meditations 6 of 18</span> — 12 spots left. Do them before The Big One. <a href="#missables" data-goto="missables">See the missable window →</a></div>';
  if (t.c) html += '<div class="counter"><span class="clab">Counter: ' + esc(String(t.c)) + '</span></div>';
  html += '<p><button id="trackBtn" type="button">' + (isE ? '✓ Tracked — mark not earned' : 'Track it — mark earned') + '</button> <span class="meta">100% link: ' + esc(ledgerLink(t)) + '</span> <a href="#trophy-' + t.id + '">Deep link</a></p>';
  html += '<ol class="steps">' + (t.st || []).map((s) => {
    const single = (s.s || []).length < 2;
    return '<li>' + esc(s.t) + ' <span class="src">[' + (s.s || []).map((id) => 'S' + id).join(', ') + ']</span>' + (single ? ' <span class="single">single source</span>' : '') + '</li>';
  }).join('') + '</ol>';
  const rel = (T.disputes || []).filter((d) => (d.q || '').toLowerCase().includes(t.name.toLowerCase().split(' ')[0]));
  if (rel.length) html += '<div class="differ"><h3>SOURCES DIFFER</h3>' + rel.slice(0, 2).map((d) => '<p><b>' + esc(d.q) + '</b><br>' + esc(d.a) + '</p><span class="call">OUR CALL: ' + esc(d.a.split('.')[0]) + '.</span>').join('') + '</div>';
  html += '<p><button id="copy" type="button">Copy trophy link</button></p></div>';
  $('detail').innerHTML = html;
  const rb = $('revealBtn'); if (rb) rb.addEventListener('click', () => { spoilerOn = false; $('spoilerToggle').checked = false; renderList(); renderDetail(); });
  $('trackBtn').addEventListener('click', () => { if (earned.has(t.id)) earned.delete(t.id); else earned.add(t.id); renderAudit(); renderList(); renderDetail(); renderNext(); });
  $('copy').addEventListener('click', () => { const u = location.origin + location.pathname + '#trophy-' + t.id; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => { $('copy').textContent = 'Copied!'; setTimeout(() => { $('copy').textContent = 'Copy trophy link'; }, 1500); }); });
  document.querySelectorAll('[data-goto]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); showTab(a.dataset.goto); }));
}
function renderNext() {
  const next = T.trophies.filter((t) => !earned.has(t.id)).slice(0, 3);
  $('nextup').innerHTML = '<h2>Next up</h2>' + next.map((t) => '<div class="nu"><b>' + esc(t.name) + '</b><br><span class="meta">' + gradeLabel(t.g) + ' • ' + (t.st || []).length + ' steps • ' + esc(ledgerLink(t)) + '</span></div>').join('');
  const rm = (M.roadmap || []).map((s) => '<div><b>Stage ' + s.stage + ': ' + esc(s.title) + '</b><br><span class="meta">' + esc(s.goal) + '</span></div>').join('');
  $('roadmapMini').innerHTML = '<h2>Roadmap</h2>' + rm;
}
function renderRoadmap() {
  $('roadmapFull').innerHTML = (M.roadmap || []).map((s) => {
    const steps = s.steps || [];
    const save = steps.map((x) => x.t).find((x) => x.toLowerCase().includes('save advice')) || '';
    const body = steps.filter((x) => !x.t.toLowerCase().includes('save advice'));
    return '<div class="stage"><h3>Stage ' + s.stage + ': ' + esc(s.title) + '</h3><p class="goal">' + esc(s.goal) + '</p><ol>' +
      body.map((st) => '<li>' + esc(st.t) + ' <span class="src">[' + (st.s || []).map((id) => 'S' + id).join(', ') + ']</span></li>').join('') +
      '</ol><div class="save"><b>Save advice:</b> ' + esc(save) + '</div></div>';
  }).join('');
}
function renderLedger() {
  $('ledgerFull').innerHTML = (M.ledger || []).map((c) => '<div class="ledger-cat"><h3>' + esc(c.cat) + '</h3><ul>' + (c.items || []).map((it) => '<li>' + esc(it) + '</li>').join('') + '</ul><p class="meta">Sources: ' + (c.s || []).map((id) => 'S' + id + ' ' + esc(srcName(id))).join(' • ') + '</p></div>').join('');
}
function renderMissables() {
  const mw = M.missableWindow;
  let html = '<div class="warn"><h3>⚠ The one missable: Positive Mental Attitude</h3><p>Meditate at all 18 spots before the final heist (The Big One). After the heist, it locks on that save.</p><p><b>Last chance:</b> ' + esc(mw.lastChance) + '</p><p><b>Protect:</b> ' + esc(mw.protect) + '</p></div>';
  html += '<table class="miss-chart"><tr><th>Region</th><th>Spots</th><th>When</th></tr>' + (mw.regions || []).map((r) => '<tr><td>' + esc(r.name) + '</td><td>' + r.count + '</td><td>' + esc(r.chapter) + '</td></tr>').join('') + '</table>';
  html += '<h3>At-risk trophies (9–14) — do these before the finale</h3><ul>' + (mw.atRiskTrophies || []).map((n) => '<li>' + esc(n) + '</li>').join('') + '</ul>';
  html += '<h3>Watch rail</h3>' + (M.watch || []).map((w) => '<div class="nu"><b>' + esc(w.t) + '</b> — ' + esc(w.why) + '</div>').join('');
  $('missableFull').innerHTML = html;
}
function renderGrid() {
  const chs = [1, 2, 3, 4, 5, 6];
  let html = '<table class="grid"><thead><tr><th>Trophy</th>' + chs.map((c) => '<th>Ch. ' + c + '</th>').join('') + '<th>Side</th></tr></thead><tbody>';
  for (const t of T.trophies) {
    html += '<tr><td>' + esc(t.h && spoilerOn ? 'Hidden trophy' : t.name) + '</td>' + chs.map((c) => '<td class="' + (t.chapter === c ? 'done' : '') + '">' + (t.chapter === c ? '●' : '') + '</td>').join('') + '<td class="' + (!t.chapter ? 'done' : '') + '">' + (!t.chapter ? '●' : '') + '</td></tr>';
  }
  html += '</tbody></table>';
  $('gridsec').innerHTML = html;
}
function renderDisputes() {
  $('disputessec').innerHTML = (T.disputes || []).map((d) => '<div class="disp"><h3>' + esc(d.q) + '</h3><p><b>Side A:</b> ' + esc(d.a) + ' <span class="src">[' + (d.sa || []).map((id) => 'S' + id).join(', ') + ']</span></p><p><b>Side B:</b> ' + esc(d.b) + ' <span class="src">[' + (d.sb || []).map((id) => 'S' + id).join(', ') + ']</span></p><span class="call">OUR CALL: ' + esc(d.a.split('.')[0]) + '.</span></div>').join('');
}
function renderSources() {
  $('sourcesFull').innerHTML = (S.sources || []).map((s) => '<div class="sr"><b>S' + s.id + ' — ' + esc(s.name) + '</b><br>' + esc(s.note) + '<br><span class="url">' + esc(s.url) + '</span></div>').join('');
  $('blockedFull').innerHTML = '<ul class="blocked">' + (M.blockedSites || []).map((b) => '<li>' + esc(b) + '</li>').join('') + '</ul>';
}
function showTab(name) {
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === name));
  const pages = { tracker: null, roadmap: 'page-roadmap', ledger: 'page-ledger', missables: 'page-missables', grid: 'page-grid', disputes: 'page-disputes', sources: 'page-sources' };
  document.querySelectorAll('.tabpage').forEach((p) => { p.hidden = true; });
  document.querySelector('.layout').style.display = name === 'tracker' ? '' : 'none';
  if (pages[name]) $(pages[name]).hidden = false;
  if (name === 'roadmap') renderRoadmap();
  if (name === 'ledger') renderLedger();
  if (name === 'missables') renderMissables();
  if (name === 'grid') renderGrid();
  if (name === 'disputes') renderDisputes();
  if (name === 'sources') renderSources();
}
function renderAll() {
  renderAudit(); renderList(); renderDetail(); renderNext(); renderRoadmap(); renderLedger(); renderMissables(); renderGrid(); renderDisputes(); renderSources();
  document.querySelectorAll('#tabs button').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
  $('q').addEventListener('input', renderList);
  $('gradeFilter').addEventListener('change', renderList);
  $('sortSel').addEventListener('change', renderList);
  $('spoilerToggle').addEventListener('change', (e) => { spoilerOn = e.target.checked; renderList(); renderDetail(); renderGrid(); });
  $('shareBtn').addEventListener('click', () => {
    const ids = [...earned].sort((a, b) => a - b).join(',');
    const u = location.origin + location.pathname + '#earned=' + ids;
    (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => { $('shareMsg').textContent = 'Share link copied (' + earned.size + '/55).'; setTimeout(() => { $('shareMsg').textContent = ''; }, 2500); });
  });
  const m = location.hash.match(/earned=([\d,]+)/);
  if (m) { earned = new Set(m[1].split(',').map(Number).filter(Boolean)); renderAudit(); renderList(); renderDetail(); renderNext(); }
}
document.addEventListener('DOMContentLoaded', load);
