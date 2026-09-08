# Artboardy canvasu

Pliki `*.dc.html` to **Design Components** — artboardy jednego canvasu opisanego w
`canvas.json`. Nie są samodzielnymi stronami i **nie otworzą się poprawnie z dysku.**

Każdy z nich ma w nagłówku linię:

```html
<script src="./support.js"></script>
```

`support.js` **celowo nie istnieje w repo.** Runtime canvasu podmienia tę linię na wbudowany
skrypt w momencie renderowania, więc plik nigdy nie jest pobierany z dysku. Linia musi zostać
dokładnie w tej postaci — bez niej artboard się nie zamontuje. Otwarcie `*.dc.html` wprost w
przeglądarce da 404 na tym skrypcie i to jest oczekiwane.

## Jak to zobaczyć

Artboardy renderują się dopiero po złożeniu w jeden plik canvasu. Plik wynikowy
(`tinder-for-chihuahua.html`) jest w `.gitignore`, bo waży 2,5 MB wbudowanego edytora i
odtwarza się z tych źródeł plus `canvas.json`.

## Co gdzie leży

| Prefiks | Znaczenie |
|---|---|
| `Plakat*`, `Main` | wybrany kierunek plakatowy, strona `page-1` |
| `Miekki*` | odrzucony kierunek A, archiwum na `page-2` |
| `Geo*` | odrzucony kierunek B, archiwum na `page-2` |

`Main.dc.html` to ekran D3, czyli karta kandydata — rdzeń aplikacji. Nazwa jest wymogiem
formatu: canvas używa `Main` jako artboardu wejściowego.

Archiwalne kierunki A i B mają **własne palety** i celowo nie stosują się do tokenów z
`CLAUDE.md` — są zapisem odrzuconej decyzji, nie materiałem do implementacji.

---

**Konstancja Tanjga** · 8 września 2026 · Tinder for Chihuahua
