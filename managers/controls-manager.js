// Controls manager: options state sync and icon rendering for controls.

import { getRoundLoaderIcon } from "../ui/svg-icons.js";

export function createControlsManager(config) {
  const {
    beadStyleOptionsEl,
    backgroundStyleOptionsEl,
    soundModeOptionsEl,
    soundModeBtnEl,
    roundLoaderSpinnerEl,
    nextRoundInlineBtnEl,
    getSoundIconSvg,
  } = config;

  function syncOptionState(container, selector, attrName, currentValue) {
    if (!container) return;
    const options = container.querySelectorAll(selector);
    options.forEach((option) => {
      const isActive = option.dataset[attrName] === currentValue;
      option.classList.toggle("active", isActive);
      option.setAttribute("aria-pressed", String(isActive));
    });
  }

  function syncBeadStyleOptionState(style) {
    syncOptionState(beadStyleOptionsEl, ".style-option", "style", style);
  }

  function syncBackgroundStyleOptionState(style) {
    syncOptionState(backgroundStyleOptionsEl, ".bg-option", "backgroundStyle", style);
  }

  function syncSoundModeOptionState(mode) {
    syncOptionState(soundModeOptionsEl, ".sound-option", "soundMode", mode);
  }

  function renderSoundModeOptionIcons() {
    if (!soundModeOptionsEl) return;
    const options = soundModeOptionsEl.querySelectorAll(".sound-option");
    options.forEach((option) => {
      const mode = option.dataset.soundMode;
      const iconSlot = option.querySelector(".sound-icon");
      if (!iconSlot) return;
      iconSlot.innerHTML = getSoundIconSvg(mode);
    });
  }

  function renderRoundLoaderIcon() {
    if (!roundLoaderSpinnerEl) return;
    roundLoaderSpinnerEl.innerHTML = getRoundLoaderIcon();
  }

  function renderNextRoundButtonIcon() {
    if (!nextRoundInlineBtnEl) return;
    nextRoundInlineBtnEl.innerHTML = getRoundLoaderIcon();
  }

  function setSoundButtonState(mode, ariaLabel, iconSvg) {
    if (!soundModeBtnEl) return;
    soundModeBtnEl.dataset.soundMode = mode;
    soundModeBtnEl.setAttribute("aria-label", ariaLabel);
    soundModeBtnEl.innerHTML = iconSvg;
  }

  return {
    syncBeadStyleOptionState,
    syncBackgroundStyleOptionState,
    syncSoundModeOptionState,
    renderSoundModeOptionIcons,
    renderRoundLoaderIcon,
    renderNextRoundButtonIcon,
    setSoundButtonState,
  };
}
