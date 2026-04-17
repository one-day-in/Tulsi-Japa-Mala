// Manager initialization helpers: keep app.js focused on orchestration.

export function initAudioManager({
  audioManager,
  createAudioManager,
  stepSoundSrc,
  mantraSrcM4A,
  mantraSrcMP3,
  mantraUnlockEarlySec,
  onLockStateChange,
}) {
  if (audioManager) return audioManager;
  return createAudioManager({
    stepSoundSrc,
    mantraSrcM4A,
    mantraSrcMP3,
    mantraUnlockEarlySec,
    onLockStateChange,
  });
}

export function initGestureController({ gestureController, createGestureController, config }) {
  if (gestureController) return gestureController;
  return createGestureController(config);
}

export function initBeadRenderManager({ beadRenderManager, createBeadRenderManager, config }) {
  if (beadRenderManager) return beadRenderManager;
  return createBeadRenderManager(config);
}

export function initUIRenderer({ uiRenderer, createUIRenderer, config }) {
  if (uiRenderer) return uiRenderer;
  return createUIRenderer(config);
}

export function initAssetsManager({ assetsManager, createAssetsManager, config }) {
  if (assetsManager) return assetsManager;
  return createAssetsManager(config);
}

export function initControlsManager({ controlsManager, createControlsManager, config }) {
  if (controlsManager) return controlsManager;
  return createControlsManager(config);
}

export function initModalManager({ modalManager, createModalManager, els }) {
  if (modalManager) return modalManager;
  return createModalManager({ els });
}
