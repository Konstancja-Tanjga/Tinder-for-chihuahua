// Generuje app/src/tokens.generated.ts i app/src/tokens.generated.css z
// design/tokens.json. Aplikacja jest pierwszym konsumentem, ktory naprawde
// czyta tokeny -- artboardy maja palete na sztywno i to jest znany dlug.
// Guard: odmawia zapisu, jesli ktorakolwiek wartosc nie rozwiazala sie.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Sciezki liczone od korzenia repo, nie od cwd -- audyt zauwazyl, ze generatory
// dzialaly "przypadkiem, bo uruchamiane z roota". npm run dev w app/ to lamalo.
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const at = (p) => `${ROOT}${p}`;

const T = JSON.parse(readFileSync(at('design/tokens.json'), 'utf8'));

const ts = `// WYGENEROWANE z design/tokens.json przez design/exports/build-app-tokens.mjs
// Nie edytowac recznie -- zmiana wartosci to edycja tokenow plus ponowny build.
export const TOKENS = {
  color: {
${Object.entries(T.color.signal).map(([k, v]) => `    ${k}: '${v.hex}',`).join('\n')}
  },
  frame: { width: ${T.frame.cssWidth}, height: ${T.frame.cssHeight}, refresh: ${T.frame.refresh} },
  input: {
    dragThreshold: ${T.input.dragThreshold},
    cooldown: ${T.input.cooldown},
    zoneWidth: ${T.input.zoneWidth},
    zoneCount: ${T.input.zoneCount},
    tapAllowedOn: ${JSON.stringify(T.input.tap.allowedOn)} as const,
  },
  session: { deckMin: ${T.session.deckMin}, deckMax: ${T.session.deckMax} },
  motion: { cardExit: ${T.motion.cardExit}, fpsFloor: ${T.motion.fpsFloor} },
  sound: {
${Object.entries(T.sound).map(([k, v]) => `    ${k}: { seconds: ${v.seconds}, level: ${v.level} },`).join('\n')}
  },
} as const;

export type Decision = 'yes' | 'no';
`;

const css = `/* WYGENEROWANE z design/tokens.json -- nie edytowac recznie */
:root {
${Object.entries(T.color.signal).map(([k, v]) => `  --${k}: ${v.hex};`).join('\n')}
${Object.entries(T.color.neutral).map(([k, v]) => `  --${k}: ${v.hex};`).join('\n')}
  --frame-w: ${T.frame.cssWidth}px;
  --frame-h: ${T.frame.cssHeight}px;
  --zone-w: ${T.input.zoneWidth}px;
  --safe-top: ${T.frame.safeAreaTop}px;
  --safe-bottom: ${T.frame.safeAreaBottom}px;
  --card-exit: ${T.motion.cardExit}ms;
  --font-display: '${T.typography.display.family}', ${T.typography.display.fallback};
  --font-text: '${T.typography.text.family}', ${T.typography.text.fallback};
}

/* CIG-7.1 -- bez tych regul nos przeciagniety po ekranie zaznaczy tekst,
   wywola lupe powiekszajaca i przewinie strone. Prawo wejscia jest wtedy
   niespelnialne, wiec to nie detal implementacji. */
html, body {
${Object.entries(T.platform.css).map(([k, v]) => `  ${k}: ${v};`).join('\n')}
}
`;

function emit(path, text) {
  if (/undefined|\[object Object\]|NaN/.test(text)) {
    console.error(`\nBUILD ZATRZYMANY -- ${path}`);
    console.error(`   - nierozwiazana wartosc: ...${(text.match(/.{0,60}(undefined|\[object Object\]|NaN).{0,30}/) || [])[0]}...`);
    process.exit(1);
  }
  writeFileSync(`${path}.tmp`, text);
  renameSync(`${path}.tmp`, path);
}

emit(at('app/src/tokens.generated.ts'), ts);
emit(at('app/src/tokens.generated.css'), css);
console.log(`app/src/tokens.generated.{ts,css} — prog ${T.input.dragThreshold} px, cooldown ${T.input.cooldown} ms, talia ${T.session.deckMin}-${T.session.deckMax}`);
