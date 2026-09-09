// Renderuje panele PNG do docs/case-study/wall/.
//
// Pipeline byl opisany w CLAUDE.md, ale zyl w historii powloki, wiec kazdy
// render byl odtwarzany z pamieci. To jest ten sam pipeline jako kod:
// headless Chrome --force-device-scale-factor=2 -> sips -Z 1800.
//
// Wysokosc okna musi byc dociagnieta do tresci, bo inaczej panel ma pusty
// margines na dole albo jest ucicty. Chrome CLI nie zwraca wysokosci
// dokumentu, wiec mierzymy ja pierwszym przebiegiem: kopia panelu z
// doklejonym skryptem, ktory wpisuje scrollHeight do <title>, potem
// --dump-dom i odczyt titla. Drugi przebieg renderuje na zmierzona wysokosc.
//
//   node design/exports/render-panels.mjs [slug ...]
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const at = (p) => join(ROOT, p);

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WIDTH = 1800;

/** source -> panel. Kolejnosc jak rozdzialy use case. */
const PANELS = [
  { slug: 'ch02-research', src: 'design/exports/research.html' },
  { slug: 'ch03-personas', src: 'design/exports/personas.html' },
  { slug: 'ch04-journey-sesja-psa', src: 'design/exports/journey-sesja-psa.html' },
  { slug: 'ch05-journey-swatka', src: 'design/exports/journey-swatka.html' },
  { slug: 'ch06-blueprint', src: 'design/blueprint.html' },
  { slug: 'ch08-kierunki', src: 'design/exports/directions.html' },
  { slug: 'ch09-cig', src: 'design/exports/cig-panel.html' },
  { slug: 'ch10-dog-mode', src: 'design/exports/screens-dog.html' },
  { slug: 'ch11-human-mode', src: 'design/exports/screens-human.html' },
];

const PL_DIA = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;

const work = mkdtemp();
function mkdtemp() {
  const d = join(tmpdir(), `tfc-panels-${process.pid}`);
  mkdirSync(d, { recursive: true });
  return d;
}

function chrome(args) {
  return execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    ...args,
  ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 });
}

/** Wysokosc tresci przy szerokosci WIDTH, zmierzona w przegladarce.
 *
 * Mierzymy BODY, nie documentElement: scrollHeight elementu korzenia nie
 * schodzi ponizej wysokosci viewportu, wiec kazdy panel nizszy od okna
 * podawal te sama liczbe i dostawal pusty margines na dole. Body ma
 * margin:0, wiec jego wysokosc jest wysokoscia panelu. Okno mierzace jest
 * celowo niskie, zeby nie moglo zawyzyc wyniku. */
function measure(html, name) {
  const probe = join(work, `probe-${name}.html`);
  writeFileSync(probe, `${html}
<script>
  addEventListener('load', () => {
    const b = document.body;
    const h = Math.ceil(Math.max(b.scrollHeight, b.getBoundingClientRect().height));
    document.title = 'PANELHEIGHT:' + h;
  });
</script>`);
  const dom = chrome([
    `--window-size=${WIDTH},400`, '--virtual-time-budget=8000',
    '--dump-dom', `file://${probe}`,
  ]);
  const m = dom.match(/PANELHEIGHT:(\d+)/);
  if (!m) throw new Error(`${name}: nie udalo sie zmierzyc wysokosci -- panel nie doszedl do load?`);
  const h = Number(m[1]);
  if (!Number.isFinite(h) || h < 200 || h > 40000) {
    throw new Error(`${name}: podejrzana wysokosc ${h} px`);
  }
  return h;
}

function render({ slug, src }) {
  const srcPath = at(src);
  if (!existsSync(srcPath)) throw new Error(`${slug}: brak zrodla ${src}`);
  const html = readFileSync(srcPath, 'utf8');

  // Panele ida do dokumentacji po angielsku. Polska diakrytyka w zrodle
  // panelu znaczy, ze cos zostalo nieprzelozone -- a tego na renderze nie
  // widac bez czytania, wiec pilnuje tego build, nie oko.
  if (PL_DIA.test(stripCss(html))) {
    throw new Error(`${slug}: polska diakrytyka w tresci panelu (${src})`);
  }

  const height = measure(html, slug);
  const raw = join(work, `${slug}@2x.png`);
  chrome([
    `--window-size=${WIDTH},${height}`,
    '--force-device-scale-factor=2',
    '--virtual-time-budget=8000',
    `--screenshot=${raw}`, `file://${srcPath}`,
  ]);
  if (!existsSync(raw)) throw new Error(`${slug}: Chrome nie zapisal zrzutu`);

  const outDir = at('docs/case-study/wall');
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `${slug}.png`);
  execFileSync('sips', ['-Z', String(WIDTH), raw, '--out', out], { stdio: 'ignore' });

  const { width, bytes } = probe(out);
  if (width !== WIDTH) throw new Error(`${slug}: szerokosc ${width} px, oczekiwana ${WIDTH}`);
  if (bytes < 20000) throw new Error(`${slug}: plik ${bytes} B -- za maly, render prawdopodobnie pusty`);
  return { slug, height, width, bytes };
}

/** Diakrytyka w <style> i w nazwach fontow nie jest trescia panelu. */
function stripCss(html) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<link[^>]*>/gi, '');
}

function probe(png) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', png], { encoding: 'utf8' });
  return {
    width: Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]),
    height: Number(out.match(/pixelHeight:\s*(\d+)/)?.[1]),
    bytes: statSync(png).size,
  };
}

const only = process.argv.slice(2);
const todo = only.length ? PANELS.filter((p) => only.includes(p.slug)) : PANELS;
if (!todo.length) {
  console.error(`nie znam paneli: ${only.join(', ')}`);
  console.error(`dostepne: ${PANELS.map((p) => p.slug).join(', ')}`);
  process.exit(1);
}

const done = [];
try {
  for (const p of todo) done.push(render(p));
} finally {
  rmSync(work, { recursive: true, force: true });
}

for (const d of done) {
  console.log(`  ${d.slug.padEnd(26)} ${d.width}x${probe(at(`docs/case-study/wall/${d.slug}.png`)).height}  ${(d.bytes / 1024).toFixed(0)} kB`);
}
console.log(`${done.length} paneli w docs/case-study/wall/`);
