// Wheel engine: computes one-step settle target from drag and release velocity.

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function computeSettleTarget(params) {
  const {
    wheelIndex,
    currentBead,
    beadPitch,
    velocityPxPerMs,
    triggerPx,
    dragCommitMinPx,
    wheelMomentumMs,
    minIndex,
    maxIndex,
    velocitySwipeThreshold = 0.42,
  } = params;

  const releaseVelocity = Number.isFinite(velocityPxPerMs) ? velocityPxPerMs : 0;
  const velocityIndexPerMs = releaseVelocity / Math.max(1, beadPitch);
  const projectedIndex = wheelIndex + velocityIndexPerMs * wheelMomentumMs;
  const releaseDeltaPx = (wheelIndex - currentBead) * beadPitch;
  const dragCommitPx = Math.max(dragCommitMinPx, triggerPx);
  let targetIndex = Math.round(projectedIndex);

  // Dead-zone: tiny drags should always return to current bead.
  if (Math.abs(releaseDeltaPx) < dragCommitPx && Math.abs(releaseVelocity) < velocitySwipeThreshold) {
    targetIndex = currentBead;
  }

  // Ensure a small but clear flick still advances one step.
  if (Math.abs(releaseDeltaPx) < triggerPx && Math.abs(releaseVelocity) >= velocitySwipeThreshold) {
    targetIndex = currentBead + (releaseVelocity > 0 ? 1 : -1);
  }

  // One swipe == one bead.
  targetIndex = clamp(targetIndex, currentBead - 1, currentBead + 1);
  targetIndex = clamp(targetIndex, minIndex, maxIndex);

  return {
    targetIndex,
    targetSteps: targetIndex - currentBead,
    releaseVelocity,
  };
}
