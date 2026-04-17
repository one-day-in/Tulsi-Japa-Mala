// Event wiring module: binds all UI and gesture events.

export function bindZoomGuards() {
  // iOS Safari-specific gesture events (pinch/double-tap zoom paths).
  const prevent = (event) => {
    event.preventDefault();
  };

  document.addEventListener("gesturestart", prevent, { passive: false });
  document.addEventListener("gesturechange", prevent, { passive: false });
  document.addEventListener("gestureend", prevent, { passive: false });
  document.addEventListener("dblclick", prevent, { passive: false });
}

export function bindAppEvents({ els, handlers }) {
  const {
    onReset,
    onOpenBeadStyle,
    onOpenSoundMode,
    onCloseBeadStyle,
    onBeadStyleBackdropClick,
    onBeadStyleOptionClick,
    onBackgroundStyleOptionClick,
    onCloseSoundMode,
    onSoundModeBackdropClick,
    onSoundModeOptionClick,
    onCloseResetConfirm,
    onConfirmReset,
    onResetConfirmBackdropClick,
    onNextRound,
    onEscapeKey,
    onInitStepAudio,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onResize,
  } = handlers;

  els.resetBtn.addEventListener("click", onReset);
  els.beadStyleBtn.addEventListener("click", onOpenBeadStyle);
  els.soundModeBtn.addEventListener("click", onOpenSoundMode);
  els.closeBeadStyleModalBtn.addEventListener("click", onCloseBeadStyle);
  els.beadStyleModal.addEventListener("click", onBeadStyleBackdropClick);
  els.beadStyleOptions.addEventListener("click", onBeadStyleOptionClick);
  els.backgroundStyleOptions.addEventListener("click", onBackgroundStyleOptionClick);
  els.closeSoundModeModalBtn.addEventListener("click", onCloseSoundMode);
  els.soundModeModal.addEventListener("click", onSoundModeBackdropClick);
  els.soundModeOptions.addEventListener("click", onSoundModeOptionClick);
  els.closeResetConfirmModalBtn.addEventListener("click", onCloseResetConfirm);
  els.cancelResetBtn.addEventListener("click", onCloseResetConfirm);
  els.confirmResetBtn.addEventListener("click", onConfirmReset);
  els.resetConfirmModal.addEventListener("click", onResetConfirmBackdropClick);
  els.nextRoundInlineBtn.addEventListener("click", onNextRound);
  document.addEventListener("keydown", onEscapeKey);
  els.beadsArea.addEventListener("touchstart", onInitStepAudio, { passive: true });

  els.beadsArea.addEventListener("pointerdown", onPointerDown);
  els.beadsArea.addEventListener("pointermove", onPointerMove);
  els.beadsArea.addEventListener("pointerup", onPointerUp);
  els.beadsArea.addEventListener("pointercancel", onPointerCancel);

  window.addEventListener("resize", onResize);
}
