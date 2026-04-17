// Audio flow controller: app-level audio behavior and lock integration.

export function createAudioFlowController(config) {
  const {
    getAudioManager,
    getModalManager,
    getSoundMode,
    getLocks,
    setLocks,
    onPlayMantraStep,
  } = config;

  function playStepSound() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.playStepSound !== "function") return;
    audioManager.playStepSound(getSoundMode());
  }

  function initStepAudio() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.initStepAudio !== "function") return;
    audioManager.initStepAudio();
  }

  function bindFirstTouchAudioUnlock() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.bindFirstTouchAudioUnlock !== "function") return;
    audioManager.bindFirstTouchAudioUnlock(document.body);
  }

  function unlockAudioFromGesture() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.unlockAudioFromGesture !== "function") return;
    audioManager.unlockAudioFromGesture();
  }

  function playStepSoundElement() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.playStepSound !== "function") return false;
    return audioManager.playStepSound("click");
  }

  function onStepCommitted() {
    if (getSoundMode() !== "mantra") return;
    onPlayMantraStep();
  }

  function initMantraAudio() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.setSoundMode !== "function") return;
    audioManager.setSoundMode("mantra");
  }

  function playMantraForStep() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.playMantraForStep !== "function") return;
    audioManager.playMantraForStep(getSoundMode());
  }

  function stopMantraPlayback() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.stopMantraPlayback !== "function") {
      const locks = getLocks();
      setLocks({
        isMantraLocked: false,
        isClickLocked: locks.isClickLocked,
      });
      return;
    }

    audioManager.stopMantraPlayback();
    const locks = audioManager.getLockState ? audioManager.getLockState() : null;
    if (locks) {
      setLocks({
        isMantraLocked: Boolean(locks.isMantraLocked),
        isClickLocked: getLocks().isClickLocked,
      });
    }
  }

  function stopStepPlayback() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.stopStepPlayback !== "function") return;
    audioManager.stopStepPlayback();
    const locks = audioManager.getLockState ? audioManager.getLockState() : null;
    if (locks) {
      setLocks({
        isMantraLocked: getLocks().isMantraLocked,
        isClickLocked: Boolean(locks.isClickLocked),
      });
    }
  }

  function onMantraEnded() {
    const audioManager = getAudioManager();
    if (!audioManager || typeof audioManager.stopMantraPlayback !== "function") return;
    audioManager.stopMantraPlayback();
  }

  function isStepBlocked() {
    const audioManager = getAudioManager();
    const modalManager = getModalManager();
    const { isMantraLocked, isClickLocked } = getLocks();

    if (audioManager && typeof audioManager.isStepBlocked === "function") {
      return audioManager.isStepBlocked({
        isRoundLoaderOpen: modalManager.isRoundLoaderOpen(),
        isResetConfirmOpen: modalManager.isResetConfirmOpen(),
        soundMode: getSoundMode(),
      });
    }

    if (modalManager.isRoundLoaderOpen()) return true;
    if (modalManager.isResetConfirmOpen()) return true;
    if (isMantraLocked) return true;
    if (getSoundMode() === "click" && isClickLocked) return true;
    return false;
  }

  return {
    playStepSound,
    initStepAudio,
    bindFirstTouchAudioUnlock,
    unlockAudioFromGesture,
    playStepSoundElement,
    onStepCommitted,
    initMantraAudio,
    playMantraForStep,
    stopMantraPlayback,
    stopStepPlayback,
    onMantraEnded,
    isStepBlocked,
  };
}
