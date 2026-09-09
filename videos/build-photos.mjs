// Przygotowuje zdjecia do opisu use case: HEIC/JPG ze zdjec autorki na
// kwadratowe kadry o rozsadnej wadze, do docs/case-study/photos/.
//
// Dlaczego skrypt, a nie recznie w Podgladzie: te same zdjecia ida do repo
// projektu i do portfolio, wiec kadr i waga musza byc odtwarzalne. Recznie
// znaczy "nie da sie powtorzyc" i "nie da sie sprawdzic".
//
// Karmel i Auri maja teraz wlasne pliki zrodlowe, wiec identyfikacja nie jest
// juz wnioskowana z wygladu. Poprzednia wersja wnioskowala i pomylila sie:
// Karmel to faktycznie rudy dlugowlosy, ale Auri jest KROTKOWLOSA, tan-and-
// white -- a za Auri wzialem wtedy kremowego dlugowlosego, czyli innego psa.
// IMG_9905, odrzucone wtedy jako "ani Karmel, ani Auri", to wlasnie Auri.
//
// Galeria talii nie jest juz skladana ze zdjec, tylko z klatek prawdziwych
// klipow, ktore siedza w aplikacji. Zdjecia wymagaly zgadywania, kto jest kim;
// klip zna swojego kandydata z nazwy pliku, wiec nie ma czego pomylic.
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
  { out: 'karmel', src: 'Karmel.JPG', side: PORTRAIT, offsetY: 0, who: 'Karmel' },
  { out: 'karmel-bieg', src: 'Karmel_bieg.JPG', side: PORTRAIT, offsetY: 0, who: 'Karmel' },
  { out: 'auri', src: 'Auri.JPG', side: PORTRAIT, offsetY: -6, who: 'Auri' },
  { out: 'auri-bieg', src: 'Auri_bieg.JPG', side: PORTRAIT, offsetY: 0, who: 'Auri' },
  { out: 'oboje', src: 'IMG_2358.heic', side: PORTRAIT, offsetY: 0, who: 'Auri lezy, Karmel siedzi' },
];

/* Talia, z klatek klipow, ktore naprawde sa w aplikacji. Kandydaci nosza
   zmienione imiona -- pliki zrodlowe maja prawdziwe -- wiec podpis bierze
   imie z talii, a nie z nazwy pliku. */
const DECK = [
  { file: 'auris', name: 'Fasola' },
  { file: 'aurora', name: 'Malina' },
  { file: 'baltic', name: 'Rogal' },
  { file: 'ciastek', name: 'Piegus' },
  { file: 'fistaszka', name: 'Bąbel' },
  { file: 'kwiatuch', name: 'Szpilka' },
  { file: 'lola', name: 'Kluska' },
  { file: 'mafinka', name: 'Truskawka' },
  { file: 'misiek', name: 'Pączek' },
  { file: 'okruszek', name: 'Bajgiel' },
  { file: 'orotava', name: 'Tofik' },
  { file: 'pindzia', name: 'Sernik' },
  { file: 'skowronek', name: 'Kajtek' },
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

/* Klatka z klipu. Klip jest boomerangiem 3-5 s, wiec bierzemy ujecie z okolic
   1/3 dlugosci -- na samym poczatku pies czesto jest jeszcze w ruchu. */
const deckMade = [];
for (const d of DECK) {
  const clip = at(`app/public/videos/${d.file}.mp4`);
  if (!existsSync(clip)) throw new Error(`talia: brak klipu ${d.file}.mp4`);
  const out = join(OUT, `deck-${d.file}.jpg`);
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-ss', '1.2', '-i', clip, '-frames:v', '1',
    // Klip ma 752x660, wiec kwadrat bierzemy z pelnej wysokosci i srodka szerokosci.
    '-vf', `crop=660:660:(iw-660)/2:0,scale=${GALLERY}:${GALLERY}:flags=lanczos`,
    '-q:v', '4', out,
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  if (!existsSync(out)) throw new Error(`talia: ffmpeg nie zapisal ${d.file}`);
  const g = dims(out);
  if (g.w !== GALLERY || g.h !== GALLERY) throw new Error(`talia ${d.file}: ${g.w}x${g.h}`);
  deckMade.push({ ...d, bytes: statSync(out).size });
}

// Zdjecia, ktore zostaly w katalogu wyjsciowym, a nie sa na liscie, to smieci
// po poprzednim przebiegu -- lepiej o nich wiedziec, niz wysylac je na strone.
const expected = new Set([
  ...PHOTOS.map((p) => `${p.out}.jpg`),
  ...DECK.map((d) => `deck-${d.file}.jpg`),
]);
const stray = readdirSync(OUT).filter((f) => f.endsWith('.jpg') && !expected.has(f));
if (stray.length) console.log(`  UWAGA, pliki poza lista: ${stray.join(', ')}`);

for (const m of made) {
  console.log(`  ${m.out.padEnd(16)} ${m.side}x${m.side}  ${(m.bytes / 1024).toFixed(0)} kB  ${m.who ?? '(bez podpisu imiennego)'}`);
}
for (const d of deckMade) {
  console.log(`  deck-${d.file.padEnd(11)} ${GALLERY}x${GALLERY}  ${(d.bytes / 1024).toFixed(0)} kB  ${d.name}`);
}
console.log(`${made.length} zdjec + ${deckMade.length} klatek talii w docs/case-study/photos/`);
