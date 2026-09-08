# Tinder for Chihuahua

**A swipe interface designed for a user who is a dichromat with 20/75 acuity, and
whose input device is a wet nose.**

**▶ Live: [konstancja-tanjga.github.io/Tinder-for-chihuahua](https://konstancja-tanjga.github.io/Tinder-for-chihuahua/)**
— open it on a phone and add it to the home screen; it runs as a standalone PWA.

---

## The premise

Karmel (5) and Auri (12, his mother) are chihuahuas. They would like to meet a
kindred spirit who is neither mum nor son. So they get an app, on an old iPhone
13 Pro Max, and they operate it themselves.

This is **speculative design**: the question of whether a dog *can* work a
touchscreen is set aside deliberately. Assume it can. What follows from that is a
real design problem with real constraints, and the constraints are the point —
they come from published research on canine vision and motor behaviour, not from
taste.

## The thesis

**One screen, two users.** The dog swipes a card and expresses a preference about
what it sees. The human reads that preference and decides about an actual
meeting. The app never matches dogs. Its output is a **ranked preference signal**,
handed to a matchmaker — never a "match".

That single decision is what makes the product buildable: it removes the cold-start
problem that killed every dog-dating app in the benchmark, because v1 needs no
second user and no network.

## What is in here

| Path | What it is |
|---|---|
| [`app/`](app/) | The working PWA — the five dog screens D1–D5 as a vertical slice. Human mode (H1–H4) is designed but not built. Vite + TypeScript, no framework, no backend. |
| [`design/tokens.json`](design/tokens.json) | **Single source of truth.** Every colour, size, timing and threshold. The guidelines, the app CSS and the app's TypeScript constants are all generated from it. |
| [`design/cig.html`](design/cig.html) | **Canine Interface Guidelines** — 29 numbered laws in 6 groups, plus 5 platform laws. Generated, so not one number in it is typed by hand. |
| [`docs/case-study/`](docs/case-study/) | The use case: a chapter-by-chapter walkthrough of how the project was made, with the panels. In Polish. |
| [`videos/`](videos/) | Candidate clips, normalised to spec by [`normalize.mjs`](videos/normalize.mjs). |

## Why its own guidelines instead of Apple's

Human Interface Guidelines describe a human: a fingertip, a 44 pt target, red as
warning, text as content. Every one of those assumptions breaks on a dichromat
with 20/75 acuity whose pointing device is a nose. In dog mode the HIG are not
merely insufficient, they are actively harmful — so **CIG govern dog mode, HIG
govern human mode**, and the two departures from HIG in human mode are recorded
rather than quietly taken.

A few of the laws, to show what the research buys you:

- **Two hues only.** Dogs are dichromats with cones near 429–435 nm and 555 nm, so
  blue and yellow-green carry all meaning; black and white carry none.
- **Everything ×4.** Canine acuity is roughly 20/75 against a human 20/20 — a
  factor of about 3.75 — so the dog-scale type and target floors are multiples of
  the human ones, not "a bit bigger".
- **120 Hz is a hardware requirement.** Canine flicker fusion runs 70–80 Hz against
  a human ~60 Hz. On a 60 Hz panel the screen visibly flickers to a dog. This is
  why the device is named in the brief.
- **Drag, not tap.** A nose lands as a large multi-point contact patch, not a
  point. The app takes the centroid, ignores the touch count, needs 40 px of travel
  and then refuses input for 1500 ms — because one wet-nose swipe otherwise
  registers as three.

## Testing

The spike exists to measure the things design cannot settle: whether a dog will
actually drag, whether one swipe registers once, and whether audio unlocks. The
app records contact-patch size in millimetres, decision latency and rejected
events, attributed per dog.

---

**Konstancja Tanjga** · 2026 · design, research and build
