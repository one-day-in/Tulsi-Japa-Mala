# Improvement Proposals

## 1) Split Monolithic `app.js` Into Domain Modules
- **problem description**: `app.js` is ~1350 lines and mixes config, i18n, gesture handling, rendering, audio, persistence, and modal UI logic.
- **why it matters**: High coupling makes regressions more likely and slows changes because one edit can affect many concerns.
- **suggested solution**: Split into modules like `state/`, `ui/`, `gesture/`, `audio/`, `i18n/`, `persistence/`, and keep one small `bootstrap` entry.
- **expected impact**: Faster onboarding, safer refactors, and easier testing per feature.
- **estimated complexity**: Medium.

## 2) Introduce Reducer-Style State Transitions
- **problem description**: State is mutated from many places (`state.currentBead`, `state.round`, lock flags), with behavior spread across handlers.
- **why it matters**: Hard to guarantee invariants (e.g., bead limits, round transitions, modal/loader/audio lock interactions).
- **suggested solution**: Centralize transitions in pure reducer-like functions (`STEP_COMMIT`, `NEXT_ROUND`, `RESET_ALL`, `SET_SOUND_MODE`) and keep side effects outside.
- **expected impact**: Predictable behavior, easier debugging, and lower risk of edge-case bugs.
- **estimated complexity**: Medium.

## 3) Formalize App State Shape (Persistent vs Runtime)
- **problem description**: Persistent and runtime-only flags are mixed conceptually (`localStorage` fields vs transient locks/animation flags).
- **why it matters**: Increases chance of accidental persistence bugs and state drift after restore.
- **suggested solution**: Define `persistentState` and `runtimeState` schemas explicitly; validate persisted input before hydration.
- **expected impact**: Safer reload behavior and clearer ownership of state fields.
- **estimated complexity**: Low.

## 4) Consolidate Render Triggers Into One Scheduler
- **problem description**: `render()`, `requestRenderBeads()`, and direct DOM updates are invoked from many handlers.
- **why it matters**: Extra repaint/reflow risk and harder mental model for why the UI changed.
- **suggested solution**: Add a single render scheduler that batches full UI and bead-only updates by dirty flags (e.g., `dirty.counter`, `dirty.layout`, `dirty.modals`).
- **expected impact**: More stable frame times and less UI jitter on mobile.
- **estimated complexity**: Medium.

## 5) Reduce Per-Frame Inline Style Churn
- **problem description**: `BeadLayout.renderBeadLayout()` writes many inline styles for every bead and knot each frame.
- **why it matters**: On mobile GPUs/CPUs this can cause micro-stutter during drag and settle.
- **suggested solution**: Move stable visuals to CSS classes/custom properties; in frame loop update only minimal transform/opacity variables. Consider skipping updates if value delta is below epsilon.
- **expected impact**: Smoother interaction and lower CPU cost.
- **estimated complexity**: Medium.

## 6) Debounce/Cache Expensive Environment Checks
- **problem description**: Some environment checks (`matchMedia`, responsive metrics recomputation) are called frequently in interaction paths.
- **why it matters**: Small repeated costs accumulate during gesture-heavy usage.
- **suggested solution**: Cache pointer-capability/media-query results and refresh only on resize/orientation/media change listeners.
- **expected impact**: Small but consistent performance gain, especially on lower-end phones.
- **estimated complexity**: Low.

## 7) Move Static i18n Dictionaries Out of Runtime File
- **problem description**: Large i18n object sits inside `app.js`, increasing parse/maintenance burden.
- **why it matters**: Hard to review and easy to create translation mismatches.
- **suggested solution**: Store locales in dedicated JSON/JS files and add key completeness checks against fallback locale.
- **expected impact**: Cleaner main logic and fewer localization regressions.
- **estimated complexity**: Low.

## 8) Unify Modal and Overlay Management
- **problem description**: Multiple open/close functions manually toggle classes/ARIA/body lock for each modal/overlay type.
- **why it matters**: Duplicated logic invites inconsistent behavior (escape handling, outside click, body lock collisions).
- **suggested solution**: Implement a shared modal controller with generic `openOverlay(id)` / `closeOverlay(id)` and centralized escape/backdrop logic.
- **expected impact**: Less duplication, fewer modal-state bugs, cleaner code.
- **estimated complexity**: Low.

## 9) Harden Audio Concurrency and Lifecycle
- **problem description**: Click/mantra locks, unlock flow, and playback fallback logic are distributed and stateful.
- **why it matters**: Audio race conditions are a known source of “ghost” behavior on mobile browsers.
- **suggested solution**: Wrap audio in a small `AudioManager` finite-state model (`idle`, `primed`, `playing_click`, `playing_mantra`, `blocked`) with explicit transitions and cancellation policy.
- **expected impact**: Fewer intermittent audio bugs and clearer rules for gesture blocking.
- **estimated complexity**: Medium.

## 10) Extract and Reuse Generic Utility Functions
- **problem description**: Utilities like `clamp` and repetitive patterns (option syncing, aria pressed toggles, image preload patterns) are duplicated.
- **why it matters**: Duplication increases inconsistency risk and maintenance effort.
- **suggested solution**: Create lightweight utility modules (`math.ts/js`, `dom.ts/js`, `assets.ts/js`) and reuse shared helpers.
- **expected impact**: Smaller surface area for bugs and easier refactors.
- **estimated complexity**: Low.

## 11) Add Guard Rails for Risky Direct DOM Assumptions
- **problem description**: Many `els.*` nodes are assumed present after query; missing markup can fail at runtime.
- **why it matters**: Fragile startup and harder diagnostics when HTML changes.
- **suggested solution**: Add startup assertions with clear errors, and fail-fast checks for required elements/features.
- **expected impact**: Faster debugging and safer UI evolution.
- **estimated complexity**: Low.

## 12) Consider Small Libraries Only Where They Remove Real Complexity
- **problem description**: Some concerns are hand-rolled (gesture semantics, schema validation, i18n formatting).
- **why it matters**: Custom logic is flexible but can become costly to maintain at scale.
- **suggested solution**:
  - `zod` (or equivalent tiny schema validator) for persisted state validation.
  - `@formatjs/intl-localematcher` (optional) for robust locale matching.
  - Keep gesture animation custom unless current complexity grows further; avoid heavy UI frameworks.
- **expected impact**: Better reliability for persistence/i18n with minimal bundle impact.
- **estimated complexity**: Low.
