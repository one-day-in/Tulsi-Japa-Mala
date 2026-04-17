// Runtime initializers: build flow controllers and managers from dependencies.

export function initRuntimeFlowControllers(params) {
  const {
    audioFlowController,
    uiFlowController,
    gestureFlowController,
    settingsFlowController,
    createAudioFlowController,
    createUIFlowController,
    createGestureFlowController,
    createSettingsFlowController,
    els,
    activeStepCount,
    activeBeadMinIndex,
    activeBeadMaxIndex,
    state,
    t,
    clamp,
    getStyleLabel,
    getSoundIconSvg,
    getAudioManager,
    getModalManager,
    getUIRenderer,
    getBeadRenderManager,
    getGestureController,
    getWheelIndex,
    setWheelIndex,
    getLocks,
    setLocks,
    displayStep,
    applyVisualStyles,
    syncBeadStyleOptionState,
    syncBackgroundStyleOptionState,
    syncSoundModeOptionState,
    persistAndRender,
    closeBeadStyleModal,
    closeSoundModeModal,
    beadStyles,
    backgroundStyles,
    soundModes,
  } = params;

  const nextAudioFlowController = audioFlowController ||
    createAudioFlowController({
      getAudioManager,
      getModalManager,
      getSoundMode: () => state.soundMode,
      getLocks,
      setLocks,
      onPlayMantraStep: () => {
        nextAudioFlowController?.playMantraForStep();
      },
    });

  const nextUIFlowController = uiFlowController ||
    createUIFlowController({
      els,
      activeStepCount,
      activeBeadMinIndex,
      activeBeadMaxIndex,
      getState: () => state,
      getModalManager,
      getUIRenderer,
      getBeadRenderManager,
      getWheelIndex,
      setWheelIndex,
      clamp,
      t,
      getStyleLabel,
      getSoundIconSvg,
      applyVisualStyles,
      syncBeadStyleOptionState,
      syncBackgroundStyleOptionState,
      syncSoundModeOptionState,
      getLocks,
      displayStep,
    });

  const nextGestureFlowController = gestureFlowController ||
    createGestureFlowController({
      getGestureController,
      getBeadsArea: () => els.beadsArea,
      getBeadRenderManager,
      getWheelIndex,
      setWheelIndex,
      activeBeadMinIndex,
      activeBeadMaxIndex,
      clamp,
    });

  const nextSettingsFlowController = settingsFlowController ||
    createSettingsFlowController({
      beadStyles,
      backgroundStyles,
      soundModes,
      getState: () => state,
      getAudioManager,
      setLocks,
      persistAndRender,
      closeBeadStyleModal,
      closeSoundModeModal,
    });

  return {
    audioFlowController: nextAudioFlowController,
    uiFlowController: nextUIFlowController,
    gestureFlowController: nextGestureFlowController,
    settingsFlowController: nextSettingsFlowController,
  };
}

export function initRuntimeManagers(params) {
  const {
    modalManager,
    beadRenderManager,
    uiRenderer,
    assetsManager,
    controlsManager,
    audioManager,
    gestureController,
    ensureModalManager,
    ensureBeadRenderManager,
    ensureUIRenderer,
    ensureAssetsManager,
    ensureControlsManager,
    ensureAudioManager,
    ensureGestureController,
    createModalManager,
    createBeadRenderManager,
    createUIRenderer,
    createAssetsManager,
    createControlsManager,
    createAudioManager,
    createGestureController,
    els,
    activeStepCount,
    activeBeadMinIndex,
    activeBeadMaxIndex,
    visualBeadMinIndex,
    visualBeadMaxIndex,
    terminalBeadLowIndex,
    terminalBeadHighIndex,
    desktopBeadSizePx,
    mobileBeadSizePx,
    beadGapPx,
    knotAspectRatio,
    onWheelLivePreview,
    isCoarsePointer,
    getSoundIconSvg,
    beadStyles,
    beadImageSrcs,
    backgroundStyles,
    backgroundImageSrcs,
    backgroundImageByStyle,
    knotImageSrc,
    terminalBeadStyleSrc,
    terminalTailSrc,
    stepSoundSrc,
    mantraSrcM4A,
    mantraSrcMP3,
    mantraUnlockEarlySec,
    onLockStateChange,
    swipeThresholdPx,
    wheelMinStepTriggerRatio,
    getBeadPitch,
    getWheelIndex,
    setWheelIndex,
    getCurrentBeadIndex,
    requestRender,
    stopSettleAnimation,
    initStepAudio,
    isStepBlocked,
    setDragging,
    onCancel,
    onSettle,
  } = params;

  const nextModalManager = ensureModalManager({
    modalManager,
    createModalManager,
    els,
  });

  const nextBeadRenderManager = ensureBeadRenderManager({
    beadRenderManager,
    createBeadRenderManager,
    config: {
      beadsColumnEl: els.beadsColumn,
      activeBeadMinIndex,
      activeBeadMaxIndex,
      visualBeadMinIndex,
      visualBeadMaxIndex,
      terminalBeadLowIndex,
      terminalBeadHighIndex,
      desktopBeadSizePx,
      mobileBeadSizePx,
      beadGapPx,
      knotAspectRatio,
      onLivePreview: onWheelLivePreview,
      isCoarsePointer,
    },
  });

  const nextUIRenderer = ensureUIRenderer({
    uiRenderer,
    createUIRenderer,
    config: {
      els,
      activeStepCount,
      getSoundIconSvg,
    },
  });

  const nextAssetsManager = ensureAssetsManager({
    assetsManager,
    createAssetsManager,
    config: {
      beadStyles,
      beadImageSrcs,
      backgroundStyles,
      backgroundImageSrcs,
      backgroundImageByStyle,
      knotImageSrc,
      terminalBeadStyleSrc,
      terminalTailSrc,
      beadsColumnEl: els.beadsColumn,
    },
  });

  const nextControlsManager = ensureControlsManager({
    controlsManager,
    createControlsManager,
    config: {
      beadStyleOptionsEl: els.beadStyleOptions,
      backgroundStyleOptionsEl: els.backgroundStyleOptions,
      soundModeOptionsEl: els.soundModeOptions,
      beadStyleBtnEl: els.beadStyleBtn,
      resetBtnEl: els.resetBtn,
      soundModeBtnEl: els.soundModeBtn,
      roundLoaderSpinnerEl: els.roundLoaderSpinner,
      nextRoundInlineBtnEl: els.nextRoundInlineBtn,
      getSoundIconSvg,
    },
  });

  const nextAudioManager = ensureAudioManager({
    audioManager,
    createAudioManager,
    stepSoundSrc,
    mantraSrcM4A,
    mantraSrcMP3,
    mantraUnlockEarlySec,
    onLockStateChange,
  });

  const nextGestureController = ensureGestureController({
    gestureController,
    createGestureController,
    config: {
      activeBeadMinIndex,
      activeBeadMaxIndex,
      swipeThresholdPx,
      wheelMinStepTriggerRatio,
      getBeadPitch,
      getWheelIndex,
      setWheelIndex,
      getCurrentBeadIndex,
      requestRender,
      stopSettleAnimation,
      initStepAudio,
      isStepBlocked,
      isCoarsePointer,
      setDragging,
      onCancel,
      onSettle,
    },
  });

  return {
    modalManager: nextModalManager,
    beadRenderManager: nextBeadRenderManager,
    uiRenderer: nextUIRenderer,
    assetsManager: nextAssetsManager,
    controlsManager: nextControlsManager,
    audioManager: nextAudioManager,
    gestureController: nextGestureController,
  };
}
