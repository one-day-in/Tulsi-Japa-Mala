import { createI18NManager } from "../ui/i18n-manager.js";
import { loadPersistedState, savePersistedState } from "../state/state-persistence.js";

export function initI18nManager(data) {
  return createI18NManager({
    data,
    fallbackLocale: "en",
  });
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function isCoarsePointer() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
}

export function loadRuntimeState({ storageKey, hydrateState, domainConfig }) {
  return loadPersistedState({
    storageKey,
    hydrateState,
    domainConfig,
  });
}

export function saveRuntimeState({ storageKey, state }) {
  savePersistedState({
    storageKey,
    state,
  });
}
