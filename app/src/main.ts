import './style.css';
import { TOKENS } from './tokens.generated';
import * as audio from './audio';
import * as log from './log';

const { dragThreshold, cooldown } = TOKENS.input;
const app = document.querySelector<HTMLDivElement>('#app')!;

/* ---- talia: CIG-5.1, dolna granica 6 --------------------------------------- */
const DECK = ['Lola', 'Fistaszek', 'Bruno', 'Miśka', 'Kajtek', 'Tofik'].slice(0, TOKENS.session.deckMin);

type Screen = 'warmup' | 'card' | 'reward' | 'end';
const state = {
  screen: 'warmup' as Screen,
  idx: 0,
  warmHits: 0,
  lockUntil: 0,
  history: [] as { card: string; decision: 'yes' | 'no' }[],
};

/* ---- sylwetka: placeholder do czasu wideo z Groka (CIG-7.5) ---------------- */
const dog = (fill: string, eye: string, size: number) => `
<svg width="${size}" height="${(size * 124) / 120}" viewBox="0 0 120 124" aria-hidden="true">
  <polygon points="32,60 6,4 58,30" fill="${fill}"/><polygon points="88,60 114,4 62,30" fill="${fill}"/>
  <polygon points="60,30 92,58 84,96 60,110 36,96 28,58" fill="${fill}"/>
  <polygon points="60,80 74,96 60,112 46,96" fill="${fill}"/>
  <polygon points="60,98 66,104 60,110 54,104" fill="${eye}"/>
  <polygon points="42,56 52,52 52,64 42,64" fill="${eye}"/><polygon points="78,56 68,52 68,64 78,64" fill="${eye}"/>
</svg>`;
const xGlyph = `<svg class="glyph" viewBox="0 0 104 104"><path d="M14 14 L90 90 M90 14 L14 90" stroke="${TOKENS.color.white}" stroke-width="24"/></svg>`;
const heart = `<svg class="glyph" viewBox="0 0 104 96"><path d="M52 92 L14 52 C0 37 6 12 26 8 C39 5 48 13 52 24 C56 13 65 5 78 8 C98 12 104 37 90 52 Z" fill="${TOKENS.color.ink}"/></svg>`;
const bone = `<svg width="86" height="40" viewBox="0 0 120 56"><rect x="24" y="20" width="72" height="16" fill="${TOKENS.color.ink}"/><rect x="8" y="4" width="28" height="28" fill="${TOKENS.color.ink}"/><rect x="8" y="24" width="28" height="28" fill="${TOKENS.color.ink}"/><rect x="84" y="4" width="28" height="28" fill="${TOKENS.color.ink}"/><rect x="84" y="24" width="28" height="28" fill="${TOKENS.color.ink}"/></svg>`;

/* ---- pomiar dotyku: CIG-3.2, centroid plamy, liczba punktow ignorowana ----- */
function centroid(tl: TouchList) {
  let x = 0, y = 0;
  for (let i = 0; i < tl.length; i++) { x += tl[i]!.clientX; y += tl[i]!.clientY; }
  return { x: x / tl.length, y: y / tl.length };
}
function patchPx(tl: TouchList) {
  let r = 0;
  for (let i = 0; i < tl.length; i++) {
    const t = tl[i]! as Touch & { radiusX?: number; radiusY?: number };
    r = Math.max(r, (t.radiusX ?? 0) * 2, (t.radiusY ?? 0) * 2);
  }
  return r;
}
/** CIG-6.1: nos to jedna plama, wiec dwa punkty ODDALONE o >120 px sa dla niego
 *  niewykonalne. Sam warunek "dwa palce" nie wystarcza, bo iOS potrafi
 *  zaraportowac mokry nos jako kilka punktow. */
function spread(tl: TouchList) {
  let max = 0;
  for (let i = 0; i < tl.length; i++) for (let j = i + 1; j < tl.length; j++) {
    max = Math.max(max, Math.hypot(tl[i]!.clientX - tl[j]!.clientX, tl[i]!.clientY - tl[j]!.clientY));
  }
  return max;
}

/* ---- ekrany ---------------------------------------------------------------- */
function humanbar(who: string) {
  const n = state.idx + 1;
  return `<div class="humanbar">
    <span class="who">${who}</span>
    <span class="right">
      <span class="count">${String(n).padStart(2, '0')} / ${String(DECK.length).padStart(2, '0')}</span>
      <button class="undo" id="undo" ${state.history.length ? '' : 'disabled'}>
        <svg width="15" height="15" viewBox="0 0 24 24"><path d="M4 9 h9 a6 6 0 1 1 0 12 h-5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M8 4 L3.5 9 L8 14" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>
        Cofnij
      </button>
    </span>
  </div>`;
}

