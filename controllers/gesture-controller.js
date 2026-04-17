// Gesture controller for bead swipe/drag flow.

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function createGestureController(config) {
  let gestureStartY = null;
  let gesturePointerId = null;
  let gestureSamples = [];
  let gestureStartWheelIndex = config.getWheelIndex();
  let dragTargetWheelIndex = config.getWheelIndex();
  let isDraggingPointer = false;
  let dragFollowRafId = null;

  function trimGestureSamples() {
    const now = performance.now();
    gestureSamples = gestureSamples.filter((sample) => now - sample.t <= 120);
    if (gestureSamples.length > 8) {
      gestureSamples = gestureSamples.slice(-8);
    }
  }

  function calculateGestureVelocity() {
    if (gestureSamples.length < 2) return 0;
    const last = gestureSamples[gestureSamples.length - 1];
    let base = gestureSamples[0];

    for (let i = gestureSamples.length - 2; i >= 0; i -= 1) {
      const sample = gestureSamples[i];
      if (last.t - sample.t >= 24) {
        base = sample;
        break;
      }
    }

    const dt = last.t - base.t;
    if (dt <= 0) return 0;
    return (last.y - base.y) / dt;
  }

  function stopDragFollowLoop(syncToTarget) {
    isDraggingPointer = false;
    if (dragFollowRafId !== null) {
      cancelAnimationFrame(dragFollowRafId);
      dragFollowRafId = null;
    }

    if (syncToTarget) {
      config.setWheelIndex(dragTargetWheelIndex);
      config.requestRender(config.getWheelIndex());
    }
  }

  function startDragFollowLoop() {
    if (dragFollowRafId !== null) return;

    const tick = () => {
      if (!isDraggingPointer) {
        dragFollowRafId = null;
        return;
      }

      const current = config.getWheelIndex();
      const delta = dragTargetWheelIndex - current;
      if (Math.abs(delta) > 0.0008) {
        config.setWheelIndex(current + delta * 0.34);
      } else {
        config.setWheelIndex(dragTargetWheelIndex);
      }

      config.requestRender(config.getWheelIndex());
      dragFollowRafId = requestAnimationFrame(tick);
    };

    dragFollowRafId = requestAnimationFrame(tick);
  }

  function clearGestureState() {
    gestureStartY = null;
    gesturePointerId = null;
    gestureSamples = [];
    config.setDragging(false);
  }

  function handlePointerDown(areaEl, event) {
    if (config.isStepBlocked()) return;
    config.stopSettleAnimation();
    config.initStepAudio();

    const currentWheel = config.getWheelIndex();
    gesturePointerId = event.pointerId;
    gestureStartY = event.clientY;
    gestureStartWheelIndex = currentWheel;
    dragTargetWheelIndex = currentWheel;
    gestureSamples = [{ y: event.clientY, t: performance.now() }];

    isDraggingPointer = !config.isCoarsePointer();
    if (isDraggingPointer) {
      startDragFollowLoop();
    }

    config.setDragging(true);
    areaEl.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (gestureStartY === null || event.pointerId !== gesturePointerId) return;

    gestureSamples.push({ y: event.clientY, t: performance.now() });
    trimGestureSamples();

    const beadPitch = config.getBeadPitch();
    const deltaFromAnchor = event.clientY - gestureStartY;
    const nextWheel = gestureStartWheelIndex + deltaFromAnchor / beadPitch;
    const localMin = Math.max(config.activeBeadMinIndex, gestureStartWheelIndex - 1);
    const localMax = Math.min(config.activeBeadMaxIndex, gestureStartWheelIndex + 1);
    dragTargetWheelIndex = clamp(nextWheel, localMin, localMax);

    if (!isDraggingPointer) {
      config.setWheelIndex(dragTargetWheelIndex);
      config.requestRender(config.getWheelIndex());
    }
  }

  function finishGesture(event, shouldApplyStep) {
    if (gestureStartY === null || event.pointerId !== gesturePointerId) return;
    stopDragFollowLoop(true);

    if (config.isStepBlocked()) {
      config.setWheelIndex(config.getCurrentBeadIndex());
      clearGestureState();
      config.requestRender(config.getWheelIndex());
      return;
    }

    const beadPitch = config.getBeadPitch();
    const triggerPx = Math.max(config.swipeThresholdPx, beadPitch * config.wheelMinStepTriggerRatio);
    const velocityPxPerMs = calculateGestureVelocity();

    clearGestureState();

    if (!shouldApplyStep) {
      config.onCancel();
      return;
    }

    config.onSettle({
      triggerPx,
      velocityPxPerMs,
    });
  }

  function handlePointerUp(event) {
    finishGesture(event, true);
  }

  function handlePointerCancel(event) {
    finishGesture(event, false);
  }

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    stopDragFollowLoop,
  };
}
