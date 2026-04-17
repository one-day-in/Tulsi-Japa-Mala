import { initRuntimeFlowControllers, initRuntimeManagers } from "./runtime-initializers.js";
import {
  buildFlowControllerInitParams,
  buildManagerInitParams,
  buildRuntimeEventHandlers,
  buildRoundFlowInitParams,
} from "./runtime-wiring.js";
import { createWheelMotionController } from "./runtime-wheel-motion.js";

export function runBootstrapSequence(ctx) {
  ctx.applyTranslations();
  initFlows(ctx);
  initManagersWithMotion(ctx);
  initRoundFlow(ctx);
  initAudioAndPreload(ctx);
  initBindings(ctx);
}

function initFlows(ctx) {
  const flowControllers = initRuntimeFlowControllers(buildFlowControllerInitParams({
    audioFlowController: ctx.getAudioFlowController(),
    uiFlowController: ctx.getUIFlowController(),
    gestureFlowController: ctx.getGestureFlowController(),
    settingsFlowController: ctx.getSettingsFlowController(),
    createAudioFlowController: ctx.createAudioFlowController,
    createUIFlowController: ctx.createUIFlowController,
    createGestureFlowController: ctx.createGestureFlowController,
    createSettingsFlowController: ctx.createSettingsFlowController,
    els: ctx.els,
    activeStepCount: ctx.activeStepCount,
    activeBeadMinIndex: ctx.activeBeadMinIndex,
    activeBeadMaxIndex: ctx.activeBeadMaxIndex,
    state: ctx.state,
    t: ctx.t,
    clamp: ctx.clamp,
    getStyleLabel: (style) => ctx.getAssetsManager().styleLabel(style),
    getSoundIconSvg: ctx.getSoundIconSvg,
    getAudioManager: ctx.getAudioManager,
    getModalManager: ctx.getModalManager,
    getUIRenderer: ctx.getUIRenderer,
    getBeadRenderManager: ctx.getBeadRenderManager,
    getGestureController: ctx.getGestureController,
    getWheelIndex: ctx.getWheelIndex,
    setWheelIndex: ctx.setWheelIndex,
    getLocks: ctx.getLocks,
    setLocks: ctx.setLocks,
    displayStep: ctx.displayStep,
    applyVisualStyles: () => {
      ctx.getAssetsManager().applyBeadStyle(ctx.state.beadStyle);
      ctx.getAssetsManager().applyBackgroundStyle(ctx.state.backgroundStyle);
    },
    syncBeadStyleOptionState: () => {
      ctx.getControlsManager().syncBeadStyleOptionState(ctx.state.beadStyle);
    },
    syncBackgroundStyleOptionState: () => {
      ctx.getControlsManager().syncBackgroundStyleOptionState(ctx.state.backgroundStyle);
    },
    syncSoundModeOptionState: () => {
      ctx.getControlsManager().syncSoundModeOptionState(ctx.state.soundMode);
    },
    persistAndRender: ctx.persistAndRender,
    closeBeadStyleModal: () => ctx.getModalManager()?.closeBeadStyleModal(),
    closeSoundModeModal: () => ctx.getModalManager()?.closeSoundModeModal(),
    beadStyles: ctx.beadStyles,
    backgroundStyles: ctx.backgroundStyles,
    soundModes: ctx.soundModes,
  }));
  ctx.setFlowControllers(flowControllers);
}

