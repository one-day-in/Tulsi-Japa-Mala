// Audio manager: handles unlock, click/mantra playback and lock states.

export function createAudioManager(config) {
  let stepAudioEl = null;
  let mantraAudioEl = null;
  let unlockAudioEl = null;
  let isAudioUnlockedByGesture = false;
  let isMantraLocked = false;
  let isClickLocked = false;

  // Tiny silent WAV used only to unlock media on iOS/Safari gesture.
  const SILENT_WAV_DATA_URI =
    "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YRAAAAAAAAAAAAAAAAAAAAAA";

  function notify() {
    if (typeof config.onLockStateChange === "function") {
      config.onLockStateChange({
        isMantraLocked,
        isClickLocked,
      });
    }
  }

  function setMantraLocked(nextValue) {
    if (isMantraLocked === nextValue) return;
    isMantraLocked = nextValue;
    notify();
  }

  function setClickLocked(nextValue) {
    if (isClickLocked === nextValue) return;
    isClickLocked = nextValue;
    notify();
  }

  function initStepAudio() {
    if (stepAudioEl) return;

    try {
      stepAudioEl = new Audio(config.stepSoundSrc);
      stepAudioEl.preload = "auto";
      stepAudioEl.setAttribute("playsinline", "true");
      stepAudioEl.addEventListener("ended", () => setClickLocked(false));
      stepAudioEl.addEventListener("error", () => setClickLocked(false));
    } catch {
      stepAudioEl = null;
    }
  }

  function initMantraAudio() {
    if (mantraAudioEl) return;

    try {
      mantraAudioEl = new Audio();
      mantraAudioEl.preload = "auto";
      mantraAudioEl.setAttribute("playsinline", "true");
      mantraAudioEl.src = config.mantraSrcM4A;
      mantraAudioEl.addEventListener("ended", () => setMantraLocked(false));
      mantraAudioEl.addEventListener("error", () => setMantraLocked(false));
      mantraAudioEl.addEventListener("timeupdate", onMantraProgress);
    } catch {
      mantraAudioEl = null;
    }
  }

  function initUnlockAudio() {
    if (unlockAudioEl) return;
    try {
      unlockAudioEl = new Audio(SILENT_WAV_DATA_URI);
      unlockAudioEl.preload = "auto";
      unlockAudioEl.setAttribute("playsinline", "true");
    } catch {
      unlockAudioEl = null;
    }
  }

  function onMantraProgress() {
    if (!isMantraLocked || !mantraAudioEl) return;
    const duration = mantraAudioEl.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;
    if (mantraAudioEl.currentTime >= Math.max(0, duration - config.mantraUnlockEarlySec)) {
      setMantraLocked(false);
    }
  }

  function unlockAudioFromGesture() {
    if (isAudioUnlockedByGesture) return;
    isAudioUnlockedByGesture = true;

    initStepAudio();
    initUnlockAudio();
    if (!unlockAudioEl) return;

    try {
      unlockAudioEl.muted = true;
      unlockAudioEl.volume = 0;
      unlockAudioEl.currentTime = 0;
      const p = unlockAudioEl.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          unlockAudioEl.pause();
          unlockAudioEl.currentTime = 0;
          unlockAudioEl.muted = false;
          unlockAudioEl.volume = 1;
        }).catch(() => {
          unlockAudioEl.muted = false;
          unlockAudioEl.volume = 1;
        });
        return;
      }
    } catch {
      // ignore
    }

    unlockAudioEl.muted = false;
    unlockAudioEl.volume = 1;
  }

  function bindFirstTouchAudioUnlock(target) {
    const safeTarget = target || document.body;
    const unlock = () => {
      unlockAudioFromGesture();
    };

    safeTarget.addEventListener("touchstart", unlock, { passive: true, once: true, capture: true });
    safeTarget.addEventListener("pointerdown", unlock, { passive: true, once: true, capture: true });
    safeTarget.addEventListener("click", unlock, { passive: true, once: true, capture: true });
  }

  function playStepSound(soundMode) {
    if (soundMode !== "click") return false;
    initStepAudio();
    if (!stepAudioEl) return false;

    try {
      setClickLocked(true);
      stepAudioEl.pause();
      stepAudioEl.currentTime = 0;
      const maybePromise = stepAudioEl.play();
      if (maybePromise && typeof maybePromise.catch === "function") {
        maybePromise.catch(() => {
          setClickLocked(false);
        });
      }
      return true;
    } catch {
      setClickLocked(false);
      return false;
    }
  }

  function playMantraForStep(soundMode) {
    if (soundMode !== "mantra") return false;
    initMantraAudio();
    if (!mantraAudioEl) return false;

    setMantraLocked(true);

    try {
      mantraAudioEl.currentTime = 0;
      const maybe = mantraAudioEl.play();
      if (maybe && typeof maybe.catch === "function") {
        maybe.catch(() => {
          if (mantraAudioEl.src.endsWith(".m4a")) {
            mantraAudioEl.src = config.mantraSrcMP3;
            mantraAudioEl.load();
            const retry = mantraAudioEl.play();
            if (retry && typeof retry.catch === "function") {
              retry.catch(() => setMantraLocked(false));
            }
          } else {
            setMantraLocked(false);
          }
        });
      }
      return true;
    } catch {
      setMantraLocked(false);
      return false;
    }
  }

  function stopStepPlayback() {
    if (!stepAudioEl) return;
    try {
      stepAudioEl.pause();
      stepAudioEl.currentTime = 0;
    } catch {
      // ignore
    }
    setClickLocked(false);
  }

  function stopMantraPlayback() {
    if (!mantraAudioEl) {
      setMantraLocked(false);
      return;
    }

    try {
      mantraAudioEl.pause();
      mantraAudioEl.currentTime = 0;
    } catch {
      // ignore
    }
    setMantraLocked(false);
  }

  function stopAll() {
    stopMantraPlayback();
    stopStepPlayback();
  }

  function setSoundMode(mode) {
    if (mode === "mantra") {
      initMantraAudio();
      initStepAudio();
      setClickLocked(false);
      return;
    }

    stopAll();
  }

  function isStepBlocked({ isRoundLoaderOpen, isResetConfirmOpen, soundMode }) {
    if (isRoundLoaderOpen) return true;
    if (isResetConfirmOpen) return true;
    if (isMantraLocked) return true;
    if (soundMode === "click" && isClickLocked) return true;
    return false;
  }

  function getLockState() {
    return {
      isMantraLocked,
      isClickLocked,
    };
  }

  return {
    initStepAudio,
    bindFirstTouchAudioUnlock,
    unlockAudioFromGesture,
    playStepSound,
    playMantraForStep,
    stopStepPlayback,
    stopMantraPlayback,
    stopAll,
    setSoundMode,
    isStepBlocked,
    getLockState,
  };
}
