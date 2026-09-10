// Generuje CIG z design/tokens.json:
//   design/cig.html                 EN, wersja dokumentacyjna
//   design/cig.pl.html              PL, wersja robocza
//   design/exports/cig-panel.html   EN, panel 1800 px do use case
//
// Struktura: tresc praw zyje w GROUPS, warstwa platformowa w PLATFORM, tabela
// podzialu z HIG w SPLIT -- wszystkie trzy na poziomie modulu, kazde pole {en, pl}.
// S trzyma wylacznie chrome dokumentu. Dzieki temu wersje jezykowe nie moga sie
// rozjechac: audyt wykazal, ze gdy tabela byla zduplikowana per jezyk, jeden
// wiersz zgubil flage odstepstwa, a CIG-7.2 zostal bez tlumaczenia.
//
// Liczby i barwy pochodza z tokenow. Jedyny wyjatek to paleta chrome tego
// dokumentu (tokensCss) -- nie jest wartoscia produktu i nie ma jej w tokenach.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Sciezki liczone od korzenia repo, nie od cwd -- audyt zauwazyl, ze generatory
// dzialaly "przypadkiem, bo uruchamiane z roota". npm run dev w app/ to lamalo.
const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const at = (p) => `${ROOT}${p}`;

const T = JSON.parse(readFileSync(at('design/tokens.json'), 'utf8'));

// --- WALIDACJA TOKENOW ---------------------------------------------------
// Szesc niezmiennikow, ktore audyt schematu wskazal jako "spelnione, ale cicho
// naruszalne". Teraz naruszenie zatrzymuje build zamiast wyprodukowac dokument
// twierdzacy, ze talia liczy 20-12 kart.
function validate() {
  const e = [];
  const { session: s, input: i, frame: f, color: c, scale } = T;
  if (!(s.deckMin < s.deckMax)) e.push(`session.deckMin (${s.deckMin}) musi byc mniejsze od deckMax (${s.deckMax})`);
  if (i.zoneWidth * i.zoneCount !== f.cssWidth) e.push(`input.zoneWidth * zoneCount (${i.zoneWidth}*${i.zoneCount}) != frame.cssWidth (${f.cssWidth})`);
  if (i.zoneHeight !== f.cssHeight) e.push(`input.zoneHeight (${i.zoneHeight}) != frame.cssHeight (${f.cssHeight})`);
  if (Object.keys(c.signal).length !== 4) e.push(`color.signal musi miec 4 wartosci, ma ${Object.keys(c.signal).length}`);
  for (const k of c.meaningBearing) if (!c.signal[k]) e.push(`color.meaningBearing wskazuje na nieistniejacy kolor "${k}"`);
  const screens = [...scale.dog.screens, ...scale.human.screens];
  for (const k of i.tap.allowedOn) if (!screens.includes(k)) e.push(`input.tap.allowedOn wskazuje na nieistniejacy ekran "${k}"`);
  if (e.length) { console.error('\nTOKENY NIEPOPRAWNE:'); e.forEach((x) => console.error(`   - ${x}`)); console.error(''); process.exit(1); }
}
validate();

