// Sklada panel 12: protokol testu.
//
// Drabina jest przepisana z app/README.md, a nie napisana od nowa -- README
// jest instrukcja dla osoby, ktora ten test przeprowadza, wiec to on jest
// zrodlem, a panel tylko go pokazuje.
//
// Statusy sa stanem faktycznym, nie planem. Panel, ktory pokazuje same zielone
// znaczki, nie jest protokolem testu, tylko obietnica -- wiec szczebel 3 jest
// czesciowy, a 4 nie zaczety.
//
// Szczebel 2 mial przez chwile wynik negatywny: log raportuje 60 fps, a prawo
// wymagalo 120 Hz "bo inaczej ekran migocze psu". Research pokazal, ze to prawo
// mieszalo dwa zjawiska. Migotanie to modulacja jasnosci, czyli sciemnianie
// (PWM 480 Hz na tym urzadzeniu, szesc razy powyzej psiego progu), a nie liczba
// klatek. 60 fps kosztuje plynnosc ruchu, nie migotanie. Wiec test nie oblal
// wymagania -- znalazl, ze wymaganie opisywalo zla zmienna.
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const at = (p) => join(ROOT, p);

const TOKENS = JSON.parse(readFileSync(at('design/tokens.json'), 'utf8'));
const REFRESH = TOKENS.frame.refresh;
const PWM = TOKENS.frame.dimming.pwmHz;
const CFF = TOKENS.user.flickerFusionDog;
const RAF = TOKENS.motion.rafDefaultHz;
if (!Number.isFinite(PWM) || !Number.isFinite(RAF) || !CFF) {
  throw new Error('panel testu: brakuje frame.dimming.pwmHz / motion.rafDefaultHz / user.flickerFusionDog');
}
const THRESHOLD = TOKENS.input.dragThreshold;
const COOLDOWN = TOKENS.input.cooldown;
if (![REFRESH, THRESHOLD, COOLDOWN].every((v) => Number.isFinite(v))) {
  throw new Error('panel testu: brakuje wartosci w tokens.json (refresh/dragThreshold/cooldown)');
}

const RUNGS = [
  {
    n: '1',
    where: 'Laptop, in a browser',
    checks: `Decision logic, the ${COOLDOWN} ms cooldown, undo. Mouse input is a developer path onto this rung only &mdash; it is tagged separately so a trackpad never pollutes the contact-patch statistics.`,
    status: 'passed',
    result: 'Logic holds. Undo works from the keyboard and the pointer.',
  },
  {
    n: '2',
    where: 'iPhone in Safari, over Wi-Fi',
    checks: `Selection and magnifier suppression, audio unlocking on the first gesture, and the frame rate the page actually gets.`,
    status: 'passed, with a correction',
    result: `Suppression and audio: fine. The log reads <strong>${RAF} fps, not ${REFRESH}</strong> &mdash; which turned out to be Safari&rsquo;s default page-rendering cap, not the panel, and <strong>not a flicker problem at all</strong>. See the note below.`,
  },
  {
    n: '3',
    where: 'iPhone as a PWA, with Guided Access',
    checks: 'No Safari chrome, no way out of the app, safe areas respected.',
    status: 'partial',
    result: 'Installed and running full-screen &mdash; the recording is proof. Guided Access not yet verified with a dog trying to leave.',
  },
  {
    n: '4',
    where: 'iPhone flat on the floor, Karmel and Auri',
    checks: 'Whether the design makes any sense at all.',
    status: 'not yet',
    result: 'The only rung that can answer the three questions design could not settle.',
  },
];

const MEASURED = [
  { k: 'Does it touch', v: 'Contact-patch size in millimetres, per dog. The values currently in the token file are placeholders and are labelled as such.' },
  { k: 'How it touches', v: `Drag distance against the ${THRESHOLD} px threshold, and every rejected event with its reason &mdash; below threshold, or inside cooldown.` },
  { k: 'When it gets bored', v: 'Decision latency per card. A rising time is the signal to shorten the next deck, not to add cards.' },
  { k: 'Whether it comes back', v: 'Session history across days. With a twelve-year-old dog, change over time is the cognitive value the research points at.' },
];

