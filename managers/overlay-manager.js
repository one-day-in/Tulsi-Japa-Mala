// Overlay manager: unified show/hide behavior and body class coordination.

let modalDepth = 0;

export function setVisibility(element, visible) {
  if (!element) return false;
  const isVisible = !element.classList.contains("hidden");
  if (isVisible === visible) return false;
  element.classList.toggle("hidden", !visible);
  element.setAttribute("aria-hidden", String(!visible));
  return true;
}

export function setModalVisibility(element, visible) {
  const changed = setVisibility(element, visible);
  if (!changed) return;

  if (visible) {
    modalDepth += 1;
  } else {
    modalDepth = Math.max(0, modalDepth - 1);
  }

  document.body.classList.toggle("modal-open", modalDepth > 0);
}

export function setOverlayClass(bodyClass, visible) {
  if (!bodyClass) return;
  document.body.classList.toggle(bodyClass, visible);
}
