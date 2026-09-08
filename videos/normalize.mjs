#!/usr/bin/env node
// Normalizuje surowe klipy do specyfikacji z design/tokens.json i wypisuje
// raport zgodnosci -- ten sam, ktory ekran H4 pokazuje dzis na zmyslonych danych.
//
// Kadrowania NIE sa zgadywane: pozycje glow odczytane z klatek z nalozona
// siatka 10x10 (patrz videos/README.md).
//
// Petla: forward + odwrotka (boomerang). Petla wprost daje twarde ciecie, bo
// pies zmienia odleglosc od kamery. CIG wymaga PLYNNEJ petli, nie naturalnego
// ruchu, wiec boomerang jest tu wlasciwy -- i dla psa ruch to ruch.
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const T = JSON.parse(readFileSync(`${ROOT}design/tokens.json`, 'utf8'));
const V = T.assetSpec.video;
const SRC = `${ROOT}videos`;
const OUT = `${ROOT}app/public/videos`;
const HALF = 2.0; // sekundy do przodu; boomerang daje 2x tyle

// crop: [w, h, x, y] w pikselach zrodla. Proporcja ma odpowiadac docelowej.
// Kadrowanie domyslne: glowa psa siedzi zwykle nad srodkiem klatki, wiec
// bierzemy 55% wysokosci i centrujemy w 42% wysokosci. Sprawdzone na szesciu
// klipach z Groka. NADPISANIA nizej sa tam, gdzie pomiar z siatki 10x10 pokazal,
// ze domyslne by nie wystarczylo.
const AUTO = { heightFrac: 0.55, centerYFrac: 0.42, maxWidthFrac: 0.95 };

function autoCrop(w, h, aspect) {
  let ch = Math.round(h * AUTO.heightFrac);
  let cw = Math.round(ch * aspect);
  if (cw > w * AUTO.maxWidthFrac) { cw = Math.round(w * AUTO.maxWidthFrac); ch = Math.round(cw / aspect); }
  cw -= cw % 2; ch -= ch % 2;
  const cx = Math.max(0, Math.min(w - cw, Math.round((w - cw) / 2)));
  const cy = Math.max(0, Math.min(h - ch, Math.round(h * AUTO.centerYFrac - ch / 2)));
  return [cw, ch, cx, cy];
}

// start: sekunda, od ktorej bierzemy 2 s do przodu (boomerang da 4 s)
// crop:  [w, h, x, y] w pikselach zrodla -- tylko gdy domyslne nie wystarcza
const OVERRIDES = {
  // age i sex sa FIKCJA kandydatow -- wpisz je tutaj, a karta je pokaze.
  // Dopoki brak, karta pokazuje kreske, zeby nie zmyslac danych po cichu.
  'Pindzia.mp4':   { start: 1.0, crop: [560, 492, 0, 0],
    note: 'Pysk wypelnia kadr juz w zrodle, wiec bierzemy pelna szerokosc.' },
  'Lola.mp4':      { start: 7.2, crop: [340, 298, 10, 50],
    note: 'Kadr od 7,2 s -- wczesniej w ujeciu jest ludzka reka, czego specyfikacja zabrania.' },
  'Mafinka.mp4':   { start: 2.0, crop: [300, 263, 87, 61],
    note: 'Zrodlo bylo planem calej sylwetki w biegu; krop trafil w glowe.' },
  'Skowronek.mp4': { start: 1.5, crop: [340, 298, 32, 81],
    note: 'Czerwony sweterek w kadrze -- czerwien nie niesie tu znaczenia, wiec CIG-2.2 nie jest naruszone.' },
  'Misiek.mp4':    { start: 1.5, crop: [340, 298, 194, 96],
    note: 'Glowa przesunieta w prawo w zrodle, krop przesuniety za nia.' },
  'Fistaszka.mp4': { start: 1.5, crop: [280, 246, 186, 64], display: 'Fistaszek',
    note: 'Plik nazwany w dopelniaczu; imie w aplikacji w mianowniku. Glowa zajmowala 27% szerokosci, wiec krop ciasny i skalowanie 2,7x.' },
};

// Wszystkie pliki wideo z videos/ -- nowy plik nie przepadnie po cichu.
const FOUND = readdirSync(SRC).filter((f) => /\.(mp4|mov|m4v|webm)$/i.test(f)).sort();
const CLIPS = FOUND.map((file) => {
  const o = OVERRIDES[file] ?? {};
  const base = file.replace(/\.[^.]+$/, '');
  return {
    file,
    name: base.toLowerCase(),
    display: o.display ?? base,
    age: o.age ?? null,
    sex: o.sex ?? null,
    start: o.start ?? 1.5,
    crop: o.crop ?? null,
    note: o.note ?? 'Kadrowanie domyslne (55% wysokosci, srodek w 42%). Nie mierzone z siatki -- warto obejrzec.',
    auto: !o.crop,
  };
});

const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
const probe = (f, entries) => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', entries, '-of', 'csv=p=0', f], { encoding: 'utf8' }).trim();

mkdirSync(OUT, { recursive: true });
const targetAspect = V.targetWidth / V.targetHeight;
const rows = [];

