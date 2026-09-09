// Sklada panel 07: benchmark w dwoch czesciach.
//
// Czesc pierwsza to psie aplikacje, ktore dziela sie na dwie rodziny -- i
// pusta przestrzen miedzy nimi, w ktorej stoi ten projekt. Czesc druga to
// aplikacje randkowe i o prace, bo wzorzec talii kart przeszedl tam pelny
// cykl zycia, wiec ich porazki sa darmowe.
//
// Tresc jest przepisana z design/foundation.html, a nie napisana od nowa --
// fundament i panel maja mowic to samo o tych samych produktach.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const at = (p) => join(ROOT, p);

const FAMILIES = [
  {
    family: 'Social, for dogs',
    examples: 'Pawmates &middot; Tindog &middot; BarkHappy &middot; Wowzer',
    operates: 'The human. The dog is profile content, not a user.',
    produces: 'Geolocated playdates and contact between owners.',
  },
  {
    family: 'Toys, for dogs',
    examples: 'App for Dog &middot; BetterPawPlay &middot; Dog Squeaky Toy &middot; Puppy Tapper &middot; DOGLi',
    operates: 'The dog. Nose or paw, phone flat on the floor.',
    produces: 'Nothing that outlives the session. Entertainment and stimulation.',
  },
  {
    family: 'Tinder for Chihuahua',
    examples: 'This project',
    operates: 'The dog operates, the human interprets.',
    produces: 'A preference ranking, which a human turns into a real meeting.',
    ours: true,
  },
];

const LESSONS = [
  {
    source: 'Tinder &middot; the swipe',
    proves: 'The power of the gesture is a binary decision with zero interface chrome. Nothing stands between the content and the choice.',
    take: 'The gesture and the empty screen. Here it is not styling: anything that is not the card or a decision zone costs the dog legibility.',
  },
  {
    source: 'Rewind / undo',
    proves: 'In human apps, undoing a swipe is a premium feature &mdash; a small mistake that can be monetised.',
    take: 'Undo is core, not premium. A wet nose will misfire regularly, so it has to be large, immediate, and reachable by the human alongside.',
  },
  {
    source: 'Hinge',
    proves: 'Deliberately moved away from swiping towards prompts and comments, under the banner &ldquo;designed to be deleted&rdquo; &mdash; and grew revenue 22% doing it.',
    take: 'Volume is not the goal. A small curated deck beats an infinite feed, and time-in-app cannot be the success metric.',
  },
  {
    source: 'Bumble',
    proves: 'Stated plainly: away from &ldquo;optimising for swipe speed and volume&rdquo;, towards fewer, better, more considered signals.',
    take: 'The deck has a ceiling: 6 to 12 cards per session. That agrees with canine attention and with the cognitive-enrichment frame at the same time.',
  },
  {
    source: 'Double opt-in',
    proves: 'Consent from both sides &mdash; that mechanism, not the swipe itself, is what creates safety and makes a match worth anything.',
    take: 'Rewritten for these two sides: the dog&rsquo;s swipe is one consent, the human&rsquo;s approval is the other.',
  },
];

const CSS = `
  :root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--warm:#EFE9D6;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  *{box-sizing:border-box;margin:0}
  body{width:1800px;padding:44px 40px;background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,serif;font-size:18px;line-height:1.5}
  h1{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:44px;line-height:1.03;letter-spacing:-0.015em;margin-bottom:10px}
  h2{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--blue);margin:34px 0 12px}
  .eyebrow{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;color:var(--acid);margin-bottom:12px}
  .lede{color:var(--muted);font-size:17px;max-width:104ch;margin-bottom:6px}
  table{width:100%;border-collapse:collapse;border-top:2px solid var(--rule-strong)}
  th{font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);text-align:left;padding:9px 14px 9px 0;border-bottom:1px solid var(--rule);vertical-align:bottom}
  td{padding:14px 14px 14px 0;border-bottom:1px solid var(--rule);font-size:15px;line-height:1.44;vertical-align:top}
  tr.ours td{background:var(--tint)}
  tr.ours td:first-child{box-shadow:inset 4px 0 0 var(--blue)}
  td:first-child,th:first-child{padding-left:14px}
  .fam{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:17px;letter-spacing:-0.01em;white-space:nowrap}
  .ex{font-size:14px;color:var(--muted)}
  .src{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:16px;letter-spacing:-0.01em}
  .take{color:var(--ink)}
  .proves{color:var(--muted)}
  .note{margin-top:22px;background:var(--warm);padding:18px 22px;max-width:126ch;font-size:15.5px;line-height:1.5}
  .pull{margin-top:30px;padding:22px 26px;background:var(--ink);color:var(--ground);font-size:24px;line-height:1.32;font-weight:500;max-width:112ch}
  .credit{margin-top:30px;padding-top:14px;border-top:2px solid var(--ink);font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;color:var(--muted);display:flex;gap:22px}`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Newsreader:ital,wght@0,400;0,500;0,600&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>${CSS}</style></head><body>

<p class="eyebrow">Tinder for Chihuahua &middot; Chapter 07 &middot; Benchmark</p>
<h1>Two families, and the gap between them</h1>
<p class="lede">Looking only at dog apps would have been a waste of a week. The market splits cleanly in two, and neither half does what this project does &mdash; so the second half of the benchmark leaves the category entirely.</p>

<h2>Part one &middot; dog apps</h2>
<table>
  <tr><th style="width:230px">Family</th><th style="width:390px">Examples</th><th style="width:400px">Who operates it</th><th>What it produces</th></tr>
${FAMILIES.map((f) => `  <tr${f.ours ? ' class="ours"' : ''}>
    <td class="fam">${f.family}</td>
    <td class="ex">${f.examples}</td>
    <td>${f.operates}</td>
    <td>${f.produces}</td>
  </tr>`).join('\n')}
</table>

<div class="note"><strong>Two things worth the trip.</strong> <strong>App for Dog</strong> markets its buttons as &ldquo;big, full-screen, so a curious nose can&rsquo;t miss them&rdquo; &mdash; the exact pattern this project derived from gesture morphology research, except somebody had already validated it commercially. And the founder story behind a Toronto &ldquo;Tinder for dogs&rdquo; is a man who built it because his older dog could not find anyone to play with. That is, more or less exactly, this brief. So the motivation is market-validated, and the differentiator has to be that here the dog does the swiping.</div>

<h2>Part two &middot; what dating and job apps already paid to find out</h2>
<table>
  <tr><th style="width:230px">Pattern / source</th><th style="width:640px">What it proves</th><th>What this project takes</th></tr>
${LESSONS.map((l) => `  <tr>
    <td class="src">${l.source}</td>
    <td class="proves">${l.proves}</td>
    <td class="take">${l.take}</td>
  </tr>`).join('\n')}
</table>

<p class="pull">A swipe that only moves something onto a &ldquo;maybe later&rdquo; pile has not saved anyone any work. It has relocated the decision &mdash; which is the diagnosis for the entire graveyard of &ldquo;Tinder for jobs&rdquo; apps, and the trap this project was walking into.</p>

<p class="credit"><span>Konstancja Tanjga</span><span>9 September 2026</span><span>Tinder for Chihuahua</span></p>

</body></html>`;

writeFileSync(at('design/exports/benchmark.html'), html);
console.log(`benchmark.html (${FAMILIES.length} rodziny + ${LESSONS.length} wnioskow)`);