// --- GUARD ---------------------------------------------------------------
// Audyt wykazal, ze 47 z 53 kluczy tokenow po usunieciu publikowalo slowo
// "undefined" do gotowego HTML i konczylo build kodem 0. Cztery regexy nizej
// lapia te ~50 bledow, obiekt wstawiony w miejsce napisu, niepodstawione
// placeholdery oraz polski tekst w dokumencie angielskim -- czyli klase bledu,
// ktora trzy razy przeszla review. Zapis przez plik tymczasowy, wiec odrzucony
// build nie niszczy poprzedniego, dobrego dokumentu.
const PL_DIA = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
// Diakrytyki nie wystarcza: z trzech bledow, ktore realnie sie wydarzyly,
// "8 wrzesnia" i "sygnal" maja znaki diakrytyczne, ale "figura" i "D2 rozgrzewka"
// nie -- przeszlyby. Druga warstwa to lista czestych polskich slow BEZ diakrytykow,
// dobranych tak, zeby nie kolidowaly z angielska proza techniczna.
const PL_WORDS = /\b(jest|nie|oraz|przez|tylko|dla|jako|ekran|ekranie|rozgrzewka|figura|podloze|smaczek|psa|psi|psim|talia|talii|wiersz|liczba|kart)\b/i;
function emit(path, html, { lang } = {}) {
  const bad = [];
  const first = (re) => (html.match(re) || [])[0]?.replace(/\s+/g, ' ').trim();
  if (/undefined/.test(html)) bad.push(`slowo "undefined" w wyjsciu -- token sie nie rozwiazal:\n      ...${first(/.{0,60}undefined.{0,40}/)}...`);
  if (/\[object Object\]/.test(html)) bad.push(`"[object Object]" -- obiekt wstawiony tam, gdzie oczekiwano napisu:\n      ...${first(/.{0,60}\[object Object\].{0,30}/)}...`);
  const ph = html.match(/\{(where|laws|groups)\}/g);
  if (ph) bad.push(`niepodstawione placeholdery: ${[...new Set(ph)].join(', ')}`);
  if (lang === 'en') {
    if (PL_DIA.test(html)) {
      const w = [...new Set(html.match(/[^\s<>&;"'()]*[ąćęłńóśźż][^\s<>&;"'()]*/g) || [])];
      bad.push(`polskie znaki diakrytyczne w dokumencie angielskim: ${w.slice(0, 8).join(', ')}`);
    }
    const text = html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const hits = [...new Set((text.match(new RegExp(PL_WORDS.source, 'gi')) || []).map((x) => x.toLowerCase()))];
    if (hits.length) bad.push(`polskie slowa bez diakrytykow w dokumencie angielskim: ${hits.slice(0, 8).join(', ')}`);
  }
  if (bad.length) {
    console.error(`\nBUILD ZATRZYMANY -- ${path}`);
    bad.forEach((b) => console.error(`   - ${b}`));
    console.error('');
    process.exit(1);
  }
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, html);
  renameSync(tmp, path);
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hex = (k) => T.color.signal[k].hex;
const nNeutral = Object.keys(T.color.neutral).length;
const PLAT = T.platform;
const dec = (n, lang) => (lang === 'pl' ? String(n).replace('.', ',') : String(n));
const sounds = (lang) => Object.entries(T.sound).map(([k, v]) => `${k} ${dec(v.seconds, lang)} s`).join(', ');
// Realne stosunki skali -- audyt wykazal, ze "4x" bylo wspolczynnikiem ostrosci,
// a nie stosunkiem rozmiarow, i ze "derived directly" tego nie wytrzymuje.
const R = {
  target: (T.scale.dog.minTargetWidth / T.scale.human.minTargetWidth).toFixed(1),
  targetH: (T.scale.dog.minTargetHeight / T.scale.human.minTargetHeight).toFixed(1),
  type: (T.scale.dog.display / T.scale.human.stat).toFixed(1),
};
const cssKeys = Object.keys(PLAT.css);
const namedLocks = cssKeys.slice(0, 3).map((k) => `<code>${esc(k)}</code>`);

const GROUPS = [
  { id: '1', title: { en: 'The user', pl: 'Użytkownik' },
    lede: { en: `A specification, not a description. Everything below follows from these ${'{n}'} rows.`,
            pl: `Specyfikacja, nie opis. Wszystko dalej wynika z tych ${'{n}'} wierszy.` },
    laws: [
      { id: '1.1',
        rule: { en: `Dichromat: cones peaking at <b>${T.user.conePeakShort}</b> and <b>${T.user.conePeakLongMedium}</b>. ${T.user.indistinguishable.en.join(' and ')} are indistinguishable.`,
                pl: `Dichromat: czopki przy <b>${T.user.conePeakShort}</b> i <b>${T.user.conePeakLongMedium}</b>. ${T.user.indistinguishable.pl.join(' i ')} są nieodróżnialne.` },
        why: { en: `This is not a poorer palette. It is a differently shaped colour space.`, pl: `To nie ubóstwo palety, a inna geometria przestrzeni barw.` },
        check: { en: `No information the dog needs is encoded in a ${T.user.indistinguishable.en.join('–')} opposition.`, pl: `Żadna informacja potrzebna psu nie jest zakodowana w opozycji ${T.user.indistinguishable.pl.join('–')}.` } },
      { id: '1.2',
        rule: { en: `Acuity <b>${T.user.acuityTypical}</b> (range ${T.user.acuityRange}), roughly <b>${T.user.acuityFactor}×</b> weaker than human.`,
                pl: `Ostrość <b>${T.user.acuityTypical}</b> (zakres ${T.user.acuityRange}), około <b>${dec(T.user.acuityFactor, 'pl')}×</b> słabsza od ludzkiej.` },
        why: { en: `Detail does not exist. The carriers are silhouette, colour mass and motion.`, pl: `Detal nie istnieje. Nośnikiem jest sylwetka, plama koloru i ruch.` },
        check: { en: `Every dog-mode element clears the size floor in CIG-2.3.`, pl: `Każdy element trybu psiego przechodzi próg rozmiaru z CIG-2.3.` } },
      { id: '1.3',
        rule: { en: `Flicker fusion threshold <b>${T.user.flickerFusionDog}</b>, against ${T.user.flickerFusionHuman} in humans.`,
                pl: `Próg fuzji migotania <b>${T.user.flickerFusionDog}</b>, wobec ${T.user.flickerFusionHuman} u człowieka.` },
        why: { en: `What the dog could see flickering is <b>luminance modulation</b>, not frame rate. On a sample-and-hold panel that is the dimming: this device uses ${T.frame.dimming.method} at <b>${T.frame.dimming.pwmHz} Hz</b> at every brightness, which is six times the threshold, so it fuses.`,
                pl: `Tym, co pies mógłby zobaczyć jako migotanie, jest <b>modulacja jasności</b>, nie liczba klatek. Na panelu sample-and-hold to ściemnianie: to urządzenie używa ${T.frame.dimming.method} ${T.frame.dimming.pwmHz} Hz przy każdej jasności, czyli sześciokrotnie powyżej progu, więc obraz się zlewa.` },
        check: { en: `Screen dimming above ${T.user.flickerFusionDog}: satisfied at ${T.frame.dimming.pwmHz} Hz. <b>Room lighting is the open risk</b> — a dimmed or mains-driven lamp can modulate below the threshold, and it is outside the app.`,
                 pl: `Ściemnianie ekranu powyżej ${T.user.flickerFusionDog}: spełnione przy ${T.frame.dimming.pwmHz} Hz. <b>Otwartym ryzykiem jest światło w pokoju</b> — ściemniana lub sieciowa lampa może modulować poniżej progu, a to jest poza aplikacją.` } },
      { id: '1.4',
        rule: { en: `The input device is <b>${T.user.inputOrgan.en}</b>.`, pl: `Urządzeniem wejściowym jest <b>${T.user.inputOrgan.pl}</b>.` },
        why: { en: `A wet nose is a large, moist, multi-point contact patch.`, pl: `Mokry nos to duża, wilgotna, wielopunktowa plama kontaktu.` },
        check: { en: `No interaction requires precision or a discrete tap; see CIG-3.`, pl: `Interakcja nie wymaga precyzji ani stuknięcia; patrz CIG-3.` } },
      { id: '1.5',
        rule: { en: `Contrast and size floors are set by <b>${T.user.contrastFloorSetBy.en}</b>, not the younger dog.`,
                pl: `Próg kontrastu i rozmiaru ustala <b>${T.user.contrastFloorSetBy.pl}</b>, nie młodszy pies.` },
        why: { en: `If it reads for her, it reads for both. The converse does not hold.`, pl: `Jeśli czyta się dla niej, czyta się dla obojga. Odwrotnie nie.` },
        check: { en: `Tests run on both dogs; thresholds validated on the older.`, pl: `Testy prowadzone na obu psach, progi walidowane na starszym.` } },
      { id: '1.6',
        rule: { en: `The dog does <b>not read an image as standing for</b> a real dog.`, pl: `Pies <b>nie odczytuje obrazu jako reprezentacji</b> realnego psa.` },
        why: { en: `It discriminates image features, but an image need not substitute for its real-world referent.`, pl: `Rozróżnia cechy obrazu, ale obraz nie musi zastępować odpowiednika w świecie.` },
        check: { en: `The product's output is a preference ranking, never a "match".`, pl: `Wyjściem produktu jest ranking preferencji, nigdy „match".` } },
    ] },
  { id: '2', title: { en: 'Perception', pl: 'Percepcja' },
    lede: { en: `What may be shown, and how large it has to be.`, pl: `Co wolno pokazać i jak duże to musi być.` },
    laws: [
      { id: '2.1',
        rule: { en: `Meaning is carried <b>only by the ${T.color.meaningBearing.join(' ↔ ')} opposition</b> (<code>${hex('blue')}</code> ↔ <code>${hex('acid')}</code>). ${T.color.ground.join(' and ')} are figure and ground, not meanings.`,
                pl: `Znaczenie niesie <b>wyłącznie opozycja ${T.color.meaningBearing.join(' ↔ ')}</b> (<code>${hex('blue')}</code> ↔ <code>${hex('acid')}</code>). ${T.color.ground.join(' i ')} to figura i tło, nie znaczenia.` },
        why: { en: `Both hues sit near the peaks of canine cone sensitivity.`, pl: `Obie barwy leżą blisko szczytów czułości psich czopków.` },
        check: { en: `The neutral ramp (${nNeutral} steps) appears in no signal role.`, pl: `Rampa neutralna (${nNeutral} odcieni) nie występuje w żadnej roli sygnałowej.` } },
      { id: '2.2',
        rule: { en: `State must never be encoded in ${T.user.indistinguishable.en.join(' or ')}.`, pl: `Zakaz kodowania stanu barwą ${T.user.indistinguishable.pl.join(' lub ')}.` },
        why: { en: `To a dichromat both are grey, so the semantics do not exist.`, pl: `Dla dichromata obie są szarością, więc semantyka nie istnieje.` },
        check: { en: `Grepping the dog-mode artboards finds neither hue.`, pl: `Grep po artboardach trybu psiego nie znajduje żadnej z nich.` } },
      { id: '2.3',
        rule: { en: `Minimum dog-mode target <b>${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} ${T.scale.human.minTargetUnit}</b>. Type scale display ${T.scale.dog.display} / name ${T.scale.dog.name} / value ${T.scale.dog.value}.`,
                pl: `Minimalny cel w trybie psim <b>${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} ${T.scale.human.minTargetUnit}</b>. Skala display ${T.scale.dog.display} / name ${T.scale.dog.name} / value ${T.scale.dog.value}.` },
        why: { en: `The acuity factor is ${T.user.acuityFactor}×, but the floors run higher still: ${R.target}× on target width, ${R.targetH}× on height, ${R.type}× on display type. The acuity number sets the direction, not the sizes.`,
               pl: `Współczynnik ostrości to ${dec(T.user.acuityFactor, 'pl')}×, ale progi są wyższe: ${dec(R.target, 'pl')}× na szerokości celu, ${dec(R.targetH, 'pl')}× na wysokości, ${dec(R.type, 'pl')}× na typografii display. Ostrość wyznacza kierunek, nie rozmiary.` },
        check: { en: `Decision zones measure ${T.input.zoneWidth}×${T.input.zoneHeight} px — the full frame height.`, pl: `Strefy decyzji mają ${T.input.zoneWidth}×${T.input.zoneHeight} px, czyli pełną wysokość ramki.` } },
      { id: '2.4',
        rule: { en: `Figure and ground separated by maximum contrast: ${hex('ink')} against ${hex('white')}, ${hex('acid')} against ${hex('ink')}.`,
                pl: `Figura i tło rozdzielone maksymalnym kontrastem: ${hex('ink')} przeciw ${hex('white')}, ${hex('acid')} przeciw ${hex('ink')}.` },
        why: { en: `Contrast, not hue, is the dog's primary information channel.`, pl: `Kontrast, nie barwa, jest u psa głównym kanałem informacji.` },
        check: { en: `Every signal survives conversion to greyscale.`, pl: `Każdy sygnał czytelny po konwersji do skali szarości.` } },
      { id: '2.5',
        rule: { en: `<b>${T.frame.refresh} Hz for motion continuity</b>, not against flicker — flicker is CIG-1.3 and the dimming already clears it. Animate <code>${T.motion.animatableProperties.join('</code> and <code>')}</code> only.`,
                pl: `<b>${T.frame.refresh} Hz dla płynności ruchu</b>, nie przeciw migotaniu — migotanie to CIG-1.3, a ściemnianie już je przechodzi. Animacje wyłącznie na <code>${T.motion.animatableProperties.join('</code> i <code>')}</code>.` },
        why: { en: `The dog resolves change up to ${T.user.flickerFusionDog}, so motion updated at ${T.motion.rafDefaultHz} fps is steppier to it than to us. <b>${T.motion.rafDefaultHz} fps is the platform default, not the hardware ceiling</b>: ${T.motion.rafHint.en}`,
               pl: `Pies rozdziela zmianę do ${T.user.flickerFusionDog}, więc ruch odświeżany w ${T.motion.rafDefaultHz} fps jest dla niego bardziej skokowy niż dla nas. <b>${T.motion.rafDefaultHz} fps to domyślna wartość platformy, nie pułap sprzętu</b>: ${T.motion.rafHint.pl}` },
        check: { en: `Nothing renders at ${T.motion.fpsFloor} fps; no layout animation anywhere. Measure the achieved rate and record it — do not assume the panel's ${T.frame.refresh} Hz reaches the page.`,
                 pl: `Nic nie renderuje się w ${T.motion.fpsFloor} fps; brak animacji layoutu. Zmierz osiągniętą liczbę klatek i zapisz ją — nie zakładaj, że ${T.frame.refresh} Hz panelu dociera do strony.` } },
      { id: '2.6',
        rule: { en: `Text is <b>for the human only</b>.`, pl: `Tekst jest <b>wyłącznie dla człowieka</b>.` },
        why: { en: `The dog does not read. A letterform cannot be the sole carrier of information.`, pl: `Pies nie czyta. Litera nie może być jedynym nośnikiem informacji.` },
        check: { en: `Every dog-mode message has a non-text carrier: shape, motion or sound.`, pl: `Każdy komunikat trybu psiego ma nośnik nietekstowy: kształt, ruch albo dźwięk.` } },
    ] },
  { id: '3', title: { en: 'Input', pl: 'Wejście' },
    lede: { en: `Input is a patch, not a point — and a drag, not a tap.`, pl: `Wejście to plama, nie punkt — i przesunięcie, nie stuknięcie.` },
    laws: [
      { id: '3.1',
        rule: { en: `The interaction primitive is a <b>${T.input.primitive.en}</b>. Forbidden: ${T.input.forbidden.en.join(', ')}. One exception, CIG-3.6.`,
                pl: `Prymitywem interakcji jest <b>${T.input.primitive.pl}</b>. Zakazane: ${T.input.forbidden.pl.join(', ')}. Jeden wyjątek, CIG-3.6.` },
        why: { en: `Canine screen input naturally resembles a swipe and a drag. The Tinder gesture is, by coincidence, the right gesture.`, pl: `Psi input z natury przypomina przesunięcie i przeciągnięcie. Gest Tindera jest przypadkiem właściwym gestem.` },
        check: { en: `No handler listens for a tap event in dog mode, outside ${T.input.tap.allowedOn.join(', ')}.`, pl: `Żaden handler nie nasłuchuje stuknięcia w trybie psim, poza ${T.input.tap.allowedOn.join(', ')}.` } },
      { id: '3.2',
        rule: { en: `The pointer is <b>${T.input.pointerModel.en}</b>.`, pl: `Wskaźnik to <b>${T.input.pointerModel.pl}</b>.` },
        why: { en: `A nose contact is an area, not a cursor, and the number of points is incidental.`, pl: `Kontakt nosa to obszar, nie kursor; liczba punktów jest przypadkowa.` },
        check: { en: `Decision logic never reads <code>touches.length</code>.`, pl: `Logika decyzji nie odczytuje <code>touches.length</code>.` } },
      { id: '3.3',
        rule: { en: `Drag threshold <b>${T.input.dragThreshold} px</b>. Direction comes from the screen half: ${T.input.zoneCount} zones of ${T.input.zoneWidth} px across the full ${T.input.zoneHeight} px height.`,
                pl: `Próg przesunięcia <b>${T.input.dragThreshold} px</b>. Kierunek wyznacza połowa ekranu: ${T.input.zoneCount} strefy po ${T.input.zoneWidth} px na pełnej wysokości ${T.input.zoneHeight} px.` },
        why: { en: `A low threshold and enormous zones remove any demand for precision.`, pl: `Niski próg i ogromne strefy zdejmują wymóg precyzji.` },
        check: { en: `Any drag longer than ${T.input.dragThreshold} px yields a decision.`, pl: `Każdy drag dłuższy niż ${T.input.dragThreshold} px daje decyzję.` } },
      { id: '3.4',
        rule: { en: `After a decision, input is locked for <b>${T.input.cooldown} ms</b>.`, pl: `Po decyzji blokada wejścia <b>${T.input.cooldown} ms</b>.` },
        why: { en: `One long nose drag must not register as three decisions.`, pl: `Jedno długie pociągnięcie nosem nie może dać trzech decyzji.` },
        check: { en: `Two decisions less than ${T.input.cooldown} ms apart are impossible.`, pl: `Dwie decyzje w odstępie mniejszym niż ${T.input.cooldown} ms są niemożliwe.` } },
      { id: '3.5',
        rule: { en: `Undo is a <b>core function</b>, at human scale, reachable by the person sitting alongside.`, pl: `Cofnięcie jest <b>funkcją rdzeniową</b>, w skali ludzkiej, dostępne dla człowieka obok.` },
        why: { en: `A wet nose misfires routinely. In Tinder and Bumble undo is a paid feature; here the mistake is the norm, not the exception.`, pl: `Mokry nos myli się regularnie. W Tinderze i Bumble undo jest funkcją płatną; tutaj pomyłka jest normą, nie wyjątkiem.` },
        check: { en: `Undo is visible on D3 and reachable without leaving the session.`, pl: `Cofnięcie widoczne na D3 i osiągalne bez wychodzenia z sesji.` } },
      { id: '3.6',
        rule: { en: `The only exception to the no-tap rule is <b>${T.input.tap.allowedOn.join(', ')}</b>.`, pl: `Jedyny wyjątek od zakazu stuknięć: <b>${T.input.tap.allowedOn.join(', ')}</b>.` },
        why: { en: `${T.input.tap.why.en}.`, pl: `${T.input.tap.why.pl}.` },
        check: { en: `The exception is recorded in the tokens as <code>input.tap.allowedOn</code> and extends to no other screen.`, pl: `Wyjątek zapisany w tokenach jako <code>input.tap.allowedOn</code> i nie rozszerza się na inne ekrany.` } },
    ] },
  { id: '4', title: { en: 'Feedback', pl: 'Sprzężenie zwrotne' },
    lede: { en: `What happens after a decision — and where the loop actually closes.`, pl: `Co się dzieje po decyzji — i gdzie ta pętla naprawdę się zamyka.` },
    laws: [
      { id: '4.1',
        rule: { en: `Every "yes" <b>does something immediately</b>. No "maybe later" pile.`, pl: `Każde „tak" <b>natychmiast coś robi</b>. Żadnego stosu „może później".` },
        why: { en: `The lesson from the graveyard of swipe-for-jobs apps: a swipe that only defers an item saves nobody anything.`, pl: `Lekcja z cmentarza apek o pracę: swipe, który tylko odkłada ofertę, nie oszczędza niczego.` },
        check: { en: `A decision fires sound, the reward cue and the ranking entry in the same moment.`, pl: `Decyzja wywołuje dźwięk, zapowiedź nagrody i wpis w rankingu w tym samym momencie.` } },
      { id: '4.2',
        rule: { en: `Sound is a <b>primary</b> carrier: ${sounds('en')}.`, pl: `Dźwięk jest nośnikiem <b>pierwszorzędnym</b>: ${sounds('pl')}.` },
        why: { en: `In a dog, hearing outranks vision — the more so at ${T.user.acuityTypical} acuity.`, pl: `U psa słuch bije wzrok, zwłaszcza przy ostrości ${T.user.acuityTypical}.` },
        check: { en: `Every decision event has an assigned sound; levels come from the tokens.`, pl: `Każde zdarzenie decyzyjne ma przypisany dźwięk; poziomy z tokenów.` } },
      { id: '4.3',
        rule: { en: `Motion is information, not ornament. <code>prefers-reduced-motion</code> applies to human mode.`, pl: `Ruch jest informacją, nie ozdobą. <code>prefers-reduced-motion</code> dotyczy trybu ludzkiego.` },
        why: { en: `${T.motion.reducedMotion.en.charAt(0).toUpperCase()}${T.motion.reducedMotion.en.slice(1)}.`, pl: `${T.motion.reducedMotion.pl.charAt(0).toUpperCase()}${T.motion.reducedMotion.pl.slice(1)}.` },
        check: { en: `Disabling animation in dog mode is not implemented, and should not be.`, pl: `Wyłączenie animacji w trybie psim nie jest zaimplementowane i nie powinno być.` } },
      { id: '4.4',
        rule: { en: `The reward is <b>physical</b>. The screen ${T.reward.screenRole.en}.`, pl: `Nagroda jest <b>fizyczna</b>. Ekran ${T.reward.screenRole.pl}.` },
        why: { en: `The loop closes with a treat from ${T.reward.deliveredBy.en}, in the room — not on the glass.`, pl: `Pętla zamyka się smaczkiem od ${T.reward.deliveredBy.pl}, w pokoju — nie na szkle.` },
        check: { en: `D4 carries an explicit cue to the human that it is treat time.`, pl: `D4 zawiera jawny sygnał dla człowieka, że czas na smaczek.` } },
      { id: '4.5',
        rule: { en: `A human present in the room is <b>required</b>.`, pl: `Obecność człowieka w pomieszczeniu jest <b>wymagana</b>.` },
        why: { en: `Canine engagement in an on-screen task rises with a person alongside.`, pl: `Zaangażowanie psa w zadanie na ekranie rośnie przy człowieku obok.` },
        check: { en: `The design admits no session in which the dog is left alone with the phone.`, pl: `Projekt nie przewiduje sesji, w której pies zostaje sam z telefonem.` } },
    ] },
  { id: '5', title: { en: 'Session', pl: 'Sesja' },
    lede: { en: `The app ends. That is a decision, not a shortcut.`, pl: `Aplikacja ma koniec. To nie oszczędność, to decyzja.` },
    laws: [
      { id: '5.1',
        rule: { en: `A deck holds <b>${T.session.deckMin}–${T.session.deckMax} cards</b> and it ends.`, pl: `Talia liczy <b>${T.session.deckMin}–${T.session.deckMax} kart</b> i się kończy.` },
        why: { en: `The floor is ${T.session.deckMin} because ${T.session.deckFloorWhy.en}.`, pl: `Dolna granica to ${T.session.deckMin}, bo ${T.session.deckFloorWhy.pl}.` },
        check: { en: `After the last card an end state appears, not another card.`, pl: `Po ostatniej karcie pojawia się stan końcowy, a nie kolejna karta.` } },
      { id: '5.2',
        rule: { en: `No feed, no notifications, no streaks.`, pl: `Brak feedu, brak powiadomień, brak streaków.` },
        why: { en: `Swipe fatigue is a documented phenomenon: monetisation over purpose, repetitive labour instead of pleasure.`, pl: `Zmęczenie swipe'em jest rozpoznanym zjawiskiem: monetyzacja ponad cel, powtarzalna praca zamiast przyjemności.` },
        check: { en: `The code contains no notification schedule and no streak counter.`, pl: `Kod nie zawiera harmonogramu powiadomień ani licznika serii.` } },
      { id: '5.3',
        rule: { en: `Success is measured by <b>regularity and in-session engagement</b>, not time in app.`, pl: `Metryką sukcesu jest <b>regularność i zaangażowanie w sesji</b>, nie czas w aplikacji.` },
        why: { en: `The value to an ageing dog is cognitive stimulation, and that does not scale with session length.`, pl: `Wartością dla starszego psa jest stymulacja poznawcza, a ta nie skaluje się długością sesji.` },
        check: { en: `H1 reports decision times and the drop-off point, not total screen time.`, pl: `H1 raportuje czas decyzji i punkt spadku, nie łączny czas ekranu.` } },
    ] },
  { id: '6', title: { en: 'The mode boundary', pl: 'Granica trybów' },
    lede: { en: `One law, but the product makes no sense without it.`, pl: `Jedno prawo, ale bez niego produkt nie ma sensu.` },
    laws: [
      { id: '6.1',
        rule: { en: `<b>The dog does not enter human mode.</b> The transition gesture must be impossible for a nose — two simultaneous contact points, or a sequence.`,
                pl: `<b>Pies nie wchodzi w tryb ludzki.</b> Gest przejścia musi być niewykonalny nosem — dwa punkty kontaktu naraz albo sekwencja.` },
        why: { en: `Human mode holds data, profile editing and meeting approvals. A nose must not land there by accident.`, pl: `Tryb ludzki zawiera dane, edycję profili i zatwierdzanie spotkań. Nos nie może tam trafić przypadkiem.` },
        check: { en: `No screen ${T.scale.dog.screens.join(', ')} contains a single target leading to ${T.scale.human.screens.join(', ')}.`, pl: `Żaden ekran ${T.scale.dog.screens.join(', ')} nie zawiera pojedynczego celu prowadzącego do ${T.scale.human.screens.join(', ')}.` } },
      { id: '6.2',
        rule: { en: `The end-of-session screen carries <b>no "next" affordance at all</b>.`, pl: `Ekran końca sesji nie ma <b>żadnej afordancji „dalej"</b>.` },
        why: { en: `An affordance the size of a nose is an affordance for a nose, whatever the intent behind it.`, pl: `Afordancja wielkości nosa jest afordancją dla nosa, niezależnie od intencji.` },
        check: { en: `D5 contains no bordered or filled rectangle at target dimensions.`, pl: `D5 nie zawiera obramowanego ani wypełnionego prostokąta o wymiarach celu.` } },
      { id: '6.3',
        rule: { en: `At the OS level, iOS <b>Guided Access</b> closes the boundary.`, pl: `Poziom systemu domyka <b>Dostęp nadzorowany</b> iOS.` },
        why: { en: `It blocks the exit into Settings; CIG-6.1 governs the inside of the app.`, pl: `Blokuje wyjście do Ustawień; CIG-6.1 dotyczy wnętrza aplikacji.` },
        check: { en: `The session procedure includes enabling Guided Access before the phone reaches the dog.`, pl: `Procedura sesji zawiera włączenie Dostępu nadzorowanego przed podaniem telefonu psu.` } },
    ] },
];

// Warstwa platformowa -- prawa jak wszystkie inne, wiec z checkiem i w checkliscie.
const PLATFORM = [
  { id: '7.1',
    rule: { en: `Browser locks, on <code>html</code> and <code>body</code>:`, pl: `Blokady przeglądarki, na <code>html</code> i <code>body</code>:` },
    code: Object.entries(PLAT.css).map(([k, v]) => `${esc(k)}: ${esc(v)};`).join('<br>'),
    why: { en: `Without ${namedLocks.join(', ')} a nose dragged across the glass selects text, raises the magnifier loupe and scrolls the page.`,
           pl: `Bez ${namedLocks.join(', ')} nos przeciągnięty po ekranie zaznacza tekst, wywołuje lupę i przewija stronę.` },
    check: { en: `Dragging a finger across the screen on the device selects no text, raises no loupe and does not bounce the page.`,
             pl: `Przeciągnięcie palcem po ekranie na urządzeniu nie zaznacza tekstu, nie pokazuje lupy i nie odbija strony.` } },
  { id: '7.2',
    rule: { en: `Viewport <code>${esc(PLAT.viewport)}</code>, manifest <code>display: ${esc(PLAT.manifest.display)}</code>, <code>${esc(PLAT.manifest.orientation)}</code>, <code>${esc(PLAT.manifest.background_color)}</code>.`,
            pl: `Viewport <code>${esc(PLAT.viewport)}</code>, manifest <code>display: ${esc(PLAT.manifest.display)}</code>, <code>${esc(PLAT.manifest.orientation)}</code>, <code>${esc(PLAT.manifest.background_color)}</code>.` },
    why: { en: `Standalone removes the Safari chrome; <code>viewport-fit=cover</code> hands us the full ${T.frame.cssWidth}×${T.frame.cssHeight} px frame.`,
           pl: `Standalone zdejmuje pasek Safari, <code>viewport-fit=cover</code> oddaje pełną ramkę ${T.frame.cssWidth}×${T.frame.cssHeight} px.` },
    check: { en: `After adding to the home screen no browser interface is visible.`, pl: `Po dodaniu do ekranu głównego nie widać interfejsu przeglądarki.` } },
  { id: '7.3',
    rule: { en: `Safe areas: ${T.frame.safeAreaTop} px top, ${T.frame.safeAreaBottom} px bottom, via <code>${esc(PLAT.safeAreaCss)}</code>.`,
            pl: `Bezpieczne obszary: górny ${T.frame.safeAreaTop} px, dolny ${T.frame.safeAreaBottom} px, przez <code>${esc(PLAT.safeAreaCss)}</code>.` },
    why: { en: `The real status bar and home indicator draw over our layout. We never paint a fake one.`, pl: `Prawdziwy pasek statusu i wskaźnik rysują się na naszym layoucie. Udawanego nie rysujemy nigdy.` },
    check: { en: `No artboard paints a status bar; content stays clear of the home indicator.`, pl: `Żaden artboard nie zawiera namalowanego paska statusu; treść nie wchodzi pod wskaźnik.` } },
  { id: '7.4',
    rule: { en: `<b>Unlock audio on ${PLAT.audioUnlock.where.en}.</b>`, pl: `<b>Odblokowanie dźwięku na ${PLAT.audioUnlock.where.pl}.</b>` },
    why: { en: `${PLAT.audioUnlock.why.en}.`, pl: `${PLAT.audioUnlock.why.pl}.` },
    check: { en: `The bark plays on the first "yes" of the session, not the second.`, pl: `Szczeknięcie gra przy pierwszym „tak" w sesji, a nie dopiero przy drugim.` } },
  { id: '7.5',
    rule: { en: `Profile video carries <code>${PLAT.video.attributes.join('</code> <code>')}</code>.`, pl: `Wideo profilu z atrybutami <code>${PLAT.video.attributes.join('</code> <code>')}</code>.` },
    why: { en: `${PLAT.video.consequence.en}.`, pl: `${PLAT.video.consequence.pl}.` },
    check: { en: `Video starts by itself on the device, with no gesture and no fullscreen.`, pl: `Wideo startuje samo na urządzeniu, bez gestu i bez pełnego ekranu.` } },
];

// Tabela podzialu -- JEDNA tablica dwujezyczna. Gdy byla zduplikowana per jezyk,
// wiersz "reduced motion" zgubil flage i trzy dokumenty twierdzily "trzy odstepstwa"
// przy dwoch oznaczonych.
const SPLIT = [
  { concern: { en: 'Minimum target', pl: 'Minimalny cel' },
    dog: { en: `<b>CIG-2.3</b> — ${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} px`, pl: `<b>CIG-2.3</b> — ${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} px` },
    human: { en: `HIG — ${T.scale.human.higTargetPt}×${T.scale.human.higTargetPt} pt, adopted unchanged`, pl: `HIG — ${T.scale.human.higTargetPt}×${T.scale.human.higTargetPt} pt, przyjmujemy bez zmian` },
    departure: false },
  { concern: { en: 'Semantic colour', pl: 'Kolor semantyczny' },
    dog: { en: `<b>CIG-2.2</b> — ${T.user.indistinguishable.en.join(' and ')} forbidden as encodings`, pl: `<b>CIG-2.2</b> — ${T.user.indistinguishable.pl.join(' i ')} zakazane jako kod` },
    human: { en: `HIG permits destructive red; we stay on ${T.color.meaningBearing.join(' ↔ ')} so both modes read as one product`, pl: `HIG dopuszcza czerwień destrukcyjną; zostajemy przy ${T.color.meaningBearing.join(' ↔ ')} dla spójności obu trybów` },
    departure: true },
  { concern: { en: 'Typography', pl: 'Typografia' },
    dog: { en: `<b>CIG-2.3</b> — display ${T.scale.dog.display} px`, pl: `<b>CIG-2.3</b> — display ${T.scale.dog.display} px` },
    human: { en: `HIG assumes SF Pro and Dynamic Type; we use ${T.typography.display.family} and ${T.typography.text.family}, because identity has to span both modes`, pl: `HIG zakłada SF Pro i Dynamic Type; używamy ${T.typography.display.family} i ${T.typography.text.family}, bo tożsamość musi łączyć oba tryby` },
    departure: true },
  { concern: { en: 'Gestures', pl: 'Gesty' },
    dog: { en: `<b>CIG-3.1</b> — ${T.input.primitive.en} only, one exception (CIG-3.6)`, pl: `<b>CIG-3.1</b> — wyłącznie ${T.input.primitive.pl}, jeden wyjątek (CIG-3.6)` },
    human: { en: `HIG — taps and standard gestures, adopted unchanged`, pl: `HIG — stuknięcia i standardowe gesty, bez zmian` },
    departure: false },
  { concern: { en: 'Safe areas', pl: 'Bezpieczne obszary' },
    dog: { en: `<b>CIG-7.3</b> — ${T.frame.safeAreaTop} px and ${T.frame.safeAreaBottom} px`, pl: `<b>CIG-7.3</b> — ${T.frame.safeAreaTop} px i ${T.frame.safeAreaBottom} px` },
    human: { en: `HIG — identical`, pl: `HIG — identycznie` },
    departure: false },
  { concern: { en: 'Reduced motion', pl: 'Redukcja ruchu' },
    dog: { en: `<b>CIG-4.3</b> — not honoured; motion carries information`, pl: `<b>CIG-4.3</b> — nie stosujemy, ruch jest informacją` },
    human: { en: `HIG — <code>prefers-reduced-motion</code> honoured`, pl: `HIG — <code>prefers-reduced-motion</code> respektowane` },
    departure: false },
];

const flat = GROUPS.flatMap((g) => g.laws);
const ALL = [...flat, ...PLATFORM];
const nDepartures = SPLIT.filter((r) => r.departure).length;

const S = {
  en: { lang: 'en', why: 'Why', check: 'Check', lawsN: 'laws',
    deck: `Interface guidelines for a user you <em>cannot ask</em>: a dichromat with ${T.user.acuityTypical} acuity whose input device is ${T.user.inputOrgan.en}.`,
    whyNotTitle: 'Why not HIG',
    whyNot: `Human Interface Guidelines describe a human: a fingertip, a ${T.scale.human.higTargetPt} pt target, red as warning, text as content. Every one of those assumptions breaks on our user, so in dog mode HIG are not merely insufficient — they are <strong>harmful</strong>. CIG states the laws for the dog; for the human we defer to HIG and record only the ${nDepartures} places where we depart from it.`,
    ssot: `Every number and colour in a law comes from <code>design/tokens.json</code> and is interpolated at build time. The one exception is this document's own chrome palette, which is not a product value and is not in the tokens.`,
    ssotWhy: `A review audit found the input cooldown restated in seven files and the palette hardcoded across ten artboards. The artboards are not fixed yet — this file exists so the restating stops spreading, and the build now refuses to publish a document containing an unresolved token or Polish text in the English version.`,
    platTitle: 'Platform layer', higTitle: 'Where HIG governs, not us',
    higLede: `We are building a PWA, so Human Interface Guidelines do not formally bind us — Apple does not review a page added to the home screen. But in human mode HIG describes <strong>expectations</strong>, and those hold regardless of who enforces them. For ${T.scale.human.screens.join('–')} we do not rewrite HIG: we defer to it and record only our ${nDepartures} departures.`,
    checkTitle: 'Compliance checklist',
    checkLede: `Every one of the ${ALL.length} laws — the ${flat.length} in groups one to six plus the ${PLATFORM.length} in the platform layer — carries a check you can run against a finished screen. A law without a check is decoration, so there is not one on this list.`,
    thId: 'Concern', thDog: `Dog mode · ${T.scale.dog.screens[0]}–${T.scale.dog.screens.at(-1)}`, thHuman: `Human mode · ${T.scale.human.screens[0]}–${T.scale.human.screens.at(-1)}`,
    groupsTitle: `${GROUPS.length} groups of laws`, splitTitle: 'Where CIG governs and where HIG does',
    departure: 'Departure.', chapter: 'Chapter 09', plOther: 'wersja polska' },
  pl: { lang: 'pl', why: 'Dlaczego', check: 'Sprawdzenie', lawsN: 'praw',
    deck: `Wytyczne interfejsu dla użytkownika, którego <em>nie da się zapytać</em>: dichromata o ostrości ${T.user.acuityTypical}, którego urządzeniem wejściowym jest ${T.user.inputOrgan.pl}.`,
    whyNotTitle: 'Dlaczego nie HIG',
    whyNot: `Human Interface Guidelines opisują człowieka: palec, ${T.scale.human.higTargetPt} pt celu, czerwień jako ostrzeżenie, tekst jako treść. Każde z tych założeń pęka na naszym użytkowniku, więc w trybie psim HIG nie są niewystarczające — są <strong>szkodliwe</strong>. CIG opisuje prawa dla psa; dla człowieka odsyłamy do HIG i notujemy tylko ${nDepartures} miejsca, w których się rozchodzimy.`,
    ssot: `Każda liczba i barwa w prawie pochodzi z <code>design/tokens.json</code> i jest wstawiana przy generowaniu. Jedynym wyjątkiem jest paleta chrome tego dokumentu, która nie jest wartością produktu i nie ma jej w tokenach.`,
    ssotWhy: `Audyt review wykazał, że cooldown wejścia żył w siedmiu plikach, a paleta była wpisana na sztywno w dziesięciu artboardach. Artboardy nie są jeszcze naprawione — ten plik istnieje, żeby powtarzanie przestało się rozprzestrzeniać, a build odmawia teraz publikacji dokumentu z nierozwiązanym tokenem albo polskim tekstem w wersji angielskiej.`,
    platTitle: 'Warstwa platformowa', higTitle: 'Gdzie rządzi HIG, a nie my',
    higLede: `Budujemy PWA, więc Human Interface Guidelines nas formalnie nie obowiązują — Apple nie recenzuje strony dodanej do ekranu głównego. Ale w trybie ludzkim HIG opisuje <strong>oczekiwania</strong>, a te obowiązują niezależnie od tego, kto je wymusza. Dla ${T.scale.human.screens.join('–')} nie przepisujemy HIG: odsyłamy i zapisujemy tylko ${nDepartures} odstępstwa.`,
    checkTitle: 'Checklista zgodności',
    checkLede: `Każde z ${ALL.length} praw — ${flat.length} w grupach od pierwszej do szóstej plus ${PLATFORM.length} w warstwie platformowej — ma sprawdzenie wykonalne na gotowym ekranie. Prawo bez sprawdzenia jest ozdobą, więc na tej liście nie ma ani jednego.`,
    thId: 'Zagadnienie', thDog: `Tryb psi · ${T.scale.dog.screens[0]}–${T.scale.dog.screens.at(-1)}`, thHuman: `Tryb ludzki · ${T.scale.human.screens[0]}–${T.scale.human.screens.at(-1)}`,
    groupsTitle: `${GROUPS.length} grup praw`, splitTitle: 'Gdzie rządzi CIG, a gdzie HIG',
    departure: 'Odstępstwo.', chapter: 'Rozdział 09', plOther: 'English version' },
};

const tokensCss = `:root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--warm:#EFE9D6;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ground:#0D1014;--panel:#171B21;--tint:#171C2E;--warm:#1E1B14;--ink:#EDEFEA;--muted:#9AA3B1;--faint:#5A6470;--blue:#7E92FF;--acid:#C3D122;--rule:#242A33;--rule-strong:#3A424E}}
  :root[data-theme="dark"]{--ground:#0D1014;--panel:#171B21;--tint:#171C2E;--warm:#1E1B14;--ink:#EDEFEA;--muted:#9AA3B1;--faint:#5A6470;--blue:#7E92FF;--acid:#C3D122;--rule:#242A33;--rule-strong:#3A424E}`;

const lawRow = (l, L) => `      <div class="law"><span class="id">CIG-${l.id}</span><div>
        <p class="rule">${l.rule[L.lang]}</p>${l.code ? `<div class="code">${l.code}</div>` : ''}
        <div class="meta"><div class="why"><b>${L.why}</b>${l.why[L.lang]}</div><div class="chk"><b>${L.check}</b>${l.check[L.lang]}</div></div>
      </div></div>`;

const section = (eyebrow, title, lede, body) => `
  <section>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
      <p class="mono" style="color:var(--acid)">${eyebrow}</p>
      <h2>${esc(title)}</h2>
      <p class="lede">${lede}</p>
    </div>
${body}
  </section>`;

function buildDoc(L) {
  const laws = GROUPS.map((g) => section(`CIG-${g.id}`, g.title[L.lang],
    g.lede[L.lang].replace('{n}', g.laws.length),
    `    <div style="border-top:2px solid var(--rule-strong)">\n${g.laws.map((l) => lawRow(l, L)).join('\n')}\n    </div>`)).join('\n');

  const platform = section('CIG-7', L.platTitle, PLATFORM[0].why[L.lang],
    `    <div style="border-top:2px solid var(--rule-strong)">\n${PLATFORM.map((l) => lawRow(l, L)).join('\n')}\n    </div>`);

  const hig = section('CIG-8', L.higTitle, L.higLede,
    `    <div class="tw"><table>
      <thead><tr><th class="mono">${L.thId}</th><th class="mono">${L.thDog}</th><th class="mono">${L.thHuman}</th></tr></thead>
      <tbody>
${SPLIT.map((r) => `        <tr><td>${r.concern[L.lang]}</td><td>${r.dog[L.lang]}</td><td${r.departure ? ' class="dev"' : ''}>${r.departure ? `<b>${L.departure}</b> ` : ''}${r.human[L.lang]}</td></tr>`).join('\n')}
      </tbody>
    </table></div>`);

  const checklist = section('CIG-9', L.checkTitle, L.checkLede,
    `    <div style="border-top:2px solid var(--rule-strong)">
${ALL.map((l) => `      <div style="display:grid;grid-template-columns:74px minmax(0,1fr);gap:18px;padding:10px 0;border-bottom:1px solid var(--rule)"><span class="mono" style="color:var(--blue);font-size:11.5px;letter-spacing:0.04em">CIG-${l.id}</span><span style="font-size:15.5px;line-height:1.45">${l.check[L.lang]}</span></div>`).join('\n')}
    </div>`);

  return `<title>${T.meta.specName}${L.lang === 'pl' ? ' po polsku' : ''}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&amp;family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&amp;family=IBM+Plex+Mono:wght@400;600&amp;display=swap">
<style>${tokensCss}
  body{background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,'Times New Roman',serif;font-size:18px;line-height:1.6;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1040px;margin:0 auto;padding:52px 24px 88px}
  h1,h2{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;margin:0;letter-spacing:-0.015em;text-wrap:balance}
  h1{font-size:clamp(36px,5.4vw,56px);line-height:1.03}
  h2{font-size:30px;line-height:1.12}
  p{margin:0}
  a{color:var(--blue);text-underline-offset:2px}a:hover{color:var(--ink)}
  code{font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:0.86em;background:var(--panel);padding:1px 5px}
  .mono{font-family:'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;letter-spacing:0.09em;text-transform:uppercase;font-weight:600}
  header.top{display:flex;flex-direction:column;gap:18px;padding-bottom:32px;border-bottom:2px solid var(--ink)}
  .meta{display:flex;flex-wrap:wrap;gap:8px 24px;color:var(--muted)}
  .deck{font-size:21px;line-height:1.5;max-width:62ch}
  .thesis{background:var(--tint);padding:24px 26px;margin-top:26px;max-width:76ch;display:flex;flex-direction:column;gap:10px}
  .thesis .mono{color:var(--blue)}
  .swatches{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px;background:var(--rule);margin-top:26px}
  .sw{background:var(--ground)}.sw i{display:block;height:56px}
  .sw span{display:block;padding:10px 12px;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:10.5px;color:var(--muted)}
  .sw span b{display:block;color:var(--ink);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:2px}
  section{padding-top:54px}
  .lede{color:var(--muted);font-size:17px;max-width:78ch}
  .law{display:grid;grid-template-columns:74px minmax(0,1fr);gap:18px;padding:16px 0;border-bottom:1px solid var(--rule)}
  .law .id{font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:12.5px;font-weight:600;color:var(--blue);padding-top:3px}
  .law .rule{font-size:17.5px;line-height:1.5}
  .law .meta{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;padding-top:9px}
  @media(max-width:720px){.law .meta{grid-template-columns:minmax(0,1fr)}.law{grid-template-columns:58px minmax(0,1fr);gap:12px}}
  .law .meta>div{font-size:14.5px;line-height:1.45;color:var(--muted)}
  .law .meta b{display:block;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:9.5px;letter-spacing:0.11em;text-transform:uppercase;margin-bottom:3px}
  .law .why b{color:var(--acid)}
  .law .chk{background:var(--tint);padding:9px 11px}.law .chk b{color:var(--blue)}
  .code{background:var(--panel);padding:12px 14px;margin-top:9px;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:12.5px;line-height:1.8}
  .tw{overflow-x:auto;border-top:2px solid var(--rule-strong)}
  table{border-collapse:collapse;width:100%;min-width:640px;font-size:16px}
  th{text-align:left;padding:12px 18px 12px 0;border-bottom:1px solid var(--rule)}
  td{padding:13px 18px 13px 0;border-bottom:1px solid var(--rule);vertical-align:top;line-height:1.44}
  td:first-child{font-weight:600}
  td b{color:var(--blue);font-weight:600}
  td.dev{background:var(--warm)}td.dev b{color:var(--acid)}
  footer{margin-top:64px;padding-top:20px;border-top:2px solid var(--ink);color:var(--muted);font-size:15px;display:flex;gap:24px;flex-wrap:wrap}
</style>

<div class="wrap">
  <header class="top">
    <p class="meta mono"><span>${T.meta.project}</span><span>${T.meta.spec}</span><span>${T.meta.date[L.lang]}</span><span><a href="${L.lang === 'en' ? 'cig.pl.html' : 'cig.html'}">${L.plOther}</a></span></p>
    <h1>${T.meta.specName}</h1>
    <p class="deck">${L.deck}</p>
  </header>

  <div class="thesis">
    <p class="mono">${L.whyNotTitle}</p>
    <p>${L.whyNot}</p>
    <p style="color:var(--muted);font-size:16px">${L.ssot}</p>
  </div>

  <div class="swatches">
${Object.entries(T.color.signal).map(([k, v]) => `    <div class="sw"><i style="background:${esc(v.hex)}${k === 'ink' ? ';box-shadow:inset 0 0 0 1px var(--rule-strong)' : ''}"></i><span><b>${esc(k)}</b>${esc(v.hex)}<br>${v.role[L.lang]}</span></div>`).join('\n')}
  </div>
${laws}
${platform}
${hig}
${checklist}

  <footer><span><strong>${esc(T.meta.author)}</strong></span><span>${T.meta.date[L.lang]}</span><span>${esc(T.meta.project)}</span></footer>
</div>
`;
}

emit(at('design/cig.html'), buildDoc(S.en), { lang: 'en' });
emit(at('design/cig.pl.html'), buildDoc(S.pl), { lang: 'pl' });

/* ---------- panel 1800 px do use case (EN) ---------- */
const L = S.en;
const panel = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Newsreader:ital,wght@0,400;0,500;0,600&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>
  ${tokensCss}
  *{box-sizing:border-box}
  body{margin:0;width:${T.assetSpec.panelWidth}px;padding:44px 40px;background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,serif;font-size:18px;line-height:1.55}
  h1{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:44px;line-height:1.03;margin:0 0 10px;letter-spacing:-0.015em}
  h2{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:24px;margin:30px 0 14px;letter-spacing:-0.015em}
  p{margin:0}
  code{font-family:'IBM Plex Mono',Menlo,monospace;font-size:0.85em;background:var(--panel);padding:1px 5px}
  .eyebrow{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;color:var(--acid);margin-bottom:12px}
  .mono{font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;letter-spacing:0.11em;text-transform:uppercase;font-weight:600}
  .top{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:34px;padding-bottom:24px;border-bottom:2px solid var(--ink)}
  .lede{color:var(--muted);font-size:17px;max-width:78ch}
  .thesis{background:var(--tint);padding:18px 20px;display:flex;flex-direction:column;gap:8px}
  .thesis .mono{color:var(--blue)}.thesis p{font-size:15.5px;line-height:1.5}
  .sw{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px;background:var(--rule);margin-top:12px}
  .sw>div{background:var(--ground)}.sw i{display:block;height:40px}
  .sw span{display:block;padding:7px 9px;font-family:'IBM Plex Mono',Menlo,monospace;font-size:9.5px;color:var(--muted)}
  .sw span b{display:block;color:var(--ink);font-size:11px;letter-spacing:0.07em;text-transform:uppercase}
  table{border-collapse:collapse;width:100%;font-size:15px}
  th{text-align:left;padding:10px 16px 10px 0;border-bottom:2px solid var(--rule-strong);font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;letter-spacing:0.11em;text-transform:uppercase;font-weight:600;color:var(--muted)}
  td{padding:11px 16px 11px 0;border-bottom:1px solid var(--rule);vertical-align:top;line-height:1.42}
  td:first-child{font-weight:600;white-space:nowrap}
  td b{color:var(--blue);font-weight:600}
  td.dev{background:var(--warm)}td.dev b{color:var(--acid)}
  .groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;background:var(--rule)}
  .g{background:var(--ground);padding:16px 18px;display:flex;flex-direction:column;gap:7px}
  .g .h{display:flex;align-items:baseline;gap:10px}
  .g .h .mono{color:var(--blue)}
  .g .h strong{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-size:19px;font-weight:800;letter-spacing:-0.01em}
  .g .h em{margin-left:auto;font-style:normal;font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;color:var(--faint);letter-spacing:0.08em}
  .g p{font-size:14.5px;line-height:1.45}
  .g .why{color:var(--muted);font-size:13px;line-height:1.4}
  .plat{margin-top:2px;background:var(--warm);padding:18px 20px;display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:26px;align-items:start}
  .plat pre{margin:0;font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;line-height:1.75}
  .plat .mono{color:var(--acid)}
  .credit{margin-top:28px;padding-top:14px;border-top:2px solid var(--ink);font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;color:var(--muted);display:flex;gap:22px}
</style></head><body>

<p class="eyebrow">${esc(T.meta.project)} &middot; ${L.chapter} &middot; ${T.meta.spec}</p>

<div class="top">
  <div>
    <h1>${T.meta.specName}</h1>
    <p class="lede">${L.whyNot}</p>
    <div class="sw">
${Object.entries(T.color.signal).map(([k, v]) => `      <div><i style="background:${esc(v.hex)}${k === 'ink' ? ';box-shadow:inset 0 0 0 1px var(--rule-strong)' : ''}"></i><span><b>${esc(k)}</b>${esc(v.hex)} &middot; ${v.role.en}</span></div>`).join('\n')}
    </div>
  </div>
  <div class="thesis">
    <p class="mono">A single source of truth</p>
    <p>${L.ssot}</p>
    <p>${L.ssotWhy}</p>
    <p class="mono" style="color:var(--acid);padding-top:2px">${ALL.length} laws &middot; ${GROUPS.length} groups &middot; every one testable</p>
  </div>
</div>

<h2>${L.splitTitle}</h2>
<table>
  <thead><tr><th>${L.thId}</th><th>${L.thDog}</th><th>${L.thHuman}</th></tr></thead>
  <tbody>
${SPLIT.map((r) => `    <tr><td>${r.concern.en}</td><td>${r.dog.en}</td><td${r.departure ? ' class="dev"' : ''}>${r.departure ? `<b>${L.departure}</b> ` : ''}${r.human.en}</td></tr>`).join('\n')}
  </tbody>
</table>

<h2>${L.groupsTitle}</h2>
<div class="groups">
${GROUPS.map((g) => `  <div class="g"><div class="h"><span class="mono">CIG-${g.id}</span><strong>${esc(g.title.en)}</strong><em>${g.laws.length} ${L.lawsN}</em></div><p>${g.laws[0].rule.en}</p><p class="why">${g.laws[0].why.en}</p></div>`).join('\n')}
</div>

<div class="plat">
  <div>
    <p class="mono" style="margin-bottom:8px">CIG-7 &middot; ${L.platTitle}</p>
    <pre>${Object.entries(PLAT.css).map(([k, v]) => `${esc(k)}: ${esc(v)};`).join('\n')}</pre>
  </div>
  <div style="display:flex;flex-direction:column;gap:9px">
    <p style="font-size:15.5px;line-height:1.5"><strong>Without the first ${namedLocks.length} rules the input law is unsatisfiable.</strong> ${PLATFORM[0].why.en} This is not an implementation detail — it is the precondition for a swipe reaching the app at all.</p>
    <p style="font-size:14.5px;line-height:1.45;color:var(--muted)">Two further iOS constraints shape the flow rather than the code: ${PLAT.audioUnlock.why.en}, so <strong>${PLAT.audioUnlock.where.en}</strong> must unlock the AudioContext. And ${PLAT.video.consequence.en}.</p>
  </div>
</div>

<p class="credit"><span>${esc(T.meta.author)}</span><span>${T.meta.date.en}</span><span>${esc(T.meta.project)}</span></p>
</body></html>
`;
emit(at('design/exports/cig-panel.html'), panel, { lang: 'en' });

console.log(`CIG: ${flat.length} praw w ${GROUPS.length} grupach + ${PLATFORM.length} platformowych = ${ALL.length} w checkliscie; ${nDepartures} odstepstwa od HIG`);
