// Bead render manager: pool sync, responsive metrics and RAF render scheduling.

import { renderBeadLayout } from "../engine/bead-layout.js";

export function createBeadRenderManager(config) {
  const {
    beadsColumnEl,
    activeBeadMinIndex,
    activeBeadMaxIndex,
    visualBeadMinIndex,
    visualBeadMaxIndex,
    terminalBeadLowIndex,
    terminalBeadHighIndex,
    desktopBeadSizePx,
    mobileBeadSizePx,
    beadGapPx,
    knotAspectRatio,
    onLivePreview,
    isCoarsePointer,
  } = config;

  const beads = [];
  const knots = [];
  let beadSizePx = desktopBeadSizePx;
  let beadPitch = beadSizePx + beadGapPx;
  let visibleBeads = 5;
  let pendingRenderWheelIndex = activeBeadMinIndex;
  let renderRafId = null;

  function syncKnotPool(totalNeeded) {
    const safeTotal = Math.max(0, totalNeeded);
    while (knots.length < safeTotal) {
      const knot = document.createElement("div");
      knot.className = "knot";
      beadsColumnEl.appendChild(knot);
      knots.push(knot);
    }
    while (knots.length > safeTotal) {
      const knot = knots.pop();
      knot.remove();
    }
  }

  function syncBeadPool() {
    const totalNeeded = visualBeadMaxIndex - visualBeadMinIndex + 1;
    while (beads.length < totalNeeded) {
      const bead = document.createElement("div");
      bead.className = "bead";
      beadsColumnEl.appendChild(bead);
      beads.push(bead);
    }
    while (beads.length > totalNeeded) {
      const bead = beads.pop();
      bead.remove();
    }
    syncKnotPool(totalNeeded - 1);
  }

  function getResponsiveBeadSize(viewportWidth) {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      if (window.matchMedia("(pointer: fine)").matches) {
        return desktopBeadSizePx;
      }
    }
    const width = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : window.innerWidth;
    return width <= 768 ? mobileBeadSizePx : desktopBeadSizePx;
  }

  function refreshMetrics() {
    const viewportHeight = beadsColumnEl.clientHeight;
    const viewportWidth = beadsColumnEl.clientWidth;
    if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return;

    beadSizePx = getResponsiveBeadSize(viewportWidth);
    beadPitch = beadSizePx + beadGapPx;
    const roughVisible = Math.floor((viewportHeight + beadGapPx) / beadPitch);
    let fittedVisible = Math.max(3, roughVisible);
    if (fittedVisible % 2 === 0) {
      fittedVisible -= 1;
    }
    visibleBeads = Math.max(3, fittedVisible);
    syncBeadPool();
  }

  function renderNow(wheelPosition) {
    const viewportHeight = beadsColumnEl.clientHeight;
    renderBeadLayout({
      beads,
      knots,
      viewportHeight,
      visibleBeads,
      beadPitch,
      beadSizePx,
      knotAspectRatio,
      activeBeadIndex: wheelPosition,
      rootBeadMinIndex: visualBeadMinIndex,
      rootBeadMaxIndex: visualBeadMaxIndex,
      terminalBeadLowIndex,
      terminalBeadHighIndex,
      lowPowerMode: isCoarsePointer(),
    });
  }

  function requestRender(wheelPosition) {
    pendingRenderWheelIndex = wheelPosition;
    if (renderRafId !== null) return;

    renderRafId = requestAnimationFrame(() => {
      renderRafId = null;
      if (typeof onLivePreview === "function") {
        onLivePreview(pendingRenderWheelIndex, activeBeadMinIndex, activeBeadMaxIndex);
      }
      renderNow(pendingRenderWheelIndex);
    });
  }

  return {
    refreshMetrics,
    requestRender,
    renderNow,
    getBeadPitch: () => beadPitch,
  };
}
