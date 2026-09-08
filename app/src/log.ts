// Instrumentacja. Bez niej test z psem nie powie nic mierzalnego -- a caly sens
// tego spike'u jest w pomiarze. Zapisujemy takze zdarzenia ODRZUCONE, bo to one
// pokaza, jak czesto nos sie myli i czy cooldown z CIG-3.4 jest potrzebny.
import { TOKENS } from './tokens.generated';

// iPhone 13 Pro Max: 428 px CSS na ~71,5 mm szerokosci ekranu.
// Stala jest zalezna od urzadzenia -- przy innym telefonie trzeba ja zmienic.
const MM_PER_PX = 71.5 / TOKENS.frame.width;

/** Skad przyszlo zdarzenie. Myszka to sciezka DEWELOPERSKA -- jej zdarzenia nie
 *  moga wchodzic do statystyki plamy kontaktu, bo to jedyna liczba, po ktora
 *  robimy test z psem. */
export type Src = 'touch' | 'mouse';

export type Entry =
  | { kind: 'decision'; src: Src; card: string; decision: 'yes' | 'no'; latencyMs: number; dragPx: number; patchMm: number; touches: number }
  | { kind: 'rejected'; src: Src; reason: 'below-threshold' | 'cooldown'; dragPx: number; patchMm: number; touches: number }
  | { kind: 'warmup'; src: Src; hit: number; patchMm: number; touches: number; audioUnlocked: boolean }
  | { kind: 'undo'; card: string }
  | { kind: 'note'; text: string };

export type Dog = 'Karmel' | 'Auri';
let subject: Dog | null = null;
/** Bez tego log nie wie, ktory pies generowal dane -- a plama kontaktu Karmela
 *  i Auri to dwie rozne liczby, ktore maja zastapic dwa rozne placeholdery. */
export function setSubject(d: Dog) { subject = d; }

const entries: (Entry & { atMs: number; dog: Dog | null })[] = [];
const t0 = performance.now();

export const px2mm = (px: number) => +(px * MM_PER_PX).toFixed(1);
export function add(e: Entry) { entries.push({ ...e, atMs: Math.round(performance.now() - t0), dog: subject }); }
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
  // TYLKO dotyk -- myszka nie ma plamy kontaktu i zanizylaby srednia
  const patches = entries.filter((e) => 'src' in e && e.src === 'touch' && 'patchMm' in e).map((e) => (e as { patchMm: number }).patchMm).filter((x) => x > 0);
  const byMouse = entries.filter((e) => 'src' in e && e.src === 'mouse').length;
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
    `        z dotyku: ${dec.filter((d) => d.src === 'touch').length}, z myszki: ${dec.filter((d) => d.src === 'mouse').length}`,
    `        sredni czas decyzji ${avg(dec.map((d) => d.latencyMs))} ms`,
    `        sredni drag ${avg(dec.map((d) => d.dragPx))} px, prog ${TOKENS.input.dragThreshold} px`,
    `ODRZUCONE  ${rej.length}  (ponizej progu: ${rej.filter((r) => r.reason === 'below-threshold').length}, w cooldownie: ${rej.filter((r) => r.reason === 'cooldown').length})`,
    `        odrzucone w cooldownie to dowod, ze CIG-3.4 jest potrzebny`,
    ``,
    `PLAMA KONTAKTU  ${patches.length} pomiarow z dotyku lacznie -- to wartosci do wpisania w tokeny zamiast placeholderow`,
    ...(['Karmel', 'Auri'] as Dog[]).map((d) => {
      const ps = entries.filter((e) => e.dog === d && 'src' in e && e.src === 'touch' && 'patchMm' in e).map((e) => (e as { patchMm: number }).patchMm).filter((x) => x > 0);
      return `        ${d.padEnd(7)} srednio ${avg(ps)} mm, max ${ps.length ? Math.max(...ps) : 0} mm  (${ps.length} pomiarow)`;
    }),
    byMouse ? `        UWAGA: ${byMouse} zdarzen z myszki pominieto -- myszka nie ma plamy kontaktu` : `        wszystkie zdarzenia z dotyku`,
    ``,
    `ZDARZENIA`,
    ...entries.map((e) => `  ${String(e.atMs).padStart(6)} ms  ${JSON.stringify(e)}`),
  ];
  return lines.join('\n');
}
