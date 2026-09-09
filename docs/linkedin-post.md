# Post na LinkedIn — wersje do wyboru

Nie do repo dla potomności, tylko roboczy plik do skopiowania. Trzy wersje,
bo długość na LinkedInie jest decyzją, a nie szczegółem: **pierwsze ~200 znaków**
widać przed „zobacz więcej", więc one muszą zarobić na kliknięcie.

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
