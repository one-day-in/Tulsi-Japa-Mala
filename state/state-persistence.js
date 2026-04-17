// Persistence module for app state hydration and save.

export function loadPersistedState({ storageKey, hydrateState, domainConfig, storage = window.localStorage }) {
  const raw = storage.getItem(storageKey);
  return hydrateState(raw, domainConfig);
}

export function savePersistedState({ storageKey, state, storage = window.localStorage }) {
  storage.setItem(storageKey, JSON.stringify(state));
}
