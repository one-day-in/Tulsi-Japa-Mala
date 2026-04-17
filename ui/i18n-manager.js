// I18N manager: locale detection, translation lookup and DOM text bindings.

function getByPath(source, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : null), source);
}

export function detectLocale() {
  const browserLang =
    (typeof navigator !== "undefined" && Array.isArray(navigator.languages) && navigator.languages[0]) ||
    (typeof navigator !== "undefined" ? navigator.language : "en") ||
    "en";
  const normalized = String(browserLang).toLowerCase();
  if (normalized.startsWith("uk")) return "uk";
  if (normalized.startsWith("ru")) return "ru";
  return "en";
}

export function createI18NManager({ data, fallbackLocale = "en" }) {
  const locale = detectLocale();

  function t(path) {
    const primary = data[locale] || data[fallbackLocale] || {};
    const value = getByPath(primary, path);
    if (value !== null && value !== undefined) return String(value);
    const fallback = getByPath(data[fallbackLocale] || {}, path);
    return fallback !== null && fallback !== undefined ? String(fallback) : path;
  }

  function setText(node, value) {
    if (!node) return;
    node.textContent = value;
  }

  function applyTranslations(els) {
    if (document?.documentElement) {
      document.documentElement.lang = locale;
    }
    if (typeof document !== "undefined") {
      document.title = t("title");
    }

    setText(els.roundLabel, t("status.round"));
    setText(els.beadsLabel, t("status.beads"));
    setText(els.beadStyleTitle, t("modal.beadStyleTitle"));
    setText(els.beadSectionTitle, t("modal.beadSectionTitle"));
    setText(els.backgroundSectionTitle, t("modal.bgSectionTitle"));
    setText(els.soundModeTitle, t("modal.soundModeTitle"));
    setText(els.resetConfirmTitle, t("modal.resetConfirmTitle"));
    setText(els.resetConfirmText, t("modal.resetConfirmText"));
    setText(els.styleOptionLabel1, t("options.style1"));
    setText(els.styleOptionLabel2, t("options.style2"));
    setText(els.styleOptionLabel3, t("options.style3"));
    setText(els.bgOptionLabel1, t("options.bg1"));
    setText(els.bgOptionLabel2, t("options.bg2"));
    setText(els.bgOptionLabel3, t("options.bg3"));
    setText(els.bgOptionLabel4, t("options.bg4"));
    setText(els.bgOptionLabel5, t("options.bg5"));
    setText(els.soundModeLabelOff, t("options.soundOff"));
    setText(els.soundModeLabelClick, t("options.soundClick"));
    setText(els.soundModeLabelMantra, t("options.soundMantra"));
    setText(els.cancelResetBtn, t("options.cancel"));
    setText(els.confirmResetBtn, t("options.reset"));

    els.beadStyleBtn.setAttribute("aria-label", t("aria.beadStyleBtn"));
    els.soundModeBtn.setAttribute("aria-label", t("aria.soundModeBtn"));
    els.resetBtn.setAttribute("aria-label", t("aria.resetRoundBtn"));
    els.nextRoundInlineBtn.setAttribute("aria-label", t("aria.nextRoundBtn"));
    els.beadsArea.setAttribute("aria-label", t("aria.beadsArea"));
    els.closeBeadStyleModalBtn.setAttribute("aria-label", t("aria.close"));
    els.closeSoundModeModalBtn.setAttribute("aria-label", t("aria.close"));
    els.closeResetConfirmModalBtn.setAttribute("aria-label", t("aria.close"));
  }

  return {
    locale,
    t,
    applyTranslations,
  };
}
