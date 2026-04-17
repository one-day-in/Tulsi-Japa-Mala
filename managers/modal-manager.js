// Modal manager: centralized open/close flow for modals and round loader.

import { setModalVisibility, setVisibility, setOverlayClass } from "./overlay-manager.js";

export function createModalManager({ els }) {
  let roundLoaderOpen = false;
  let resetConfirmOpen = false;
  const closeTimers = new WeakMap();

  function clearCloseTimer(element) {
    const timerId = closeTimers.get(element);
    if (!timerId) return;
    window.clearTimeout(timerId);
    closeTimers.delete(element);
  }

  function getModalCloseDurationMs() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return 220;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
    return 220;
  }

  function openModal(element) {
    if (!element) return;
    clearCloseTimer(element);
    element.classList.remove("is-closing");
    setModalVisibility(element, true);

    // Ensure transitions run from closed -> open state.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.classList.add("is-open");
      });
    });
  }

  function closeModal(element) {
    if (!element || element.classList.contains("hidden")) return;
    clearCloseTimer(element);
    element.classList.remove("is-open");
    element.classList.add("is-closing");

    const delayMs = getModalCloseDurationMs();
    const timerId = window.setTimeout(() => {
      element.classList.remove("is-closing");
      setModalVisibility(element, false);
      closeTimers.delete(element);
    }, delayMs);
    closeTimers.set(element, timerId);
  }

  function openBeadStyleModal() {
    openModal(els.beadStyleModal);
  }

  function closeBeadStyleModal() {
    closeModal(els.beadStyleModal);
  }

  function onBeadStyleBackdropClick(event) {
    if (event.target === els.beadStyleModal) {
      closeBeadStyleModal();
    }
  }

  function openSoundModeModal() {
    openModal(els.soundModeModal);
  }

  function closeSoundModeModal() {
    closeModal(els.soundModeModal);
  }

  function onSoundModeBackdropClick(event) {
    if (event.target === els.soundModeModal) {
      closeSoundModeModal();
    }
  }

  function openResetConfirmModal() {
    if (roundLoaderOpen) return;
    resetConfirmOpen = true;
    openModal(els.resetConfirmModal);
  }

  function closeResetConfirmModal() {
    if (!resetConfirmOpen) return;
    resetConfirmOpen = false;
    closeModal(els.resetConfirmModal);
  }

  function onResetConfirmBackdropClick(event) {
    if (event.target === els.resetConfirmModal) {
      closeResetConfirmModal();
    }
  }

  function openRoundLoader() {
    if (roundLoaderOpen || !els.roundLoader) return;
    roundLoaderOpen = true;
    setVisibility(els.roundLoader, true);
    setOverlayClass("round-loader-open", true);
  }

  function closeRoundLoader() {
    if (!roundLoaderOpen || !els.roundLoader) return;
    roundLoaderOpen = false;
    setVisibility(els.roundLoader, false);
    setOverlayClass("round-loader-open", false);
  }

  function onEscapeKey(event) {
    if (event.key !== "Escape") return;
    if (!els.beadStyleModal.classList.contains("hidden")) closeBeadStyleModal();
    if (!els.soundModeModal.classList.contains("hidden")) closeSoundModeModal();
    if (!els.resetConfirmModal.classList.contains("hidden")) closeResetConfirmModal();
  }

  function isRoundLoaderOpen() {
    return roundLoaderOpen;
  }

  function isResetConfirmOpen() {
    return resetConfirmOpen;
  }

  return {
    openBeadStyleModal,
    closeBeadStyleModal,
    onBeadStyleBackdropClick,
    openSoundModeModal,
    closeSoundModeModal,
    onSoundModeBackdropClick,
    openResetConfirmModal,
    closeResetConfirmModal,
    onResetConfirmBackdropClick,
    openRoundLoader,
    closeRoundLoader,
    onEscapeKey,
    isRoundLoaderOpen,
    isResetConfirmOpen,
  };
}
