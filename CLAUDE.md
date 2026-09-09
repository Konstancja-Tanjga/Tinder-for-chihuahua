# Tinder for Chihuahua

Lokalna PWA na iPhone 13 Pro Max dla dwóch chihuahua: **Karmel** (5 lat, samiec) i **Auri**
(12 lat, suczka, matka Karmela). Szukają partnera, który nie jest członkiem rodziny.

Rama projektowa: **speculative design**. Zakładamy, że psy obsłużą ekran dotykowy i że to
działa. Nie prowadzimy rozważań o barierach ani wykonalności — research służy temu, żeby
zaprojektować to dobrze, nie temu, żeby oceniać, czy się da.

Pełny fundament (research, benchmark, persony, user journey, deliverables):
`design/foundation.html`. Kierunki i ekrany: `design/canvas/`.

## Teza: jeden ekran, dwóch użytkowników

Pies przesuwa kartę i wyraża preferencję wobec tego, co widzi. Człowiek ją czyta i decyduje
o realnym spotkaniu. **Aplikacja nie kojarzy psów — zbiera sygnał i przekazuje go swatce.**
Wyjściem produktu jest ranking preferencji, nie „match".

## Stack

- PWA dodawana do ekranu głównego (bez App Store, bez wygasania podpisu)
- Vite + React + TypeScript, Tailwind, Framer Motion
- Bez backendu: dane w JSON, stan w `localStorage`
- Model: `Dog { id, name, age, sex, videoUrl, bio, ownerId, familyIds[] }`

## Design system

**`design/tokens.json` jest jedynym źródłem prawdy dla liczb i barw.** Tabele poniżej to
**ręcznie utrzymywane lustro** tego pliku, dla czytelności — przy rozbieżności wygrywa
`tokens.json`. Dokument CIG, panel
do use case, konfiguracja Tailwinda i Storybook czytają stąd. Nie wpisujemy wartości na
sztywno — audyt wykazał, że cooldown żył w siedmiu plikach, a paleta w dziesięciu
artboardach. Zmiana wartości to jedna edycja plus `node design/exports/build-cig.mjs`.

Wytyczne interfejsu: **CIG, Canine Interface Guidelines** — `design/cig.html`, 29 praw w
sześciu grupach plus warstwa platformowa i checklista zgodności. Generowane z tokenów.
Podział odpowiedzialności: **CIG rządzi trybem psim D1–D5, HIG trybem ludzkim H1–H4.**
Dla H1–H4 nie przepisujemy HIG — odsyłamy i notujemy tylko odstępstwa. Ich liczbę
wylicza generator z tablicy `SPLIT`; nie wpisujemy jej w prozę, bo raz się rozjechała.


Kierunek **plakatowy**. Dwie skale w jednym systemie.

| Token | Wartość | Rola |
|---|---|---|
| `--ink` | `#000000` | podłoże |
| `--blue` | `#0033FF` | sygnał, 429 nm |
| `--acid` | `#D6F000` | sygnał, 555 nm |
| `--white` | `#FFFFFF` | figura |

Cztery wartości powyżej to **jedyne nośniki znaczenia**. Obok nich system ma rampę
neutralną, która obsługuje wyłącznie tekst i kontury trybu ludzkiego i **nigdy nie niesie
sygnału**:

| Token | Wartość | Rola |
|---|---|---|
| `--grey-100` | `#C9CCD4` | tekst drugorzędny na czerni |
| `--grey-300` | `#8A8F9A` | etykiety sekcji |
| `--grey-500` | `#5A5F6A` | tekst wyciszony, stany nieaktywne |
| `--grey-700` | `#3E434C` | kontur wyciszony |
| `--grey-800` | `#2A2E36` | kontur, obramowanie |
| `--grey-850` | `#22262E` | linie siatki i separatory |
| `--grey-900` | `#0A0C10` | tło wstawki z kodem |

Skala ludzka ma dodatkowy stopień `micro 10,5` na etykiety w arkuszu tokenów.

Typografia: **Anton** (display) + **Barlow** (600/800). `radius: 0` wszędzie.
Dog scale: display 112 / name 80 / value 44, cel min. 214×300 px, kant 6 px.
Human scale: stat 26 / label 13 / meta 11, cel min. 44×44 px, kant 2–3 px.

## Zasady nienaruszalne

