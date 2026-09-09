# Tinder for Chihuahua — use case

> Aplikacja, której użytkownik jest dichromatem o ostrości wzroku 20/75, a jego
> urządzeniem wejściowym jest mokry nos.

Lokalna PWA na iPhone 13 Pro Max dla dwóch chihuahua: **Karmel** (5 lat) i **Auri**
(12 lat, jego matki). Szukają partnera, który nie jest członkiem rodziny.

| | |
|---|---|
| **Rola** | Lead designer — research, IA, design system, UI |
| **Zakres** | 9 ekranów w dwóch skalach, CIG i tokeny, protokół testu |
| **Rama** | Speculative design — zakładamy, że psy obsłużą ekran |
| **Stack** | PWA · Vite + React + TS · Tailwind · bez backendu |
| **Status** | Design zamknięty poza gestem wejścia w tryb ludzki |
| **Data** | 8 września 2026 |

## Jak czytać ten katalog

Panele w [`wall/`](wall/) są **numerowane i mają być czytane po kolei** — opowiadają
projekt w tej kolejności, w której powstawał: najpierw kto jest użytkownikiem, potem co z
tego wynika dla interfejsu, a na końcu ekrany. Każdy rozdział poniżej mówi trzy rzeczy:
**co to jest**, **dlaczego powstało** i **na co patrzeć**.

Jeśli masz czas na jedną rzecz, otwórz rozdział 04 — journey pokazuje jedyną naprawdę
nietypową cechę tego produktu: cztery z jedenastu kroków dzieją się poza aplikacją.

## Teza

**Jeden ekran, dwóch użytkowników.** Pies przesuwa kartę i wyraża preferencję wobec tego,
co widzi. Człowiek ją czyta i decyduje o realnym spotkaniu. Aplikacja nie kojarzy psów —
zbiera sygnał i przekazuje go swatce. Wyjściem produktu jest ranking preferencji, nie
„match".

---

## Rozdziały

### 00 · Cover
![Cover](00-cover.png)
`00-cover.png` — 1920×1502 · **gotowe**
**Co to jest:** karta projektu w formacie okladek portfolio: plaskie tlo blue, typografia
po lewej, iPhone schodzacy z prawej krawedzi. Na ekranie telefonu jest prawdziwa klatka z
nagrania, nie artboard.
**Dlaczego:** pozostale use case'y maja tam laptopa ze zrzutem. Ten produkt nie istnieje na
desktopie, wiec urzadzenie musialo sie zmienic, a format nie.
**Na co patrzec:** na pierscien acid wokol obudowy. Kazda barwa palety wystepuje takze w
aplikacji, wiec bez niego strefa NIE zlewa sie z tlem i telefon traci krawedz.

### 01 · Problem i brief
`wall/ch01-brief.png` · **do zrobienia**
**Co to jest:** obietnica dana dwóm psom i to, co z niej wynika jako zakres produktu.
**Dlaczego:** bez tego reszta wygląda na żart, a nie na projekt z ograniczeniami.
**Na co patrzeć:** na rozstrzygnięcie, że v1 jest jednostronne i lokalne — to omija problem
cold startu, który zabił konkurencję.

### 02 · Research: psi odbiorca
![Research](wall/ch02-research.png)
`wall/ch02-research.png` · **gotowe**
**Co to jest:** dziesięć ustaleń z literatury, każde sparowane z wymaganiem projektowym.
**Dlaczego:** użytkownika nie da się zapytać, więc wymagania muszą przyjść z badań.
**Na co patrzeć:** 429 i 555 nm (paleta), 20/75 (skala ×4), 70–80 Hz (dlaczego 120 Hz to
wymaganie), oraz to, że psi input z natury przypomina swipe, a nie tap.

### 03 · Persony
![Persony](wall/ch03-personas.png)
`wall/ch03-personas.png` · **gotowe**
**Co to jest:** dwie persony psie opisane profilem sensorycznym i motoryką, plus persona
ludzka opisana rolą.
**Dlaczego:** Karmel i Auri mają tę samą bazę dichromata, ale nie ten sam próg kontrastu.
**Na co patrzeć:** na wniosek „projektujemy dla Auri, testujemy Karmelem".

### 04 · User journey: sesja psa
![Sesja psa](wall/ch04-journey-sesja-psa.png)
`wall/ch04-journey-sesja-psa.png` · **gotowe**
**Co to jest:** jedenaście kroków sesji w swimlane, z oznaczeniem, gdzie każdy się dzieje.
**Dlaczego:** nagroda jest fizyczna, więc pętla nie domyka się na ekranie — a to zmienia
architekturę produktu, nie tylko copy.
**Na co patrzeć:** na dwie kreski w wierszu „Ekran". Druga z nich, w kroku 08, to moment
nagrody — najważniejszy krok pętli dzieje się wtedy, gdy aplikacja nie robi nic.

### 05 · User journey: swatka
![Journey swatki](wall/ch05-journey-swatka.png)
`wall/ch05-journey-swatka.png` · **gotowe**
**Co to jest:** pięć kroków journeya człowieka, od setupu do spotkania w parku.
**Dlaczego:** pokazuje, że wyjściem aplikacji nie jest match, a ranking preferencji.
**Na co patrzeć:** na krok 04 — zatwierdzenie człowieka jest drugą połową double opt-in
przepisanego z Tindera i Bumble, tylko strony się zmieniły.