for (const c of CLIPS) {
  const src = `${SRC}/${c.file}`;
  if (!existsSync(src)) { console.error(`brak zrodla: ${src}`); process.exit(1); }
  const dims = probe(src, 'stream=width,height').split(',').map(Number);
  const [cw, ch, cx, cy] = c.crop ?? autoCrop(dims[0], dims[1], targetAspect);
  const cropAspect = cw / ch;
  if (Math.abs(cropAspect - targetAspect) > 0.02) {
    console.error(`crop ${c.name} ma proporcje ${cropAspect.toFixed(3)}, docelowa ${targetAspect.toFixed(3)} -- obraz bylby zniekształcony`);
    process.exit(1);
  }
  const out = `${OUT}/${c.name}.mp4`;
  // Budzet wagi jest ograniczeniem, a CRF pokretlem -- wiec dobieramy CRF do
  // budzetu, zamiast krecic nim recznie. Klip z duza iloscia szczegolow (siersc,
  // rozmyte tlo) potrzebuje wyzszego CRF, zeby zmiescic sie w tym samym budzecie.
  let crf = 26;
  let bytes = 0;
  const tried = [];
  for (;;) {
    ff([
      '-ss', String(c.start), '-t', String(HALF), '-i', src,
      '-an', '-map_metadata', '-1',
      '-filter_complex',
      `[0:v]crop=${cw}:${ch}:${cx}:${cy},scale=${V.targetWidth}:${V.targetHeight}:flags=lanczos,fps=${V.fps},split[f][r];[r]reverse,trim=start_frame=1[rv];[f][rv]concat=n=2:v=1:a=0[v]`,
      '-map', '[v]',
      '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-crf', String(crf), '-preset', 'slow', '-movflags', '+faststart',
      '-y', out,
    ]);
    bytes = statSync(out).size;
    tried.push(`crf ${crf} -> ${(bytes / 1000).toFixed(0)} kB`);
    if (bytes <= V.maxBytes || crf >= 36) break;
    crf += 3;
  }
  c.crf = crf;
  if (tried.length > 1) c.crfLog = tried.join(', ');
  const [w, h] = probe(out, 'stream=width,height').split(',').map(Number);
  const dur = Number(probe(out, 'stream=duration'));
  const hasAudio = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', out], { encoding: 'utf8' }).includes('audio');
  const checks = [
    [`${w}x${h}`, w === V.targetWidth && h === V.targetHeight],
    [`${dur.toFixed(2)} s`, dur >= V.seconds[0] && dur <= V.seconds[1]],
    [`bez audio`, !hasAudio],
    [`${(bytes / 1000).toFixed(0)} kB`, bytes <= V.maxBytes],
  ];
  rows.push({ name: c.name, src: c.file, display: c.display, age: c.age, sex: c.sex, auto: c.auto, crop: [cw, ch, cx, cy], checks, note: c.note, bytes, crf: c.crf, crfLog: c.crfLog, ok: checks.every(([, v]) => v) });
}

const pad = (s, n) => String(s).padEnd(n);
console.log(`\nSPECYFIKACJA  ${V.targetWidth}x${V.targetHeight}, ${V.seconds[0]}-${V.seconds[1]} s, ${V.fps} fps, bez audio, petla plynna, budzet ${V.maxBytes / 1000} kB\n`);
for (const r of rows) {
  console.log(`${r.ok ? 'OK  ' : 'UWAGA'} ${pad(r.display, 10)}${r.auto ? 'auto ' : 'mierz'} ${r.checks.map(([label, v]) => `${v ? '+' : '!'} ${label}`).join('   ')}`);
  console.log(`      crf ${r.crf}${r.crfLog ? `  (dobierane: ${r.crfLog})` : ''}`);
  console.log(`      ${r.note}\n`);
}

// rejestr pochodzenia -- audyt wypunktowal, ze dzwieki maja zrodla, a wideo nie
writeFileSync(`${SRC}/REJESTR.md`, `# Rejestr wideo

Wygenerowane przez \`videos/normalize.mjs\`. Nie edytowac recznie.

Specyfikacja z \`design/tokens.json\`: **${V.targetWidth}×${V.targetHeight}**, ${V.seconds[0]}–${V.seconds[1]} s,
${V.fps} fps, bez sciezki audio, petla plynna (boomerang), budzet ${V.maxBytes / 1000} kB.

| Klip | Zrodlo | Pochodzenie | Licencja | Zgodnosc | Waga |
|---|---|---|---|---|---|
${rows.map((r) => `| \`${r.name}.mp4\` | \`${r.src}\` | wygenerowane AI (Grok), wlasnosc autorki | brak osob trzecich | ${r.ok ? 'zgodne' : '**do poprawy**'} | ${(r.bytes / 1000).toFixed(0)} kB, crf ${r.crf} |`).join('\n')}

## Uwagi per klip

${rows.map((r) => `**${r.display}** (\`${r.name}.mp4\`, krop ${r.crop.join('×')}${r.auto ? ', domyslny' : ', mierzony'}) — ${r.note}`).join('\n\n')}

---

**Konstancja Tanjga** · 8 września 2026 · Tinder for Chihuahua
`);
writeFileSync(`${ROOT}app/src/deck.generated.ts`, `// WYGENEROWANE przez videos/normalize.mjs -- nie edytowac recznie.
export type Candidate = { name: string; video: string; age: number | null; sex: 'M' | 'F' | null };
export const DECK: readonly Candidate[] = [
${rows.map((r) => `  { name: '${r.display}', video: '/videos/${r.name}.mp4', age: ${r.age ?? 'null'}, sex: ${r.sex ? `'${r.sex}'` : 'null'} },`).join('\n')}
] as const;
`);
console.log(`rejestr: videos/REJESTR.md`);
console.log(`talia:   app/src/deck.generated.ts (${rows.length} psow)`);
