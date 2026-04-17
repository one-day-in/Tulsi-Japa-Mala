// Settings flow controller: style/sound option changes.

export function createSettingsFlowController(config) {
  const {
    beadStyles,
    backgroundStyles,
    soundModes,
    getState,
    getAudioManager,
    setLocks,
    persistAndRender,
    closeBeadStyleModal,
    closeSoundModeModal,
  } = config;

  function onBeadStyleOptionClick(event) {
    const option = event.target.closest(".style-option");
    if (!option) return;

    const nextStyle = option.dataset.style;
    if (!beadStyles.includes(nextStyle)) return;

    const state = getState();
    state.beadStyle = nextStyle;
    persistAndRender();
    closeBeadStyleModal();
  }

  function onBackgroundStyleOptionClick(event) {
    const option = event.target.closest(".bg-option");
    if (!option) return;

    const nextStyle = option.dataset.backgroundStyle;
    if (!backgroundStyles.includes(nextStyle)) return;

    const state = getState();
    state.backgroundStyle = nextStyle;
    persistAndRender();
    closeBeadStyleModal();
  }

  function setSoundMode(mode) {
    if (!soundModes.includes(mode)) return;

    const state = getState();
    state.soundMode = mode;

    const audioManager = getAudioManager();
    if (audioManager && typeof audioManager.setSoundMode === "function") {
      audioManager.setSoundMode(mode);
      const locks = audioManager.getLockState ? audioManager.getLockState() : null;
      if (locks) {
        setLocks({
          isMantraLocked: Boolean(locks.isMantraLocked),
          isClickLocked: Boolean(locks.isClickLocked),
        });
      }
    }

    persistAndRender();
  }

  function onSoundModeOptionClick(event) {
    const option = event.target.closest(".sound-option");
    if (!option) return;

    const nextMode = option.dataset.soundMode;
    if (!soundModes.includes(nextMode)) return;

    setSoundMode(nextMode);
    closeSoundModeModal();
  }

  return {
    onBeadStyleOptionClick,
    onBackgroundStyleOptionClick,
    onSoundModeOptionClick,
    setSoundMode,
  };
}