function renderWarmup() {
  app.innerHTML = `<div class="screen">
    ${humanbar('Rozgrzewka')}
    <div class="warm">
      <svg class="ball" viewBox="0 0 264 264"><circle cx="132" cy="132" r="130" fill="${TOKENS.color.acid}"/><path d="M132 2 V262" stroke="${TOKENS.color.ink}" stroke-width="9"/><path d="M40 42 C104 90 104 174 40 222" fill="none" stroke="${TOKENS.color.ink}" stroke-width="9"/><path d="M224 42 C160 90 160 174 224 222" fill="none" stroke="${TOKENS.color.ink}" stroke-width="9"/></svg>
      <div class="word">Dotknij</div>
      <div class="hint"><b>Cały ekran jest celem &middot; ${state.warmHits} / 3</b><span>CIG-3.6: to jedyny ekran, na którym liczy się dotknięcie. Trzy trafienia kalibrują plamę kontaktu i odblokowują dźwięk.</span></div>
    </div>
  </div>`;
  wireUndo();
}

function renderCard() {
  const name = DECK[state.idx]!;
  app.innerHTML = `<div class="screen">
    <div class="zones">
      <div class="zone no">${xGlyph}<div class="label">NIE</div></div>
      <div class="zone yes">${heart}<div class="label">TAK</div></div>
    </div>
    <div class="card" id="card">
      <div class="media"><span class="ph">[ placeholder &middot; wideo pyska 4 s ]</span>${dog(TOKENS.color.acid, TOKENS.color.ink, 240)}</div>
      <div class="rule"></div>
      <div class="name"><b>${name}</b><span>4</span></div>
    </div>
    ${humanbar('Karmel')}
    <div class="cooldown" id="cool" style="width:0"></div>
  </div>`;
  wireUndo();
}

function renderReward(name: string) {
  app.innerHTML = `<div class="screen"><div class="reward">
    <div class="big">Lubi<br>${name}</div>
    <div class="treat">${bone}<b>Daj smaczek</b></div>
  </div></div>`;
}

function renderEnd() {
  const yes = state.history.filter((h) => h.decision === 'yes').length;
  const f = log.fps();
  app.innerHTML = `<div class="screen"><div class="end">
    ${dog(TOKENS.color.blue, TOKENS.color.ink, 130)}
    <div class="word">Koniec</div>
    <div class="stats">
      <div><b>Kart</b><span>${DECK.length}</span></div>
      <div><b>Tak</b><span>${yes}</span></div>
      <div><b>Nie</b><span>${DECK.length - yes}</span></div>
      <div><b>fps</b><span>${f.avg}</span></div>
    </div>
    <div class="note">Talia się skończyła. Aplikacja nie doładuje kolejnych kart.<br>Dalej tylko z ręki człowieka — ten ekran nie ma celu do dotknięcia.<br><br>Log sesji: przytrzymaj <strong>dwa palce oddalone od siebie</strong>.</div>
  </div>
  <div class="log" id="log"><h2>Log sesji</h2><pre id="logtext"></pre><button class="close" id="logclose">Zamknij</button></div>
  </div>`;
  const close = document.querySelector<HTMLButtonElement>('#logclose')!;
  close.addEventListener('click', () => document.querySelector('#log')!.classList.remove('open'));
}

function render() {
  if (state.screen === 'warmup') renderWarmup();
  else if (state.screen === 'card') renderCard();
  else if (state.screen === 'end') renderEnd();
}

function wireUndo() {
  const b = document.querySelector<HTMLButtonElement>('#undo');
  if (!b) return;
  // CIG-3.5: cofniecie jest dla czlowieka, wiec click jest tu wlasciwy.
  b.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const last = state.history.pop();
    if (!last) return;
    log.add({ kind: 'undo', card: last.card });
    state.idx = Math.max(0, state.idx - 1);
    state.screen = 'card';
    state.lockUntil = 0;
    render();
  });
}

