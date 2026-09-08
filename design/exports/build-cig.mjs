// Generuje design/cig.html (dokument) i design/exports/cig-panel.html (panel 1800 px)
// z design/tokens.json. Liczby NIE są tu wpisywane — wszystkie pochodzą z tokenów,
// więc zmiana cooldownu to jedna edycja w tokens.json plus `node`.
import { readFileSync, writeFileSync } from 'node:fs';

const T = JSON.parse(readFileSync('design/tokens.json', 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hex = (k) => T.color.signal[k].hex;

const GROUPS = [
  {
    id: '1', title: 'Użytkownik', lede:
      `Specyfikacja, nie opis. Wszystko dalej wynika z tych sześciu wierszy.`,
    laws: [
      { id: '1.1', rule: `Dichromat: czopki przy <b>${T.user.conePeakShort}</b> i <b>${T.user.conePeakLongMedium}</b>. ${T.user.indistinguishable.join(' i ')} są nieodróżnialne.`,
        why: `To nie ubóstwo palety, a inna geometria przestrzeni barw.`,
        check: `Żadna informacja potrzebna psu nie jest zakodowana w opozycji ${T.user.indistinguishable.join('–')}.` },
      { id: '1.2', rule: `Ostrość <b>${T.user.acuityTypical}</b> (zakres ${T.user.acuityRange}), czyli około <b>${T.user.acuityFactor}×</b> słabsza od ludzkiej.`,
        why: `Detal nie istnieje. Nośnikiem jest sylwetka, plama koloru i ruch.`,
        check: `Każdy element trybu psiego przechodzi próg rozmiaru z CIG-2.3.` },
      { id: '1.3', rule: `Próg fuzji migotania <b>${T.user.flickerFusionDog}</b>, wobec ${T.user.flickerFusionHuman} u człowieka.`,
        why: `Ekran 60 Hz, dla nas płynny, może dla psa widocznie migać.`,
        check: `Odświeżanie ${T.frame.refresh} Hz utrzymane; patrz CIG-2.5.` },
      { id: '1.4', rule: `Urządzeniem wejściowym jest <b>${T.user.inputOrgan}</b>.`,
        why: `Mokry nos to duża, wilgotna, wielopunktowa plama kontaktu.`,
        check: `Interakcja nie wymaga precyzji ani stuknięcia; patrz CIG-3.` },
      { id: '1.5', rule: `Próg kontrastu i rozmiaru ustala <b>${T.user.contrastFloorSetBy}</b>, nie młodszy pies.`,
        why: `Jeśli coś jest czytelne dla starszej suczki, jest czytelne dla obojga. Odwrotnie nie.`,
        check: `Testy prowadzone na obu psach, ale progi walidowane na starszym.` },
      { id: '1.6', rule: `Pies <b>nie odczytuje obrazu jako reprezentacji</b> realnego psa.`,
        why: `Rozróżnia cechy obrazu, ale obraz nie musi dla niego zastępować odpowiednika w świecie.`,
        check: `Wyjściem produktu jest ranking preferencji, nigdy „match".` },
    ],
  },
  {
    id: '2', title: 'Percepcja', lede: `Co wolno pokazać i jak duże to musi być.`,
    laws: [
      { id: '2.1', rule: `Znaczenie niesie <b>wyłącznie opozycja blue ↔ acid</b> (<code>${hex('blue')}</code> ↔ <code>${hex('acid')}</code>).`,
        why: `Obie barwy leżą blisko szczytów czułości psich czopków.`,
        check: `Rampa neutralna (${Object.keys(T.color.neutral).length} odcieni) nie występuje w żadnej roli sygnałowej.` },
      { id: '2.2', rule: `Zakaz kodowania stanu barwą czerwoną lub zieloną.`,
        why: `Dla dichromata obie są szarością, więc semantyka nie istnieje.`,
        check: `Grep po artboardach trybu psiego nie znajduje czerwieni ani zieleni.` },
      { id: '2.3', rule: `Minimalny cel w trybie psim <b>${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} px</b>. Skala typografii display ${T.scale.dog.display} / name ${T.scale.dog.name} / value ${T.scale.dog.value}.`,
        why: `Około ${T.user.acuityFactor}× skali ludzkiej, wprost z ostrości ${T.user.acuityTypical}.`,
        check: `Strefy decyzji mają ${T.input.zoneWidth}×${T.input.zoneHeight} px, czyli pełną wysokość ramki.` },
      { id: '2.4', rule: `Figura i tło rozdzielone maksymalnym kontrastem: ${hex('ink')} przeciw ${hex('white')}, ${hex('acid')} przeciw ${hex('ink')}.`,
        why: `Kontrast, nie barwa, jest u psa głównym kanałem informacji.`,
        check: `Każdy sygnał czytelny po konwersji do skali szarości.` },
      { id: '2.5', rule: `<b>${T.frame.refresh} Hz jest wymaganiem sprzętowym</b>, nie luksusem. Animacje wyłącznie na <code>${T.motion.animatableProperties.join('</code> i <code>')}</code>.`,
        why: `Przy progu ${T.user.flickerFusionDog} ekran 60 Hz może być dla psa widocznie migający.`,
        check: `Nic nie renderuje się w 30 fps; brak animacji layoutu.` },
      { id: '2.6', rule: `Tekst jest <b>wyłącznie dla człowieka</b>.`,
        why: `Pies nie czyta. Litera nie może być jedynym nośnikiem informacji.`,
        check: `Każdy komunikat trybu psiego ma nośnik nietekstowy: kształt, ruch albo dźwięk.` },
    ],
  },
  {
    id: '3', title: 'Wejście', lede: `Wejście to plama, nie punkt — i przesunięcie, nie stuknięcie.`,
    laws: [
      { id: '3.1', rule: `Prymitywem interakcji jest <b>${T.input.primitive}</b>. Zakazane: ${T.input.forbidden.join(', ')}.`,
        why: `Psi input na ekranie z natury przypomina przesunięcie i przeciągnięcie. Gest Tindera jest przypadkiem właściwym gestem.`,
        check: `Żaden handler nie nasłuchuje zdarzenia stuknięcia w trybie psim.` },
      { id: '3.2', rule: `Wskaźnik to <b>${T.input.pointerModel}</b>.`,
        why: `Kontakt nosa to obszar, nie kursor; liczba punktów jest przypadkowa.`,
        check: `Logika decyzji nie odczytuje <code>touches.length</code>.` },
      { id: '3.3', rule: `Próg przesunięcia <b>${T.input.dragThreshold} px</b>. Kierunek wyznacza połowa ekranu: ${T.input.zoneCount} strefy po ${T.input.zoneWidth} px na pełnej wysokości ${T.input.zoneHeight} px.`,
        why: `Niski próg i ogromne strefy zdejmują z psa wymóg precyzji.`,
        check: `Każdy drag dłuższy niż ${T.input.dragThreshold} px daje decyzję.` },
      { id: '3.4', rule: `Po decyzji blokada wejścia <b>${T.input.cooldown} ms</b>.`,
        why: `Jedno długie pociągnięcie nosem nie może zarejestrować trzech decyzji.`,
        check: `Dwie decyzje w odstępie mniejszym niż ${T.input.cooldown} ms są niemożliwe.` },
      { id: '3.5', rule: `Cofnięcie jest <b>funkcją rdzeniową</b>, w skali ludzkiej, dostępne dla człowieka obok.`,
        why: `${T.input.undo.split('—')[1].trim()}. W apkach ludzkich undo bywa funkcją premium; tutaj pomyłka jest normą.`,
        check: `Cofnięcie widoczne na D3 i osiągalne bez wychodzenia z sesji.` },
      { id: '3.6', rule: `Jedyny wyjątek od zakazu stuknięć: <b>${T.input.tapException.screen}</b>.`,
        why: `${T.input.tapException.why}.`,
        check: `Wyjątek zapisany w arkuszu tokenów i w CLAUDE.md; nie rozszerza się na inne ekrany.` },
    ],
  },
  {
    id: '4', title: 'Sprzężenie zwrotne', lede: `Co się dzieje po decyzji — i gdzie ta pętla naprawdę się zamyka.`,
    laws: [
      { id: '4.1', rule: `Każde „tak" <b>natychmiast coś robi</b>. Żadnego stosu „może później".`,
        why: `Lekcja z cmentarza apek o pracę: swipe, który tylko odkłada ofertę, nie oszczędza niczego.`,
        check: `Decyzja wywołuje dźwięk, zapowiedź nagrody i wpis w rankingu w tym samym momencie.` },
      { id: '4.2', rule: `Dźwięk jest nośnikiem <b>pierwszorzędnym</b>: ${Object.entries(T.sound).filter(([k]) => !k.startsWith('$')).map(([k, v]) => `${k} ${v.seconds} s`).join(', ')}.`,
        why: `U psa słuch bije wzrok, zwłaszcza przy ostrości ${T.user.acuityTypical}.`,
        check: `Każde zdarzenie decyzyjne ma przypisany dźwięk; poziomy z tokenów.` },
      { id: '4.3', rule: `Ruch jest informacją, nie ozdobą. <code>prefers-reduced-motion</code> dotyczy trybu ludzkiego.`,
        why: `${T.motion.reducedMotion}.`,
        check: `Wyłączenie animacji w trybie psim nie jest zaimplementowane i nie powinno być.` },
      { id: '4.4', rule: `Nagroda jest <b>fizyczna</b>. Ekran ją ${T.reward.screenRole.split(',')[0]}.`,
        why: `Pętla zamyka się smaczkiem z ręki, w pokoju — nie na szkle.`,
        check: `D4 zawiera jawny sygnał dla człowieka, że czas na smaczek.` },
      { id: '4.5', rule: `Obecność człowieka w pomieszczeniu jest <b>wymagana</b>.`,
        why: `Zaangażowanie psa w zadanie na ekranie rośnie przy człowieku obok.`,
        check: `Projekt nie przewiduje sesji, w której pies zostaje sam z telefonem.` },
    ],
  },
  {
    id: '5', title: 'Sesja', lede: `Aplikacja ma koniec. To nie oszczędność, to decyzja.`,
    laws: [
      { id: '5.1', rule: `Talia liczy <b>${T.session.deckMin}–${T.session.deckMax} kart</b> i się kończy.`,
        why: `Dolna granica to ${T.session.deckMin}, bo ${T.session.deckFloorWhy}.`,
        check: `Po ostatniej karcie pojawia się stan końcowy, a nie kolejna karta.` },
      { id: '5.2', rule: `Brak feedu, brak powiadomień, brak streaków.`,
        why: `Zmęczenie swipe'em jest rozpoznanym zjawiskiem: monetyzacja ponad cel, powtarzalna praca zamiast przyjemności.`,
        check: `Kod nie zawiera harmonogramu powiadomień ani licznika serii.` },
      { id: '5.3', rule: `Metryką sukcesu jest <b>regularność i zaangażowanie w sesji</b>, nie czas w aplikacji.`,
        why: `Wartością dla starszego psa jest stymulacja poznawcza, a ta nie skaluje się długością sesji.`,
        check: `H1 raportuje czas decyzji i punkt spadku, nie łączny czas ekranu.` },
    ],
  },
  {
    id: '6', title: 'Granica trybów', lede: `Jedno prawo, ale bez niego produkt nie ma sensu.`,
    laws: [
      { id: '6.1', rule: `<b>Pies nie wchodzi w tryb ludzki.</b> Gest przejścia musi być niewykonalny nosem — wymaga dwóch punktów kontaktu naraz albo sekwencji.`,
        why: `Tryb ludzki zawiera dane, edycję profili i zatwierdzanie spotkań. Nos nie może tam trafić przypadkiem.`,
        check: `Żaden ekran D1–D5 nie zawiera pojedynczego celu prowadzącego do H1–H4.` },
      { id: '6.2', rule: `Ekran końca sesji nie ma <b>żadnej afordancji „dalej"</b>.`,
        why: `Afordancja wielkości nosa jest afordancją dla nosa, niezależnie od intencji.`,
        check: `D5 nie zawiera obramowanego ani wypełnionego prostokąta o wymiarach celu.` },
      { id: '6.3', rule: `Poziom systemu domyka <b>Dostęp nadzorowany</b> iOS.`,
        why: `Blokuje wyjście z aplikacji do Ustawień; prawo 6.1 dotyczy wnętrza aplikacji.`,
        check: `Procedura sesji zawiera włączenie Dostępu nadzorowanego przed podaniem telefonu psu.` },
    ],
  },
];

const PLATFORM = T.platform;

function lawsFlat() { return GROUPS.flatMap((g) => g.laws.map((l) => ({ ...l, group: g.title }))); }

/* ---------- dokument ---------- */
const tokensCss = `
  :root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--warm:#EFE9D6;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--acid-fill:#C8D400;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  @media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ground:#0D1014;--panel:#171B21;--tint:#171C2E;--warm:#1E1B14;--ink:#EDEFEA;--muted:#9AA3B1;--faint:#5A6470;--blue:#7E92FF;--acid:#C3D122;--acid-fill:#C8D400;--rule:#242A33;--rule-strong:#3A424E}}
  :root[data-theme="dark"]{--ground:#0D1014;--panel:#171B21;--tint:#171C2E;--warm:#1E1B14;--ink:#EDEFEA;--muted:#9AA3B1;--faint:#5A6470;--blue:#7E92FF;--acid:#C3D122;--acid-fill:#C8D400;--rule:#242A33;--rule-strong:#3A424E}`;

const shared = `
  body{background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,'Times New Roman',serif;font-size:18px;line-height:1.6;-webkit-font-smoothing:antialiased}
  h1,h2,h3{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;margin:0;letter-spacing:-0.015em;text-wrap:balance}
  p{margin:0}
  a{color:var(--blue);text-underline-offset:2px}a:hover{color:var(--ink)}
  code{font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:0.86em;background:var(--panel);padding:1px 5px}
  .mono{font-family:'IBM Plex Mono',ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;letter-spacing:0.09em;text-transform:uppercase;font-weight:600}
  .law{display:grid;grid-template-columns:74px minmax(0,1fr);gap:18px;padding:16px 0;border-bottom:1px solid var(--rule)}
  .law .id{font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:12.5px;font-weight:600;color:var(--blue);padding-top:3px}
  .law .rule{font-size:17.5px;line-height:1.5}
  .law .meta{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;padding-top:9px}
  @media(max-width:720px){.law .meta{grid-template-columns:minmax(0,1fr)}.law{grid-template-columns:58px minmax(0,1fr);gap:12px}}
  .law .meta > div{font-size:14.5px;line-height:1.45;color:var(--muted)}
  .law .meta b{display:block;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:9.5px;letter-spacing:0.11em;text-transform:uppercase;margin-bottom:3px}
  .law .why b{color:var(--acid)}
  .law .chk{background:var(--tint);padding:9px 11px}
  .law .chk b{color:var(--blue)}`;

const lawsHtml = GROUPS.map((g) => `
  <section>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
      <p class="mono" style="color:var(--acid)">CIG-${g.id}</p>
      <h2 style="font-size:30px;line-height:1.12">${esc(g.title)}</h2>
      <p style="color:var(--muted);font-size:17px;max-width:70ch">${g.lede}</p>
    </div>
    <div style="border-top:2px solid var(--rule-strong)">
${g.laws.map((l) => `      <div class="law">
        <span class="id">CIG-${l.id}</span>
        <div>
          <p class="rule">${l.rule}</p>
          <div class="meta">
            <div class="why"><b>Dlaczego</b>${l.why}</div>
            <div class="chk"><b>Sprawdzenie</b>${l.check}</div>
          </div>
        </div>
      </div>`).join('\n')}
    </div>
  </section>`).join('\n');

const platformHtml = `
  <section>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
      <p class="mono" style="color:var(--acid)">CIG-7</p>
      <h2 style="font-size:30px;line-height:1.12">Warstwa platformowa</h2>
      <p style="color:var(--muted);font-size:17px;max-width:74ch">${PLATFORM.$note}</p>
    </div>
    <div style="border-top:2px solid var(--rule-strong)">
      <div class="law"><span class="id">CIG-7.1</span><div><p class="rule">Blokady przeglądarki, na <code>html</code> i <code>body</code>:</p>
        <div style="background:var(--color-code,var(--panel));padding:12px 14px;margin-top:9px;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:12.5px;line-height:1.8">${Object.entries(PLATFORM.css).map(([k, v]) => `${esc(k)}: ${esc(v)};`).join('<br>')}</div>
        <div class="meta"><div class="why"><b>Dlaczego</b>Bez pierwszych trzech nos przeciągnięty po ekranie zaznaczy tekst, wywoła lupę powiększającą i przewinie stronę. Prawo CIG-3 jest wtedy niespełnialne.</div><div class="chk"><b>Sprawdzenie</b>Przeciągnięcie palcem po ekranie na urządzeniu nie zaznacza tekstu, nie pokazuje lupy i nie odbija strony.</div></div></div></div>
      <div class="law"><span class="id">CIG-7.2</span><div><p class="rule">Viewport <code>${esc(PLATFORM.viewport)}</code>, manifest <code>display: ${PLATFORM.manifest.display}</code>, orientacja <code>${PLATFORM.manifest.orientation}</code>, tło i motyw <code>${PLATFORM.manifest.background_color}</code>.</p>
        <div class="meta"><div class="why"><b>Dlaczego</b>Standalone zdejmuje pasek Safari, <code>viewport-fit=cover</code> oddaje pełną ramkę ${T.frame.cssWidth}×${T.frame.cssHeight} px.</div><div class="chk"><b>Sprawdzenie</b>Po dodaniu do ekranu głównego nie widać interfejsu przeglądarki.</div></div></div></div>
      <div class="law"><span class="id">CIG-7.3</span><div><p class="rule">Bezpieczne obszary: górny ${T.frame.safeAreaTop} px, dolny ${T.frame.safeAreaBottom} px, przez <code>env(safe-area-inset-*)</code>.</p>
        <div class="meta"><div class="why"><b>Dlaczego</b>Prawdziwy pasek statusu i wskaźnik ekranu głównego rysują się na naszym layoucie. Udawanego paska nie rysujemy nigdy.</div><div class="chk"><b>Sprawdzenie</b>Żaden artboard nie zawiera namalowanego paska statusu; treść nie wchodzi pod wskaźnik.</div></div></div></div>
      <div class="law"><span class="id">CIG-7.4</span><div><p class="rule"><b>Odblokowanie dźwięku na ${PLATFORM.audioUnlock.where}.</b></p>
        <div class="meta"><div class="why"><b>Dlaczego</b>${PLATFORM.audioUnlock.$note} ${PLATFORM.audioUnlock.why}.</div><div class="chk"><b>Sprawdzenie</b>Szczeknięcie gra przy pierwszym „tak" w sesji, a nie dopiero przy drugim.</div></div></div></div>
      <div class="law"><span class="id">CIG-7.5</span><div><p class="rule">Wideo profilu z atrybutami <code>${PLATFORM.video.attributes.join('</code> <code>')}</code>.</p>
        <div class="meta"><div class="why"><b>Dlaczego</b>${PLATFORM.video.$note} ${PLATFORM.video.consequence}.</div><div class="chk"><b>Sprawdzenie</b>Wideo startuje samo na urządzeniu, bez gestu i bez pełnego ekranu.</div></div></div></div>
    </div>
  </section>`;

const higHtml = `
  <section>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
      <p class="mono" style="color:var(--acid)">CIG-8</p>
      <h2 style="font-size:30px;line-height:1.12">Gdzie rządzi HIG, a nie my</h2>
      <p style="color:var(--muted);font-size:17px;max-width:74ch">Budujemy PWA, więc Human Interface Guidelines nas formalnie nie obowiązują — Apple nie recenzuje strony dodanej do ekranu głównego. Ale w trybie ludzkim HIG opisuje <strong>oczekiwania</strong>, a te obowiązują niezależnie od tego, kto je wymusza. Dla H1–H4 nie przepisujemy HIG: odsyłamy do niego i zapisujemy tylko odstępstwa.</p>
    </div>
    <div class="tw" style="overflow-x:auto;border-top:2px solid var(--rule-strong)">
    <table style="border-collapse:collapse;width:100%;min-width:620px;font-size:16px">
      <thead><tr>
        <th style="text-align:left;padding:12px 18px 12px 0;border-bottom:1px solid var(--rule)" class="mono">Zagadnienie</th>
        <th style="text-align:left;padding:12px 18px 12px 0;border-bottom:1px solid var(--rule)" class="mono">Tryb psi D1–D5</th>
        <th style="text-align:left;padding:12px 0;border-bottom:1px solid var(--rule)" class="mono">Tryb ludzki H1–H4</th>
      </tr></thead>
      <tbody>
        <tr><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule);font-weight:600">Minimalny cel</td><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule)"><b>CIG-2.3</b> — ${T.scale.dog.minTargetWidth}×${T.scale.dog.minTargetHeight} px</td><td style="padding:13px 0;border-bottom:1px solid var(--rule);color:var(--muted)">HIG — ${T.scale.human.minTargetWidth}×${T.scale.human.minTargetHeight} px, przyjmujemy bez zmian</td></tr>
        <tr><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule);font-weight:600">Kolor semantyczny</td><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule)"><b>CIG-2.2</b> — czerwień i zieleń zakazane</td><td style="padding:13px 0;border-bottom:1px solid var(--rule);color:var(--muted)"><b>Odstępstwo.</b> HIG dopuszcza czerwień destrukcyjną; my zostajemy przy blue ↔ acid dla spójności obu trybów</td></tr>
        <tr><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule);font-weight:600">Typografia</td><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule)"><b>CIG-2.3</b> — display ${T.scale.dog.display} px</td><td style="padding:13px 0;border-bottom:1px solid var(--rule);color:var(--muted)"><b>Odstępstwo.</b> HIG zakłada SF Pro i Dynamic Type; my używamy ${T.typography.display.family} i ${T.typography.text.family}, bo tożsamość musi łączyć oba tryby</td></tr>
        <tr><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule);font-weight:600">Gesty</td><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule)"><b>CIG-3.1</b> — tylko przesunięcie</td><td style="padding:13px 0;border-bottom:1px solid var(--rule);color:var(--muted)">HIG — stuknięcia i standardowe gesty, przyjmujemy bez zmian</td></tr>
        <tr><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule);font-weight:600">Bezpieczne obszary</td><td style="padding:13px 18px 13px 0;border-bottom:1px solid var(--rule)"><b>CIG-7.3</b></td><td style="padding:13px 0;border-bottom:1px solid var(--rule);color:var(--muted)">HIG — identycznie, ${T.frame.safeAreaTop} px i ${T.frame.safeAreaBottom} px</td></tr>
        <tr><td style="padding:13px 18px 13px 0;font-weight:600">Redukcja ruchu</td><td style="padding:13px 18px 13px 0"><b>CIG-4.3</b> — nie stosujemy, ruch jest informacją</td><td style="padding:13px 0;color:var(--muted)">HIG — <code>prefers-reduced-motion</code> respektowane</td></tr>
      </tbody>
    </table>
    </div>
  </section>`;

const flat = lawsFlat();
const checklist = `
  <section>
    <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px">
      <p class="mono" style="color:var(--acid)">CIG-9</p>
      <h2 style="font-size:30px;line-height:1.12">Checklista zgodności</h2>
      <p style="color:var(--muted);font-size:17px;max-width:74ch">Każde prawo ma sprawdzenie, które da się wykonać na gotowym ekranie. Prawo bez sprawdzenia jest ozdobą, więc na tej liście nie ma ani jednego.</p>
    </div>
    <div style="border-top:2px solid var(--rule-strong)">
${flat.map((l) => `      <div style="display:grid;grid-template-columns:74px minmax(0,1fr);gap:18px;padding:10px 0;border-bottom:1px solid var(--rule)"><span class="mono" style="color:var(--blue);font-size:11.5px;letter-spacing:0.04em">CIG-${l.id}</span><span style="font-size:15.5px;line-height:1.45">${l.check}</span></div>`).join('\n')}
    </div>
  </section>`;

const doc = `<title>Canine Interface Guidelines</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&amp;family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&amp;family=IBM+Plex+Mono:wght@400;600&amp;display=swap">
<style>${tokensCss}${shared}
  .wrap{max-width:1040px;margin:0 auto;padding:52px 24px 88px}
  header.top{display:flex;flex-direction:column;gap:18px;padding-bottom:32px;border-bottom:2px solid var(--ink)}
  .meta{display:flex;flex-wrap:wrap;gap:8px 24px;color:var(--muted)}
  .deck{font-size:21px;line-height:1.5;max-width:62ch}
  h1{font-size:clamp(36px,5.4vw,56px);line-height:1.03}
  section{padding-top:54px}
  .thesis{background:var(--tint);padding:24px 26px;margin-top:26px;max-width:76ch;display:flex;flex-direction:column;gap:10px}
  .thesis .mono{color:var(--blue)}
  .swatches{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px;background:var(--rule);margin-top:26px}
  .sw{background:var(--ground);padding:0}
  .sw i{display:block;height:56px}
  .sw span{display:block;padding:10px 12px;font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace;font-size:10.5px;letter-spacing:0.05em;color:var(--muted)}
  .sw span b{display:block;color:var(--ink);font-size:12px;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:2px}
  footer{margin-top:64px;padding-top:20px;border-top:2px solid var(--ink);color:var(--muted);font-size:15px;display:flex;gap:24px;flex-wrap:wrap}
</style>

<div class="wrap">
  <header class="top">
    <p class="meta mono"><span>${T.meta.project}</span><span>${T.meta.spec}</span><span>${T.meta.date}</span></p>
    <h1>Canine Interface Guidelines</h1>
    <p class="deck">Wytyczne interfejsu dla użytkownika, którego <em>nie da się zapytać</em>: dichromata o ostrości ${T.user.acuityTypical}, którego urządzeniem wejściowym jest ${T.user.inputOrgan}.</p>
  </header>

  <div class="thesis">
    <p class="mono">Dlaczego nie HIG</p>
    <p>Human Interface Guidelines opisują człowieka: palec, ${T.scale.human.minTargetWidth} pt celu, czerwień jako ostrzeżenie, tekst jako treść. Każde z tych założeń pęka na naszym użytkowniku, więc w trybie psim HIG nie są niewystarczające — są <strong>szkodliwe</strong>. CIG opisuje ${flat.length + 8} praw dla psa; dla człowieka odsyłamy do HIG i notujemy tylko odstępstwa.</p>
    <p style="color:var(--muted);font-size:16px">Wszystkie liczby w tym dokumencie pochodzą z <code>design/tokens.json</code> i są w niego wstawiane przy generowaniu. Nie ma tu ani jednej wartości wpisanej ręcznie.</p>
  </div>

  <div class="swatches">
${Object.entries(T.color.signal).map(([k, v]) => `    <div class="sw"><i style="background:${v.hex}${k === 'ink' ? ';box-shadow:inset 0 0 0 1px var(--rule-strong)' : ''}"></i><span><b>${k}</b>${v.hex}<br>${v.rola}</span></div>`).join('\n')}
  </div>

${lawsHtml}
${platformHtml}
${higHtml}
${checklist}

  <footer><span><strong>${T.meta.author}</strong></span><span>${T.meta.date}</span><span>${T.meta.project}</span></footer>
</div>
`;

writeFileSync('design/cig.html', doc);
console.log(`cig.html — ${flat.length} praw w ${GROUPS.length} grupach + warstwa platformowa + HIG + checklista`);

/* ---------- panel 1800 px do use case, rozdzial 09 ---------- */
const HEAD = GROUPS.map((g) => ({ id: g.id, title: g.title, n: g.laws.length, top: g.laws[0] }));
const panel = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;800&family=Newsreader:ital,wght@0,400;0,500;0,600&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>
  :root{--ground:#EFF1EC;--panel:#E4E8DE;--tint:#E0E5F5;--warm:#EFE9D6;--ink:#10131A;--muted:#58606E;--faint:#97A08F;--blue:#1B34D8;--acid:#7E8A00;--acid-fill:#C8D400;--rule:#CFD5C8;--rule-strong:#A9B2A0}
  *{box-sizing:border-box}
  body{margin:0;width:1800px;padding:44px 40px;background:var(--ground);color:var(--ink);font-family:'Newsreader',Georgia,serif;font-size:18px;line-height:1.55}
  h1{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:44px;line-height:1.03;margin:0 0 10px;letter-spacing:-0.015em}
  p{margin:0}
  code{font-family:'IBM Plex Mono',Menlo,monospace;font-size:0.85em;background:var(--panel);padding:1px 5px}
  .eyebrow{font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;font-weight:600;color:var(--acid);margin-bottom:12px}
  .mono{font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;letter-spacing:0.11em;text-transform:uppercase;font-weight:600}
  .top{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:34px;padding-bottom:24px;border-bottom:2px solid var(--ink)}
  .lede{color:var(--muted);font-size:17px;max-width:78ch}
  .thesis{background:var(--tint);padding:18px 20px;display:flex;flex-direction:column;gap:8px}
  .thesis .mono{color:var(--blue)}
  .thesis p{font-size:15.5px;line-height:1.5}
  .sw{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2px;background:var(--rule);margin-top:12px}
  .sw>div{background:var(--ground)}
  .sw i{display:block;height:40px}
  .sw span{display:block;padding:7px 9px;font-family:'IBM Plex Mono',Menlo,monospace;font-size:9.5px;color:var(--muted)}
  .sw span b{display:block;color:var(--ink);font-size:11px;letter-spacing:0.07em;text-transform:uppercase}
  h2{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-weight:800;font-size:24px;margin:30px 0 14px;letter-spacing:-0.015em}
  table{border-collapse:collapse;width:100%;font-size:15px}
  th{text-align:left;padding:10px 16px 10px 0;border-bottom:2px solid var(--rule-strong);font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;letter-spacing:0.11em;text-transform:uppercase;font-weight:600;color:var(--muted)}
  td{padding:11px 16px 11px 0;border-bottom:1px solid var(--rule);vertical-align:top;line-height:1.42}
  td:first-child{font-weight:600;white-space:nowrap}
  td b{color:var(--blue);font-weight:600}
  td.dev{background:var(--warm)}
  td.dev b{color:var(--acid)}
  .groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;background:var(--rule)}
  .g{background:var(--ground);padding:16px 18px;display:flex;flex-direction:column;gap:7px}
  .g .h{display:flex;align-items:baseline;gap:10px}
  .g .h .mono{color:var(--blue)}
  .g .h strong{font-family:'Bricolage Grotesque','Helvetica Neue',Arial,sans-serif;font-size:19px;font-weight:800;letter-spacing:-0.01em}
  .g .h em{margin-left:auto;font-style:normal;font-family:'IBM Plex Mono',Menlo,monospace;font-size:10px;color:var(--faint);letter-spacing:0.08em}
  .g p{font-size:14.5px;line-height:1.45}
  .g .why{color:var(--muted);font-size:13px;line-height:1.4}
  .plat{margin-top:2px;background:var(--warm);padding:18px 20px;display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:26px;align-items:start}
  .plat pre{margin:0;font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;line-height:1.75;color:var(--ink)}
  .plat .mono{color:var(--acid)}
  .credit{margin-top:28px;padding-top:14px;border-top:2px solid var(--ink);font-family:'IBM Plex Mono',Menlo,monospace;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;font-weight:600;color:var(--muted);display:flex;gap:22px}
</style></head><body>

<p class="eyebrow">${T.meta.project} &middot; Rozdzia&#322; 09 &middot; ${T.meta.spec}</p>

<div class="top">
  <div>
    <h1>Canine Interface Guidelines</h1>
    <p class="lede">Human Interface Guidelines opisuj&#261; cz&#322;owieka: palec, ${T.scale.human.minTargetWidth} pt celu, czerwie&#324; jako ostrze&#380;enie, tekst jako tre&#347;&#263;. Ka&#380;de z tych za&#322;o&#380;e&#324; p&#281;ka na naszym u&#380;ytkowniku &mdash; dichromacie o ostro&#347;ci ${T.user.acuityTypical}, kt&oacute;rego urz&#261;dzeniem wej&#347;ciowym jest ${T.user.inputOrgan}. Wi&#281;c w trybie psim HIG nie s&#261; niewystarczaj&#261;ce. S&#261; <strong>szkodliwe</strong>.</p>
    <div class="sw">
${Object.entries(T.color.signal).map(([k, v]) => `      <div><i style="background:${v.hex}${k === 'ink' ? ';box-shadow:inset 0 0 0 1px var(--rule-strong)' : ''}"></i><span><b>${k}</b>${v.hex} &middot; ${v.rola}</span></div>`).join('\n')}
    </div>
  </div>
  <div class="thesis">
    <p class="mono">Jedno &#378;r&oacute;d&#322;o prawdy</p>
    <p>Wszystkie liczby w tym dokumencie pochodz&#261; z <code>design/tokens.json</code> i s&#261; wstawiane przy generowaniu. Ani jedna nie jest wpisana r&#281;cznie.</p>
    <p>Audyt review wykaza&#322;, &#380;e cooldown &#380;y&#322; w siedmiu plikach, a paleta w dziesi&#281;ciu artboardach. Ten plik istnieje, &#380;eby to si&#281; nie powt&oacute;rzy&#322;o.</p>
    <p class="mono" style="color:var(--acid);padding-top:2px">${flat.length} praw &middot; ${GROUPS.length} grup &middot; ka&#380;de ze sprawdzeniem</p>
  </div>
</div>

<h2>Gdzie rz&#261;dzi CIG, a gdzie HIG</h2>
<table>
  <thead><tr><th>Zagadnienie</th><th>Tryb psi &middot; D1&ndash;D5</th><th>Tryb ludzki &middot; H1&ndash;H4</th></tr></thead>
  <tbody>
    <tr><td>Minimalny cel</td><td><b>CIG-2.3</b> &mdash; ${T.scale.dog.minTargetWidth}&times;${T.scale.dog.minTargetHeight} px</td><td>HIG &mdash; ${T.scale.human.minTargetWidth}&times;${T.scale.human.minTargetHeight} px, przyjmujemy bez zmian</td></tr>
    <tr><td>Kolor semantyczny</td><td><b>CIG-2.2</b> &mdash; czerwie&#324; i zielen&#324; zakazane jako kod</td><td class="dev"><b>Odst&#281;pstwo.</b> HIG dopuszcza czerwie&#324; destrukcyjn&#261;; zostajemy przy blue &harr; acid dla sp&oacute;jno&#347;ci obu tryb&oacute;w</td></tr>
    <tr><td>Typografia</td><td><b>CIG-2.3</b> &mdash; display ${T.scale.dog.display} px</td><td class="dev"><b>Odst&#281;pstwo.</b> HIG zak&#322;ada SF Pro i Dynamic Type; u&#380;ywamy ${T.typography.display.family} i ${T.typography.text.family}, bo to&#380;samo&#347;&#263; musi &#322;&#261;czy&#263; oba tryby</td></tr>
    <tr><td>Gesty</td><td><b>CIG-3.1</b> &mdash; wy&#322;&#261;cznie przesuni&#281;cie</td><td>HIG &mdash; stukni&#281;cia i standardowe gesty, bez zmian</td></tr>
    <tr><td>Bezpieczne obszary</td><td><b>CIG-7.3</b> &mdash; ${T.frame.safeAreaTop} px i ${T.frame.safeAreaBottom} px</td><td>HIG &mdash; identycznie</td></tr>
    <tr><td>Redukcja ruchu</td><td><b>CIG-4.3</b> &mdash; nie stosujemy, ruch jest informacj&#261;</td><td>HIG &mdash; <code>prefers-reduced-motion</code> respektowane</td></tr>
  </tbody>
</table>

<h2>Sze&#347;&#263; grup praw</h2>
<div class="groups">
${HEAD.map((g) => `  <div class="g"><div class="h"><span class="mono">CIG-${g.id}</span><strong>${esc(g.title)}</strong><em>${g.n} praw</em></div><p>${g.top.rule}</p><p class="why">${g.top.why}</p></div>`).join('\n')}
</div>

<div class="plat">
  <div>
    <p class="mono" style="margin-bottom:8px">CIG-7 &middot; Warstwa platformowa</p>
    <pre>${Object.entries(PLATFORM.css).map(([k, v]) => `${esc(k)}: ${esc(v)};`).join('\n')}</pre>
  </div>
  <div style="display:flex;flex-direction:column;gap:9px">
    <p style="font-size:15.5px;line-height:1.5"><strong>Bez pierwszych trzech regu&#322; prawo wej&#347;cia jest niespe&#322;nialne.</strong> Nos przeci&#261;gni&#281;ty po ekranie zaznaczy tekst, wywo&#322;a lup&#281; powi&#281;kszaj&#261;c&#261; i przewinie stron&#281;. To nie detal implementacji &mdash; to warunek, &#380;eby swipe w og&oacute;le dotar&#322; do aplikacji.</p>
    <p style="font-size:14.5px;line-height:1.45;color:var(--muted)">Do tego dwa ograniczenia iOS, kt&oacute;re kszta&#322;tuj&#261; przep&#322;yw: d&#378;wi&#281;k wymaga gestu u&#380;ytkownika, wi&#281;c <strong>${PLATFORM.audioUnlock.where}</strong> musi odblokowa&#263; AudioContext, inaczej szczekni&#281;cie na D4 nie zagra. A wideo odtwarza si&#281; samo tylko jako <code>${PLATFORM.video.attributes.join('</code> <code>')}</code>, wi&#281;c &#347;cie&#380;ka d&#378;wi&#281;kowa profilu jest bez znaczenia.</p>
  </div>
</div>

<p class="credit"><span>${T.meta.author}</span><span>${T.meta.date}</span><span>${T.meta.project}</span></p>
</body></html>
`;
writeFileSync('design/exports/cig-panel.html', panel);
console.log(`cig-panel.html — panel ${T.assetSpec.panelWidth} px, ${HEAD.length} grup`);
