// Generuje CIG w dwóch językach z design/tokens.json:
//   design/cig.html          — EN, wersja dokumentacyjna
//   design/cig.pl.html       — PL, wersja robocza
//   design/exports/cig-panel.html — EN, panel 1800 px do use case
// Treść praw żyje w JEDNEJ tablicy z polami en/pl, liczby wyłącznie z tokenów.
import { readFileSync, writeFileSync } from 'node:fs';

const T = JSON.parse(readFileSync('design/tokens.json', 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hex = (k) => T.color.signal[k].hex;
const nNeutral = Object.keys(T.color.neutral).length;
const sounds = Object.entries(T.sound).filter(([k]) => !k.startsWith('$'));

const S = {
  en: {
    lang: 'en', title: 'Canine Interface Guidelines', spec: 'CIG 1.0',
    deck: `Interface guidelines for a user you <em>cannot ask</em>: a dichromat with ${T.user.acuityTypical} acuity whose input device is a nose.`,
    whyNotTitle: 'Why not HIG',
    whyNot: `Human Interface Guidelines describe a human: a fingertip, a ${T.scale.human.minTargetWidth} pt target, red as warning, text as content. Every one of those assumptions breaks on our user, so in dog mode HIG are not merely insufficient — they are <strong>harmful</strong>. CIG states the laws for the dog; for the human we defer to HIG and record only where we depart from it.`,
    ssot: `Every number on this page comes from <code>design/tokens.json</code> and is interpolated at build time. Not one value is typed by hand.`,
    ssotWhy: `A review audit found the input cooldown restated in seven files and the palette hardcoded across ten artboards. This file exists so that cannot happen again.`,
    ssotStat: `${'{laws}'} laws · ${'{groups}'} groups · every one testable`,
    platTitle: 'Platform layer', higTitle: 'Where HIG governs, not us',
    higLede: `We are building a PWA, so Human Interface Guidelines do not formally bind us — Apple does not review a page added to the home screen. But in human mode HIG describes <strong>expectations</strong>, and those hold regardless of who enforces them. For H1–H4 we do not rewrite HIG: we defer to it and record only our departures.`,
    checkTitle: 'Compliance checklist',
    checkLede: `Every law carries a check you can run against a finished screen. A law without a check is decoration, so there is not one on this list.`,
    thId: 'Concern', thDog: `Dog mode · D1–D5`, thHuman: `Human mode · H1–H4`,
    why: 'Why', check: 'Check', lawsN: 'laws', groupsTitle: 'Six groups of laws',
    splitTitle: 'Where CIG governs and where HIG does',
    unchanged: 'adopted unchanged', departure: 'Departure.',
    rows: [
      ['Minimum target', `<b>CIG-2.3</b> — ${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} px`, `HIG — ${T.scale.human.minTargetWidth}×${T.scale.human.minTargetHeight} px, adopted unchanged`, false],
      ['Semantic colour', `<b>CIG-2.2</b> — red and green forbidden as encodings`, `<b>Departure.</b> HIG permits destructive red; we stay on blue ↔ acid so both modes read as one product`, true],
      ['Typography', `<b>CIG-2.3</b> — display ${T.scale.dog.display} px`, `<b>Departure.</b> HIG assumes SF Pro and Dynamic Type; we use ${T.typography.display.family} and ${T.typography.text.family}, because identity has to span both modes`, true],
      ['Gestures', `<b>CIG-3.1</b> — drag only`, `HIG — taps and standard gestures, adopted unchanged`, false],
      ['Safe areas', `<b>CIG-7.3</b> — ${T.frame.safeAreaTop} px and ${T.frame.safeAreaBottom} px`, `HIG — identical`, false],
      ['Reduced motion', `<b>CIG-4.3</b> — not honoured; motion carries information`, `HIG — <code>prefers-reduced-motion</code> honoured`, false],
    ],
    platLead: `<strong>Without the first three rules the input law is unsatisfiable.</strong> A nose dragged across the glass selects text, raises the magnifier loupe and scrolls the page. This is not an implementation detail — it is the precondition for a swipe reaching the app at all.`,
    platMore: `Two further iOS constraints shape the flow rather than the code: audio needs a user gesture, so <strong>${'{where}'}</strong> must unlock the AudioContext or the bark on D4 will not play. And video only autoplays as <code>${T.platform.video.attributes.join('</code> <code>')}</code>, so a profile clip's own soundtrack is irrelevant.`,
    chapter: 'Chapter 09',
  },
  pl: {
    lang: 'pl', title: 'Canine Interface Guidelines', spec: 'CIG 1.0',
    deck: `Wytyczne interfejsu dla użytkownika, którego <em>nie da się zapytać</em>: dichromata o ostrości ${T.user.acuityTypical}, którego urządzeniem wejściowym jest ${T.user.inputOrgan}.`,
    whyNotTitle: 'Dlaczego nie HIG',
    whyNot: `Human Interface Guidelines opisują człowieka: palec, ${T.scale.human.minTargetWidth} pt celu, czerwień jako ostrzeżenie, tekst jako treść. Każde z tych założeń pęka na naszym użytkowniku, więc w trybie psim HIG nie są niewystarczające — są <strong>szkodliwe</strong>. CIG opisuje prawa dla psa; dla człowieka odsyłamy do HIG i notujemy tylko odstępstwa.`,
    ssot: `Wszystkie liczby na tej stronie pochodzą z <code>design/tokens.json</code> i są wstawiane przy generowaniu. Ani jedna nie jest wpisana ręcznie.`,
    ssotWhy: `Audyt review wykazał, że cooldown wejścia żył w siedmiu plikach, a paleta była wklejona na sztywno w dziesięciu artboardach. Ten plik istnieje, żeby to się nie powtórzyło.`,
    ssotStat: `${'{laws}'} praw · ${'{groups}'} grup · każde ze sprawdzeniem`,
    platTitle: 'Warstwa platformowa', higTitle: 'Gdzie rządzi HIG, a nie my',
    higLede: `Budujemy PWA, więc Human Interface Guidelines nas formalnie nie obowiązują — Apple nie recenzuje strony dodanej do ekranu głównego. Ale w trybie ludzkim HIG opisuje <strong>oczekiwania</strong>, a te obowiązują niezależnie od tego, kto je wymusza. Dla H1–H4 nie przepisujemy HIG: odsyłamy do niego i zapisujemy tylko odstępstwa.`,
    checkTitle: 'Checklista zgodności',
    checkLede: `Każde prawo ma sprawdzenie, które da się wykonać na gotowym ekranie. Prawo bez sprawdzenia jest ozdobą, więc na tej liście nie ma ani jednego.`,
    thId: 'Zagadnienie', thDog: `Tryb psi · D1–D5`, thHuman: `Tryb ludzki · H1–H4`,
    why: 'Dlaczego', check: 'Sprawdzenie', lawsN: 'praw', groupsTitle: 'Sześć grup praw',
    splitTitle: 'Gdzie rządzi CIG, a gdzie HIG',
    unchanged: 'przyjmujemy bez zmian', departure: 'Odstępstwo.',
    rows: [
      ['Minimalny cel', `<b>CIG-2.3</b> — ${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} px`, `HIG — ${T.scale.human.minTargetWidth}×${T.scale.human.minTargetHeight} px, przyjmujemy bez zmian`, false],
      ['Kolor semantyczny', `<b>CIG-2.2</b> — czerwień i zieleń zakazane jako kod`, `<b>Odstępstwo.</b> HIG dopuszcza czerwień destrukcyjną; zostajemy przy blue ↔ acid dla spójności obu trybów`, true],
      ['Typografia', `<b>CIG-2.3</b> — display ${T.scale.dog.display} px`, `<b>Odstępstwo.</b> HIG zakłada SF Pro i Dynamic Type; używamy ${T.typography.display.family} i ${T.typography.text.family}, bo tożsamość musi łączyć oba tryby`, true],
      ['Gesty', `<b>CIG-3.1</b> — wyłącznie przesunięcie`, `HIG — stuknięcia i standardowe gesty, bez zmian`, false],
      ['Bezpieczne obszary', `<b>CIG-7.3</b> — ${T.frame.safeAreaTop} px i ${T.frame.safeAreaBottom} px`, `HIG — identycznie`, false],
      ['Redukcja ruchu', `<b>CIG-4.3</b> — nie stosujemy, ruch jest informacją`, `HIG — <code>prefers-reduced-motion</code> respektowane`, false],
    ],
    platLead: `<strong>Bez pierwszych trzech reguł prawo wejścia jest niespełnialne.</strong> Nos przeciągnięty po ekranie zaznaczy tekst, wywoła lupę powiększającą i przewinie stronę. To nie detal implementacji — to warunek, żeby swipe w ogóle dotarł do aplikacji.`,
    platMore: `Do tego dwa ograniczenia iOS, które kształtują przepływ, nie kod: dźwięk wymaga gestu użytkownika, więc <strong>${'{where}'}</strong> musi odblokować AudioContext, inaczej szczeknięcie na D4 nie zagra. A wideo odtwarza się samo tylko jako <code>${T.platform.video.attributes.join('</code> <code>')}</code>, więc ścieżka dźwiękowa profilu jest bez znaczenia.`,
    chapter: 'Rozdział 09',
  },
};

const GROUPS = [
  { id: '1', title: { en: 'The user', pl: 'Użytkownik' },
    lede: { en: `A specification, not a description. Everything below follows from these six rows.`,
            pl: `Specyfikacja, nie opis. Wszystko dalej wynika z tych sześciu wierszy.` },
    laws: [
      { id: '1.1',
        rule: { en: `Dichromat: cones peaking at <b>${T.user.conePeakShort}</b> and <b>${T.user.conePeakLongMedium}</b>. Red and green are indistinguishable.`,
                pl: `Dichromat: czopki przy <b>${T.user.conePeakShort}</b> i <b>${T.user.conePeakLongMedium}</b>. Czerwony i zielony są nieodróżnialne.` },
        why: { en: `This is not a poorer palette. It is a differently shaped colour space.`, pl: `To nie ubóstwo palety, a inna geometria przestrzeni barw.` },
        check: { en: `No information the dog needs is encoded in a red–green opposition.`, pl: `Żadna informacja potrzebna psu nie jest zakodowana w opozycji czerwony–zielony.` } },
      { id: '1.2',
        rule: { en: `Acuity <b>${T.user.acuityTypical}</b> (range ${T.user.acuityRange}), roughly <b>${T.user.acuityFactor}×</b> weaker than human.`,
                pl: `Ostrość <b>${T.user.acuityTypical}</b> (zakres ${T.user.acuityRange}), około <b>${T.user.acuityFactor}×</b> słabsza od ludzkiej.` },
        why: { en: `Detail does not exist. The carriers are silhouette, colour mass and motion.`, pl: `Detal nie istnieje. Nośnikiem jest sylwetka, plama koloru i ruch.` },
        check: { en: `Every dog-mode element clears the size floor in CIG-2.3.`, pl: `Każdy element trybu psiego przechodzi próg rozmiaru z CIG-2.3.` } },
      { id: '1.3',
        rule: { en: `Flicker fusion threshold <b>${T.user.flickerFusionDog}</b>, against ${T.user.flickerFusionHuman} in humans.`,
                pl: `Próg fuzji migotania <b>${T.user.flickerFusionDog}</b>, wobec ${T.user.flickerFusionHuman} u człowieka.` },
        why: { en: `A 60 Hz screen, fluid to us, may visibly flicker to the dog.`, pl: `Ekran 60 Hz, dla nas płynny, może dla psa widocznie migać.` },
        check: { en: `${T.frame.refresh} Hz sustained; see CIG-2.5.`, pl: `Odświeżanie ${T.frame.refresh} Hz utrzymane; patrz CIG-2.5.` } },
      { id: '1.4',
        rule: { en: `The input device is a <b>nose</b>.`, pl: `Urządzeniem wejściowym jest <b>${T.user.inputOrgan}</b>.` },
        why: { en: `A wet nose is a large, moist, multi-point contact patch.`, pl: `Mokry nos to duża, wilgotna, wielopunktowa plama kontaktu.` },
        check: { en: `No interaction requires precision or a discrete tap; see CIG-3.`, pl: `Interakcja nie wymaga precyzji ani stuknięcia; patrz CIG-3.` } },
      { id: '1.5',
        rule: { en: `Contrast and size floors are set by <b>the older dog</b>, not the younger one.`, pl: `Próg kontrastu i rozmiaru ustala <b>${T.user.contrastFloorSetBy}</b>, nie młodszy pies.` },
        why: { en: `If it reads for the twelve-year-old, it reads for both. The converse does not hold.`, pl: `Jeśli coś jest czytelne dla starszej suczki, jest czytelne dla obojga. Odwrotnie nie.` },
        check: { en: `Tests run on both dogs; thresholds validated on the older.`, pl: `Testy prowadzone na obu psach, ale progi walidowane na starszym.` } },
      { id: '1.6',
        rule: { en: `The dog does <b>not read an image as standing for</b> a real dog.`, pl: `Pies <b>nie odczytuje obrazu jako reprezentacji</b> realnego psa.` },
        why: { en: `It discriminates image features, but an image need not substitute for its real-world referent.`, pl: `Rozróżnia cechy obrazu, ale obraz nie musi dla niego zastępować odpowiednika w świecie.` },
        check: { en: `The product's output is a preference ranking, never a "match".`, pl: `Wyjściem produktu jest ranking preferencji, nigdy „match".` } },
    ] },
  { id: '2', title: { en: 'Perception', pl: 'Percepcja' },
    lede: { en: `What may be shown, and how large it has to be.`, pl: `Co wolno pokazać i jak duże to musi być.` },
    laws: [
      { id: '2.1',
        rule: { en: `Meaning is carried <b>only by the blue ↔ acid opposition</b> (<code>${hex('blue')}</code> ↔ <code>${hex('acid')}</code>).`,
                pl: `Znaczenie niesie <b>wyłącznie opozycja blue ↔ acid</b> (<code>${hex('blue')}</code> ↔ <code>${hex('acid')}</code>).` },
        why: { en: `Both hues sit near the peaks of canine cone sensitivity.`, pl: `Obie barwy leżą blisko szczytów czułości psich czopków.` },
        check: { en: `The neutral ramp (${nNeutral} steps) appears in no signal role.`, pl: `Rampa neutralna (${nNeutral} odcieni) nie występuje w żadnej roli sygnałowej.` } },
      { id: '2.2',
        rule: { en: `State must never be encoded in red or green.`, pl: `Zakaz kodowania stanu barwą czerwoną lub zieloną.` },
        why: { en: `To a dichromat both are grey, so the semantics do not exist.`, pl: `Dla dichromata obie są szarością, więc semantyka nie istnieje.` },
        check: { en: `Grepping the dog-mode artboards finds no red and no green.`, pl: `Grep po artboardach trybu psiego nie znajduje czerwieni ani zieleni.` } },
      { id: '2.3',
        rule: { en: `Minimum dog-mode target <b>${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} px</b>. Type scale display ${T.scale.dog.display} / name ${T.scale.dog.name} / value ${T.scale.dog.value}.`,
                pl: `Minimalny cel w trybie psim <b>${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} px</b>. Skala display ${T.scale.dog.display} / name ${T.scale.dog.name} / value ${T.scale.dog.value}.` },
        why: { en: `About ${T.user.acuityFactor}× the human scale, derived directly from ${T.user.acuityTypical} acuity.`, pl: `Około ${T.user.acuityFactor}× skali ludzkiej, wprost z ostrości ${T.user.acuityTypical}.` },
        check: { en: `Decision zones measure ${T.input.zoneWidth}×${T.input.zoneHeight} px — the full frame height.`, pl: `Strefy decyzji mają ${T.input.zoneWidth}×${T.input.zoneHeight} px, czyli pełną wysokość ramki.` } },
      { id: '2.4',
        rule: { en: `Figure and ground separated by maximum contrast: ${hex('ink')} against ${hex('white')}, ${hex('acid')} against ${hex('ink')}.`,
                pl: `Figura i tło rozdzielone maksymalnym kontrastem: ${hex('ink')} przeciw ${hex('white')}, ${hex('acid')} przeciw ${hex('ink')}.` },
        why: { en: `Contrast, not hue, is the dog's primary information channel.`, pl: `Kontrast, nie barwa, jest u psa głównym kanałem informacji.` },
        check: { en: `Every signal survives conversion to greyscale.`, pl: `Każdy sygnał czytelny po konwersji do skali szarości.` } },
      { id: '2.5',
        rule: { en: `<b>${T.frame.refresh} Hz is a hardware requirement</b>, not a luxury. Animate <code>${T.motion.animatableProperties.join('</code> and <code>')}</code> only.`,
                pl: `<b>${T.frame.refresh} Hz jest wymaganiem sprzętowym</b>, nie luksusem. Animacje wyłącznie na <code>${T.motion.animatableProperties.join('</code> i <code>')}</code>.` },
        why: { en: `At a ${T.user.flickerFusionDog} threshold a 60 Hz screen may visibly flicker.`, pl: `Przy progu ${T.user.flickerFusionDog} ekran 60 Hz może być widocznie migający.` },
        check: { en: `Nothing renders at 30 fps; no layout animation anywhere.`, pl: `Nic nie renderuje się w 30 fps; brak animacji layoutu.` } },
      { id: '2.6',
        rule: { en: `Text is <b>for the human only</b>.`, pl: `Tekst jest <b>wyłącznie dla człowieka</b>.` },
        why: { en: `The dog does not read. A letterform cannot be the sole carrier of information.`, pl: `Pies nie czyta. Litera nie może być jedynym nośnikiem informacji.` },
        check: { en: `Every dog-mode message has a non-text carrier: shape, motion or sound.`, pl: `Każdy komunikat trybu psiego ma nośnik nietekstowy: kształt, ruch albo dźwięk.` } },
    ] },
  { id: '3', title: { en: 'Input', pl: 'Wejście' },
    lede: { en: `Input is a patch, not a point — and a drag, not a tap.`, pl: `Wejście to plama, nie punkt — i przesunięcie, nie stuknięcie.` },
    laws: [
      { id: '3.1',
        rule: { en: `The interaction primitive is a <b>drag</b>. Forbidden: tap, long-press, double-tap, pinch, edge swipe.`,
                pl: `Prymitywem interakcji jest <b>${T.input.primitive}</b>. Zakazane: ${T.input.forbidden.join(', ')}.` },
        why: { en: `Canine screen input naturally resembles a swipe and a drag. The Tinder gesture is, by coincidence, the right gesture.`, pl: `Psi input z natury przypomina przesunięcie i przeciągnięcie. Gest Tindera jest przypadkiem właściwym gestem.` },
        check: { en: `No handler listens for a tap event in dog mode.`, pl: `Żaden handler nie nasłuchuje stuknięcia w trybie psim.` } },
      { id: '3.2',
        rule: { en: `The pointer is the <b>centroid of the contact patch; touch count is ignored</b>.`, pl: `Wskaźnik to <b>${T.input.pointerModel}</b>.` },
        why: { en: `A nose contact is an area, not a cursor, and the number of points is incidental.`, pl: `Kontakt nosa to obszar, nie kursor; liczba punktów jest przypadkowa.` },
        check: { en: `Decision logic never reads <code>touches.length</code>.`, pl: `Logika decyzji nie odczytuje <code>touches.length</code>.` } },
      { id: '3.3',
        rule: { en: `Drag threshold <b>${T.input.dragThreshold} px</b>. Direction comes from the screen half: ${T.input.zoneCount} zones of ${T.input.zoneWidth} px across the full ${T.input.zoneHeight} px height.`,
                pl: `Próg przesunięcia <b>${T.input.dragThreshold} px</b>. Kierunek wyznacza połowa ekranu: ${T.input.zoneCount} strefy po ${T.input.zoneWidth} px na pełnej wysokości ${T.input.zoneHeight} px.` },
        why: { en: `A low threshold and enormous zones remove any demand for precision.`, pl: `Niski próg i ogromne strefy zdejmują z psa wymóg precyzji.` },
        check: { en: `Any drag longer than ${T.input.dragThreshold} px yields a decision.`, pl: `Każdy drag dłuższy niż ${T.input.dragThreshold} px daje decyzję.` } },
      { id: '3.4',
        rule: { en: `After a decision, input is locked for <b>${T.input.cooldown} ms</b>.`, pl: `Po decyzji blokada wejścia <b>${T.input.cooldown} ms</b>.` },
        why: { en: `One long nose drag must not register as three decisions.`, pl: `Jedno długie pociągnięcie nosem nie może dać trzech decyzji.` },
        check: { en: `Two decisions less than ${T.input.cooldown} ms apart are impossible.`, pl: `Dwie decyzje w odstępie mniejszym niż ${T.input.cooldown} ms są niemożliwe.` } },
      { id: '3.5',
        rule: { en: `Undo is a <b>core function</b>, at human scale, reachable by the person sitting alongside.`, pl: `Cofnięcie jest <b>funkcją rdzeniową</b>, w skali ludzkiej, dostępne dla człowieka obok.` },
        why: { en: `A wet nose misfires routinely. In human dating apps undo is a paid feature; here the mistake is the norm, not the exception.`, pl: `Mokry nos myli się regularnie. W apkach ludzkich undo bywa funkcją premium; tutaj pomyłka jest normą.` },
        check: { en: `Undo is visible on D3 and reachable without leaving the session.`, pl: `Cofnięcie widoczne na D3 i osiągalne bez wychodzenia z sesji.` } },
      { id: '3.6',
        rule: { en: `The only exception to the no-tap rule is <b>${T.input.tapException.screen}</b>.`, pl: `Jedyny wyjątek od zakazu stuknięć: <b>${T.input.tapException.screen}</b>.` },
        why: { en: `Warm-up calibrates the contact patch and builds the nose → consequence association, and only a contact can do that.`, pl: `${T.input.tapException.why}.` },
        check: { en: `The exception is recorded in the token sheet and CLAUDE.md, and does not extend to any other screen.`, pl: `Wyjątek zapisany w arkuszu tokenów i w CLAUDE.md; nie rozszerza się na inne ekrany.` } },
    ] },
  { id: '4', title: { en: 'Feedback', pl: 'Sprzężenie zwrotne' },
    lede: { en: `What happens after a decision — and where the loop actually closes.`, pl: `Co się dzieje po decyzji — i gdzie ta pętla naprawdę się zamyka.` },
    laws: [
      { id: '4.1',
        rule: { en: `Every "yes" <b>does something immediately</b>. No "maybe later" pile.`, pl: `Każde „tak" <b>natychmiast coś robi</b>. Żadnego stosu „może później".` },
        why: { en: `The lesson from the graveyard of swipe-for-jobs apps: a swipe that only defers an item saves nobody anything.`, pl: `Lekcja z cmentarza apek o pracę: swipe, który tylko odkłada ofertę, nie oszczędza niczego.` },
        check: { en: `A decision fires sound, the reward cue and the ranking entry in the same moment.`, pl: `Decyzja wywołuje dźwięk, zapowiedź nagrody i wpis w rankingu w tym samym momencie.` } },
      { id: '4.2',
        rule: { en: `Sound is a <b>primary</b> carrier: ${sounds.map(([k, v]) => `${k} ${v.seconds} s`).join(', ')}.`,
                pl: `Dźwięk jest nośnikiem <b>pierwszorzędnym</b>: ${sounds.map(([k, v]) => `${k} ${v.seconds} s`).join(', ')}.` },
        why: { en: `In a dog, hearing outranks vision — the more so at ${T.user.acuityTypical} acuity.`, pl: `U psa słuch bije wzrok, zwłaszcza przy ostrości ${T.user.acuityTypical}.` },
        check: { en: `Every decision event has an assigned sound; levels come from the tokens.`, pl: `Każde zdarzenie decyzyjne ma przypisany dźwięk; poziomy z tokenów.` } },
      { id: '4.3',
        rule: { en: `Motion is information, not ornament. <code>prefers-reduced-motion</code> applies to human mode.`, pl: `Ruch jest informacją, nie ozdobą. <code>prefers-reduced-motion</code> dotyczy trybu ludzkiego.` },
        why: { en: `In dog mode motion carries meaning, so switching it off would remove content, not decoration.`, pl: `${T.motion.reducedMotion}.` },
        check: { en: `Disabling animation in dog mode is not implemented, and should not be.`, pl: `Wyłączenie animacji w trybie psim nie jest zaimplementowane i nie powinno być.` } },
      { id: '4.4',
        rule: { en: `The reward is <b>physical</b>. The screen announces it; it is not the reward.`, pl: `Nagroda jest <b>fizyczna</b>. Ekran ją zapowiada, nie jest nią.` },
        why: { en: `The loop closes with a treat from a hand, in the room — not on the glass.`, pl: `Pętla zamyka się smaczkiem z ręki, w pokoju — nie na szkle.` },
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
        why: { en: `The floor is ${T.session.deckMin} because a rising decision time is the signal to shorten the deck.`, pl: `Dolna granica to ${T.session.deckMin}, bo ${T.session.deckFloorWhy}.` },
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
        rule: { en: `<b>The dog does not enter human mode.</b> The transition gesture must be impossible for a nose — it needs two simultaneous contact points, or a sequence.`,
                pl: `<b>Pies nie wchodzi w tryb ludzki.</b> Gest przejścia musi być niewykonalny nosem — wymaga dwóch punktów kontaktu naraz albo sekwencji.` },
        why: { en: `Human mode holds data, profile editing and meeting approvals. A nose must not land there by accident.`, pl: `Tryb ludzki zawiera dane, edycję profili i zatwierdzanie spotkań. Nos nie może tam trafić przypadkiem.` },
        check: { en: `No screen D1–D5 contains a single target that leads to H1–H4.`, pl: `Żaden ekran D1–D5 nie zawiera pojedynczego celu prowadzącego do H1–H4.` } },
      { id: '6.2',
        rule: { en: `The end-of-session screen carries <b>no "next" affordance at all</b>.`, pl: `Ekran końca sesji nie ma <b>żadnej afordancji „dalej"</b>.` },
        why: { en: `An affordance the size of a nose is an affordance for a nose, whatever the intent behind it.`, pl: `Afordancja wielkości nosa jest afordancją dla nosa, niezależnie od intencji.` },
        check: { en: `D5 contains no bordered or filled rectangle at target dimensions.`, pl: `D5 nie zawiera obramowanego ani wypełnionego prostokąta o wymiarach celu.` } },
      { id: '6.3',
        rule: { en: `At the OS level, iOS <b>Guided Access</b> closes the boundary.`, pl: `Poziom systemu domyka <b>Dostęp nadzorowany</b> iOS.` },
        why: { en: `It blocks the exit into Settings; CIG-6.1 governs the inside of the app.`, pl: `Blokuje wyjście do Ustawień; prawo 6.1 dotyczy wnętrza aplikacji.` },
        check: { en: `The session procedure includes enabling Guided Access before the phone reaches the dog.`, pl: `Procedura sesji zawiera włączenie Dostępu nadzorowanego przed podaniem telefonu psu.` } },
    ] },
];

const PL = T.platform;
const flat = GROUPS.flatMap((g) => g.laws);
const NL = flat.length + 8;

const tokensCss = `:root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--warm:#EFE9D6;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--acid-fill:#C8D400;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ground:#0D1014;--panel:#171B21;--tint:#171C2E;--warm:#1E1B14;--ink:#EDEFEA;--muted:#9AA3B1;--faint:#5A6470;--blue:#7E92FF;--acid:#C3D122;--acid-fill:#C8D400;--rule:#242A33;--rule-strong:#3A424E}}
  :root[data-theme="dark"]{--ground:#0D1014;--panel:#171B21;--tint:#171C2E;--warm:#1E1B14;--ink:#EDEFEA;--muted:#9AA3B1;--faint:#5A6470;--blue:#7E92FF;--acid:#C3D122;--acid-fill:#C8D400;--rule:#242A33;--rule-strong:#3A424E}`;

function buildDoc(L) {
  const laws = GROUPS.map((g) => `
  <section>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
      <p class="mono" style="color:var(--acid)">CIG-${g.id}</p>
      <h2>${esc(g.title[L.lang])}</h2>
      <p class="lede">${g.lede[L.lang]}</p>
    </div>
    <div style="border-top:2px solid var(--rule-strong)">
${g.laws.map((l) => `      <div class="law"><span class="id">CIG-${l.id}</span><div>
        <p class="rule">${l.rule[L.lang]}</p>
        <div class="meta"><div class="why"><b>${L.why}</b>${l.why[L.lang]}</div><div class="chk"><b>${L.check}</b>${l.check[L.lang]}</div></div>
      </div></div>`).join('\n')}
    </div>
  </section>`).join('\n');

  const platRows = [
    ['7.1', L.lang === 'en' ? `Browser locks, on <code>html</code> and <code>body</code>:` : `Blokady przeglądarki, na <code>html</code> i <code>body</code>:`,
      L.platLead, L.lang === 'en' ? `Dragging a finger across the screen on the device selects no text, raises no loupe and does not bounce the page.` : `Przeciągnięcie palcem po ekranie na urządzeniu nie zaznacza tekstu, nie pokazuje lupy i nie odbija strony.`,
      `<div class="code">${Object.entries(PL.css).map(([k, v]) => `${esc(k)}: ${esc(v)};`).join('<br>')}</div>`],
    ['7.2', `Viewport <code>${esc(PL.viewport)}</code>, manifest <code>display: ${PL.manifest.display}</code>, <code>${PL.manifest.orientation}</code>, <code>${PL.manifest.background_color}</code>.`,
      L.lang === 'en' ? `Standalone removes the Safari chrome; <code>viewport-fit=cover</code> hands us the full ${T.frame.cssWidth}×${T.frame.cssHeight} px frame.` : `Standalone zdejmuje pasek Safari, <code>viewport-fit=cover</code> oddaje pełną ramkę ${T.frame.cssWidth}×${T.frame.cssHeight} px.`,
      L.lang === 'en' ? `After adding to the home screen no browser interface is visible.` : `Po dodaniu do ekranu głównego nie widać interfejsu przeglądarki.`, ''],
    ['7.3', L.lang === 'en' ? `Safe areas: ${T.frame.safeAreaTop} px top, ${T.frame.safeAreaBottom} px bottom, via <code>env(safe-area-inset-*)</code>.` : `Bezpieczne obszary: górny ${T.frame.safeAreaTop} px, dolny ${T.frame.safeAreaBottom} px, przez <code>env(safe-area-inset-*)</code>.`,
      L.lang === 'en' ? `The real status bar and home indicator draw over our layout. We never paint a fake one.` : `Prawdziwy pasek statusu i wskaźnik rysują się na naszym layoucie. Udawanego nie rysujemy nigdy.`,
      L.lang === 'en' ? `No artboard paints a status bar; content stays clear of the home indicator.` : `Żaden artboard nie zawiera namalowanego paska statusu; treść nie wchodzi pod wskaźnik.`, ''],
    ['7.4', L.lang === 'en' ? `<b>Unlock audio on ${PL.audioUnlock.where[L.lang]}.</b>` : `<b>Odblokowanie dźwięku na ${PL.audioUnlock.where[L.lang]}.</b>`,
      L.lang === 'en' ? `iOS will not play sound without a user gesture, and the dog's first touch is the only gesture before the decision loop.` : `${PL.audioUnlock.$note} ${PL.audioUnlock.why}.`,
      L.lang === 'en' ? `The bark plays on the first "yes" of the session, not the second.` : `Szczeknięcie gra przy pierwszym „tak" w sesji, a nie dopiero przy drugim.`, ''],
    ['7.5', L.lang === 'en' ? `Profile video carries <code>${PL.video.attributes.join('</code> <code>')}</code>.` : `Wideo profilu z atrybutami <code>${PL.video.attributes.join('</code> <code>')}</code>.`,
      L.lang === 'en' ? `iOS autoplays video only when muted and inline, so the clip's own audio track is irrelevant — sound plays separately from the unlocked AudioContext.` : `${PL.video.$note} ${PL.video.consequence}.`,
      L.lang === 'en' ? `Video starts by itself on the device, with no gesture and no fullscreen.` : `Wideo startuje samo na urządzeniu, bez gestu i bez pełnego ekranu.`, ''],
  ];

  return `<title>${L.title}${L.lang === 'pl' ? ' po polsku' : ''}</title>
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
  .lede{color:var(--muted);font-size:17px;max-width:74ch}
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
    <p class="meta mono"><span>${T.meta.project}</span><span>${L.spec}</span><span>${T.meta.date}</span>${L.lang === 'en' ? '<span><a href="cig.pl.html">wersja polska</a></span>' : '<span><a href="cig.html">English version</a></span>'}</p>
    <h1>${L.title}</h1>
    <p class="deck">${L.deck}</p>
  </header>

  <div class="thesis">
    <p class="mono">${L.whyNotTitle}</p>
    <p>${L.whyNot}</p>
    <p style="color:var(--muted);font-size:16px">${L.ssot}</p>
  </div>

  <div class="swatches">
${Object.entries(T.color.signal).map(([k, v]) => `    <div class="sw"><i style="background:${v.hex}${k === 'ink' ? ';box-shadow:inset 0 0 0 1px var(--rule-strong)' : ''}"></i><span><b>${k}</b>${v.hex}<br>${v.role[L.lang]}</span></div>`).join('\n')}
  </div>
${laws}

  <section>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
      <p class="mono" style="color:var(--acid)">CIG-7</p>
      <h2>${L.platTitle}</h2>
      <p class="lede">${L.platLead}</p>
    </div>
    <div style="border-top:2px solid var(--rule-strong)">
${platRows.map(([id, rule, why, check, extra]) => `      <div class="law"><span class="id">CIG-${id}</span><div>
        <p class="rule">${rule}</p>${extra}
        <div class="meta"><div class="why"><b>${L.why}</b>${why}</div><div class="chk"><b>${L.check}</b>${check}</div></div>
      </div></div>`).join('\n')}
    </div>
  </section>

  <section>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
      <p class="mono" style="color:var(--acid)">CIG-8</p>
      <h2>${L.higTitle}</h2>
      <p class="lede">${L.higLede}</p>
    </div>
    <div class="tw"><table>
      <thead><tr><th class="mono">${L.thId}</th><th class="mono">${L.thDog}</th><th class="mono">${L.thHuman}</th></tr></thead>
      <tbody>
${L.rows.map(([a, b, c, dev]) => `        <tr><td>${a}</td><td>${b}</td><td${dev ? ' class="dev"' : ''}>${c}</td></tr>`).join('\n')}
      </tbody>
    </table></div>
  </section>

  <section>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
      <p class="mono" style="color:var(--acid)">CIG-9</p>
      <h2>${L.checkTitle}</h2>
      <p class="lede">${L.checkLede}</p>
    </div>
    <div style="border-top:2px solid var(--rule-strong)">
${flat.map((l) => `      <div style="display:grid;grid-template-columns:74px minmax(0,1fr);gap:18px;padding:10px 0;border-bottom:1px solid var(--rule)"><span class="mono" style="color:var(--blue);font-size:11.5px;letter-spacing:0.04em">CIG-${l.id}</span><span style="font-size:15.5px;line-height:1.45">${l.check[L.lang]}</span></div>`).join('\n')}
    </div>
  </section>

  <footer><span><strong>${T.meta.author}</strong></span><span>${T.meta.date}</span><span>${T.meta.project}</span></footer>
</div>
`;
}

writeFileSync('design/cig.html', buildDoc(S.en));
writeFileSync('design/cig.pl.html', buildDoc(S.pl));
console.log(`cig.html (EN) + cig.pl.html (PL) — ${flat.length} praw w ${GROUPS.length} grupach`);

/* ---------- panel 1800 px do use case (EN) ---------- */
const L = S.en;
const HEAD = GROUPS.map((g) => ({ id: g.id, title: g.title.en, n: g.laws.length, top: g.laws[0] }));
const panel = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Newsreader:ital,wght@0,400;0,500;0,600&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>
  :root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--warm:#EFE9D6;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  *{box-sizing:border-box}
  body{margin:0;width:1800px;padding:44px 40px;background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,serif;font-size:18px;line-height:1.55}
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

<p class="eyebrow">${T.meta.project} &middot; ${L.chapter} &middot; ${L.spec}</p>

<div class="top">
  <div>
    <h1>${L.title}</h1>
    <p class="lede">${L.whyNot}</p>
    <div class="sw">
${Object.entries(T.color.signal).map(([k, v]) => `      <div><i style="background:${v.hex}${k === 'ink' ? ';box-shadow:inset 0 0 0 1px var(--rule-strong)' : ''}"></i><span><b>${k}</b>${v.hex} &middot; ${v.role.en}</span></div>`).join('\n')}
    </div>
  </div>
  <div class="thesis">
    <p class="mono">A single source of truth</p>
    <p>${L.ssot}</p>
    <p>${L.ssotWhy}</p>
    <p class="mono" style="color:var(--acid);padding-top:2px">${flat.length} laws &middot; ${GROUPS.length} groups &middot; every one testable</p>
  </div>
</div>

<h2>${L.splitTitle}</h2>
<table>
  <thead><tr><th>${L.thId}</th><th>${L.thDog}</th><th>${L.thHuman}</th></tr></thead>
  <tbody>
${L.rows.map(([a, b, c, dev]) => `    <tr><td>${a}</td><td>${b}</td><td${dev ? ' class="dev"' : ''}>${c}</td></tr>`).join('\n')}
  </tbody>
</table>

<h2>${L.groupsTitle}</h2>
<div class="groups">
${HEAD.map((g) => `  <div class="g"><div class="h"><span class="mono">CIG-${g.id}</span><strong>${esc(g.title)}</strong><em>${g.n} ${L.lawsN}</em></div><p>${g.top.rule.en}</p><p class="why">${g.top.why.en}</p></div>`).join('\n')}
</div>

<div class="plat">
  <div>
    <p class="mono" style="margin-bottom:8px">CIG-7 &middot; ${L.platTitle}</p>
    <pre>${Object.entries(PL.css).map(([k, v]) => `${esc(k)}: ${esc(v)};`).join('\n')}</pre>
  </div>
  <div style="display:flex;flex-direction:column;gap:9px">
    <p style="font-size:15.5px;line-height:1.5">${L.platLead}</p>
    <p style="font-size:14.5px;line-height:1.45;color:var(--muted)">${L.platMore.replace('{where}', PL.audioUnlock.where.en)}</p>
  </div>
</div>

<p class="credit"><span>${T.meta.author}</span><span>${T.meta.date}</span><span>${T.meta.project}</span></p>
</body></html>
`;
writeFileSync('design/exports/cig-panel.html', panel);
console.log(`cig-panel.html (EN) — panel ${T.assetSpec.panelWidth} px`);
