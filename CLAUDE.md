# Tinder for Chihuahua

Lokalna PWA na iPhone 13 Pro Max dla dwóch chihuahua: **Karmela** (5 lat, samiec) i **Auri**
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

Kierunek **plakatowy**. Dwie skale w jednym systemie.

| Token | Wartość | Rola |
|---|---|---|
| `--ink` | `#000000` | podłoże |
| `--blue` | `#0033FF` | sygnał, 429 nm |
| `--acid` | `#D6F000` | sygnał, 555 nm |
| `--white` | `#FFFFFF` | figura |

Typografia: **Anton** (display) + **Barlow** (600/800). `radius: 0` wszędzie.
Dog scale: display 112 / name 80 / value 44, cel min. 214×300 px, kant 6 px.
Human scale: stat 26 / label 13 / meta 11, cel min. 44×44 px, kant 2–3 px.

## Zasady nienaruszalne

1. Projektujemy dla Auri, testujemy Karmelem — ona ustala progi kontrastu i rozmiaru.
2. Nic czerwonego ani zielonego jako nośnik znaczenia. Tylko blue ↔ acid.
3. Tekst jest dla człowieka. Psu znaczenie niesie kształt, ruch albo dźwięk.
4. Wejście to plama, nie punkt. Liczy się każdy drag (próg 40 px). Zero tapów, zero long-pressów.
5. Każde „tak" natychmiast coś robi. Żadnego stosu „może później".
6. Talia się kończy. Sesja ma koniec, aplikacja nie ma feedu.
7. Nagroda jest fizyczna. Ekran ją zapowiada, człowiek ją daje.
8. Pies nie wchodzi w tryb ludzki — gest musi być niewykonalny nosem.

Cooldown wejścia po decyzji: **1500 ms**. Undo jest funkcją rdzeniową, nie premium.

## Ekrany

Tryb psi: `D1` wybór psa · `D2` rozgrzewka/kalibracja · `D3` karta kandydata · `D4`
zapowiedź nagrody · `D5` koniec sesji.
Tryb ludzki: `H1` wynik sesji · `H2` kandydaci · `H3` profile i rodzina · `H4` setup sesji.

## Przed otwarciem PR — obowiązkowo

**Zawsze uruchom `/review-pr` przed przygotowaniem lub otwarciem pull requesta.** Bez
wyjątków, także przy jednoplikowych zmianach. Komenda i jej agenci leżą w `.claude/`.

Kolejność: `/review-pr` → napraw, co znaleziono → dopiero potem `gh pr create`.
Do prototypów opartych na design systemie dodatkowo `/handoff-readiness`.

## Dokumentacja i assety

Każdy istotny deliverable powstaje **równolegle jako panel PNG**, żeby złożył się w jeden
opis use case — w tym repo, nie na stronie portfolio.

- Źródła paneli: `design/exports/*.html`, albo dokument z `design/` renderowany bezpośrednio,
  jeśli jest theme-aware — headless Chrome domyślnie renderuje jasny motyw
- Render: headless Chrome `--force-device-scale-factor=2` → `sips -Z 1800`
- Panele: `docs/case-study/wall/chNN-<slug>.png`, szerokość **1800 px**, wysokość dociągnięta
  do treści (bez pustego marginesu). Cover: `docs/case-study/00-cover.png`, 1920×1502
- Walkthrough: `docs/case-study/README.md`

**Stopka każdego dokumentu i panelu:** `Konstancja Tanjga · <data> · Tinder for Chihuahua`.
