export function createWheelMotionController(params) {
  const {
    animateValue,
    clamp,
    minIndex,
    maxIndex,
    isSettlingNow,
    onStopSettling,
    getWheelIndex,
    setWheelIndex,
    requestRender,
  } = params;

  let activeMotion = null;

  function animateWheelTo(targetIndex, durationMs) {
    if (isSettlingNow()) return;

    const target = clamp(targetIndex, minIndex, maxIndex);
    animateOffset(getWheelIndex(), target, durationMs, (nextWheel) => {
      setWheelIndex(nextWheel);
      requestRender(nextWheel);
    });
  }

  function animateOffset(from, to, durationMs, onTick, onDone) {
    stopSettleAnimation();
    if (typeof animateValue !== "function") {
      onTick(to);
      if (onDone) onDone();
      return;
    }

    activeMotion = animateValue({
      from,
      to,
      durationMs,
      onTick,
      onDone: () => {
        activeMotion = null;
        if (onDone) onDone();
      },
    });
  }

  function stopSettleAnimation() {
    if (activeMotion && typeof activeMotion.cancel === "function") {
      activeMotion.cancel();
      activeMotion = null;
    }
    onStopSettling();
  }

  return {
    animateWheelTo,
    animateOffset,
    stopSettleAnimation,
  };
}
