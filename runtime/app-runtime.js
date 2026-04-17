import { I18NData } from "../ui/i18n-data.js";
import { createAudioManager } from "../managers/audio-manager.js";
import { createGestureController } from "../controllers/gesture-controller.js";
import { createUIRenderer } from "../managers/ui-renderer.js";
import { createAssetsManager } from "../managers/assets-manager.js";
import { createControlsManager } from "../managers/controls-manager.js";
import { createModalManager } from "../managers/modal-manager.js";
import { createBeadRenderManager } from "../managers/bead-render-manager.js";
import { getSoundIcon } from "../ui/svg-icons.js";
import { animateValue } from "../engine/bead-motion.js";
import { computeSettleTarget } from "../engine/wheel-engine.js";
import { getDomElements } from "../ui/dom-elements.js";
import { bindAppEvents, bindZoomGuards } from "../core/app-event-binder.js";
import { createAudioFlowController } from "../flows/audio-flow.js";
import { createUIFlowController } from "../flows/ui-flow.js";
import { createGestureFlowController } from "../flows/gesture-flow.js";
import { createSettingsFlowController } from "../flows/settings-flow.js";
import { ensureRuntimeRoundFlowController } from "./runtime-round-flow-init.js";
import { runBootstrapSequence } from "./runtime-bootstrap.js";
import {
  ACTIVE_BEAD_MIN_INDEX,
  ACTIVE_BEAD_MAX_INDEX,
  ACTIVE_STEP_COUNT,
  STORAGE_KEY,
  SWIPE_THRESHOLD_PX,
  DESKTOP_BEAD_SIZE_PX,
  MOBILE_BEAD_SIZE_PX,
  BEAD_GAP_PX,
  KNOT_ASPECT_RATIO,
  BEAD_STYLES,
  BACKGROUND_STYLES,
  SOUND_MODES,
  VISUAL_BEAD_MIN_INDEX,
  VISUAL_BEAD_MAX_INDEX,
  TERMINAL_BEAD_LOW_INDEX,
  TERMINAL_BEAD_HIGH_INDEX,
  BEAD_IMAGE_SRCS,
  BACKGROUND_IMAGE_SRCS,
  BACKGROUND_IMAGE_BY_STYLE,
  KNOT_IMAGE_SRC,
  TERMINAL_BEAD_STYLE_SRC,
  TERMINAL_TAIL_SRC,
  WHEEL_MIN_STEP_TRIGGER_RATIO,
  WHEEL_MOMENTUM_MS,
  WHEEL_MIN_SETTLE_MS,
  WHEEL_MAX_SETTLE_MS,
  DRAG_COMMIT_MIN_PX,
  HAPTIC_MS,
  MANTRA_SRC_M4A,
  MANTRA_SRC_MP3,
  MANTRA_UNLOCK_EARLY_SEC,
  STEP_SOUND_SRC,
  ROUND_LOADER_MS,
  STATE_DOMAIN_CONFIG,
} from "../core/app-config.js";
import {
  initAudioManager as ensureAudioManager,
  initGestureController as ensureGestureController,
  initBeadRenderManager as ensureBeadRenderManager,
  initUIRenderer as ensureUIRenderer,
  initAssetsManager as ensureAssetsManager,
  initControlsManager as ensureControlsManager,
  initModalManager as ensureModalManager,
} from "../core/app-managers.js";
import {
  hydrateState,
  resetProgress,
  advanceRound,
} from "../state/state-manager.js";
import {
  initI18nManager,
  clamp,
  isCoarsePointer,
  loadRuntimeState,
} from "./runtime-utils.js";
import { createRuntimeActions } from "./runtime-actions.js";

const I18N = I18NData;
const i18nManager = initI18nManager(I18N);
const t = (path) => i18nManager.t(path);

const els = getDomElements();
const state = loadRuntimeState({
  storageKey: STORAGE_KEY,
  hydrateState,
  domainConfig: STATE_DOMAIN_CONFIG,
});

let wheelIndex = ACTIVE_BEAD_MIN_INDEX;
let isMantraLocked = false;
let isClickLocked = false;
let audioManager = null;
let gestureController = null;
let uiRenderer = null;
let assetsManager = null;
let controlsManager = null;
let modalManager = null;
let beadRenderManager = null;
let roundFlowController = null;
let wheelMotionController = null;
let audioFlowController = null;
let uiFlowController = null;
let gestureFlowController = null;
let settingsFlowController = null;

