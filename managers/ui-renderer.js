// UI renderer: lightweight DOM updates for counter and action button visibility.

export function createUIRenderer(config) {
  const { els, activeStepCount, getSoundIconSvg } = config;
  const cache = {
    round: null,
    displayStep: null,
    nextRoundVisible: null,
    soundMode: null,
    soundAria: null,
    soundIcon: null,
  };

  function syncNextRoundButton(step, isRoundLoaderOpen) {
    if (!els.nextRoundInlineBtn) return;
    const isVisible = step === activeStepCount && !isRoundLoaderOpen;
    if (cache.nextRoundVisible !== isVisible) {
      els.nextRoundInlineBtn.classList.toggle("is-visible", isVisible);
      els.nextRoundInlineBtn.disabled = !isVisible;
      els.nextRoundInlineBtn.setAttribute("aria-hidden", String(!isVisible));
      cache.nextRoundVisible = isVisible;
    }
  }

  function updateCounter({ round, step, isRoundLoaderOpen }) {
    if (cache.round !== round) {
      els.roundValue.textContent = String(round);
      cache.round = round;
    }

    if (cache.displayStep !== step) {
      els.displayValue.textContent = String(step);
      cache.displayStep = step;
    }

    if (els.displayMax) {
      els.displayMax.textContent = String(activeStepCount);
    }

    syncNextRoundButton(step, isRoundLoaderOpen);
  }

  function updateLivePreviewStep(step) {
    if (cache.displayStep === step) return false;
    els.displayValue.textContent = String(step);
    cache.displayStep = step;
    return true;
  }

  function renderSoundButton({ soundMode, soundLabelPrefix, soundModeLabelText }) {
    const nextAria = `${soundLabelPrefix}: ${soundModeLabelText}`;
    if (cache.soundMode !== soundMode) {
      els.soundModeBtn.dataset.soundMode = soundMode;
      cache.soundMode = soundMode;
    }

    if (cache.soundAria !== nextAria) {
      els.soundModeBtn.setAttribute("aria-label", nextAria);
      cache.soundAria = nextAria;
    }

    const nextIcon = getSoundIconSvg(soundMode);
    if (cache.soundIcon !== nextIcon) {
      els.soundModeBtn.innerHTML = nextIcon;
      cache.soundIcon = nextIcon;
    }
  }

  return {
    syncNextRoundButton,
    updateCounter,
    updateLivePreviewStep,
    renderSoundButton,
  };
}
