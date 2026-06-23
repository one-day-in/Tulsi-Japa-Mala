// Modal manager: centralized open/close flow for modals and round loader.

import { setModalVisibility, setVisibility, setOverlayClass } from "./overlay-manager.js";

export function createModalManager({ els }) {
  let roundLoaderOpen = false;
  let resetConfirmOpen = false;
  let activeModal = null;
  const closeTimers = new WeakMap();
  const returnFocusTargets = new WeakMap();

  function getFocusableElements(element) {
    if (!element) return [];
    return Array.from(
      element.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );
  }

  function focusFirstControl(element) {
    const preferred = element?.querySelector("[data-initial-focus]");
    const [first] = preferred ? [preferred] : getFocusableElements(element);
    first?.focus();
  }

  function restoreFocus(element) {
    const target = returnFocusTargets.get(element);
    returnFocusTargets.delete(element);
    if (target && typeof target.focus === "function" && target.isConnected !== false) {
      target.focus();
    }
  }

  function trapFocus(event) {
    if (event.key !== "Tab" || !activeModal) return;
    const focusable = getFocusableElements(activeModal);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

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
    const currentFocus = document.activeElement;
    if (currentFocus && currentFocus !== document.body) {
      returnFocusTargets.set(element, currentFocus);
    }
    activeModal = element;
    element.classList.remove("is-closing");
    setModalVisibility(element, true);

    // Ensure transitions run from closed -> open state.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.classList.add("is-open");
        focusFirstControl(element);
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
      if (activeModal === element) activeModal = null;
      restoreFocus(element);
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

  function openFeedbackModal() {
    if (roundLoaderOpen) return;
    openModal(els.feedbackModal);
  }

  function closeFeedbackModal() {
    closeModal(els.feedbackModal);
  }

  function onFeedbackBackdropClick(event) {
    if (event.target === els.feedbackModal) {
      closeFeedbackModal();
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
    trapFocus(event);
    if (event.key !== "Escape") return;
    if (!els.beadStyleModal.classList.contains("hidden")) closeBeadStyleModal();
    if (!els.soundModeModal.classList.contains("hidden")) closeSoundModeModal();
    if (!els.feedbackModal.classList.contains("hidden")) closeFeedbackModal();
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
    openFeedbackModal,
    closeFeedbackModal,
    onFeedbackBackdropClick,
    openRoundLoader,
    closeRoundLoader,
    onEscapeKey,
    isRoundLoaderOpen,
    isResetConfirmOpen,
  };
}
