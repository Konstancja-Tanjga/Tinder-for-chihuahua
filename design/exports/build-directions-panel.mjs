// Sklada panel 08: trzy kierunki wizualne na tych samych trzech ekranach.
//
// Argumenty za i przeciw nie sa pisane od nowa -- pochodza z adnotacji
// canvasu (design/canvas/canvas.json, adnotacja "archiwum"), zeby panel i
// canvas nie mowily dwoch roznych rzeczy o tej samej decyzji.
//
// Rendery artboardow leza w /tmp/screens (headless Chrome na *.dc.html z
// pustym support.js). Panel wkleja je jako data: URI.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const at = (p) => join(ROOT, p);

const DIR = '/tmp/screens';
const uri = (f) => {
  const p = `${DIR}/${f}.png`;
  if (!existsSync(p)) throw new Error(`brak renderu artboardu: ${p}`);
  return `data:image/png;base64,${readFileSync(p).toString('base64')}`;
};

/* Trzy kierunki, kazdy na tych samych trzech ekranach: wybor psa, karta,
   nagroda. Ten sam zestaw za kazdym razem -- inaczej porownanie jest
   porownaniem doboru ekranow, nie kierunkow. */
const DIRECTIONS = [
  {
    key: 'A',
    name: 'Soft',
    files: ['MiekkiWybor', 'MiekkiKarta', 'MiekkiNagroda'],
    idea: 'Rounded corners, inset cards, a warm off-white ground on the reward screen. The direction that looks most like a normal consumer app.',
    pro: 'The friendliest to the human half of the audience, and the only one a stranger would call attractive at first glance.',
    con: 'Soft edges are the first thing to dissolve at 20/75 acuity, and an inset card spends its contrast on a border rather than on the dog.',
    verdict: 'rejected',
  },
  {
    key: 'B',
    name: 'Geometric',
    files: ['GeoWybor', 'GeoKarta', 'GeoNagroda'],
    idea: 'A strict grid, thin rules, explicit numbers set in monospace beside every specification.',
    pro: 'The most legible about its own reasoning: every value is on the screen, which makes the spec and the design impossible to separate.',
    con: 'The grid spends its contrast on structure rather than on the figure. For a dichromat the lines compete with the thing that matters.',
    verdict: 'rejected, one idea kept',
  },
  {
    key: 'C',
    name: 'Poster',
    files: ['PlakatWybor', 'Main', 'PlakatNagroda'],
    idea: 'Enormous flat shapes, square corners, two hues on black, no chrome and no decoration anywhere.',
    pro: 'The highest figure-to-ground contrast of the three &mdash; which is precisely what a twelve-year-old dog&rsquo;s raised contrast threshold demands.',
    con: 'In human mode the same language is shouting. H1&ndash;H4 needed their own scale rather than a shrunken copy of this one.',
    verdict: 'chosen',
  },
];

const CSS = `
  :root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--warm:#EFE9D6;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  *{box-sizing:border-box}
  body{margin:0;width:1800px;padding:44px 40px;background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,serif;font-size:18px;line-height:1.5}
  h1{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:44px;line-height:1.03;margin:0 0 10px;letter-spacing:-0.015em}
  p{margin:0}
  .eyebrow{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;color:var(--acid);margin-bottom:12px}
  .lede{color:var(--muted);font-size:17px;max-width:104ch;margin-bottom:30px}
  .cols{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px}
  .d{display:flex;flex-direction:column;gap:12px;padding:18px;background:var(--panel);border-top:3px solid var(--rule-strong)}
  .d.win{background:var(--tint);border-top-color:var(--blue)}
  .dh{display:flex;align-items:baseline;gap:10px}
  .dh b{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;font-weight:600;color:var(--blue);letter-spacing:0.08em}
  .dh strong{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:800;letter-spacing:-0.015em}
  .tag{margin-left:auto;font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:4px 8px;background:var(--rule);color:var(--muted);white-space:nowrap}
  .d.win .tag{background:var(--blue);color:var(--ground)}
  .idea{font-size:15px;line-height:1.45;color:var(--ink)}
  .shots{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
  .shots img{display:block;width:100%;height:auto;border:1px solid var(--rule-strong)}
  .arg{font-size:14px;line-height:1.45;padding-top:9px;border-top:1px solid var(--rule)}
  .arg span{font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;display:block;margin-bottom:4px}
  .arg.for span{color:var(--acid)}
  .arg.against span{color:var(--blue)}
  .arg.against{margin-top:auto}
  .note{margin-top:30px;background:var(--warm);padding:18px 22px;max-width:120ch;font-size:15.5px;line-height:1.5}
  .credit{margin-top:28px;padding-top:14px;border-top:2px solid var(--ink);font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;color:var(--muted);display:flex;gap:22px}`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Newsreader:ital,wght@0,400;0,500;0,600&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>${CSS}</style></head><body>
<p class="eyebrow">Tinder for Chihuahua &middot; Chapter 08 &middot; Visual directions</p>
<h1>Three directions, one user who cannot tell you</h1>
<p class="lede">The same three screens in each column &mdash; choose the dog, the candidate card, the reward &mdash; because comparing different screens would only compare my choice of screens. Each direction carries an argument for and an argument against, including the one that won. A direction with no named weakness has not been evaluated, only preferred.</p>
<div class="cols">
${DIRECTIONS.map((d) => `  <div class="d${d.verdict === 'chosen' ? ' win' : ''}">
    <div class="dh"><b>${d.key}</b><strong>${d.name}</strong><span class="tag">${d.verdict}</span></div>
    <p class="idea">${d.idea}</p>
    <div class="shots">
${d.files.map((f) => `      <img src="${uri(f)}" alt="${d.name} direction, ${f}">`).join('\n')}
    </div>
    <p class="arg for"><span>Argument for</span>${d.pro}</p>
    <p class="arg against"><span>Argument against</span>${d.con}</p>
  </div>`).join('\n')}
</div>
<div class="note"><strong>Why C won, and what B left behind.</strong> The deciding criterion was not taste but the highest available contrast between figure and ground, because that is what a twelve-year-old dog&rsquo;s raised contrast threshold requires &mdash; and the personas had already settled that Auri sets the floor. One idea was carried over from B: explicit values in monospace next to the thing they govern, which is now how the token sheet reads. The two rejected directions keep their own palettes on the canvas and deliberately do not comply with the tokens, because they are a record of a decision rather than material to build from.</div>
<p class="credit"><span>Konstancja Tanjga</span><span>9 September 2026</span><span>Tinder for Chihuahua</span></p>
</body></html>`;

const out = at('design/exports/directions.html');
writeFileSync(out, html);
console.log(`directions.html (${DIRECTIONS.length} kierunki x ${DIRECTIONS[0].files.length} ekrany)`);
