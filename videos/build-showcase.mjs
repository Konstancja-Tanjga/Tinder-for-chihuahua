// Sklada wideo pokazowe do use case: zapis ekranu telefonu wlozony w mockup
// iPhone'a, na tle w barwie projektu.
//
// Dlaczego kompozycja, a nie samo nagranie: nagranie ekranu bez ramki czyta sie
// jak zrzut, a nie jak urzadzenie -- a caly ten produkt jest o tym, ze lezy na
// podlodze i pies go dotyka nosem. Ramka to informacja, nie dekoracja.
//
// Ramka nie ma dziury w kanale alfa. Apertura w tle jest po prostu czarna, a
// wideo laduje na niej dokladnie, z zaokraglonymi rogami przez maske alfa.
// Prosciej niz wycinanie otworu i nie da sie rozjechac o piksel.
//
//   node videos/build-showcase.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, statSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const at = (p) => join(ROOT, p);

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const TOKENS = JSON.parse(readFileSync(at('design/tokens.json'), 'utf8'));
const BLUE = TOKENS.color.signal.blue.hex;
const ACID = TOKENS.color.signal.acid.hex;
const INK = TOKENS.color.signal.ink.hex;

/* Geometria. Apertura trzyma proporcje nagrania (1320x2322 = 0.56848), a nie
   proporcje katalogowa ekranu 13 Pro Max (0.462) -- dociecie do katalogu
   zabiera 19% szerokosci, czyli obie strefy decyzji, wiec ramka idzie za
   trescia. Wszystkie wymiary parzyste, bo h264 tego wymaga. */
const SCREEN_W = 540;
const SCREEN_H = 950;
const BEZEL = 12;
const RING = 3;
const MARGIN = 30;
const DEVICE_W = SCREEN_W + 2 * BEZEL;
const DEVICE_H = SCREEN_H + 2 * BEZEL;
const CANVAS_W = DEVICE_W + 2 * (RING + MARGIN);
const CANVAS_H = DEVICE_H + 2 * (RING + MARGIN);
const SCREEN_X = MARGIN + RING + BEZEL;
const SCREEN_Y = MARGIN + RING + BEZEL;

for (const [name, v] of Object.entries({ CANVAS_W, CANVAS_H, SCREEN_W, SCREEN_H })) {
  if (v % 2 !== 0) throw new Error(`${name}=${v} jest nieparzyste, h264 tego nie przyjmie`);
}

const SRC_ASPECT = 1320 / 2322;
const OUT_ASPECT = SCREEN_W / SCREEN_H;
if (Math.abs(SRC_ASPECT - OUT_ASPECT) / SRC_ASPECT > 0.005) {
  throw new Error(`apertura ${OUT_ASPECT.toFixed(5)} rozjezdza sie ze zrodlem ${SRC_ASPECT.toFixed(5)} -- wideo bylo by rozciagniete`);
}

/* Fragment: cala sesja Karmela. Rozgrzewka, szesc kart, ekran konca ze
   statystykami. Dalej zaczyna sie sesja Auri, w ktorej jedna karta ma czarna
   dziure zamiast wideo -- realny blad, ale nie material na wizytowke. */
const FROM = 0;
const DURATION = 33;
const FPS = 30;
const MAX_BYTES = 6_000_000;

function findSource() {
  const dir = at('videos');
  const hits = readdirSync(dir).filter((f) => /^ScreenRecording.*\.(mov|mp4)$/i.test(f));
  if (!hits.length) throw new Error(`brak zapisu ekranu w ${dir} (ScreenRecording*.mov)`);
  if (hits.length > 1) {
    // Wiecej niz jeden zapis znaczy, ze doszedl nowy i trzeba wybrac swiadomie,
    // a nie wziac alfabetycznie pierwszy.
    throw new Error(`kilka zapisow ekranu, wybierz jeden: ${hits.join(', ')}`);
  }
  return join(dir, hits[0]);
}

const work = join(tmpdir(), `tfc-showcase-${process.pid}`);
mkdirSync(work, { recursive: true });

function shot(html, w, h, out, transparent = false) {
  const page = join(work, `${out.replace(/\W/g, '')}.html`);
  writeFileSync(page, html);
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    ...(transparent ? ['--default-background-color=00000000'] : []),
    `--window-size=${w},${h}`, '--virtual-time-budget=4000',
    `--screenshot=${join(work, out)}`, `file://${page}`,
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  const p = join(work, out);
  if (!existsSync(p)) throw new Error(`Chrome nie zapisal ${out}`);
  return p;
}

