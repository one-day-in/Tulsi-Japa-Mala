// State domain module: defaults, hydration, derived values and transitions.

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function createDefaultState(config) {
  return {
    round: 1,
    currentBead: config.activeBeadMinIndex,
    beadStyle: config.defaultBeadStyle,
    backgroundStyle: config.defaultBackgroundStyle,
    soundMode: "off",
  };
}

export function hydrateState(raw, config) {
  const defaults = createDefaultState(config);
  if (!raw) return defaults;

  try {
    const parsed = JSON.parse(raw);
    const round = Number.isInteger(parsed.round) && parsed.round > 0 ? parsed.round : 1;
    const legacyCount = Number.isInteger(parsed.countInRound) ? parsed.countInRound : null;
    const parsedCurrentBead = Number.isInteger(parsed.currentBead)
      ? parsed.currentBead
      : legacyCount !== null
        ? config.activeBeadMinIndex + legacyCount
        : config.activeBeadMinIndex;
    const currentBead = clamp(parsedCurrentBead, config.activeBeadMinIndex, config.activeBeadMaxIndex);
    const beadStyle = config.beadStyles.includes(parsed.beadStyle) ? parsed.beadStyle : config.defaultBeadStyle;
    const backgroundStyle = config.backgroundStyles.includes(parsed.backgroundStyle)
      ? parsed.backgroundStyle
      : config.defaultBackgroundStyle;

    // Per product decision, sound mode always starts as "off" after reload.
    return {
      round,
      currentBead,
      beadStyle,
      backgroundStyle,
      soundMode: "off",
    };
  } catch {
    return defaults;
  }
}

export function getDisplayStep(currentBead, activeBeadMinIndex) {
  return currentBead - activeBeadMinIndex;
}

export function applyStepDelta(state, deltaSteps, config) {
  if (!Number.isInteger(deltaSteps) || deltaSteps === 0) return 0;
  const nextBead = clamp(state.currentBead + deltaSteps, config.activeBeadMinIndex, config.activeBeadMaxIndex);
  const applied = nextBead - state.currentBead;
  state.currentBead = nextBead;
  return applied;
}

export function resetProgress(state, config) {
  state.round = 1;
  state.currentBead = config.activeBeadMinIndex;
}

export function advanceRound(state, config) {
  state.round += 1;
  state.currentBead = config.activeBeadMinIndex;
}
