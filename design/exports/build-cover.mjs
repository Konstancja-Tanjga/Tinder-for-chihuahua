// Sklada okladke use case: docs/case-study/00-cover.png, 1920x1502.
//
// Format jest przepisany z okladek portfolio autorki (np. applus-analytics):
// plaskie tlo w barwie projektu, typografia w kolumnie po lewej, urzadzenie
// schodzace z prawej krawedzi. Roznica jest jedna -- tam stoi laptop ze
// zrzutem, tu iPhone, bo ten produkt nie istnieje na desktopie.
//
// Tlo jest blue #0033FF, nie acid. Acid lezy blisko zoltego, a w galerii
// portfolio jest juz kilka zoltych okladek -- karta musi byc rozpoznawalna
// w rzedzie miniatur, a nie tylko ladna z osobna.
//
// Ekran telefonu to prawdziwa klatka z nagrania ekranu, nie artboard.
// Artboard pokazywalby projekt, klatka pokazuje dzialajaca aplikacje.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const at = (p) => join(ROOT, p);

const TOKENS = JSON.parse(readFileSync(at('design/tokens.json'), 'utf8'));
const BLUE = TOKENS.color.signal.blue.hex;
const ACID = TOKENS.color.signal.acid.hex;
const WHITE = TOKENS.color.signal.white.hex;
const INK = TOKENS.color.signal.ink.hex;

for (const [name, v] of Object.entries({ BLUE, ACID, WHITE, INK })) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(v ?? '')) {
    throw new Error(`okladka: ${name} nie jest kolorem (${v}) -- tokens.json sie zmienil`);
  }
}

const SCREEN = at('design/exports/cover-screen.jpg');
if (!existsSync(SCREEN)) throw new Error(`brak klatki na ekran telefonu: ${SCREEN}`);
const screenUri = `data:image/jpeg;base64,${readFileSync(SCREEN).toString('base64')}`;

/* Proporcja apertury jest wzieta z nagrania, nie z katalogu Apple.
   Nagranie ma 1320x2322, czyli 0.569, a ekran 13 Pro Max ma 0.462.
   Dociecie do proporcji katalogowej zabiera 19% szerokosci, czyli obie
   strefy decyzji -- a to jest dokladnie to, co ten ekran ma pokazywac.
   Wiec ramka idzie za trescia. */
const SCREEN_W = 1320;
const SCREEN_H = 2322;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500&display=swap">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1920px;height:1502px;background:${BLUE};overflow:hidden;position:relative;
       font-family:'Rubik','Helvetica Neue',Arial,sans-serif;color:${WHITE}}

  .col{position:absolute;left:112px;top:0;bottom:0;width:1010px;
       display:flex;flex-direction:column;justify-content:center;gap:0}

  .kicker{font-weight:500;font-size:27px;letter-spacing:0.13em;text-transform:uppercase;
          color:${ACID};margin-bottom:52px}
  h1{font-weight:300;font-size:150px;line-height:0.98;letter-spacing:-0.035em}
  .subline{font-weight:300;font-size:62px;line-height:1.12;letter-spacing:-0.02em;
           margin-top:26px;max-width:14ch}
  .stamp{font-weight:500;font-size:25px;letter-spacing:0.11em;text-transform:uppercase;
         line-height:1.5;margin-top:66px;color:${ACID};white-space:nowrap}
  .credit{position:absolute;left:112px;bottom:96px;font-weight:300;font-size:31px;
          letter-spacing:-0.005em}

  /* Telefon schodzi z prawej krawedzi, tak jak laptop na pozostalych
     okladkach. Obrot jest lekki -- na 4 stopniach notch zostaje czytelny,
     na wiekszym kacie ramka zaczyna udawac render 3D, ktorym nie jest. */
  /* Kazda barwa palety wystepuje takze w aplikacji, wiec ekran styka sie z
     tlem w tym samym kolorze -- na pierwszej wersji strefa NIE zlewala sie z
     podlozem i telefon tracil krawedz. Pierscien acid odcina urzadzenie od
     dowolnego tla, bez wprowadzania koloru z poza palety. */
  .phone{position:absolute;right:-8px;top:50%;transform:translateY(-50%) rotate(3.5deg);
         width:512px;padding:13px;background:${INK};border-radius:60px;
         box-shadow:0 0 0 3px ${ACID}, 0 54px 110px rgba(0,0,0,0.42)}
  .aperture{position:relative;width:100%;aspect-ratio:${SCREEN_W} / ${SCREEN_H};
            border-radius:48px;overflow:hidden;background:${INK}}
  .aperture img{display:block;width:100%;height:100%;object-fit:cover}
  /* iPhone 13 Pro Max ma notch, nie Dynamic Island -- ta wyspa pojawia sie
     dopiero w 14 Pro. Zla forma na okladce projektu, ktory nazywa model
     w briefie, byla by drobnym klamstwem w widocznym miejscu. */
  .notch{position:absolute;top:0;left:50%;transform:translateX(-50%);
         width:150px;height:27px;background:${INK};border-radius:0 0 17px 17px}
  .btn{position:absolute;background:#2A2E36;border-radius:3px}
  .btn.pwr{right:-5px;top:27%;width:5px;height:86px}
  .btn.up{left:-5px;top:21%;width:5px;height:54px}
  .btn.dn{left:-5px;top:31%;width:5px;height:54px}
  .btn.mute{left:-5px;top:15%;width:5px;height:28px}
</style></head><body>

<div class="col">
  <p class="kicker">Personal project &middot; Speculative design</p>
  <h1>Tinder for<br>Chihuahua</h1>
  <p class="subline">for Karmel and Auri</p>
  <p class="stamp">Research &middot; Guidelines &middot; Tokens<br>PWA &middot; Testing</p>
</div>

<div class="phone">
  <div class="btn mute"></div><div class="btn up"></div><div class="btn dn"></div>
  <div class="btn pwr"></div>
  <div class="aperture">
    <img src="${screenUri}" alt="D3, karta kandydata, w dzialajacej aplikacji">
    <div class="notch"></div>
  </div>
</div>

<p class="credit">Konstancja Tanjga &middot; 9 September 2026</p>

</body></html>`;

const out = at('design/exports/cover.html');
writeFileSync(out, html);
console.log(`cover.html (1920x1502, tlo ${BLUE}, apertura ${SCREEN_W}x${SCREEN_H})`);