function initManagersWithMotion(ctx) {
  const managers = initRuntimeManagers(buildManagerInitParams({
    modalManager: ctx.getModalManager(),
    beadRenderManager: ctx.getBeadRenderManager(),
    uiRenderer: ctx.getUIRenderer(),
    assetsManager: ctx.getAssetsManager(),
    controlsManager: ctx.getControlsManager(),
    audioManager: ctx.getAudioManager(),
    gestureController: ctx.getGestureController(),
    ensureModalManager: ctx.ensureModalManager,
    ensureBeadRenderManager: ctx.ensureBeadRenderManager,
    ensureUIRenderer: ctx.ensureUIRenderer,
    ensureAssetsManager: ctx.ensureAssetsManager,
    ensureControlsManager: ctx.ensureControlsManager,
    ensureAudioManager: ctx.ensureAudioManager,
    ensureGestureController: ctx.ensureGestureController,
    createModalManager: ctx.createModalManager,
    createBeadRenderManager: ctx.createBeadRenderManager,
    createUIRenderer: ctx.createUIRenderer,
    createAssetsManager: ctx.createAssetsManager,
    createControlsManager: ctx.createControlsManager,
    createAudioManager: ctx.createAudioManager,
    createGestureController: ctx.createGestureController,
    els: ctx.els,
    activeStepCount: ctx.activeStepCount,
    activeBeadMinIndex: ctx.activeBeadMinIndex,
    activeBeadMaxIndex: ctx.activeBeadMaxIndex,
    visualBeadMinIndex: ctx.visualBeadMinIndex,
    visualBeadMaxIndex: ctx.visualBeadMaxIndex,
    terminalBeadLowIndex: ctx.terminalBeadLowIndex,
    terminalBeadHighIndex: ctx.terminalBeadHighIndex,
    desktopBeadSizePx: ctx.desktopBeadSizePx,
    mobileBeadSizePx: ctx.mobileBeadSizePx,
    beadGapPx: ctx.beadGapPx,
    knotAspectRatio: ctx.knotAspectRatio,
    onWheelLivePreview: ctx.onWheelLivePreview,
    isCoarsePointer: ctx.isCoarsePointer,
    getSoundIconSvg: ctx.getSoundIconSvg,
    beadStyles: ctx.beadStyles,
    beadImageSrcs: ctx.beadImageSrcs,
    backgroundStyles: ctx.backgroundStyles,
    backgroundImageSrcs: ctx.backgroundImageSrcs,
    backgroundImageByStyle: ctx.backgroundImageByStyle,
    knotImageSrc: ctx.knotImageSrc,
    terminalBeadStyleSrc: ctx.terminalBeadStyleSrc,
    terminalTailSrc: ctx.terminalTailSrc,
    stepSoundSrc: ctx.stepSoundSrc,
    mantraSrcM4A: ctx.mantraSrcM4A,
    mantraSrcMP3: ctx.mantraSrcMP3,
    mantraUnlockEarlySec: ctx.mantraUnlockEarlySec,
    onLockStateChange: ctx.onLockStateChange,
    swipeThresholdPx: ctx.swipeThresholdPx,
    wheelMinStepTriggerRatio: ctx.wheelMinStepTriggerRatio,
    getBeadPitch: () => ctx.getBeadRenderManager().getBeadPitch(),
    getWheelIndex: ctx.getWheelIndex,
    setWheelIndex: ctx.setWheelIndex,
    getCurrentBeadIndex: () => ctx.state.currentBead,
    requestRender: (nextWheel) => {
      ctx.getBeadRenderManager().requestRender(nextWheel);
    },
    stopSettleAnimation: ctx.stopSettleAnimation,
    initStepAudio: () => ctx.getAudioFlowController()?.initStepAudio(),
    isStepBlocked: () => {
      const audioFlowController = ctx.getAudioFlowController();
      return audioFlowController ? audioFlowController.isStepBlocked() : false;
    },
    setDragging: (isDragging) => {
      ctx.els.beadsArea.classList.toggle("dragging", isDragging);
    },
    onCancel: () => {
      ctx.animateWheelTo(ctx.state.currentBead, 200);
    },
    onSettle: ({ triggerPx, velocityPxPerMs }) => {
      ctx.settleWheel(triggerPx, velocityPxPerMs);
    },
  }));

  const wheelMotionController = createWheelMotionController({
    animateValue: ctx.animateValue,
    clamp: ctx.clamp,
    minIndex: ctx.activeBeadMinIndex,
    maxIndex: ctx.activeBeadMaxIndex,
    isSettlingNow: () => {
      const roundFlowController = ctx.getRoundFlowController();
      return roundFlowController ? roundFlowController.isSettlingNow() : false;
    },
    onStopSettling: () => {
      const roundFlowController = ctx.getRoundFlowController();
      if (roundFlowController) roundFlowController.stopSettling();
    },
    getWheelIndex: ctx.getWheelIndex,
    setWheelIndex: ctx.setWheelIndex,
    requestRender: (nextWheel) => {
      ctx.getBeadRenderManager().requestRender(nextWheel);
    },
  });

  ctx.setManagers({
    ...managers,
    wheelMotionController,
  });
}

