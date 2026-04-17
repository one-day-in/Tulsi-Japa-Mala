// Gesture flow controller: pointer event handlers and resize reaction.

export function createGestureFlowController(config) {
  const {
    getGestureController,
    getBeadsArea,
    getBeadRenderManager,
    getWheelIndex,
    setWheelIndex,
    activeBeadMinIndex,
    activeBeadMaxIndex,
    clamp,
  } = config;

  function onPointerDown(event) {
    const gestureController = getGestureController();
    if (!gestureController || typeof gestureController.handlePointerDown !== "function") return;
    gestureController.handlePointerDown(getBeadsArea(), event);
  }

  function onPointerMove(event) {
    const gestureController = getGestureController();
    if (!gestureController || typeof gestureController.handlePointerMove !== "function") return;
    gestureController.handlePointerMove(event);
  }

  function onPointerUp(event) {
    const gestureController = getGestureController();
    if (!gestureController || typeof gestureController.handlePointerUp !== "function") return;
    gestureController.handlePointerUp(event);
  }

  function onPointerCancel(event) {
    const gestureController = getGestureController();
    if (!gestureController || typeof gestureController.handlePointerCancel !== "function") return;
    gestureController.handlePointerCancel(event);
  }

  function onResize() {
    const beadRenderManager = getBeadRenderManager();
    beadRenderManager.refreshMetrics();
    const clamped = clamp(getWheelIndex(), activeBeadMinIndex, activeBeadMaxIndex);
    setWheelIndex(clamped);
    beadRenderManager.requestRender(clamped);
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onResize,
  };
}