1. Projektujemy dla Auri, testujemy Karmelem — ona ustala progi kontrastu i rozmiaru.
2. Nic czerwonego ani zielonego jako nośnik znaczenia. Tylko blue ↔ acid.
3. Tekst jest dla człowieka. Psu znaczenie niesie kształt, ruch albo dźwięk.
4. Wejście to plama, nie punkt. Liczy się każdy drag (próg 40 px). Zero tapów, zero long-pressów.
   **Jedyny wyjątek: D2 rozgrzewka**, gdzie liczy się każde dotknięcie — bo to ono kalibruje
   wielkość plamy kontaktu dla danego psa i buduje skojarzenie nos → skutek.
5. Każde „tak" natychmiast coś robi. Żadnego stosu „może później".
6. Talia się kończy. **6–12 kart**, dobierane do psa; dolna granica to 6, bo rosnący czas
   decyzji jest sygnałem do skrócenia talii. Sesja ma koniec, aplikacja nie ma feedu.
7. Nagroda jest fizyczna. Ekran ją zapowiada, człowiek ją daje.
8. Pies nie wchodzi w tryb ludzki — gest musi być niewykonalny nosem.

Cooldown wejścia po decyzji: **1500 ms**. Undo jest funkcją rdzeniową, nie premium.

## Ekrany

Tryb psi: `D1` wybór psa · `D2` rozgrzewka/kalibracja · `D3` karta kandydata · `D4`
zapowiedź nagrody · `D5` koniec sesji.
Tryb ludzki: `H1` wynik sesji · `H2` kandydaci · `H3` profile i rodzina · `H4` setup sesji.

## Przed otwarciem PR — obowiązkowo

**Zawsze uruchom `/review-pr` przed przygotowaniem lub otwarciem pull requesta.** Bez
wyjątków, także przy zmianach jednoplikowych. Komenda i jej agenci leżą w `.claude/`.

Kolejność: `/review-pr` → napraw krytyczne i ważne → poświadcz sentinelem → PR.
Do prototypów opartych na design systemie dodatkowo `/handoff-readiness`.

Wymuszenie jest **na poziomie użytkownika**, nie projektu: `~/.claude/hooks/require-pr-review.sh`
blokuje utworzenie PR-a do momentu, w którym powstanie plik sentinela kluczowany po sesji,
repo i branchu. Projekt **celowo nie dubluje** tej bramki własnym hookiem — audyt wykazał, że
duplikat był bezstanowy, więc obiecywał ścieżkę „zrób review i ponów", której nigdy nie mógł
spełnić, a przy braku `jq` cicho przepuszczał wszystko.

## Dokumentacja i assety

Każdy istotny deliverable powstaje **równolegle jako panel PNG**, żeby złożył się w jeden
opis use case — w tym repo, nie na stronie portfolio.

- Źródła paneli: `design/exports/*.html`, albo dokument z `design/` renderowany bezpośrednio,
  jeśli jest theme-aware — headless Chrome domyślnie renderuje jasny motyw
- Z `tokens.json` czytają: `build-cig.mjs` i `build-screen-panels.mjs`. **Nie czyta**
  `build-case-study-preview.mjs` (nie ma tam wartości produktu) ani artboardy w
  `design/canvas/` — tam paleta jest wpisana na sztywno i to jest znany, nienaprawiony dług
- Render: `node design/exports/render-panels.mjs [slug ...]` — headless Chrome
  `--force-device-scale-factor=2` → `sips -Z 1800`. Wysokość jest mierzona z **body**, nie
  z `documentElement`, bo `scrollHeight` korzenia nie schodzi poniżej viewportu i każdy panel
  niższy od okna dostawał pusty margines. Skrypt przerywa build, jeśli w treści panelu jest
  polska diakrytyka — panele idą do dokumentacji po angielsku
- Panele: `docs/case-study/wall/chNN-<slug>.png`, szerokość **1800 px**, wysokość dociągnięta
  do treści (bez pustego marginesu). Cover: `docs/case-study/00-cover.png`, 1920×1502
- Walkthrough: `docs/case-study/README.md`

**Stopka każdego dokumentu i panelu PNG:** `Konstancja Tanjga · <data> · Tinder for Chihuahua`.
Artboardy `*.dc.html` są z tej reguły wyłączone — to fragmenty canvasu, nie samodzielne
dokumenty, a stopka zabierałaby przestrzeń celu dotykowego.