const actions = createRuntimeActions({
  i18nManager,
  els,
  hapticMs: HAPTIC_MS,
  activeBeadMinIndex: ACTIVE_BEAD_MIN_INDEX,
  stateDomainConfig: STATE_DOMAIN_CONFIG,
  storageKey: STORAGE_KEY,
  getState: () => state,
  getRoundFlowController: () => roundFlowController,
  getWheelMotionController: () => wheelMotionController,
  getAudioFlowController: () => audioFlowController,
  getUIFlowController: () => uiFlowController,
  getAssetsManager: () => assetsManager,
});

wheelIndex = state.currentBead;
bootstrapRuntime();
beadRenderManager.refreshMetrics();
beadRenderManager.requestRender(wheelIndex);
actions.render();
initStartupLoader();

function bootstrapRuntime() {
  runBootstrapSequence({
    els,
    state,
    t,
    animateValue,
    bindAppEvents,
    bindZoomGuards,
    ensureRuntimeRoundFlowController,
    computeSettleTarget,
    resetProgress,
    advanceRound,
    createAudioFlowController,
    createUIFlowController,
    createGestureFlowController,
    createSettingsFlowController,
    createModalManager,
    createBeadRenderManager,
    createUIRenderer,
    createAssetsManager,
    createControlsManager,
    createAudioManager,
    createGestureController,
    ensureModalManager,
    ensureBeadRenderManager,
    ensureUIRenderer,
    ensureAssetsManager,
    ensureControlsManager,
    ensureAudioManager,
    ensureGestureController,
    getSoundIconSvg: (mode) => getSoundIcon(mode),
    activeStepCount: ACTIVE_STEP_COUNT,
    activeBeadMinIndex: ACTIVE_BEAD_MIN_INDEX,
    activeBeadMaxIndex: ACTIVE_BEAD_MAX_INDEX,
    visualBeadMinIndex: VISUAL_BEAD_MIN_INDEX,
    visualBeadMaxIndex: VISUAL_BEAD_MAX_INDEX,
    terminalBeadLowIndex: TERMINAL_BEAD_LOW_INDEX,
    terminalBeadHighIndex: TERMINAL_BEAD_HIGH_INDEX,
    desktopBeadSizePx: DESKTOP_BEAD_SIZE_PX,
    mobileBeadSizePx: MOBILE_BEAD_SIZE_PX,
    beadGapPx: BEAD_GAP_PX,
    knotAspectRatio: KNOT_ASPECT_RATIO,
    beadStyles: BEAD_STYLES,
    backgroundStyles: BACKGROUND_STYLES,
    soundModes: SOUND_MODES,
    beadImageSrcs: BEAD_IMAGE_SRCS,
    backgroundImageSrcs: BACKGROUND_IMAGE_SRCS,
    backgroundImageByStyle: BACKGROUND_IMAGE_BY_STYLE,
    knotImageSrc: KNOT_IMAGE_SRC,
    terminalBeadStyleSrc: TERMINAL_BEAD_STYLE_SRC,
    terminalTailSrc: TERMINAL_TAIL_SRC,
    stepSoundSrc: STEP_SOUND_SRC,
    mantraSrcM4A: MANTRA_SRC_M4A,
    mantraSrcMP3: MANTRA_SRC_MP3,
    mantraUnlockEarlySec: MANTRA_UNLOCK_EARLY_SEC,
    swipeThresholdPx: SWIPE_THRESHOLD_PX,
    wheelMinStepTriggerRatio: WHEEL_MIN_STEP_TRIGGER_RATIO,
    stateDomainConfig: STATE_DOMAIN_CONFIG,
    dragCommitMinPx: DRAG_COMMIT_MIN_PX,
    wheelMomentumMs: WHEEL_MOMENTUM_MS,
    wheelMinSettleMs: WHEEL_MIN_SETTLE_MS,
    wheelMaxSettleMs: WHEEL_MAX_SETTLE_MS,
    roundLoaderMs: ROUND_LOADER_MS,
    applyTranslations: () => actions.applyTranslations(),
    preloadAssets: () => actions.preloadAssets(),
    clamp,
    isCoarsePointer,
    displayStep: () => actions.displayStep(),
    persistAndRender: () => actions.persistAndRender(),
    applyStepDelta: (deltaSteps) => actions.applyStepDelta(deltaSteps),
    updateCounterText: (forcedStep) => actions.updateCounterText(forcedStep),
    triggerHaptic: () => actions.triggerHaptic(),
    settleWheel: (triggerPx, velocityPxPerMs) => actions.settleWheel(triggerPx, velocityPxPerMs),
    animateWheelTo: (targetIndex, durationMs) => actions.animateWheelTo(targetIndex, durationMs),
    animateOffset: (from, to, durationMs, onTick, onDone) =>
      actions.animateOffset(from, to, durationMs, onTick, onDone),
    stopSettleAnimation: () => actions.stopSettleAnimation(),
    render: () => actions.render(),
    saveState: () => actions.saveState(),
    onReset: () => actions.onReset(),
    onConfirmReset: () => actions.onConfirmReset(),
    onNextRound: () => actions.onNextRound(),
    onWheelLivePreview: (wheelPosition, minIndex, maxIndex) =>
      actions.onWheelLivePreview(wheelPosition, minIndex, maxIndex),
    onLockStateChange: (locks) => {
      const nextMantraLocked = Boolean(locks?.isMantraLocked);
      const nextClickLocked = Boolean(locks?.isClickLocked);
      const changed = nextMantraLocked !== isMantraLocked || nextClickLocked !== isClickLocked;
      isMantraLocked = nextMantraLocked;
      isClickLocked = nextClickLocked;
      if (changed) actions.render();
    },
    getWheelIndex: () => wheelIndex,
    setWheelIndex: (nextValue) => {
      wheelIndex = nextValue;
    },
    getLocks: () => ({ isMantraLocked, isClickLocked }),
    setLocks: (locks) => {
      isMantraLocked = Boolean(locks?.isMantraLocked);
      isClickLocked = Boolean(locks?.isClickLocked);
    },
    getAudioManager: () => audioManager,
    getGestureController: () => gestureController,
    getUIRenderer: () => uiRenderer,
    getAssetsManager: () => assetsManager,
    getControlsManager: () => controlsManager,
    getModalManager: () => modalManager,
    getBeadRenderManager: () => beadRenderManager,
    getRoundFlowController: () => roundFlowController,
    getAudioFlowController: () => audioFlowController,
    getUIFlowController: () => uiFlowController,
    getGestureFlowController: () => gestureFlowController,
    getSettingsFlowController: () => settingsFlowController,
    setRoundFlowController: (controller) => {
      roundFlowController = controller;
    },
    setFlowControllers: (controllers) => {
      audioFlowController = controllers.audioFlowController;
      uiFlowController = controllers.uiFlowController;
      gestureFlowController = controllers.gestureFlowController;
      settingsFlowController = controllers.settingsFlowController;
    },
    setManagers: (managers) => {
      modalManager = managers.modalManager;
      beadRenderManager = managers.beadRenderManager;
      uiRenderer = managers.uiRenderer;
      assetsManager = managers.assetsManager;
      controlsManager = managers.controlsManager;
      audioManager = managers.audioManager;
      gestureController = managers.gestureController;
      wheelMotionController = managers.wheelMotionController;
    },
  });
}

