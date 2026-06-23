// UI renderer: lightweight DOM updates for counter and action button visibility.

export function createUIRenderer(config) {
  const { els, activeStepCount, getSoundIconSvg } = config;
  const cache = {
    round: null,
    displayStep: null,
    nextRoundVisible: null,
    beadsAreaStep: null,
    soundMode: null,
    soundAria: null,
    soundIcon: null,
  };

  function syncBeadsAreaValue(step) {
    if (!els.beadsArea || cache.beadsAreaStep === step) return;
    els.beadsArea.setAttribute("aria-valuenow", String(step));
    els.beadsArea.setAttribute("aria-valuetext", `${step}/${activeStepCount}`);
    cache.beadsAreaStep = step;
  }

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

    syncBeadsAreaValue(step);
    syncNextRoundButton(step, isRoundLoaderOpen);
  }

  function updateLivePreviewStep(step) {
    const changed = cache.displayStep !== step;
    if (changed) {
      els.displayValue.textContent = String(step);
      cache.displayStep = step;
    }
    syncBeadsAreaValue(step);
    return changed;
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
