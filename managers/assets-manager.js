// Assets manager: preloading and visual style application for beads/background.

export function createAssetsManager(config) {
  const {
    beadStyles,
    beadImageSrcs,
    backgroundImageSrcs,
    backgroundStyles,
    backgroundImageByStyle,
    knotImageSrc,
    terminalBeadStyleSrc,
    terminalTailSrc,
    beadsColumnEl,
  } = config;

  function preloadImage(src) {
    if (typeof Image === "undefined" || !src) return;
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }

  function extractUrlsFromBackgroundImage(backgroundImageValue) {
    if (!backgroundImageValue || backgroundImageValue === "none") return [];
    const matches = backgroundImageValue.match(/url\((['"]?)(.*?)\1\)/g) || [];
    return matches
      .map((entry) => {
        const parsed = entry.match(/url\((['"]?)(.*?)\1\)/);
        return parsed && parsed[2] ? parsed[2] : null;
      })
      .filter(Boolean);
  }

  function preloadModalThumbsFromDom() {
    if (typeof document === "undefined" || typeof window === "undefined") return;
    const thumbDots = document.querySelectorAll("#backgroundStyleOptions .bg-dot");
    thumbDots.forEach((dot) => {
      const bg = window.getComputedStyle(dot).backgroundImage;
      const urls = extractUrlsFromBackgroundImage(bg);
      urls.forEach((src) => preloadImage(src));
    });
  }

  function preloadAll() {
    for (const src of beadImageSrcs) preloadImage(src);
    for (const src of backgroundImageSrcs) preloadImage(src);
    preloadImage(knotImageSrc);
    preloadImage(terminalBeadStyleSrc);
    preloadImage(terminalTailSrc);
    preloadModalThumbsFromDom();
  }

  function applyBeadStyle(style) {
    if (!beadsColumnEl) return;
    for (const currentStyle of beadStyles) {
      beadsColumnEl.classList.remove(`bead-style-${currentStyle.slice(-1)}`);
    }

    const styleIndex = beadStyles.indexOf(style) + 1;
    beadsColumnEl.classList.add(`bead-style-${styleIndex}`);
  }

  function applyBackgroundStyle(style) {
    const key = backgroundStyles.includes(style) ? style : backgroundStyles[0];
    const src = backgroundImageByStyle[key];
    if (!src) return;
    document.documentElement.style.setProperty("--page-bg-image", `url("${src}")`);
  }

  function styleLabel(style) {
    const index = beadStyles.indexOf(style);
    return index >= 0 ? String(index + 1) : "1";
  }

  return {
    preloadAll,
    applyBeadStyle,
    applyBackgroundStyle,
    styleLabel,
  };
}