function initStartupLoader() {
  const startupLoader = document.getElementById("startupLoader");
  if (!startupLoader) {
    return;
  }

  const startupImage = document.getElementById("startupLoaderImage");
  const startupFrame = startupLoader.querySelector(".startup-loader-frame");
  const visibleMs = getStartupSpinDurationMs(startupFrame);
  let isHidden = false;
  let hideTimerId = 0;

  const cleanup = () => {
    startupLoader.removeEventListener("pointerdown", hideLoader);
    startupLoader.removeEventListener("click", hideLoader);
    if (hideTimerId) {
      window.clearTimeout(hideTimerId);
      hideTimerId = 0;
    }
  };

  const hideLoader = () => {
    if (isHidden) return;
    isHidden = true;
    cleanup();
    startupLoader.classList.add("is-hidden");
    window.setTimeout(() => {
      startupLoader.style.display = "none";
    }, 450);
  };

  // Keep startup loader duration deterministic: exactly one spin cycle.
  hideTimerId = window.setTimeout(hideLoader, visibleMs);
  startupLoader.addEventListener("pointerdown", hideLoader, { passive: true });
  startupLoader.addEventListener("click", hideLoader, { passive: true });

  // Decode in background only to reduce visual pop, but never block hide timing.
  if (startupImage && typeof startupImage.decode === "function") {
    startupImage.decode().catch(() => {});
  }
}

function getStartupSpinDurationMs(startupFrame) {
  if (!startupFrame || typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
    return 900;
  }

  const animationDurationRaw = window.getComputedStyle(startupFrame).animationDuration || "";
  const firstDuration = animationDurationRaw.split(",")[0]?.trim() || "";
  const match = firstDuration.match(/^([\d.]+)(ms|s)$/i);
  if (!match) return 900;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return 900;
  return match[2].toLowerCase() === "s" ? value * 1000 : value;
}
