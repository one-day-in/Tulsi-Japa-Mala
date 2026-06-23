import assert from "node:assert/strict";
import test from "node:test";

import {
  ACTIVE_BEAD_MAX_INDEX,
  ACTIVE_BEAD_MIN_INDEX,
  ACTIVE_STEP_COUNT,
  BEAD_GAP_PX,
  DESKTOP_BEAD_SIZE_PX,
  KNOT_ASPECT_RATIO,
  MOBILE_BEAD_SIZE_PX,
  TERMINAL_BEAD_HIGH_INDEX,
  TERMINAL_BEAD_LOW_INDEX,
  VISUAL_BEAD_MAX_INDEX,
  VISUAL_BEAD_MIN_INDEX,
} from "../core/app-config.js";
import { createBeadRenderManager } from "../managers/bead-render-manager.js";

function createMockNode() {
  const classes = new Set();
  return {
    className: "",
    removed: false,
    style: {
      setProperty(name, value) {
        this[name] = value;
      },
    },
    classList: {
      contains(name) {
        return classes.has(name);
      },
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
    },
    remove() {
      this.removed = true;
    },
  };
}

test("terminal beads frame exactly 108 counted beads", () => {
  assert.equal(TERMINAL_BEAD_LOW_INDEX, ACTIVE_BEAD_MIN_INDEX);
  assert.equal(TERMINAL_BEAD_HIGH_INDEX, ACTIVE_BEAD_MAX_INDEX + 1);
  assert.equal(TERMINAL_BEAD_HIGH_INDEX - TERMINAL_BEAD_LOW_INDEX - 1, ACTIVE_STEP_COUNT);
});

test("render positions 0 and 109 on terminal beads without shifting step 108", () => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const children = [];
  const beadsColumnEl = {
    clientHeight: 1_000,
    clientWidth: 390,
    appendChild(node) {
      children.push(node);
    },
  };

  globalThis.document = { createElement: () => createMockNode() };
  globalThis.window = {
    innerWidth: 390,
    matchMedia: () => ({ matches: false }),
  };

  try {
    const manager = createBeadRenderManager({
      beadsColumnEl,
      activeBeadMinIndex: ACTIVE_BEAD_MIN_INDEX,
      activeBeadMaxIndex: ACTIVE_BEAD_MAX_INDEX,
      visualBeadMinIndex: VISUAL_BEAD_MIN_INDEX,
      visualBeadMaxIndex: VISUAL_BEAD_MAX_INDEX,
      terminalBeadLowIndex: TERMINAL_BEAD_LOW_INDEX,
      terminalBeadHighIndex: TERMINAL_BEAD_HIGH_INDEX,
      desktopBeadSizePx: DESKTOP_BEAD_SIZE_PX,
      mobileBeadSizePx: MOBILE_BEAD_SIZE_PX,
      beadGapPx: BEAD_GAP_PX,
      knotAspectRatio: KNOT_ASPECT_RATIO,
      onLivePreview: () => {},
      isCoarsePointer: () => true,
    });
    const beads = children.filter((node) => node.className === "bead");
    const beadAt = (logicalIndex) => beads[logicalIndex - VISUAL_BEAD_MIN_INDEX];

    manager.renderNow(ACTIVE_BEAD_MIN_INDEX);
    assert.equal(beadAt(TERMINAL_BEAD_LOW_INDEX).style.top, "500px");
    assert.equal(beadAt(TERMINAL_BEAD_LOW_INDEX).classList.contains("terminal-bead"), true);

    manager.renderNow(ACTIVE_BEAD_MAX_INDEX);
    assert.equal(beadAt(ACTIVE_BEAD_MAX_INDEX).style.top, "500px");
    assert.equal(beadAt(ACTIVE_BEAD_MAX_INDEX).classList.contains("terminal-bead"), false);
    assert.equal(beadAt(TERMINAL_BEAD_HIGH_INDEX).classList.contains("terminal-bead"), true);

    manager.renderNow(TERMINAL_BEAD_HIGH_INDEX);
    assert.equal(beadAt(TERMINAL_BEAD_HIGH_INDEX).style.top, "500px");
  } finally {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  }
});
