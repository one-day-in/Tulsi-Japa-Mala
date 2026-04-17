// Geometry/layout engine for bead and knot placement.

const KNOT_GAP_SCALE_MIN = 0.58;
const KNOT_GAP_SCALE_MAX = 1.22;
const KNOT_HEIGHT_SCALE = 0.9;
const KNOT_MIN_PX = 6;
const KNOT_MAX_PX = 26;
const KNOT_WIDTH_BOOST = 1.08;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function renderBeadLayout(params) {
  const {
    beads,
    knots,
    viewportHeight,
    visibleBeads,
    beadSizePx,
    beadPitch,
    knotAspectRatio,
    activeBeadIndex,
    rootBeadMinIndex,
    rootBeadMaxIndex,
    terminalBeadLowIndex,
    terminalBeadHighIndex,
    lowPowerMode = false,
  } = params;

  const centerSlot = (visibleBeads - 1) / 2;
  const maxDist = centerSlot || 1;
  const centers = new Array(beads.length);
  const sizes = new Array(beads.length);
  const halfHeights = new Array(beads.length);
  const depths = new Array(beads.length);
  const knotHeights = new Array(Math.max(0, beads.length - 1));
  const pairDistances = new Array(Math.max(0, beads.length - 1));
  const logicalIndices = new Array(beads.length);
  const wheelIndex = clamp(activeBeadIndex, rootBeadMinIndex, rootBeadMaxIndex);
  const baseSize = Math.max(24, beadSizePx);
  const baseGap = Math.max(2, beadPitch - beadSizePx);
  const centerY = viewportHeight / 2;

  // Depth by real size (no translateZ): center bigger, edges smaller.
  for (let i = 0; i < beads.length; i += 1) {
    const logicalIndex = rootBeadMinIndex + i;
    const relativeToCenter = logicalIndex - wheelIndex;
    const dist = Math.abs(relativeToCenter);
    const depth = clamp(1 - dist / maxDist, 0, 1);
    const size = baseSize * (0.62 + depth * 0.38);

    depths[i] = depth;
    sizes[i] = size;
    halfHeights[i] = size / 2;
    logicalIndices[i] = logicalIndex;
    centers[i] = centerY;
  }

  for (let i = 0; i < knotHeights.length; i += 1) {
    const pairDepth = (depths[i] + depths[i + 1]) * 0.5;
    const pairSizeAvg = (sizes[i] + sizes[i + 1]) * 0.5;
    const scaledGap = baseGap * (pairSizeAvg / baseSize);
    const visualGap = clamp(
      scaledGap * (0.92 + pairDepth * 0.16),
      baseGap * KNOT_GAP_SCALE_MIN,
      baseGap * KNOT_GAP_SCALE_MAX,
    );
    const knotHeight = clamp(visualGap * KNOT_HEIGHT_SCALE, KNOT_MIN_PX, KNOT_MAX_PX);

    knotHeights[i] = knotHeight;
    pairDistances[i] = halfHeights[i] + knotHeight + halfHeights[i + 1];
  }

  const anchorLogical = clamp(Math.floor(wheelIndex), rootBeadMinIndex, rootBeadMaxIndex);
  const anchorArray = anchorLogical - rootBeadMinIndex;
  const anchorFraction = wheelIndex - anchorLogical;
  const anchorPairDistance = pairDistances[anchorArray] ?? pairDistances[anchorArray - 1] ?? beadPitch;
  centers[anchorArray] = centerY + anchorFraction * anchorPairDistance;

  for (let i = anchorArray + 1; i < beads.length; i += 1) {
    centers[i] = centers[i - 1] - pairDistances[i - 1];
  }

  for (let i = anchorArray - 1; i >= 0; i -= 1) {
    centers[i] = centers[i + 1] + pairDistances[i];
  }

  for (let i = 0; i < beads.length; i += 1) {
    const bead = beads[i];
    const y = centers[i];
    const size = sizes[i];
    const depth = depths[i];
    const logicalIndex = logicalIndices[i];
    const isRootBead = logicalIndex === rootBeadMinIndex || logicalIndex === rootBeadMaxIndex;
    const isTerminalBead = logicalIndex === terminalBeadLowIndex || logicalIndex === terminalBeadHighIndex;
    const relativeToCenter = logicalIndex - wheelIndex;
    const pullStrength = clamp(1 - Math.abs(relativeToCenter) / 2.2, 0, 1);
    const pullDir = relativeToCenter >= 0 ? 1 : -1;
    const pullX = isTerminalBead ? pullDir * pullStrength * 4 : 0;
    const pullRotate = isTerminalBead ? pullDir * pullStrength * 2.6 : 0;
    const renderSize = isTerminalBead ? size * 1.06 : size;

    bead.style.top = `${y}px`;
    bead.style.width = `${renderSize.toFixed(2)}px`;
    bead.style.height = `${renderSize.toFixed(2)}px`;
    bead.style.transform =
      `translate(calc(-50% + ${pullX.toFixed(2)}px), -50%) ` +
      `rotate(${pullRotate.toFixed(2)}deg)`;
    bead.style.opacity = "1";
    bead.style.zIndex = String(12 + Math.round(depth * 10));
    const blurPx = (1 - depth) * 1.35;
    bead.style.filter = lowPowerMode
      ? `brightness(${(0.93 + depth * 0.1).toFixed(3)})`
      : `brightness(${(0.9 + depth * 0.15).toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
    const shadowY = 4 + depth * 8;
    const shadowBlur = 10 + depth * 16;
    const haloBlur = 4 + depth * 6;
    if (isTerminalBead) {
      bead.style.boxShadow = lowPowerMode
        ? `0 ${Math.max(2, shadowY * 0.5).toFixed(2)}px ${Math.max(5, shadowBlur * 0.45).toFixed(2)}px rgba(30, 16, 6, 0.26)`
        : `0 0 ${haloBlur.toFixed(2)}px rgba(255, 233, 184, 0.2), ` +
          `0 ${shadowY.toFixed(2)}px ${shadowBlur.toFixed(2)}px rgba(30, 16, 6, 0.32)`;
    } else {
      bead.style.boxShadow = lowPowerMode
        ? `0 0 0 1px rgba(58, 36, 17, 0.28), 0 ${Math.max(2, shadowY * 0.55).toFixed(2)}px ${Math.max(6, shadowBlur * 0.5).toFixed(2)}px rgba(30, 16, 6, 0.28)`
        : `0 0 0 1px rgba(58, 36, 17, 0.34), ` +
          `0 0 ${haloBlur.toFixed(2)}px rgba(255, 233, 184, 0.28), ` +
          `0 ${shadowY.toFixed(2)}px ${shadowBlur.toFixed(2)}px rgba(30, 16, 6, 0.38)`;
    }

    bead.classList.toggle("root-bead", isRootBead);
    bead.classList.toggle("terminal-bead", isTerminalBead);
    bead.style.setProperty("--terminal-pull", pullStrength.toFixed(3));

    const isInsideViewport = y > -size * 2 && y < viewportHeight + size * 2;
    bead.style.visibility = isInsideViewport ? "visible" : "hidden";
  }

  for (let i = 0; i < knots.length; i += 1) {
    const knot = knots[i];
    const centerA = centers[i];
    const centerB = centers[i + 1];
    const aIsUpper = centerA <= centerB;
    const upperCenter = aIsUpper ? centerA : centerB;
    const lowerCenter = aIsUpper ? centerB : centerA;
    const upperHalf = aIsUpper ? halfHeights[i] : halfHeights[i + 1];
    const lowerHalf = aIsUpper ? halfHeights[i + 1] : halfHeights[i];
    const upperBottom = upperCenter + upperHalf;
    const lowerTop = lowerCenter - lowerHalf;
    const knotHeight = Math.max(2, lowerTop - upperBottom);
    const knotWidth = Math.max(KNOT_MIN_PX, knotHeight * knotAspectRatio * KNOT_WIDTH_BOOST);
    const midY = (upperBottom + lowerTop) / 2;
    const knotDepth = (depths[i] + depths[i + 1]) * 0.5;
    knot.style.top = `${midY}px`;
    knot.style.transform = "translate(-50%, -50%)";
    knot.style.height = `${knotHeight.toFixed(2)}px`;
    knot.style.width = `${knotWidth.toFixed(2)}px`;
    knot.style.zIndex = String(10 + Math.round(knotDepth * 8));
    knot.style.opacity = String((lowPowerMode ? 0.86 : 0.8) + knotDepth * (lowPowerMode ? 0.14 : 0.2));

    const isInsideViewport = midY > -180 && midY < viewportHeight + 180;
    knot.style.visibility = isInsideViewport ? "visible" : "hidden";
  }
}
