// Instrumentacja. Bez niej test z psem nie powie nic mierzalnego -- a caly sens
// tego spike'u jest w pomiarze. Zapisujemy takze zdarzenia ODRZUCONE, bo to one
// pokaza, jak czesto nos sie myli i czy cooldown z CIG-3.4 jest potrzebny.
import { TOKENS } from './tokens.generated';

// iPhone 13 Pro Max: 428 px CSS na ~71,5 mm szerokosci ekranu.
// Stala jest zalezna od urzadzenia -- przy innym telefonie trzeba ja zmienic.
const MM_PER_PX = 71.5 / TOKENS.frame.width;

export type Entry =
  | { kind: 'decision'; card: string; decision: 'yes' | 'no'; latencyMs: number; dragPx: number; patchMm: number; touches: number }
  | { kind: 'rejected'; reason: 'below-threshold' | 'cooldown'; dragPx: number; patchMm: number; touches: number }
  | { kind: 'warmup'; hit: number; patchMm: number; touches: number; audioUnlocked: boolean }
  | { kind: 'undo'; card: string }
  | { kind: 'note'; text: string };

const entries: (Entry & { atMs: number })[] = [];
const t0 = performance.now();

export const px2mm = (px: number) => +(px * MM_PER_PX).toFixed(1);
export function add(e: Entry) { entries.push({ ...e, atMs: Math.round(performance.now() - t0) }); }
export function all() { return entries; }

/* ---- licznik klatek: CIG-2.5 mowi, ze 120 Hz to wymaganie, wiec mierzymy ---- */
let frames = 0, worstDelta = 0, lastT = performance.now(), running = false;
export function startFps() {
  if (running) return; running = true;
  const tick = (t: number) => {
    const d = t - lastT; lastT = t;
    if (frames > 10 && d > worstDelta) worstDelta = d;
    frames++;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
export function fps() {
  const avg = frames / ((performance.now() - t0) / 1000);
  return { avg: Math.round(avg), worstFrameMs: +worstDelta.toFixed(1), worstFps: worstDelta ? Math.round(1000 / worstDelta) : 0 };
}

export function report() {
  const dec = entries.filter((e) => e.kind === 'decision') as Extract<Entry, { kind: 'decision' }>[] & { atMs: number }[];
  const rej = entries.filter((e) => e.kind === 'rejected') as Extract<Entry, { kind: 'rejected' }>[] & { atMs: number }[];
  const warm = entries.filter((e) => e.kind === 'warmup') as Extract<Entry, { kind: 'warmup' }>[] & { atMs: number }[];
  const patches = entries.map((e) => ('patchMm' in e ? e.patchMm : 0)).filter((x) => x > 0);
  const f = fps();
  const avg = (xs: number[]) => (xs.length ? +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1) : 0);
  const lines = [
    `SESJA  ${new Date().toISOString()}`,
    `urzadzenie  ${navigator.userAgent}`,
    `ramka  ${window.innerWidth}x${window.innerHeight} css px, dpr ${window.devicePixelRatio}`,
    `standalone  ${window.matchMedia('(display-mode: standalone)').matches}`,
    ``,
    `KLATKI  srednio ${f.avg} fps, najgorsza klatka ${f.worstFrameMs} ms (${f.worstFps} fps)`,
    `        prog z CIG-2.5: nic nie powinno spadac do ${TOKENS.motion.fpsFloor} fps`,
    ``,
    `ROZGRZEWKA  ${warm.length} dotkniec, audio odblokowane: ${warm.some((w) => w.audioUnlocked)}`,
    `DECYZJE  ${dec.length}  (tak: ${dec.filter((d) => d.decision === 'yes').length}, nie: ${dec.filter((d) => d.decision === 'no').length})`,
    `        sredni czas decyzji ${avg(dec.map((d) => d.latencyMs))} ms`,
    `        sredni drag ${avg(dec.map((d) => d.dragPx))} px, prog ${TOKENS.input.dragThreshold} px`,
    `ODRZUCONE  ${rej.length}  (ponizej progu: ${rej.filter((r) => r.reason === 'below-threshold').length}, w cooldownie: ${rej.filter((r) => r.reason === 'cooldown').length})`,
    `        odrzucone w cooldownie to dowod, ze CIG-3.4 jest potrzebny`,
    ``,
    `PLAMA KONTAKTU  srednio ${avg(patches)} mm, max ${patches.length ? Math.max(...patches) : 0} mm`,
    `        to wartosc do wpisania w tokeny zamiast placeholdera`,
    ``,
    `ZDARZENIA`,
    ...entries.map((e) => `  ${String(e.atMs).padStart(6)} ms  ${JSON.stringify(e)}`),
  ];
  return lines.join('\n');
}
