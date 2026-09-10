# Post na LinkedIn — wersje do wyboru

**WYBRANA: wersja B po angielsku.** Leży pierwsza, gotowa do skopiowania.
Polskie wersje niżej są **nieaktualne** — powstały przed researchem o migotaniu
i twierdzą, że wymóg 120 Hz nie został dowieziony. Zostawiam je tylko jako
zapis, jak brzmiała historia przed sprawdzeniem.

**LinkedIn nie renderuje markdownu** — gwiazdki wyświetlą się dosłownie.
Wersja angielska jest czystym tekstem; struktura to emoji i puste linie.

Pierwsze ~200 znaków widać przed „zobacz więcej".

---

## ✅ Wersja B — angielska, do skopiowania

My most recent user couldn't read, couldn't speak, and his pointing device was a wet nose.

That's Karmel, five. He cornered me one afternoon together with his mother Auri, twelve, and delivered a brief: they would like to meet a kindred spirit who is neither mum nor son. I said I'd build them an app.

Sounds like a joke, right up until you do the numbers. A dog is a dichromat with roughly 20/75 acuity, so:

🔵 Two hues carry all the meaning. Cone peaks sit near 429 and 555 nm, so blue and yellow-green do every job. Red as a warning is a warning nobody receives.

📏 Everything is about four times bigger. The acuity factor is 3.75 — applied deliberately, not "looks about right".

⚡ Dogs resolve change faster than we do: flicker fusion at 70–80 Hz against our 60.

👃 The gesture is a drag, not a tap. A nose doesn't land as a point — it lands as a large, wet, multi-point moving patch.

So I wrote my own guidelines. Thirty-four numbered laws, because Apple's Human Interface Guidelines describe a fingertip, a 44 pt target and text carrying the content. Every one of those premises is false for this user, and adapting a document whose every premise has failed isn't adaptation, it's fan fiction.

Then I built the thing, instrumented it, tested it on an actual dog — and one of my own laws fell over.

The law said: 120 Hz is required, or the screen flickers to the dog. My session log said 60 fps. For about an hour that looked like a straightforward failure.

It wasn't. The law was wrong.

Flicker is luminance modulation — how often the light actually goes on and off. On a modern sample-and-hold OLED that's the dimming, not the refresh rate. This phone runs PWM dimming at 480 Hz at every brightness level. Against a dog's 70–80 Hz threshold, that's six times the headroom. The screen never flickered for the dog and never could have.

What 60 fps actually costs is motion continuity — a swipe following his nose is genuinely steppier to Karmel than to me. And that 60 wasn't the hardware either: iOS Safari caps page rendering near 60 fps by default, ProMotion or not, to save battery. There's a feature flag that lifts it.

So the requirement became two requirements, because it had been one law doing two jobs badly. And the actual flicker risk turned out to be somewhere I wasn't looking at all: a dimmed or mains-driven lamp in the room can modulate below 80 Hz. The risk was in the ceiling light, not the device.

The measurement I thought had caught my build failing had caught my reasoning failing. I'd take that trade every time — but I only went looking because a number disagreed with me.

Karmel went through the whole deck. He has preferences. He's not saying why 🐕

Built for fun and for practice, but the method is the one I use at work: research before design, tokens as the single source of truth, and a prototype that measures itself hard enough to embarrass its author.

🐕 Open it on a phone: https://konstancja-tanjga.github.io/Tinder-for-chihuahua/
📖 The whole process, including this correction: https://konstancja-tanjga.github.io/portfolio-site/work/tinder-for-chihuahua/

The candidates are real chihuahuas under assumed names. The deck deliberately excludes family — a filter makes sure Karmel never gets served his own mother.

#UX #ProductDesign #DesignSystems #Accessibility #SpeculativeDesign

---

## Źródła do researchu o migotaniu

