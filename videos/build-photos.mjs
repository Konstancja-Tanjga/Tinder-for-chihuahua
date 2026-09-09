// Przygotowuje zdjecia do opisu use case: HEIC/JPG ze zdjec autorki na
// kwadratowe kadry o rozsadnej wadze, do docs/case-study/photos/.
//
// Dlaczego skrypt, a nie recznie w Podgladzie: te same zdjecia ida do repo
// projektu i do portfolio, wiec kadr i waga musza byc odtwarzalne. Recznie
// znaczy "nie da sie powtorzyc" i "nie da sie sprawdzic".
//
// Identyfikacja psow nie jest zgadywana z nazw plikow -- nazwy plikow nic nie
// mowia. Karmel to rudy dlugowlosy z ciemna maska, Auri kremowa o jasnym
// pysku; potwierdzone przez autorke. IMG_9905 celowo nie jest uzyte: to pies
// krotkowlosy, czyli ani Karmel, ani Auri, a podpisanie go imieniem byloby
// bledem w widocznym miejscu.
//
//   node videos/build-photos.mjs
import { existsSync, mkdirSync, statSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const at = (p) => join(ROOT, p);
const SRC = at('videos');
const OUT = at('docs/case-study/photos');

/* `side` to dlugosc boku kadru wyjsciowego. Portrety ida wieksze, bo w duo i
   w kartach person zajmuja realnie duzo miejsca; galeria mniejsze, bo jest
   pokazywana w rzedzie po kilka. Lightbox otwiera to, co dostanie, wiec nie
   ma sensu trzymac 4000 px na cokolwiek. */
const PORTRAIT = 1100;
const GALLERY = 760;

/* offsetY: przesuniecie kadru w dol od srodka, w procentach wysokosci
   zrodla. Psy rzadko stoja w geometrycznym srodku klatki. */
const PHOTOS = [
  { out: 'karmel', src: 'IMG_2376.heic', side: PORTRAIT, offsetY: -6, who: 'Karmel' },
  { out: 'auri', src: 'IMG_8922.JPG', side: PORTRAIT, offsetY: -4, who: 'Auri' },
  { out: 'karmel-persona', src: 'IMG_2378.heic', side: PORTRAIT, offsetY: -8, who: 'Karmel' },
  { out: 'auri-persona', src: 'IMG_9290.jpg', side: PORTRAIT, offsetY: 0, who: 'Auri' },
  { out: 'oboje', src: 'IMG_2358.heic', side: PORTRAIT, offsetY: 0, who: 'Auri i Karmel' },

  // Galeria: psy bez podpisow imiennych. W aplikacji wystepuja pod
  // zmienionymi imionami, a ja nie mam mapowania zdjecie -> klip, wiec
  // podpis mowi o praktyce, nie o konkretnym psie.
  { out: 'deck-1', src: 'IMG_0100.JPG', side: GALLERY, offsetY: -8 },
  { out: 'deck-2', src: 'IMG_0101.JPG', side: GALLERY, offsetY: 0 },
  { out: 'deck-3', src: 'IMG_0102.JPG', side: GALLERY, offsetY: 0 },
  { out: 'deck-4', src: 'IMG_0103.JPG', side: GALLERY, offsetY: 0 },
  { out: 'deck-5', src: 'IMG_0105.JPG', side: GALLERY, offsetY: 0 },
  { out: 'deck-6', src: 'IMG_0107.JPG', side: GALLERY, offsetY: -8 },
  { out: 'deck-7', src: 'IMG_2418.heic', side: GALLERY, offsetY: -6 },
  { out: 'deck-8', src: 'IMG_0341.jpg', side: GALLERY, offsetY: 0 },
];

const MAX_BYTES = 420_000;

const work = join(tmpdir(), `tfc-photos-${process.pid}`);
mkdirSync(work, { recursive: true });
mkdirSync(OUT, { recursive: true });

function dims(p) {
  const s = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', p], { encoding: 'utf8' });
  return {
    w: Number(s.match(/pixelWidth:\s*(\d+)/)?.[1]),
    h: Number(s.match(/pixelHeight:\s*(\d+)/)?.[1]),
  };
}

const seen = new Set();
const made = [];

try {
  for (const p of PHOTOS) {
    const src = join(SRC, p.src);
    if (!existsSync(src)) throw new Error(`${p.out}: brak zrodla ${p.src}`);
    if (seen.has(p.src)) throw new Error(`${p.src} uzyte dwa razy -- to samo zdjecie w dwoch miejscach czyta sie jak blad`);
    seen.add(p.src);

    // HEIC nie wchodzi do przegladarki, wiec najpierw konwersja.
    const flat = join(work, `${p.out}.jpg`);
    execFileSync('sips', ['-s', 'format', 'jpeg', src, '--out', flat], { stdio: 'ignore' });

    const { w, h } = dims(flat);
    if (!w || !h) throw new Error(`${p.out}: nie odczytalem wymiarow`);
    const side = Math.min(w, h);

    // Kadrowanie robi ffmpeg, nie sips. sips --cropOffset dopelnial czernia
    // przy ujemnym offsecie mimo domkniecia do zapasu, a kadr zostawal
    // kwadratem, wiec sprawdzenie wymiarow tego nie lapilo. W ffmpeg podaje
    // sie wprost lewy gorny rog, wiec nie ma czego zle zrozumiec.
    const slack = h - side;                       // ile pikseli mozna przesunac w pionie
    const centre = Math.floor(slack / 2);
    const wanted = centre + Math.round((h * (p.offsetY ?? 0)) / 100);
    const y = Math.max(0, Math.min(slack, wanted));
    if (wanted !== y) {
      console.log(`  ${p.out}: offsetY ${p.offsetY}% wychodzi za kadr, domkniete (y=${y}, zapas 0-${slack})`);
    }
    const x = Math.floor((w - side) / 2);
    // Kadr musi sie miescic w zrodle. To sie da udowodnic, a nie tylko
    // zmierzyc na wyniku -- i wlasnie tego brakowalo, gdy sips dopelnial
    // czernia, a sprawdzenie wymiarow widzialo poprawny kwadrat.
    if (x < 0 || y < 0 || x + side > w || y + side > h) {
      throw new Error(`${p.out}: kadr ${side}x${side} w (${x},${y}) wychodzi za zrodlo ${w}x${h}`);
    }
    const cropped = join(work, `${p.out}-crop.jpg`);
    execFileSync('ffmpeg', [
      '-v', 'error', '-y', '-i', flat,
      '-vf', `crop=${side}:${side}:${x}:${y},scale=${p.side}:${p.side}:flags=lanczos`,
      '-q:v', '2', cropped,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    let out = join(OUT, `${p.out}.jpg`);
    let bytes = 0;
    for (const q of ['70', '60', '50', '40']) {
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', q, cropped, '--out', out], { stdio: 'ignore' });
      bytes = statSync(out).size;
      if (bytes <= MAX_BYTES) break;
    }
    if (bytes > MAX_BYTES) throw new Error(`${p.out}: ${(bytes / 1024).toFixed(0)} kB nawet przy jakosci 40`);

    const got = dims(out);
    if (got.w !== got.h) throw new Error(`${p.out}: ${got.w}x${got.h} nie jest kwadratem`);

    made.push({ ...p, bytes, side: got.w });
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}

// Zdjecia, ktore zostaly w katalogu wyjsciowym, a nie sa na liscie, to smieci
// po poprzednim przebiegu -- lepiej o nich wiedziec, niz wysylac je na strone.
const expected = new Set(PHOTOS.map((p) => `${p.out}.jpg`));
const stray = readdirSync(OUT).filter((f) => f.endsWith('.jpg') && !expected.has(f));
if (stray.length) console.log(`  UWAGA, pliki poza lista: ${stray.join(', ')}`);

for (const m of made) {
  console.log(`  ${m.out.padEnd(16)} ${m.side}x${m.side}  ${(m.bytes / 1024).toFixed(0)} kB  ${m.who ?? '(bez podpisu imiennego)'}`);
}
console.log(`${made.length} zdjec w docs/case-study/photos/`);
