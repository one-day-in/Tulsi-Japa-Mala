// UI flow controller: render/update logic with minimal DOM churn.

export function createUIFlowController(config) {
  const {
    els,
    activeStepCount,
    activeBeadMinIndex,
    activeBeadMaxIndex,
    getState,
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
  } = config;

  let lastLivePreviewStep = -1;

  function onWheelLivePreview(wheelPosition, minIndex, maxIndex) {
    const previewBead = clamp(Math.round(wheelPosition), minIndex, maxIndex);
    const previewStep = previewBead - activeBeadMinIndex + 1;
    const uiRenderer = getUIRenderer();

    if (uiRenderer && typeof uiRenderer.updateLivePreviewStep === "function") {
      const changed = uiRenderer.updateLivePreviewStep(previewStep);
      if (changed) {
        lastLivePreviewStep = previewStep;
      }
      return;
    }

    if (previewStep === lastLivePreviewStep) return;
    lastLivePreviewStep = previewStep;
    els.displayValue.textContent = String(previewStep);
  }

  function syncNextRoundButtonState(step) {
    const uiRenderer = getUIRenderer();
    const modalManager = getModalManager();

    if (uiRenderer && typeof uiRenderer.syncNextRoundButton === "function") {
      uiRenderer.syncNextRoundButton(step, modalManager.isRoundLoaderOpen());
      return;
    }

    if (!els.nextRoundInlineBtn) return;
    const isVisible = step === activeStepCount && !modalManager.isRoundLoaderOpen();
    els.nextRoundInlineBtn.classList.toggle("is-visible", isVisible);
    els.nextRoundInlineBtn.disabled = !isVisible;
    els.nextRoundInlineBtn.setAttribute("aria-hidden", String(!isVisible));
  }

  function updateCounterText(forcedStep) {
    const modalManager = getModalManager();
    const state = getState();
    const uiRenderer = getUIRenderer();
    const step = forcedStep ?? displayStep();
    lastLivePreviewStep = step;

    if (uiRenderer && typeof uiRenderer.updateCounter === "function") {
      uiRenderer.updateCounter({
        round: state.round,
        step,
        isRoundLoaderOpen: modalManager.isRoundLoaderOpen(),
      });
      return;
    }

    els.roundValue.textContent = String(state.round);
    els.displayValue.textContent = String(step);
    if (els.displayMax) {
      els.displayMax.textContent = String(activeStepCount);
    }
    syncNextRoundButtonState(step);
  }

  function soundModeLabel(mode) {
    if (mode === "off") return t("options.soundOff").toLowerCase();
    if (mode === "mantra") return t("options.soundMantra").toLowerCase();
    return t("options.soundClick").toLowerCase();
  }

  function renderSoundModeButton() {
    const state = getState();
    const soundAria = `${t("dynamic.soundModePrefix")}: ${soundModeLabel(state.soundMode)}`;
    const soundIcon = getSoundIconSvg(state.soundMode);
    const uiRenderer = getUIRenderer();

    if (uiRenderer && typeof uiRenderer.renderSoundButton === "function") {
      uiRenderer.renderSoundButton({
        soundMode: state.soundMode,
        soundLabelPrefix: t("dynamic.soundModePrefix"),
        soundModeLabelText: soundModeLabel(state.soundMode),
      });
      return;
    }

    els.soundModeBtn.dataset.soundMode = state.soundMode;
    els.soundModeBtn.setAttribute("aria-label", soundAria);
    els.soundModeBtn.innerHTML = soundIcon;
  }

  function render() {
    const state = getState();
    const beadRenderManager = getBeadRenderManager();
    const step = displayStep();

    updateCounterText(step);
    els.beadStyleBtn.setAttribute("aria-label", `${t("dynamic.beadStylePrefix")}: ${getStyleLabel(state.beadStyle)}`);
    renderSoundModeButton();
    applyVisualStyles();
    syncBeadStyleOptionState();
    syncBackgroundStyleOptionState();
    syncSoundModeOptionState();
    syncNextRoundButtonState(step);

    beadRenderManager.refreshMetrics();
    setWheelIndex(clamp(state.currentBead, activeBeadMinIndex, activeBeadMaxIndex));
    beadRenderManager.renderNow(getWheelIndex());
  }

  return {
    onWheelLivePreview,
    updateCounterText,
    syncNextRoundButtonState,
    renderSoundModeButton,
    render,
  };
}
