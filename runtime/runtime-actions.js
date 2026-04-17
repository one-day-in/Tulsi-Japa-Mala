import { getDisplayStep, applyStepDelta as applyStateStepDelta } from "../state/state-manager.js";
import { saveRuntimeState } from "./runtime-utils.js";

export function createRuntimeActions(ctx) {
  return {
    onReset() {
      const roundFlowController = ctx.getRoundFlowController();
      if (!roundFlowController) return;
      roundFlowController.onReset();
    },

    onConfirmReset() {
      const roundFlowController = ctx.getRoundFlowController();
      if (!roundFlowController) return;
      roundFlowController.onConfirmReset();
    },

    onNextRound() {
      const roundFlowController = ctx.getRoundFlowController();
      if (!roundFlowController) return;
      roundFlowController.onNextRound();
    },

    displayStep() {
      return getDisplayStep(ctx.getState().currentBead, ctx.activeBeadMinIndex);
    },

    render() {
      const uiFlowController = ctx.getUIFlowController();
      if (!uiFlowController) return;
      uiFlowController.render();
    },

    persistAndRender() {
      this.saveState();
      this.render();
    },

    applyTranslations() {
      ctx.i18nManager.applyTranslations(ctx.els);
    },

    saveState() {
      saveRuntimeState({
        storageKey: ctx.storageKey,
        state: ctx.getState(),
      });
    },

    onWheelLivePreview(wheelPosition, minIndex, maxIndex) {
      const uiFlowController = ctx.getUIFlowController();
      if (!uiFlowController) return;
      uiFlowController.onWheelLivePreview(wheelPosition, minIndex, maxIndex);
    },

    animateWheelTo(targetIndex, durationMs) {
      ctx.getWheelMotionController()?.animateWheelTo(targetIndex, durationMs);
    },

    animateOffset(from, to, durationMs, onTick, onDone) {
      const wheelMotionController = ctx.getWheelMotionController();
      if (!wheelMotionController) {
        onTick(to);
        if (onDone) onDone();
        return;
      }
      wheelMotionController.animateOffset(from, to, durationMs, onTick, onDone);
    },

    stopSettleAnimation() {
      ctx.getWheelMotionController()?.stopSettleAnimation();
    },

    applyStepDelta(deltaSteps) {
      return applyStateStepDelta(ctx.getState(), deltaSteps, ctx.stateDomainConfig);
    },

    updateCounterText(forcedStep) {
      const uiFlowController = ctx.getUIFlowController();
      if (!uiFlowController) return;
      uiFlowController.updateCounterText(forcedStep);
    },

    triggerHaptic() {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(ctx.hapticMs);
      }
      ctx.getAudioFlowController()?.playStepSound();
    },

    settleWheel(triggerPx, velocityPxPerMs) {
      const roundFlowController = ctx.getRoundFlowController();
      if (!roundFlowController) return;
      roundFlowController.settleWheel(triggerPx, velocityPxPerMs);
    },

    preloadAssets() {
      ctx.getAssetsManager().preloadAll();
    },
  };
}
