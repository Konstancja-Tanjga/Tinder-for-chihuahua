// CIG-4.2: dzwiek jest u psa nosnikiem pierwszorzednym, nie ozdoba.
// CIG-7.4: iOS nie odtworzy dzwieku bez gestu uzytkownika, a pierwsze dotkniecie
// psa na D2 jest jedynym gestem przed petla decyzji -- wiec to ono musi
// odblokowac AudioContext.
//
// UWAGA: to sa PLACEHOLDERY syntezowane w WebAudio. Prawdziwe pliki (szczek CC0,
// pisk z wlasnego nagrania) wejda w ich miejsce; syntetyk istnieje po to, zeby
// sciezka dzwiekowa byla testowalna na urzadzeniu JUZ TERAZ.
import { TOKENS } from './tokens.generated';

type Cue = 'bark' | 'squeak' | 'knock';

let ctx: AudioContext | null = null;
let unlocked = false;

export function isUnlocked() { return unlocked; }

/** Wolac WYLACZNIE z wnetrza handlera dotyku, inaczej iOS odmowi. */
export function unlock(): boolean {
  if (unlocked) return true;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    // Cichy bufor to najpewniejszy sposob odblokowania na iOS.
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, 22050);
    src.connect(ctx.destination);
    src.start(0);
    void ctx.resume();
    unlocked = ctx.state === 'running';
    return unlocked;
  } catch {
    unlocked = false;
    return false;
  }
}

function env(gain: GainNode, seconds: number, level: number, t0: number) {
  const peak = level / 100;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(peak, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
}

export function play(cue: Cue) {
  if (!ctx || !unlocked) return false;
  const { seconds, level } = TOKENS.sound[cue];
  const t0 = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  env(gain, seconds, level, t0);

  if (cue === 'bark') {
    // szum + niski ton: szorstkie, krotkie, slyszalne z podlogi
    const noise = ctx.createBufferSource();
    const n = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    noise.buffer = n;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 1.2;
    noise.connect(bp).connect(gain);
    const tone = ctx.createOscillator();
    tone.type = 'sawtooth';
    tone.frequency.setValueAtTime(320, t0);
    tone.frequency.exponentialRampToValueAtTime(140, t0 + seconds);
    tone.connect(gain);
    noise.start(t0); tone.start(t0); tone.stop(t0 + seconds);
  } else if (cue === 'squeak') {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(1400, t0);
    o.frequency.exponentialRampToValueAtTime(2600, t0 + seconds * 0.6);
    o.frequency.exponentialRampToValueAtTime(1100, t0 + seconds);
    o.connect(gain); o.start(t0); o.stop(t0 + seconds);
  } else {
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(180, t0);
    o.connect(gain); o.start(t0); o.stop(t0 + seconds);
  }
  return true;
}
