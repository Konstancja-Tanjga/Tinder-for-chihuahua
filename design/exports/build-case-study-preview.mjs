// Generuje design/case-study-preview.html z manifestu rozdziałów poniżej.
// Panele PNG są wklejane jako data: URI, bo strona publikowana jako artifact
// nie może pobierać obrazów z zewnątrz.
// Dodanie nowego panelu = jedna linijka w tablicy CHAPTERS.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const AUTHOR = 'Konstancja Tanjga';
const DATE = '8 września 2026';
const WALL = 'docs/case-study/wall';

const CHAPTERS = [
  { n: '00', slug: 'cover', title: 'Cover', img: null, file: 'docs/case-study/00-cover.png',
    what: 'Okładka use case, 1920×1502.',
    why: 'Pierwsze, co widzi ktoś, kto trafia na katalog — musi w jednym kadrze powiedzieć, czego dotyczy projekt.',
    look: null },
  { n: '01', slug: 'brief', title: 'Problem i brief',
    what: 'Obietnica dana dwóm psom i to, co z niej wynika jako zakres produktu.',
    why: 'Bez tego reszta wygląda na żart, a nie na projekt z twardymi ograniczeniami.',
    look: 'Na rozstrzygnięcie, że v1 jest jednostronne i lokalne — to omija problem cold startu, który zabił konkurencję.' },
  { n: '02', slug: 'research', title: 'Research: psi odbiorca',
    what: 'Dziesięć ustaleń z literatury, każde sparowane z wymaganiem projektowym.',
    why: 'Użytkownika nie da się zapytać, więc wymagania muszą przyjść z badań, nie z intuicji.',
    look: '429 i 555 nm dają paletę, 20/75 daje skalę ×4, 70–80 Hz czyni 120 Hz wymaganiem sprzętowym.' },
  { n: '03', slug: 'persony', title: 'Persony',
    what: 'Dwie persony psie opisane profilem sensorycznym i motoryką, plus persona ludzka opisana rolą.',
    why: 'Karmel i Auri mają tę samą bazę dichromata, ale nie ten sam próg kontrastu.',
    look: 'Na wniosek: projektujemy dla Auri, testujemy Karmelem.' },
  { n: '04', slug: 'journey-sesja-psa', title: 'User journey: sesja psa',
    img: 'ch04-journey-sesja-psa.png',
    link: 'https://claude.ai/code/artifact/1cf92af1-fe31-4968-9f07-183df119764e',
    what: 'Jedenaście kroków sesji w swimlane, z oznaczeniem, gdzie każdy się dzieje.',
    why: 'Nagroda jest fizyczna, więc pętla nie domyka się na ekranie — a to zmienia architekturę produktu, nie tylko copy.',
    look: 'Na dwie kreski w wierszu „Ekran”. Druga, w kroku 08, to moment nagrody — najważniejszy krok pętli dzieje się wtedy, gdy aplikacja nie robi nic.' },
  { n: '05', slug: 'journey-swatka', title: 'User journey: swatka',
    img: 'ch05-journey-swatka.png',
    link: 'https://claude.ai/code/artifact/1cf92af1-fe31-4968-9f07-183df119764e',
    what: 'Pięć kroków journeya człowieka, od setupu do spotkania w parku.',
    why: 'Pokazuje, że wyjściem aplikacji nie jest match, a ranking preferencji.',
    look: 'Na krok 04 — zatwierdzenie człowieka jest drugą połową double opt-in przepisanego z Tindera i Bumble, tylko strony się zmieniły.' },
  { n: '06', slug: 'blueprint', title: 'Service blueprint',
    img: 'ch06-blueprint.png',
    link: 'https://claude.ai/code/artifact/de345a40-9734-4477-9813-4b214a3daf98',
    what: 'Front-stage kontra back-stage, z linią interakcji, linią widoczności i warstwą ryzyk.',
    why: 'Journey mówi, co się dzieje. Blueprint mówi, co musi zadziałać pod spodem, żeby to się stało.',
    look: 'Na wiersz ryzyk — mokry nos rejestrujący trzy przesunięcia zamiast jednego jest powodem, dla którego cooldown wynosi 1500 ms, a cofnięcie jest funkcją rdzeniową.' },
  { n: '07', slug: 'benchmark', title: 'Benchmark',
    what: 'Psie apki w dwóch rodzinach plus wnioski z apek randkowych i rekrutacyjnych.',
    why: 'Wzorzec talii kart przeszedł w tych kategoriach pełny cykl życia, więc mamy darmowy dostęp do ich porażek.',
    look: 'Na martwe „Tindery do pracy” — swipe, który tylko odkłada coś na stos „może później”, nie oszczędza niczego.' },
  { n: '08', slug: 'kierunki', title: 'Kierunki wizualne',
    what: 'Trzy kierunki tych samych ekranów, z argumentem za i przeciw przy każdym.',
    why: 'Kierunek trzeba wybrać przed budową design systemu, a nie po.',
    look: 'Na to, że wybrany kierunek też ma wadę i jest ona nazwana wprost.' },
  { n: '09', slug: 'cig', title: 'Canine Interface Guidelines',
    img: 'ch09-cig.png', link: 'https://claude.ai/code/artifact/31124b22-9b81-4af4-87d4-4b39cd852c04',
    what: 'Dwadzieścia dziewięć numerowanych praw interfejsu dla psa w sześciu grupach, plus warstwa platformowa PWA na iOS i checklista zgodności. Generowane z design/tokens.json, więc ani jedna liczba nie jest wpisana ręcznie.',
    why: 'Human Interface Guidelines opisują człowieka: palec, 44 pt celu, czerwień jako ostrzeżenie, tekst jako treść. Każde z tych założeń pęka na dichromacie o ostrości 20/75, którego urządzeniem wejściowym jest nos — więc w trybie psim HIG nie są niewystarczające, są szkodliwe. Własne wytyczne to konieczność, nie ambicja.',
    look: 'Na tabelę podziału odpowiedzialności: CIG rządzi trybem psim, HIG ludzkim, a dla H1–H4 nie przepisujemy HIG — odsyłamy i notujemy trzy odstępstwa. I na warstwę platformową: bez touch-action: none swipe nigdy nie dotrze do aplikacji.' },
  { n: '10', slug: 'tryb-psi', title: 'Ekrany trybu psiego',
    what: 'D1–D5 w skali ×4, bez chrome.',
    why: 'To jedyna część, którą widzi pies.',
    look: 'Na strzałkę pod ikoną zamiast celu do stuknięcia, i na D5, w którym nie ma ani jednego piksela acid.' },
  { n: '11', slug: 'tryb-ludzki', title: 'Ekrany trybu ludzkiego',
    what: 'H1–H4 w normalnej gęstości.',
    why: 'Dopiero zestawienie obu trybów pokazuje, czy system dwóch skal się trzyma.',
    look: 'Na H1 — ranking i wykres czasu decyzji. Rosnący czas to spadające zainteresowanie.' },
  { n: '12', slug: 'testy', title: 'Plan testów z psami',
    what: 'Co mierzymy, ile sesji, kiedy uznajemy, że działa.',
    why: 'Bez tego „projektujemy dla Auri” jest hasłem, nie metodą.',
    look: 'Na metryki: czy dotyka, jak dotyka, po ilu kartach się nudzi, czy wraca następnego dnia.' },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function dataUri(name) {
  const p = `${WALL}/${name}`;
  if (!existsSync(p)) return null;
  return `data:image/png;base64,${readFileSync(p).toString('base64')}`;
}

let done = 0, todo = 0;
const body = CHAPTERS.map((c) => {
  const uri = c.img ? dataUri(c.img) : null;
  const ready = Boolean(uri);
  if (c.n !== '00') { ready ? done++ : todo++; }
  const chip = ready
    ? '<span class="chip ok">gotowe</span>'
    : '<span class="chip todo">do zrobienia</span>';
  const figure = ready
    ? `<figure><img src="${uri}" alt="${esc(c.title)}"><figcaption>${esc(`wall/${c.img}`)}${c.link ? ` &middot; <a href="${c.link}">wersja interaktywna</a>` : ''}</figcaption></figure>`
    : `<div class="ph"><span class="mono">${esc(c.file ?? `wall/ch${c.n}-${c.slug}.png`)}</span><span>panel jeszcze nie wyrenderowany</span></div>`;
  const rows = [
    ['Co to jest', c.what],
    ['Dlaczego powstało', c.why],
    ['Na co patrzeć', c.look],
  ].filter(([, v]) => v);
  return `  <article class="ch${ready ? '' : ' pending'}">
    <header>
      <span class="n mono">${c.n}</span>
      <h2>${esc(c.title)}</h2>
      ${chip}
    </header>
    <div class="grid">
      <div class="txt">
${rows.map(([k, v]) => `        <div class="row"><span class="k mono">${esc(k)}</span><p>${esc(v)}</p></div>`).join('\n')}
      </div>
      ${figure}
    </div>
  </article>`;
}).join('\n\n');

const html = `<title>Dwanaście rozdziałów</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&amp;family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&amp;family=IBM+Plex+Mono:wght@400;600&amp;display=swap">
<style>
  :root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--acid-fill:#C8D400;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ground:#0D1014;--panel:#171B21;--tint:#171C2E;--ink:#EDEFEA;--muted:#9AA3B1;--faint:#5A6470;--blue:#7E92FF;--acid:#C3D122;--acid-fill:#C8D400;--rule:#242A33;--rule-strong:#3A424E}}
  :root[data-theme="dark"]{--ground:#0D1014;--panel:#171B21;--tint:#171C2E;--ink:#EDEFEA;--muted:#9AA3B1;--faint:#5A6470;--blue:#7E92FF;--acid:#C3D122;--acid-fill:#C8D400;--rule:#242A33;--rule-strong:#3A424E}
  body{background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,'Times New Roman',serif;font-size:18px;line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1080px;margin:0 auto;padding:52px 24px 88px}
  h1,h2{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;margin:0;letter-spacing:-0.015em;text-wrap:balance}
  h1{font-size:clamp(36px,5.4vw,56px);line-height:1.03}
  h2{font-size:23px;line-height:1.15}
  p{margin:0}
  a{color:var(--blue);text-underline-offset:2px}a:hover{color:var(--ink)}
  a:focus-visible{outline:2px solid var(--blue);outline-offset:3px}
  .mono{font-family:'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;letter-spacing:0.09em;text-transform:uppercase;font-weight:600}
  header.top{display:flex;flex-direction:column;gap:18px;padding-bottom:30px;border-bottom:2px solid var(--ink)}
  .meta{display:flex;flex-wrap:wrap;gap:8px 24px;color:var(--muted)}
  .deck{font-size:21px;line-height:1.5;max-width:60ch}
  .deck em{font-style:italic}
  .facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px;background:var(--rule);margin-top:26px}
  @media(max-width:760px){.facts{grid-template-columns:repeat(2,minmax(0,1fr))}}
  .fact{background:var(--ground);padding:15px 17px;display:flex;flex-direction:column;gap:3px}
  .fact .mono{font-size:10.5px;color:var(--muted)}
  .fact b{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-size:17px;font-weight:800;letter-spacing:-0.01em}
  .howto{margin-top:26px;background:var(--tint);padding:22px 24px;max-width:78ch;display:flex;flex-direction:column;gap:10px}
  .howto .mono{color:var(--blue)}
  .ch{padding-top:52px}
  .ch header{display:flex;align-items:baseline;gap:14px;padding-bottom:16px;border-bottom:2px solid var(--rule-strong);flex-wrap:wrap}
  .ch .n{color:var(--faint);font-size:14px}
  .chip{font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;padding:4px 9px;margin-left:auto}
  .chip.ok{background:var(--acid-fill);color:#10131A}
  .chip.todo{background:transparent;color:var(--muted);box-shadow:inset 0 0 0 2px var(--rule-strong)}
  .grid{display:grid;grid-template-columns:minmax(0,1fr);gap:22px;padding-top:18px}
  .txt{display:flex;flex-direction:column}
  .row{display:grid;grid-template-columns:150px minmax(0,1fr);gap:18px;padding:11px 0;border-bottom:1px solid var(--rule)}
  @media(max-width:640px){.row{grid-template-columns:minmax(0,1fr);gap:5px}}
  .row .k{color:var(--muted);font-size:10.5px;padding-top:5px}
  .row p{font-size:17px;line-height:1.5}
  figure{margin:0;display:flex;flex-direction:column;gap:8px}
  figure img{display:block;width:100%;height:auto;border:1px solid var(--rule-strong)}
  figcaption{font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:10.5px;letter-spacing:0.06em;color:var(--muted)}
  .ph{border:2px dashed var(--rule-strong);padding:34px 24px;display:flex;flex-direction:column;gap:6px;align-items:center;text-align:center;color:var(--muted)}
  .ph .mono{font-size:11px;color:var(--ink)}
  .ph span:last-child{font-size:15px;font-style:italic}
  .pending header h2{color:var(--muted)}
  footer{margin-top:64px;padding-top:20px;border-top:2px solid var(--ink);color:var(--muted);font-size:15px;display:flex;gap:24px;flex-wrap:wrap}
</style>

<div class="wrap">

  <header class="top">
    <p class="meta mono"><span>Tinder for Chihuahua</span><span>Use case &middot; podgląd szkieletu</span><span>${DATE}</span></p>
    <h1>Dwanaście rozdziałów</h1>
    <p class="deck">Aplikacja, której użytkownik jest dichromatem o ostrości wzroku 20/75, a jego urządzeniem wejściowym jest <em>mokry nos</em>.</p>
  </header>

  <div class="facts">
    <div class="fact"><span class="mono">Rola</span><b>Lead designer</b></div>
    <div class="fact"><span class="mono">Zakres</span><b>9 ekranów, 2 skale</b></div>
    <div class="fact"><span class="mono">Rozdziały gotowe</span><b>${done} z ${done + todo}</b></div>
    <div class="fact"><span class="mono">Status</span><b>Design zamknięty</b></div>
  </div>

  <div class="howto">
    <p class="mono">Jak czytać tę ścianę</p>
    <p>Rozdziały są numerowane i opowiadają projekt w kolejności, w której powstawał: najpierw kto jest użytkownikiem, potem co z tego wynika dla interfejsu, a na końcu ekrany. Każdy mówi to samo trojako — <strong>co to jest</strong>, <strong>dlaczego powstało</strong> i <strong>na co patrzeć</strong>.</p>
    <p>Jeśli masz czas na jedną rzecz, otwórz rozdział 04. Journey pokazuje jedyną naprawdę nietypową cechę tego produktu: cztery z jedenastu kroków dzieją się poza aplikacją.</p>
  </div>

${body}

  <footer>
    <span><strong>${AUTHOR}</strong></span><span>${DATE}</span><span>Tinder for Chihuahua</span>
  </footer>

</div>
`;

writeFileSync('design/case-study-preview.html', html);
console.log(`case-study-preview.html — ${done} rozdziałów z panelem, ${todo} bez, ${(html.length / 1024 / 1024).toFixed(2)} MB`);