- Psi próg fuzji migotania 80 Hz: Coile i in., 1989 — https://www.sciencedirect.com/topics/immunology-and-microbiology/critical-flicker-fusion
- PWM w OLED-ach smartfonowych, 240/480 Hz: https://www.oled-info.com/pulse-width-modulation-pwm-oled-displays
- Pomiar iPhone 13 Pro Max, 480,19 Hz, modulacja 97,6%: https://www.dxomark.com/apple-iphone-13-pro-max-display-test-retested/
- Safari domyślnie ~60 fps i flaga funkcji: https://www.macrumors.com/how-to/enable-smoother-120hz-browsing-in-safari/
- WebKit, wsparcie 120 Hz rAF: https://bugs.webkit.org/show_bug.cgi?id=173434
- Zachowanie psów pod świetlówkami vs LED (ryzyko po stronie oświetlenia): https://www.sciencedirect.com/science/article/abs/pii/S016815912500190X

---

## Wersja A — pełna (najbliżej tego, o co prosiłaś)

Pewnego dnia zaczepiły mnie moje psy.

Karmel (5) i Auri (12, jego mama) dali mi brief: chcieliby poznać bratnią duszę,
która nie jest mamą ani synem. Powiedziałam, że zrobię im apkę. Zrobiłam.

I tu przestało być zabawne, bo brief okazał się autentycznie trudny 😅

Mój użytkownik jest dichromatem o ostrości wzroku 20/75, nie czyta, nie mówi,
a jego urządzeniem wskazującym jest **mokry nos**. Nie da się go zapytać. Nie da
się zrobić wywiadu. Nie powie mi, że coś jest nieczytelne — po prostu odejdzie.

Więc wymagania musiały przyjść z literatury:

🔵 Psy widzą dwie barwy (czopki ~429 i ~555 nm), więc całe znaczenie niesie blue
i acid. Czerwień jako ostrzeżenie to ostrzeżenie, którego nikt nie odbiera.

📏 Ostrość 20/75 to współczynnik 3,75 — wszystko jest ~4× większe. Nie „trochę
większe, na oko".

⚡ Psia granica migotania to 70–80 Hz, ludzka ~60. Na ekranie 60 Hz obraz psu
**migocze**. Dlatego w briefie stoi konkretny model telefonu — spec sprzętu
wyszedł z badań nad okiem.

👃 Nos nie ląduje jako punkt, tylko jako duża, mokra, wielopunktowa plama
w ruchu. Więc gest to przesunięcie, nie tap. I jedno przesunięcie potrafi
zarejestrować się trzy razy, stąd cooldown 1500 ms i undo jako funkcja
rdzeniowa, nie premium.

Napisałam do tego własne wytyczne — **Canine Interface Guidelines**, 34
numerowane prawa — bo Human Interface Guidelines opisują palec, cel 44 pt
i tekst jako treść. Każde z tych założeń pęka na tym użytkowniku. Adaptowanie
dokumentu, któremu padły wszystkie przesłanki, to nie adaptacja, to fanfik.

Wszystko generuje się z jednego pliku tokenów, więc wytyczne nie mogą się
rozjechać z aplikacją.

**A potem przyszły testy.** Karmel przeszedł całą talię. Ma preferencje. Nie
mówi dlaczego.

I dostałam pierwszy wynik, którego nie chciałam: log sesji pokazuje **60 fps,
a nie 120**. Czyli to jedno prawo, które wymusiło wybór telefonu, nie zostało
dowiezione. Jeszcze nie wiem, dlaczego. Nie udaję, że wiem.

Szczerze? To jest najlepszy argument za całą tą konstrukcją: wymóg przyszedł
z badań, wszedł do wytycznych jako numerowane prawo, został zaprojektowany
i zbudowany — i pierwsza nagrana sesja mówi, że platforma go nie dowiozła.
Specyfikacja, której nie da się przyłapać na niespełnieniu, nie jest
specyfikacją, tylko życzeniem.

Zrobiłam to dla zabawy i dla praktyki. Ale metoda jest ta sama, którą stosuję
w pracy — research przed projektem, tokeny jako źródło prawdy, prototyp, który
się mierzy. Tylko brief był na tyle absurdalny, że żaden interesariusz nie
uratował słabej decyzji, zgadzając się z nią. Każdy skrót było widać.

Aplikacja działa i możecie ją otworzyć na telefonie 👇
🐕 https://konstancja-tanjga.github.io/Tinder-for-chihuahua/
📖 Cały proces: https://konstancja-tanjga.github.io/portfolio-site/work/tinder-for-chihuahua/

