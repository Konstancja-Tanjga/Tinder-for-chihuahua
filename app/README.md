# Spike D2 → D3 → D5

Pionowy przekrój przez rdzeń aplikacji. **Nie jest to wersja 0.1 produktu** — to
narzędzie pomiarowe, które ma odpowiedzieć na pytania, na które design nie
odpowiada, bo odpowiada na nie tylko szkło i pies.

## Co ten spike ma rozstrzygnąć

1. **Czy pies w ogóle przesunie nosem** — a nie tylko dotknie i odejdzie.
2. **Czy jedno długie pociągnięcie nie zarejestruje się trzy razy** (CIG-3.4, cooldown 1500 ms).
3. **Czy dźwięk się odblokuje** — iOS nie odtworzy niczego bez gestu użytkownika, więc
   pierwsze dotknięcie na D2 musi odblokować `AudioContext` (CIG-7.4).
4. **Czy `touch-action` i `touch-callout` tłumią zaznaczanie, lupę i przewijanie** (CIG-7.1).
   Na laptopie zawsze wygląda dobrze — to trzeba zobaczyć na urządzeniu.
5. **Jaka jest realna plama kontaktu** nosa Karmela i nosa Auri. W tokenach są
   placeholdery; ta liczba ma je zastąpić.

## Czego tu celowo nie ma

Trybu ludzkiego H1–H4, profili, filtru rodziny, prawdziwych wideo, prawdziwych
dźwięków, service workera. Talia to sześć imion, sylwetka to ten sam placeholder
co w artboardach, a trzy dźwięki są **syntezowane w WebAudio** — po to, żeby
ścieżka dźwiękowa była testowalna już teraz, zanim pojawią się pliki.

## Uruchomienie

```bash
npm install
npm run dev      # generuje tokeny, potem vite --host
```

`npm run dev` najpierw uruchamia `build-app-tokens.mjs`, który generuje
`src/tokens.generated.{ts,css}` z `design/tokens.json`. **Nie edytuj tych plików** —
zmiana wartości to edycja tokenów i ponowny build. Generator odmawia zapisu, jeśli
którakolwiek wartość się nie rozwiązała.

To pierwszy konsument, który naprawdę czyta tokeny. Artboardy w `design/canvas/`
mają paletę na sztywno i to jest znany dług.

## Na telefon — bez kabla

Kabel nie jest potrzebny. Wspólne Wi-Fi wystarcza:

1. `npm run dev` na laptopie
2. Vite wypisze adres w sieci lokalnej, np. `http://192.168.1.124:5173`
3. W Safari na iPhonie ten adres, potem **Udostępnij → Dodaj do ekranu głównego**

Kabel przydaje się tylko do **Safari Web Inspector**: na iPhonie Ustawienia →
Safari → Zaawansowane → Web Inspector, na Macu menu Deweloper w Safari. Po
pierwszym sparowaniu działa też bezprzewodowo.

**Pułapka:** service worker nie zarejestruje się po `http://192.168.x.x`, bo wymaga
bezpiecznego kontekstu. Dodanie do ekranu głównego i tryb pełnoekranowy zadziałają,
offline nie. Spike i tak nie ma service workera, więc na razie to nie przeszkadza.

## Drabina testów

| Szczebel | Gdzie | Co sprawdzamy |
|---|---|---|
| 1 | laptop, przeglądarka | logika decyzji, cooldown, cofnięcie |
| 2 | iPhone w Safari po Wi-Fi | tłumienie zaznaczania i lupy, odblokowanie dźwięku, 120 Hz |
| 3 | iPhone jako PWA + Dostęp nadzorowany | brak paska Safari, brak wyjścia, safe area |
| 4 | iPhone płasko na podłodze, Karmel i Auri | czy projekt ma sens |

## Log sesji

Instrumentacja jest sensem tego spike'u — bez niej test z psem nie powie nic
mierzalnego. Zapisujemy też zdarzenia **odrzucone**, bo one pokażą, jak często nos
myli się i czy cooldown jest potrzebny.

Na ekranie końcowym (D5) **przytrzymaj dwa palce oddalone od siebie o ponad 120 px**
przez sekundę. Log jest zaznaczalny, więc da się go skopiować.

Dlaczego tak, a nie przyciskiem: D5 nie może mieć celu trafialnego nosem (CIG-6.2),
a wejście w tryb ludzki musi być niewykonalne nosem (CIG-6.1). Przy pisaniu wyszło,
że **sam warunek „dwa palce" nie wystarcza** — iOS potrafi zaraportować mokry nos
jako kilka punktów dotyku. Dlatego wymagane jest realne rozstawienie.

## Zrzuty ekranu: `dev-frame.html`

Chrome headless ma minimalną szerokość okna około 500 px i **ignoruje**
`--window-size=428`. Zrzuty aplikacji były przez to ucięte: strona renderowała się
w 500 css, a obraz miał 428 — co wygląda dokładnie jak zepsuty layout i kosztowało
mnie kilka cykli zgadywania. `dev-frame.html` wkłada aplikację w iframe 428×926,
więc zrzut odpowiada telefonowi. Artboardy tego nie potrzebują, bo mają sztywną
szerokość.

---

**Konstancja Tanjga** · 8 września 2026 · Tinder for Chihuahua
