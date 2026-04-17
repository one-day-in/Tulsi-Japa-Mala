// Round flow controller: reset / settle / next-round behavior.

export function createRoundFlowController(config) {
  let isSettling = false;

  function onReset() {
    config.openResetConfirmModal();
  }

  function performFullReset() {
    config.stopMantraPlayback();
    config.stopStepPlayback();
    config.closeResetConfirmModal();
    config.resetProgress(config.state, config.stateDomainConfig);
    config.setWheelIndex(config.state.currentBead);
    config.updateCounterText(config.displayStep());
    config.requestRender(config.getWheelIndex());
    config.saveState();
  }

  function onConfirmReset() {
    performFullReset();
    config.openRoundLoader();
    window.setTimeout(() => {
      config.closeRoundLoader();
      config.render();
    }, config.roundLoaderMs);
  }

  function settleWheel(triggerPx, velocityPxPerMs) {
    if (isSettling) return;

    const settle = config.computeSettleTarget({
      wheelIndex: config.getWheelIndex(),
      currentBead: config.state.currentBead,
      beadPitch: config.getBeadPitch(),
      velocityPxPerMs,
      triggerPx,
      dragCommitMinPx: config.dragCommitMinPx,
      wheelMomentumMs: config.wheelMomentumMs,
      minIndex: config.activeBeadMinIndex,
      maxIndex: config.activeBeadMaxIndex,
    });

    const targetIndex = settle.targetIndex;
    const targetSteps = settle.targetSteps;

    if (targetSteps === 0) {
      config.animateWheelTo(config.state.currentBead, 200);
      return;
    }

    isSettling = true;
    const settleDistance = Math.abs(targetIndex - config.getWheelIndex()) * config.getBeadPitch();
    const settleDuration = config.clamp(
      170 + settleDistance * 0.45,
      config.wheelMinSettleMs,
      config.wheelMaxSettleMs,
    );

    config.animateOffset(
      config.getWheelIndex(),
      targetIndex,
      settleDuration,
      (nextWheel) => {
        config.setWheelIndex(nextWheel);
        config.requestRender(config.getWheelIndex());
      },
      () => {
        const appliedSteps = config.applyStepDelta(targetSteps);
        config.setWheelIndex(config.state.currentBead);

        if (appliedSteps !== 0) {
          config.triggerHaptic();
          if (config.getSoundMode() === "mantra") {
            config.onStepCommitted();
          }
        }

        config.saveState();
        config.updateCounterText(config.displayStep());
        config.requestRender(config.getWheelIndex());
        isSettling = false;
      },
    );
  }

  function onNextRound() {
    if (config.isRoundLoaderOpen() || config.displayStep() !== config.activeStepCount) return;

    config.stopMantraPlayback();
    config.stopStepPlayback();
    config.openRoundLoader();

    config.advanceRound(config.state, config.stateDomainConfig);
    config.setWheelIndex(config.state.currentBead);
    config.updateCounterText(config.displayStep());
    config.requestRender(config.getWheelIndex());
    config.saveState();

    window.setTimeout(() => {
      config.closeRoundLoader();
      config.render();
    }, config.roundLoaderMs);
  }

  function isSettlingNow() {
    return isSettling;
  }

  function stopSettling() {
    isSettling = false;
  }

  return {
    onReset,
    onConfirmReset,
    settleWheel,
    onNextRound,
    isSettlingNow,
    stopSettling,
  };
}