/* ---- decyzja ---------------------------------------------------------------- */
function decide(decision: 'yes' | 'no', startedAt: number, dragPx: number, patch: number, touches: number) {
  const card = DECK[state.idx]!;
  log.add({ kind: 'decision', card, decision, latencyMs: Math.round(performance.now() - startedAt), dragPx: Math.round(dragPx), patchMm: log.px2mm(patch), touches });
  state.history.push({ card, decision });
  state.lockUntil = performance.now() + cooldown;

  const el = document.querySelector<HTMLDivElement>('#card');
  if (el) el.classList.add(decision === 'yes' ? 'exit-yes' : 'exit-no');
  audio.play(decision === 'yes' ? 'bark' : 'knock');

  const advance = () => {
    state.idx++;
    if (state.idx >= DECK.length) { state.screen = 'end'; render(); return; }
    state.screen = 'card'; render();
    runCooldownBar();
  };

  if (decision === 'yes') {
    // CIG-4.4: D4 nie jest gratulacja, a zapowiedzia nagrody. Trwa tyle, ile
    // cooldown, wiec czlowiek ma czas podac smaczek zanim wroci karta.
    state.screen = 'reward';
    renderReward(card);
    setTimeout(advance, cooldown);
  } else {
    setTimeout(advance, TOKENS.motion.cardExit);
  }
}

function runCooldownBar() {
  const bar = document.querySelector<HTMLDivElement>('#cool');
  if (!bar) return;
  const remaining = state.lockUntil - performance.now();
  if (remaining <= 0) return;
  const t0 = performance.now();
  const step = () => {
    const p = Math.min(1, (performance.now() - t0) / remaining);
    bar.style.transform = `scaleX(${1 - p})`;
    bar.style.width = '100%';
    bar.style.transformOrigin = 'left';
    if (p < 1) requestAnimationFrame(step); else bar.style.width = '0';
  };
  requestAnimationFrame(step);
}

/* ---- wejscie ---------------------------------------------------------------- */
let drag: { x: number; y: number; t: number; max: number; patch: number; touches: number } | null = null;
let holdTimer: number | null = null;

app.addEventListener('touchstart', (ev) => {
  const tl = ev.touches;
  const c = centroid(tl);
  const patch = patchPx(tl);

  // Gest trybu ludzkiego, tylko na D5 i tylko przy realnie rozstawionych punktach.
  if (state.screen === 'end' && tl.length >= 2 && spread(tl) > 120) {
    holdTimer = window.setTimeout(() => {
      const panel = document.querySelector('#log');
      const text = document.querySelector('#logtext');
      if (panel && text) { text.textContent = log.report(); panel.classList.add('open'); }
    }, 800);
    return;
  }

  if (state.screen === 'warmup') {
    // CIG-3.6 + CIG-7.4: jedyny ekran, gdzie liczy sie dotkniecie -- i to ono
    // odblokowuje dzwiek, bo iOS nie zrobi tego bez gestu.
    const ok = audio.unlock();
    audio.play('squeak');
    state.warmHits++;
    log.add({ kind: 'warmup', hit: state.warmHits, patchMm: log.px2mm(patch), touches: tl.length, audioUnlocked: ok });
    if (state.warmHits >= 3) { state.screen = 'card'; render(); } else renderWarmup();
    return;
  }

  if (state.screen !== 'card') return;
  if (performance.now() < state.lockUntil) {
    log.add({ kind: 'rejected', reason: 'cooldown', dragPx: 0, patchMm: log.px2mm(patch), touches: tl.length });
    return;
  }
  drag = { x: c.x, y: c.y, t: performance.now(), max: 0, patch, touches: tl.length };
}, { passive: true });

app.addEventListener('touchmove', (ev) => {
  if (!drag) return;
  const c = centroid(ev.touches);
  drag.max = Math.max(drag.max, Math.hypot(c.x - drag.x, c.y - drag.y));
  drag.patch = Math.max(drag.patch, patchPx(ev.touches));
  drag.touches = Math.max(drag.touches, ev.touches.length);
}, { passive: true });

app.addEventListener('touchend', () => {
  if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  if (!drag) return;
  const d = drag; drag = null;
  if (d.max < dragThreshold) {
    // CIG-3.1: sam dotyk nie jest decyzja. Zapisujemy, bo to mierzy, jak czesto
    // pies dotyka bez przesuniecia.
    log.add({ kind: 'rejected', reason: 'below-threshold', dragPx: Math.round(d.max), patchMm: log.px2mm(d.patch), touches: d.touches });
    return;
  }
  // CIG-3.3: kierunek wyznacza polowa ekranu, w ktorej dotyk sie ZACZAL.
  decide(d.x < window.innerWidth / 2 ? 'no' : 'yes', d.t, d.max, d.patch, d.touches);
}, { passive: true });

log.startFps();
log.add({ kind: 'note', text: `spike D2-D3-D5; talia ${DECK.length}; prog ${dragThreshold} px; cooldown ${cooldown} ms` });
render();