const CSS = `
  :root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--warm:#EFE9D6;--bad:#F3E3DE;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  *{box-sizing:border-box;margin:0}
  body{width:1800px;padding:44px 40px;background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,serif;font-size:18px;line-height:1.5}
  h1{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:44px;line-height:1.03;letter-spacing:-0.015em;margin-bottom:10px}
  h2{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:var(--blue);margin:34px 0 12px}
  .eyebrow{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;color:var(--acid);margin-bottom:12px}
  .lede{color:var(--muted);font-size:17px;max-width:104ch}
  .ladder{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
  .r{display:flex;flex-direction:column;gap:10px;padding:18px;background:var(--panel);border-top:3px solid var(--rule-strong)}
  .r.failed{background:var(--bad);border-top-color:#B4462E}
  .r.pending{background:var(--ground);border-top-color:var(--rule);box-shadow:inset 0 0 0 1px var(--rule)}
  .rh{display:flex;align-items:baseline;gap:10px}
  .rh b{font-family:'IBM Plex Mono',Menlo,monospace;font-size:26px;font-weight:600;color:var(--blue);line-height:1}
  .rh strong{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-size:17px;font-weight:800;letter-spacing:-0.01em;line-height:1.15}
  .tag{font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;padding:4px 8px;background:var(--rule);color:var(--muted);align-self:flex-start}
  .r.passed .tag{background:var(--acid);color:#fff}
  .r.failed .tag{background:#B4462E;color:#fff}
  .checks{font-size:14px;line-height:1.44;color:var(--muted)}
  .res{font-size:14.5px;line-height:1.44;padding-top:10px;border-top:1px solid var(--rule);margin-top:auto}
  .res span{font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--blue);display:block;margin-bottom:4px}
  table{width:100%;border-collapse:collapse;border-top:2px solid var(--rule-strong)}
  td{padding:13px 14px 13px 0;border-bottom:1px solid var(--rule);font-size:15px;line-height:1.44;vertical-align:top}
  td:first-child{padding-left:14px;font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:16px;width:270px;white-space:nowrap}
  .cols{display:grid;grid-template-columns:1.35fr 1fr;gap:26px;margin-top:34px;align-items:start}
  .note{background:var(--tint);padding:18px 22px;font-size:15.5px;line-height:1.5}
  .note h3{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-size:18px;font-weight:800;letter-spacing:-0.01em;margin-bottom:8px}
  .note code{font-family:'IBM Plex Mono',Menlo,monospace;font-size:14px}
  .credit{margin-top:30px;padding-top:14px;border-top:2px solid var(--ink);font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;color:var(--muted);display:flex;gap:22px}`;

const cls = (s) => (s.startsWith('passed') ? 'passed' : s === 'failed' ? 'failed' : 'pending');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Newsreader:ital,wght@0,400;0,500;0,600&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>${CSS}</style></head><body>

<p class="eyebrow">Tinder for Chihuahua &middot; Chapter 12 &middot; Test protocol</p>
<h1>Four rungs, from a laptop to a dog on the floor</h1>
<p class="lede">Each rung can only be climbed once the one below it holds, and each one checks something the rung below cannot. The statuses are the state of play rather than the plan &mdash; including rung 2, which came back looking like a failure and turned out to be a badly written requirement.</p>

<h2>The ladder</h2>
<div class="ladder">
${RUNGS.map((r) => `  <div class="r ${cls(r.status)}">
    <div class="rh"><b>${r.n}</b><strong>${r.where}</strong></div>
    <span class="tag">${r.status}</span>
    <p class="checks">${r.checks}</p>
    <p class="res"><span>Result</span>${r.result}</p>
  </div>`).join('\n')}
</div>

<div class="cols">
  <div>
    <h2 style="margin-top:0">What gets measured</h2>
    <table>
${MEASURED.map((m) => `      <tr><td>${m.k}</td><td>${m.v}</td></tr>`).join('\n')}
    </table>
  </div>
  <div>
    <h2 style="margin-top:0">The correction rung 2 forced</h2>
    <div class="note" style="background:var(--warm)">
      <h3>Flicker and frame rate are not the same number</h3>
      <p>The law used to read &ldquo;${REFRESH} Hz is required, or the screen flickers to the dog&rdquo;. That conflated two things. Flicker is <strong>luminance modulation</strong>, and on a sample-and-hold panel that is the dimming, not the refresh: this device runs PWM at <strong>${PWM} Hz</strong> at every brightness &mdash; six times the ${CFF} canine threshold. The screen never flickered for the dog.</p>
      <p style="margin-top:10px">What ${RAF} fps actually costs is <strong>motion continuity</strong>, for an animal that resolves change up to ${CFF}. And it is Safari&rsquo;s default cap rather than the hardware: the flag is <code>Prefer Page Rendering Updates near 60fps</code>. So the test did not fail the requirement &mdash; it found the requirement was describing the wrong variable.</p>
      <p style="margin-top:10px">The open flicker risk moved off the screen entirely: <strong>a dimmed or mains-driven lamp in the room</strong> can modulate below ${CFF}, and that is outside the application.</p>
    </div>
  </div>
</div>

<div class="cols" style="grid-template-columns:1.35fr 1fr">
  <div>
    <h2 style="margin-top:0">Getting the log out</h2>
    <div class="note">
      <h3>Two fingers, held apart</h3>
      <p>On the end screen, hold <strong>two fingers more than 120 px apart</strong> for one second. The log is selectable, so it can be copied off the phone.</p>
      <p style="margin-top:10px">Not a button, because <code>CIG-6.2</code> forbids a nose-sized target on D5 and <code>CIG-6.1</code> requires that entering human mode be impossible for a nose. Writing it revealed that &ldquo;two fingers&rdquo; alone is not enough &mdash; iOS can report a single wet nose as several touch points &mdash; so a real spread is required.</p>
    </div>
  </div>
</div>

<p class="credit"><span>Konstancja Tanjga</span><span>9 September 2026</span><span>Tinder for Chihuahua</span></p>

</body></html>`;

writeFileSync(at('design/exports/test-protocol.html'), html);
const failed = RUNGS.filter((r) => r.status === 'failed').length;
console.log(`test-protocol.html (${RUNGS.length} szczeble, ${failed} z wynikiem negatywnym)`);