/* Tlo: plaskie podloze, czarne urzadzenie, pierscien acid. Apertura zostaje
   czarna -- wideo ja przykryje. Pierscien jest po to, ze kazda barwa palety
   wystepuje takze w aplikacji, wiec bez niego ekran zlewa sie z tlem. */
const bg = shot(`<!doctype html><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0}
  body{width:${CANVAS_W}px;height:${CANVAS_H}px;background:${BLUE};position:relative;overflow:hidden}
  .device{position:absolute;left:${MARGIN + RING}px;top:${MARGIN + RING}px;
          width:${DEVICE_W}px;height:${DEVICE_H}px;background:${INK};
          border-radius:58px;box-shadow:0 0 0 ${RING}px ${ACID}}
  .ap{position:absolute;left:${BEZEL}px;top:${BEZEL}px;
      width:${SCREEN_W}px;height:${SCREEN_H}px;background:${INK};border-radius:46px}
  /* 13 Pro Max ma notch, nie Dynamic Island -- ta pojawia sie w 14 Pro. */
  .notch{position:absolute;left:50%;transform:translateX(-50%);top:${BEZEL}px;
         width:152px;height:27px;background:${INK};border-radius:0 0 17px 17px;z-index:2}
  .btn{position:absolute;background:#2A2E36;border-radius:3px}
  .pwr{right:-4px;top:27%;width:4px;height:84px}
  .up{left:-4px;top:21%;width:4px;height:52px}
  .dn{left:-4px;top:31%;width:4px;height:52px}
  .mute{left:-4px;top:15%;width:4px;height:26px}
</style><body><div class="device">
  <div class="ap"></div><div class="notch"></div>
  <div class="btn mute"></div><div class="btn up"></div>
  <div class="btn dn"></div><div class="btn pwr"></div>
</div></body>`, CANVAS_W, CANVAS_H, 'bg.png');

/* Maska rogow: biale tam, gdzie wideo ma byc widoczne. */
const mask = shot(`<!doctype html><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0}
  body{width:${SCREEN_W}px;height:${SCREEN_H}px;background:#000}
  .m{width:${SCREEN_W}px;height:${SCREEN_H}px;background:#fff;border-radius:46px}
</style><body><div class="m"></div></body>`, SCREEN_W, SCREEN_H, 'mask.png');

const src = findSource();
const out = at('videos/showcase-sesja.mp4');

function encode(crf) {
  execFileSync('ffmpeg', [
    '-v', 'error', '-y',
    '-ss', String(FROM), '-t', String(DURATION), '-i', src,
    '-i', bg, '-i', mask,
    '-filter_complex',
    `[0:v]fps=${FPS},scale=${SCREEN_W}:${SCREEN_H},format=rgba[v];` +
    `[2:v]format=gray,scale=${SCREEN_W}:${SCREEN_H}[m];` +
    `[v][m]alphamerge[vr];` +
    `[1:v]format=rgba,loop=loop=-1:size=1[base];` +
    `[base][vr]overlay=${SCREEN_X}:${SCREEN_Y}:shortest=1,format=yuv420p[outv]`,
    '-map', '[outv]', '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf),
    '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '96k', '-ac', '2',
    out,
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  return statSync(out).size;
}

let bytes = 0;
let used = 0;
try {
  // Wideo idzie na strone portfolio, wiec ma budzet bajtow, nie "jakis rozmiar".
  for (const crf of [23, 26, 29, 32]) {
    bytes = encode(crf);
    used = crf;
    if (bytes <= MAX_BYTES) break;
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (bytes > MAX_BYTES) {
  throw new Error(`${(bytes / 1e6).toFixed(1)} MB nawet przy crf 32 -- skroc fragment`);
}

const probe = execFileSync('ffprobe', [
  '-v', 'error', '-select_streams', 'v:0',
  '-show_entries', 'stream=width,height', '-show_entries', 'format=duration',
  '-of', 'default=noprint_wrappers=1', out,
], { encoding: 'utf8' });
const w = Number(probe.match(/width=(\d+)/)?.[1]);
const h = Number(probe.match(/height=(\d+)/)?.[1]);
if (w !== CANVAS_W || h !== CANVAS_H) {
  throw new Error(`wyszlo ${w}x${h}, oczekiwane ${CANVAS_W}x${CANVAS_H}`);
}

console.log(`  showcase-sesja.mp4  ${w}x${h}  ${Number(probe.match(/duration=([\d.]+)/)?.[1]).toFixed(1)} s  crf ${used}  ${(bytes / 1e6).toFixed(2)} MB`);
