// Modal manager: centralized open/close flow for modals and round loader.

import { setModalVisibility, setVisibility, setOverlayClass } from "./overlay-manager.js";

export function createModalManager({ els }) {
  let roundLoaderOpen = false;
  let resetConfirmOpen = false;

  function openModal(element) {
    setModalVisibility(element, true);
  }

  function closeModal(element) {
    setModalVisibility(element, false);
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