Kandydaci to prawdziwe psy pod zmienionymi imionami. Talia celowo nie zawiera
rodziny — filtr `familyIds` pilnuje, żeby Karmel nie dostał własnej mamy.

#UX #ProductDesign #DesignSystems #Accessibility #SpeculativeDesign #Chihuahua

---

## Wersja B — krótsza, mocniejszy hak

Mój ostatni użytkownik nie umiał czytać, nie mówił, a jego urządzeniem
wskazującym był mokry nos.

To Karmel, 5 lat. Zaczepił mnie razem ze swoją mamą Auri (12) z konkretnym
briefem: chcieliby poznać bratnią duszę, która nie jest mamą ani synem.
Powiedziałam, że zrobię im apkę.

Brzmi jak żart, dopóki nie policzysz. Pies jest dichromatem o ostrości 20/75:

🔵 dwie barwy niosą całe znaczenie, czerwień nie istnieje
📏 wszystko ~4× większe — współczynnik 3,75, nie „na oko"
⚡ 120 Hz to wymóg sprzętowy, bo przy 60 Hz ekran psu migocze
👃 gest to przesunięcie, nie tap — nos to plama, nie punkt

Napisałam własne wytyczne (34 prawa), bo HIG opisują palec i cel 44 pt.
Zbudowałam PWA. Oprzyrządowałam ją. Przetestowałam na psie.

I pierwszy wynik był negatywny: log pokazuje 60 fps, a nie 120. To prawo, które
wymusiło wybór telefonu, nie zostało dowiezione — i nie wiem jeszcze dlaczego.

Co jest właściwie dobrą wiadomością. Specyfikacja, której nie da się przyłapać
na niespełnieniu, nie jest specyfikacją, tylko życzeniem.

Karmel przeszedł całą talię. Ma preferencje. Nie mówi dlaczego 🐕

🐕 Otwórz na telefonie: https://konstancja-tanjga.github.io/Tinder-for-chihuahua/
📖 Cały proces: https://konstancja-tanjga.github.io/portfolio-site/work/tinder-for-chihuahua/

#UX #ProductDesign #Accessibility #SpeculativeDesign

---

## Wersja C — najkrótsza, pod samo wideo

Zaczepiły mnie moje psy i powiedziały, że chciałyby poznać kogoś, kto nie jest
mamą ani synem.

Zrobiłam im Tindera.

Projektowanie dla użytkownika, który jest dichromatem o ostrości 20/75, nie
czyta i wskazuje mokrym nosem, okazało się autentycznie trudnym briefem: dwie
barwy na całe znaczenie, wszystko ~4× większe, 120 Hz jako wymóg sprzętowy
i przesunięcie zamiast tapa.

Zbudowałam do tego własne wytyczne, design system na tokenach i działające PWA.
Karmel przeszedł całą talię. Ma preferencje. Nie mówi dlaczego.

(Pierwszy test i tak wyszedł negatywnie: log pokazuje 60 fps, a nie 120. Wolę
to wiedzieć.)

🐕 https://konstancja-tanjga.github.io/Tinder-for-chihuahua/
📖 https://konstancja-tanjga.github.io/portfolio-site/work/tinder-for-chihuahua/

#UX #ProductDesign #Accessibility

---

## Do posta

**Wideo:** `videos/showcase-sesja.mp4` — 33 s, cała sesja Karmela: rozgrzewka,
sześć kart, ekran końca z logiem. Już jest w mockupie telefonu i waży 2,1 MB.

**Uwaga o zasięgach:** LinkedIn tłumi posty z linkami zewnętrznymi. Jeśli
zasięg ma znaczenie, zostaw w treści samo wideo, a **oba linki wrzuć pierwszym
komentarzem** i dopisz w poście „linki w komentarzu".

**Kolejność załączników:** jedno wideo działa lepiej niż wideo plus karuzela —
LinkedIn i tak pokaże tylko jedno medium jako główne.

**Czego bym nie pisała:** że to „przypadkowy weekendowy projekt". Panel z
trzydziestoma czterema prawami i pipeline generujący wytyczne z tokenów
zaprzeczają temu w pierwszym kliknięciu, a lekki ton i tak jest już w treści.

---

**Konstancja Tanjga** · 10 września 2026 · Tinder for Chihuahua
