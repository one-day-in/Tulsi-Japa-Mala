import { getDisplayStep, applyStepDelta as applyStateStepDelta } from "../state/state-manager.js";
import { saveRuntimeState } from "./runtime-utils.js";

export function createRuntimeActions(ctx) {
  function getFeedbackText() {
    return ctx.els.feedbackText?.value.trim() ?? "";
  }

  function setFeedbackStatus(message) {
    if (!ctx.els.feedbackStatus) return;
    ctx.els.feedbackStatus.textContent = message;
  }

  async function copyFeedbackText(text) {
    if (!text) {
      setFeedbackStatus(ctx.t("feedback.empty"));
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setFeedbackStatus(ctx.t("feedback.copied"));
      return true;
    } catch {
      setFeedbackStatus(ctx.t("feedback.copyFailed"));
      return false;
    }
  }

  function buildFeedbackBody(text) {
    return `${text}\n\n---\nTulsi Japa Mala feedback`;
  }

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

    onFeedbackEmail() {
      const text = getFeedbackText();
      if (!text) {
        setFeedbackStatus(ctx.t("feedback.empty"));
        return;
      }

      if (!ctx.feedbackEmail) {
        setFeedbackStatus(ctx.t("feedback.emailUnavailable"));
        return;
      }

      const subject = encodeURIComponent(ctx.feedbackEmailSubject);
      const body = encodeURIComponent(buildFeedbackBody(text));
      window.location.href = `mailto:${ctx.feedbackEmail}?subject=${subject}&body=${body}`;
      setFeedbackStatus(ctx.t("feedback.emailOpened"));
    },

    async onFeedbackTelegram() {
      const text = getFeedbackText();
      if (!text) {
        setFeedbackStatus(ctx.t("feedback.empty"));
        return;
      }

      if (!ctx.feedbackTelegramUrl) {
        setFeedbackStatus(ctx.t("feedback.telegramUnavailable"));
        return;
      }

      await copyFeedbackText(text);
      window.open(ctx.feedbackTelegramUrl, "_blank", "noopener,noreferrer");
      setFeedbackStatus(ctx.t("feedback.telegramOpened"));
    },

    async onFeedbackCopy() {
      await copyFeedbackText(getFeedbackText());
    },

    onBeadsKeyDown(event) {
      const audioFlowController = ctx.getAudioFlowController();
      if (audioFlowController?.isStepBlocked()) return;

      const keyStepMap = {
        ArrowDown: 1,
        ArrowRight: 1,
        PageDown: 10,
        ArrowUp: -1,
        ArrowLeft: -1,
        PageUp: -10,
      };

      const state = ctx.getState();
      let deltaSteps = keyStepMap[event.key] ?? 0;
      if (event.key === "Home") {
        deltaSteps = ctx.activeBeadMinIndex - state.currentBead;
      } else if (event.key === "End") {
        deltaSteps = ctx.stateDomainConfig.activeBeadMaxIndex - state.currentBead;
      }

      if (deltaSteps === 0) return;
      event.preventDefault();

      this.stopSettleAnimation();
      audioFlowController?.initStepAudio();

      const appliedSteps = this.applyStepDelta(deltaSteps);
      if (appliedSteps === 0) return;

      ctx.setWheelIndex(state.currentBead);
      this.saveState();
      this.updateCounterText(this.displayStep());
      ctx.requestRender(state.currentBead);
      this.triggerHaptic();
      audioFlowController?.onStepCommitted();
    },

    displayStep() {
      return getDisplayStep(ctx.getState().currentBead, ctx.activeBeadMinIndex);
    },

    render() {
      const uiFlowController = ctx.getUIFlowController();
      if (!uiFlowController) return;
      uiFlowController.render();
      this.applyFeedbackContactState();
    },

    persistAndRender() {
      this.saveState();
      this.render();
    },

    applyTranslations() {
      ctx.i18nManager.applyTranslations(ctx.els);
      this.applyFeedbackContactState();
    },

    applyFeedbackContactState() {
      if (ctx.els.feedbackEmailBtn) {
        ctx.els.feedbackEmailBtn.disabled = !ctx.feedbackEmail;
      }
      if (ctx.els.feedbackTelegramBtn) {
        ctx.els.feedbackTelegramBtn.disabled = !ctx.feedbackTelegramUrl;
      }
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