function initRoundFlow(ctx) {
  const roundFlowController = ctx.ensureRuntimeRoundFlowController(buildRoundFlowInitParams({
    roundFlowController: ctx.getRoundFlowController(),
    state: ctx.state,
    stateDomainConfig: ctx.stateDomainConfig,
    activeStepCount: ctx.activeStepCount,
    activeBeadMinIndex: ctx.activeBeadMinIndex,
    activeBeadMaxIndex: ctx.activeBeadMaxIndex,
    dragCommitMinPx: ctx.dragCommitMinPx,
    wheelMomentumMs: ctx.wheelMomentumMs,
    wheelMinSettleMs: ctx.wheelMinSettleMs,
    wheelMaxSettleMs: ctx.wheelMaxSettleMs,
    roundLoaderMs: ctx.roundLoaderMs,
    computeSettleTarget: ctx.computeSettleTarget,
    clamp: ctx.clamp,
    resetProgress: ctx.resetProgress,
    advanceRound: ctx.advanceRound,
    getWheelIndex: ctx.getWheelIndex,
    setWheelIndex: ctx.setWheelIndex,
    getBeadPitch: () => ctx.getBeadRenderManager().getBeadPitch(),
    getSoundMode: () => ctx.state.soundMode,
    applyStepDelta: ctx.applyStepDelta,
    animateOffset: ctx.animateOffset,
    animateWheelTo: ctx.animateWheelTo,
    triggerHaptic: ctx.triggerHaptic,
    onStepCommitted: () => ctx.getAudioFlowController()?.onStepCommitted(),
    stopMantraPlayback: () => ctx.getAudioFlowController()?.stopMantraPlayback(),
    stopStepPlayback: () => ctx.getAudioFlowController()?.stopStepPlayback(),
    isRoundLoaderOpen: () => ctx.getModalManager().isRoundLoaderOpen(),
    openRoundLoader: () => ctx.getModalManager().openRoundLoader(),
    closeRoundLoader: () => ctx.getModalManager().closeRoundLoader(),
    openResetConfirmModal: () => ctx.getModalManager().openResetConfirmModal(),
    closeResetConfirmModal: () => ctx.getModalManager().closeResetConfirmModal(),
    requestRender: (nextWheel) => ctx.getBeadRenderManager().requestRender(nextWheel),
    displayStep: ctx.displayStep,
    updateCounterText: ctx.updateCounterText,
    saveState: ctx.saveState,
    render: ctx.render,
  }));
  ctx.setRoundFlowController(roundFlowController);
}

function initAudioAndPreload(ctx) {
  const audioFlowController = ctx.getAudioFlowController();
  if (audioFlowController) {
    audioFlowController.initStepAudio();
  }
  ctx.preloadAssets();
  if (audioFlowController) {
    audioFlowController.bindFirstTouchAudioUnlock();
  }
}

function initBindings(ctx) {
  ctx.bindZoomGuards();
  ctx.getControlsManager().renderSoundModeOptionIcons();
  ctx.getControlsManager().renderHeaderButtonIcons();
  ctx.getControlsManager().renderRoundLoaderIcon();
  ctx.getControlsManager().renderNextRoundButtonIcon();

  const handlers = buildRuntimeEventHandlers({
    onReset: ctx.onReset,
    onConfirmReset: ctx.onConfirmReset,
    onNextRound: ctx.onNextRound,
    modalManager: ctx.getModalManager,
    settingsFlowController: ctx.getSettingsFlowController,
    audioFlowController: ctx.getAudioFlowController,
    gestureFlowController: ctx.getGestureFlowController,
  });

  ctx.bindAppEvents({
    els: ctx.els,
    handlers,
  });
}
