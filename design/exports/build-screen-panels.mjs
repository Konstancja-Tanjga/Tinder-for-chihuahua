// Sklada panele 10 (tryb psi) i 11 (tryb ludzki) z renderow artboardow.
// Rendery powstaja skryptem powloki (headless Chrome na *.dc.html z pustym
// support.js) i leza w /tmp/screens. Panele wkleja je jako data: URI.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DIR = '/tmp/screens';
const uri = (f) => {
  const p = `${DIR}/${f}.png`;
  if (!existsSync(p)) throw new Error(`brak renderu: ${p}`);
  return `data:image/png;base64,${readFileSync(p).toString('base64')}`;
};

const DOG = [
  { id: 'D1', file: 'PlakatWybor', name: 'Choosing the dog',
    what: 'Two enormous tiles, recognisable without reading. This step is touched by the human, not the dog.',
    law: 'CIG-2.3' },
  { id: 'D2', file: 'PlakatRozgrzewka', name: 'Warm-up',
    what: 'One large moving object; the whole screen is the target. Calibrates the contact patch, builds the nose → consequence association, and unlocks audio.',
    law: 'CIG-3.6 · CIG-7.4' },
  { id: 'D3', file: 'Main', name: 'Candidate card',
    what: 'The core screen. Muzzle video, two full-height decision zones, a directional chevron under each icon instead of a tap target.',
    law: 'CIG-3.1 · CIG-3.3' },
  { id: 'D4', file: 'PlakatNagroda', name: 'Reward cue',
    what: 'Not congratulations — an announcement. The bark plays and the human is told it is treat time. The loop closes off-screen.',
    law: 'CIG-4.4' },
  { id: 'D5', file: 'PlakatKoniec', name: 'End of session',
    what: 'Deliberately without a single acid pixel and without any "next" affordance. The absence of reward colour is the information.',
    law: 'CIG-5.1 · CIG-6.2' },
];

const HUMAN = [
  { id: 'H1', file: 'PlakatWynik', name: 'Session result',
    what: 'The actual product: a preference ranking plus decision times. A rising time means falling interest — the enrichment signal.',
    law: 'CIG-5.3' },
  { id: 'H2', file: 'PlakatKandydaci', name: 'Candidates',
    what: 'The second half of the double opt-in. The dog’s swipe is one consent; this approval is the other.',
    law: 'CIG-1.6' },
  { id: 'H3', file: 'PlakatProfile', name: 'Profiles and family',
    what: 'Profile editing and the family filter — the rule that keeps mother and son out of each other’s decks, shown as the data it really is.',
    law: '—' },
  { id: 'H4', file: 'PlakatSetup', name: 'Session setup',
    what: 'Deck length, sounds with provenance, video spec compliance, and the per-dog input calibration measured on D2.',
    law: 'CIG-3.3 · CIG-5.1' },
];

const CSS = `
  :root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--warm:#EFE9D6;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  *{box-sizing:border-box}
  body{margin:0;width:1800px;padding:44px 40px;background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,serif;font-size:18px;line-height:1.5}
  h1{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:44px;line-height:1.03;margin:0 0 10px;letter-spacing:-0.015em}
  p{margin:0}
  .eyebrow{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;color:var(--acid);margin-bottom:12px}
  .lede{color:var(--muted);font-size:17px;max-width:104ch;margin-bottom:28px}
  .row{display:grid;gap:22px}
  .s{display:flex;flex-direction:column;gap:11px}
  .s img{display:block;width:100%;height:auto;border:1px solid var(--rule-strong)}
  .h{display:flex;align-items:baseline;gap:9px}
  .h b{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;font-weight:600;color:var(--blue);letter-spacing:0.06em}
  .h strong{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.01em}
  .s p{font-size:14px;line-height:1.45;color:var(--muted)}
  .s .law{font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;color:var(--acid);border-top:1px solid var(--rule);padding-top:7px;margin-top:auto}
  .note{margin-top:28px;background:var(--tint);padding:18px 22px;max-width:120ch;font-size:15.5px;line-height:1.5}
  .credit{margin-top:26px;padding-top:14px;border-top:2px solid var(--ink);font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;color:var(--muted);display:flex;gap:22px}`;

function panel({ chapter, title, lede, screens, note, cols }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Newsreader:ital,wght@0,400;0,500;0,600&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>${CSS}</style></head><body>
<p class="eyebrow">Tinder for Chihuahua &middot; Chapter ${chapter}</p>
<h1>${title}</h1>
<p class="lede">${lede}</p>
<div class="row" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">
${screens.map((s) => `  <div class="s">
    <img src="${uri(s.file)}" alt="${s.id} ${s.name}">
    <div class="h"><b>${s.id}</b><strong>${s.name}</strong></div>
    <p>${s.what}</p>
    <p class="law">${s.law}</p>
  </div>`).join('\n')}
</div>
<div class="note">${note}</div>
<p class="credit"><span>Konstancja Tanjga</span><span>8 September 2026</span><span>Tinder for Chihuahua</span></p>
</body></html>`;
}

writeFileSync('design/exports/screens-dog.html', panel({
  chapter: '10 &middot; Dog mode',
  title: 'Five screens the dog sees',
  lede: 'Four-times scale, no chrome, blue and yellow-green only. The strip along the top of the card screen is deliberately at human scale &mdash; the undo control and the deck counter belong to the person sitting alongside, and the difference in scale is what says so on the screen itself.',
  screens: DOG, cols: 5,
  note: '<strong>Look at D5.</strong> It is the only screen in the set with no acid anywhere and no bordered rectangle at target size. Both absences are deliberate: no reward colour means there is nothing left to win, and no target means a nose cannot leave dog mode. An affordance the size of a nose is an affordance for a nose, whatever the intent behind it.',
}));

writeFileSync('design/exports/screens-human.html', panel({
  chapter: '11 &middot; Human mode',
  title: 'Four screens the operator sees',
  lede: 'The same palette and the same typefaces in a second register: normal density, tabular figures, real data. This is where the two-scale system either holds or falls apart, because both modes have to read as one product while obeying opposite rules.',
  screens: HUMAN, cols: 4,
  note: '<strong>Look at H1.</strong> The chart is the point of the whole product. Decision time rising from card seven is not a performance metric &mdash; it is the dog losing interest, which is exactly the signal that shortens the next deck. That is why the deck floor is six and not eight.',
}));

console.log(`screens-dog.html (${DOG.length} ekranow) + screens-human.html (${HUMAN.length} ekranow)`);
