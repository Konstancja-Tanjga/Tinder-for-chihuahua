# Tinder for Chihuahua — use case

> Aplikacja, której użytkownik jest dichromatem o ostrości wzroku 20/75, a jego
> urządzeniem wejściowym jest mokry nos.

Lokalna PWA na iPhone 13 Pro Max dla dwóch chihuahua: **Karmel** (5 lat) i **Auri**
(12 lat, jego matki). Szukają partnera, który nie jest członkiem rodziny.

| | |
|---|---|
| **Rola** | Lead designer — research, IA, design system, UI |
| **Zakres** | 9 ekranów w dwóch skalach, design system, protokół testu |
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
`00-cover.png` — 1920×1502 · **do zrobienia**

### 01 · Problem i brief
`wall/ch01-brief.png` · **do zrobienia**
**Co to jest:** obietnica dana dwóm psom i to, co z niej wynika jako zakres produktu.
**Dlaczego:** bez tego reszta wygląda na żart, a nie na projekt z ograniczeniami.
**Na co patrzeć:** na rozstrzygnięcie, że v1 jest jednostronne i lokalne — to omija problem
cold startu, który zabił konkurencję.

### 02 · Research: psi odbiorca
`wall/ch02-research.png` · **do zrobienia**
**Co to jest:** dziesięć ustaleń z literatury, każde sparowane z wymaganiem projektowym.
**Dlaczego:** użytkownika nie da się zapytać, więc wymagania muszą przyjść z badań.
**Na co patrzeć:** 429 i 555 nm (paleta), 20/75 (skala ×4), 70–80 Hz (dlaczego 120 Hz to
wymaganie), oraz to, że psi input z natury przypomina swipe, a nie tap.

### 03 · Persony
`wall/ch03-persony.png` · **do zrobienia**
**Co to jest:** dwie persony psie opisane profilem sensorycznym i motoryką, plus persona
ludzka opisana rolą.
**Dlaczego:** Karmel i Auri mają tę samą bazę dichromata, ale nie ten sam próg kontrastu.
**Na co patrzeć:** na wniosek „projektujemy dla Auri, testujemy Karmelem".

### 04 · User journey: sesja psa
[`wall/ch04-journey-sesja-psa.png`](wall/ch04-journey-sesja-psa.png) · **gotowe**
**Co to jest:** jedenaście kroków sesji w swimlane, z oznaczeniem, gdzie każdy się dzieje.
**Dlaczego:** nagroda jest fizyczna, więc pętla nie domyka się na ekranie — a to zmienia
architekturę produktu, nie tylko copy.
**Na co patrzeć:** na dwie kreski w wierszu „Ekran". Druga z nich, w kroku 08, to moment
nagrody — najważniejszy krok pętli dzieje się wtedy, gdy aplikacja nie robi nic.

### 05 · User journey: swatka
[`wall/ch05-journey-swatka.png`](wall/ch05-journey-swatka.png) · **gotowe**
**Co to jest:** pięć kroków journeya człowieka, od setupu do spotkania w parku.
**Dlaczego:** pokazuje, że wyjściem aplikacji nie jest match, a ranking preferencji.
**Na co patrzeć:** na krok 04 — zatwierdzenie człowieka jest drugą połową double opt-in
przepisanego z Tindera i Bumble, tylko strony się zmieniły.

### 06 · Service blueprint
[`wall/ch06-blueprint.png`](wall/ch06-blueprint.png) · **gotowe**
**Co to jest:** front-stage kontra back-stage, z linią interakcji, linią widoczności i
warstwą ryzyk.
**Dlaczego:** journey mówi, co się dzieje; blueprint mówi, co musi zadziałać pod spodem,
żeby to się stało.
**Na co patrzeć:** na wiersz ryzyk — mokry nos rejestrujący trzy swipe'y zamiast jednego
jest powodem, dla którego cooldown wynosi 1500 ms, a undo jest funkcją rdzeniową.

### 07 · Benchmark
`wall/ch07-benchmark.png` · **do zrobienia**
**Co to jest:** psie apki w dwóch rodzinach plus wnioski z apek randkowych i rekrutacyjnych.
**Dlaczego:** wzorzec talii kart przeszedł w tych kategoriach pełny cykl życia, więc mamy
darmowy dostęp do ich porażek.
**Na co patrzeć:** na martwe „Tindery do pracy" — swipe, który tylko odkłada coś na stos
„może później", nie oszczędza niczego.

### 08 · Kierunki wizualne
`wall/ch08-kierunki.png` · **do zrobienia**
**Co to jest:** trzy kierunki tych samych ekranów, z argumentem za i przeciw przy każdym.
**Dlaczego:** kierunek trzeba wybrać przed budową design systemu, a nie po.
**Na co patrzeć:** na to, że wybrany kierunek też ma wadę i jest ona nazwana.

### 09 · Design system i tokeny
`wall/ch09-design-system.png` · **do zrobienia**
**Co to jest:** paleta, typografia i dwie skale — dog scale i human scale.
**Dlaczego:** to najważniejsza decyzja architektury systemu i nie ma jej w żadnym gotowym
design systemie.
**Na co patrzeć:** na `#0033FF` i `#D6F000` — obie barwy leżą blisko szczytów czułości
psich czopków.

### 10 · Ekrany trybu psiego
`wall/ch10-tryb-psi.png` · **do zrobienia**
**Co to jest:** D1–D5 w skali ×4, bez chrome.
**Dlaczego:** to jedyna część, którą widzi pies.
**Na co patrzeć:** na strzałkę pod ikoną zamiast celu do stuknięcia, i na D5, w którym nie
ma ani jednego piksela acid.

### 11 · Ekrany trybu ludzkiego
`wall/ch11-tryb-ludzki.png` · **do zrobienia**
**Co to jest:** H1–H4 w normalnej gęstości.
**Dlaczego:** dopiero zestawienie obu trybów pokazuje, czy system dwóch skal się trzyma.
**Na co patrzeć:** na H1 — ranking i wykres czasu decyzji. Rosnący czas to spadające
zainteresowanie.

### 12 · Plan testów z psami
`wall/ch12-testy.png` · **do zrobienia**
**Co to jest:** co mierzymy, ile sesji, kiedy uznajemy, że działa.
**Dlaczego:** bez tego „projektujemy dla Auri" jest hasłem, nie metodą.
**Na co patrzeć:** na metryki — czy dotyka, jak dotyka, po ilu kartach się nudzi, czy wraca
następnego dnia.

---

## Materiały źródłowe

- [`design/foundation.html`](../../design/foundation.html) — fundament projektowy: research,
  benchmark, persony, journey, deliverables
- [`design/journey.html`](../../design/journey.html) — oba journeye jako swimlane
- [`design/blueprint.html`](../../design/blueprint.html) — service blueprint
- [`design/canvas/`](../../design/canvas/) — pliki źródłowe ekranów (`.dc.html`) i canvas
- [`design/exports/`](../../design/exports/) — źródła paneli PNG
- [`CLAUDE.md`](../../CLAUDE.md) — zasady projektu i design system w formie tekstowej

---

**Konstancja Tanjga** · 8 września 2026 · Tinder for Chihuahua
