// Motion engine for smooth numeric transitions.

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothOut(t) {
  // Stronger end-phase smoothing to avoid visible snap on settle.
  return 1 - Math.pow(1 - t, 4);
}

export function animateValue({ from, to, durationMs, onTick, onDone }) {
  const startedAt = performance.now();
  let frameId = null;
  let cancelled = false;

  const step = (now) => {
    if (cancelled) return;
    const t = clamp((now - startedAt) / durationMs, 0, 1);
    const eased = smoothOut(t);
    const value = from + (to - from) * eased;
    onTick(value);

    if (t < 1) {
      frameId = requestAnimationFrame(step);
      return;
    }

    frameId = null;
    if (onDone) onDone();
  };

  frameId = requestAnimationFrame(step);

  return {
    cancel() {
      cancelled = true;
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    },
  };
}
