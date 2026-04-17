function isLikelyMobile() {
  const coarse =
    typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  const touchPoints = typeof navigator !== "undefined" ? Number(navigator.maxTouchPoints || 0) : 0;
  const shortestSide = Math.min(window.innerWidth || 0, window.innerHeight || 0);
  return (coarse || touchPoints > 0) && shortestSide <= 1200;
}

function isLandscape() {
  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(orientation: landscape)").matches;
  }
  return (window.innerWidth || 0) > (window.innerHeight || 0);
}

function detectSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isSafari = /Safari/i.test(ua) && !/(Chrome|CriOS|EdgiOS|FxiOS|OPiOS|SamsungBrowser|YaBrowser)/i.test(ua);
  return isSafari;
}

function createOverlay({ t, isSafari }) {
  const backdrop = document.createElement("div");
  backdrop.className = "orientation-lock-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const panel = document.createElement("div");
  panel.className = "orientation-lock-panel";

  const title = document.createElement("h2");
  title.className = "orientation-lock-title";
  title.textContent = t("orientation.title");

  const text = document.createElement("p");
  text.className = "orientation-lock-text";
  text.textContent = t("orientation.text");

  panel.appendChild(title);
  panel.appendChild(text);
  backdrop.appendChild(panel);

  if (isSafari) {
    const safariPanel = document.createElement("div");
    safariPanel.className = "orientation-safari-panel";

    const safariTitle = document.createElement("h3");
    safariTitle.className = "orientation-safari-title";
    safariTitle.textContent = t("orientation.safariTitle");

    const safariText = document.createElement("p");
    safariText.className = "orientation-safari-text";
    safariText.textContent = t("orientation.safariText");

    safariPanel.appendChild(safariTitle);
    safariPanel.appendChild(safariText);
    backdrop.appendChild(safariPanel);
  }

  document.body.appendChild(backdrop);
  return backdrop;
}

export function initOrientationGuard({ t }) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const safari = detectSafari();
  const overlay = createOverlay({ t, isSafari: safari });

  const update = () => {
    const lockNeeded = isLikelyMobile() && isLandscape();
    overlay.classList.toggle("is-visible", lockNeeded);
    overlay.setAttribute("aria-hidden", String(!lockNeeded));
    document.body.classList.toggle("orientation-lock-open", lockNeeded);
  };

  const orientationQuery =
    typeof window.matchMedia === "function" ? window.matchMedia("(orientation: landscape)") : null;

  if (orientationQuery && typeof orientationQuery.addEventListener === "function") {
    orientationQuery.addEventListener("change", update);
  }

  window.addEventListener("resize", update, { passive: true });
  window.addEventListener("orientationchange", update, { passive: true });
  update();
}
