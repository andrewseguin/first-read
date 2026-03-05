# First Read: Feature Implementation Plan

We are implementing three core features to `first-read`. To maintain stability and a premium UX, we will implement these sequentially, fully testing each phase before clearing its checkpoint and moving to the next.

## Current Status: 🟢 Skipping Phase 2. Starting Phase 3!

---

## Phase 1: Letter Casing Toggle (Upper / Lower / Mixed)

**Goal:** Allow parents to cycle the application's alphabet display between lowercase (`a`), uppercase (`A`), or a mixed view showcasing both (`Aa`).

- [x] **State Structure:** Define a `letterCase` state (`'lower' | 'upper' | 'mixed'`) using `useLocalStorage` inside `src/app/page.tsx`.
- [x] **Settings UI:** Add a sleek Toggle Group (or select menu) inside `src/components/letter-selector.tsx` or `app-settings.tsx` to let parents choose the casing mode.
- [x] **Display Logic:** Pass `letterCase` down to `LetterDisplay`. - If `'upper'`, apply `.toUpperCase()`. - If `'lower'`, maintain `.toLowerCase()`. - If `'mixed'` (for single letters), format the string as `Aa`, `Bb`, etc. For words, we will determine if we want title-case (`Cat`) or keep it lowercase by default.
- [x] **Checkpoint & Testing:** Verify the toggle works, persists on refresh, and rendering cleanly handles the size differences (especially for `'mixed'` mode like `Ww` which might require slight CSS scaling adjustments so it doesn't overflow).

---

## Phase 2: Tap for Picture (Words Mode)

**Goal:** Create a visual reward and association mechanic for early readers. Tapping a word will reveal a corresponding image or emoji.

- [ ] **Data Mapping:** Update `src/lib/words.ts` (or create a new utility) that maps our existing `EASY_WORDS` and `HARD_WORDS` strings to corresponding emojis or SVG paths (e.g., `cat: "🐱"`, `run: "🏃"`).
- [ ] **Card State:** Introduce a local `showPicture` boolean state inside `src/components/letter-display.tsx` that resets to `false` every time the `content.key` changes (on back/next navigation).
- [ ] **Interaction Handling:** Add an `onClick` or `onPointerUp` listener to the word container itself. We must ensure this _does not conflict_ with the swipe-to-navigate logic we currently have bound to the parent `<main>` wrapper.
- [ ] **Animations:** Build a fluid CSS/Tailwind animation that fades the text out/shrinks it, and elegantly fades/bounces the picture into the foreground.
- [ ] **Checkpoint & Testing:** Validate that tapping words shows the picture, tapping again hides it, and navigating away immediately resets the state so the next word doesn't reveal its picture prematurely.

---

## Phase 3: Interactive Letter Tracing Overlay

**Goal:** Let kids trace the letters directly on the screen using their fingers to build motor skills.

- [ ] **Draw Mode Toggle:** Because tracing a letter requires dragging a finger across the screen, it fundamentally conflicts with our current "drag/swipe to go to the next card" navigation. We will add a "Draw/Trace Mode" toggle (perhaps a little paintbrush icon `<Button>` on the card).
- [ ] **Canvas Component:** Build a new `<TracingCanvas />` React component superimposed directly over the text. - Give it a transparent background. - Configure `onPointerDown`, `onPointerMove`, and `onPointerUp` listeners to track coordinates. - Bind those coordinates to the HTML5 Canvas 2D context using thick, child-friendly line strokes (e.g., `lineCap = 'round'`).
- [ ] **Responsive Resizing:** The Canvas must perfectly track sizes if the browser resizes or rotates (using `ResizeObserver` or window listeners) to prevent the drawn lines from offsetting.
- [ ] **Clear Canvas Tool:** When in drawing mode, provide a small "Trash/Erase" button to clear their strokes. Let navigating to a new card automatically clear the strokes.
- [ ] **Checkpoint & Testing:** Thoroughly test the pointer coordinate mapping on mobile touch screens (preventing scroll/swipe interference) and verify the drawing feels perfectly 1:1 with the finger.