### 06 · Service blueprint
![Service blueprint](wall/ch06-blueprint.png)
`wall/ch06-blueprint.png` · **gotowe**
**Co to jest:** front-stage kontra back-stage, z linią interakcji, linią widoczności i
warstwą ryzyk.
**Dlaczego:** journey mówi, co się dzieje; blueprint mówi, co musi zadziałać pod spodem,
żeby to się stało.
**Na co patrzeć:** na wiersz ryzyk — mokry nos rejestrujący trzy swipe'y zamiast jednego
jest powodem, dla którego cooldown wynosi 1500 ms, a undo jest funkcją rdzeniową.

### 07 · Benchmark
![Benchmark](wall/ch07-benchmark.png)
`wall/ch07-benchmark.png` · **gotowe**
**Co to jest:** psie apki w dwóch rodzinach plus wnioski z apek randkowych i rekrutacyjnych.
**Dlaczego:** wzorzec talii kart przeszedł w tych kategoriach pełny cykl życia, więc mamy
darmowy dostęp do ich porażek.
**Na co patrzeć:** na martwe „Tindery do pracy" — swipe, który tylko odkłada coś na stos
„może później", nie oszczędza niczego.

### 08 · Kierunki wizualne
![Kierunki wizualne](wall/ch08-kierunki.png)
`wall/ch08-kierunki.png` · **gotowe**
**Co to jest:** trzy kierunki tych samych ekranów, z argumentem za i przeciw przy każdym.
**Dlaczego:** kierunek trzeba wybrać przed budową design systemu, a nie po.
**Na co patrzeć:** na to, że wybrany kierunek też ma wadę i jest ona nazwana.

### 09 · Canine Interface Guidelines
![Canine Interface Guidelines](wall/ch09-cig.png)
`wall/ch09-cig.png` · **gotowe**
**Co to jest:** dwadzieścia dziewięć numerowanych praw interfejsu dla psa w sześciu grupach,
plus warstwa platformowa PWA na iOS i checklista zgodności. Generowane z
`design/tokens.json`, więc ani jedna liczba nie jest wpisana ręcznie.
**Dokument jest po angielsku** — `design/cig.html` — bo to specyfikacja
przeznaczona do dokumentacji; wersja robocza po polsku leży w
`design/cig.pl.html`. Oba pliki wychodzą z jednego generatora, więc
nie mogą się rozjechać.
**Dlaczego:** Human Interface Guidelines opisują człowieka — palec, 44 pt celu, czerwień jako
ostrzeżenie, tekst jako treść. Każde z tych założeń pęka na dichromacie o ostrości 20/75,
którego urządzeniem wejściowym jest nos. W trybie psim HIG nie są niewystarczające, są
szkodliwe, więc własne wytyczne to konieczność, nie ambicja.
**Na co patrzeć:** na tabelę podziału odpowiedzialności — CIG rządzi trybem psim, HIG
ludzkim, a dla H1–H4 nie przepisujemy HIG, tylko notujemy trzy odstępstwa. I na warstwę
platformową: bez `touch-action: none` swipe nigdy nie dotrze do aplikacji.

### 10 · Ekrany trybu psiego
![Tryb psi](wall/ch10-dog-mode.png)
`wall/ch10-dog-mode.png` · **gotowe**
**Co to jest:** D1–D5 w skali ×4, bez chrome.
**Dlaczego:** to jedyna część, którą widzi pies.
**Na co patrzeć:** na strzałkę pod ikoną zamiast celu do stuknięcia, i na D5, w którym nie
ma ani jednego piksela acid.

### 11 · Ekrany trybu ludzkiego
![Tryb ludzki](wall/ch11-human-mode.png)
`wall/ch11-human-mode.png` · **gotowe**
**Co to jest:** H1–H4 w normalnej gęstości.
**Dlaczego:** dopiero zestawienie obu trybów pokazuje, czy system dwóch skal się trzyma.
**Na co patrzeć:** na H1 — ranking i wykres czasu decyzji. Rosnący czas to spadające
zainteresowanie.

### 12 · Plan testów z psami
![Protokół testu](wall/ch12-test.png)
`wall/ch12-test.png` · **gotowe**
**Co to jest:** co mierzymy, ile sesji, kiedy uznajemy, że działa.
**Dlaczego:** bez tego „projektujemy dla Auri" jest hasłem, nie metodą.
**Na co patrzeć:** na metryki — czy dotyka, jak dotyka, po ilu kartach się nudzi, czy wraca
następnego dnia.

---

## Materiały źródłowe

Ścieżki, nie linki — GitHub pokazuje pliki `.html` jako surowy kod, więc linkowanie ich
wprowadzałoby w błąd. Do przeglądania służą panele PNG powyżej.

- `design/foundation.html` — fundament projektowy: research,
  benchmark, persony, journey, deliverables
- `design/journey.html` — oba journeye jako swimlane
- `design/blueprint.html` — service blueprint
- `design/cig.html` — Canine Interface Guidelines (EN), generowane z tokenów
- `design/cig.pl.html` — CIG po polsku, z tego samego generatora
- `design/tokens.json` — jedyne źródło prawdy dla liczb i barw
- `design/canvas/` — pliki źródłowe ekranów (`.dc.html`) i canvas
- `design/exports/` — źródła paneli PNG
- `CLAUDE.md` — zasady projektu i design system w formie tekstowej

---

**Konstancja Tanjga** · 8 września 2026 · Tinder for Chihuahua
