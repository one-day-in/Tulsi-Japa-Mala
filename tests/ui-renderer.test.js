import assert from "node:assert/strict";
import test from "node:test";

import { createUIRenderer } from "../managers/ui-renderer.js";

function createMockElement() {
  const attributes = new Map();
  const classes = new Set();

  return {
    dataset: {},
    disabled: false,
    innerHTML: "",
    textContent: "",
    classList: {
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
  };
}

function createRenderer() {
  const els = {
    roundValue: createMockElement(),
    displayValue: createMockElement(),
    displayMax: createMockElement(),
    nextRoundInlineBtn: createMockElement(),
    beadsArea: createMockElement(),
    soundModeBtn: createMockElement(),
  };

  return {
    els,
    renderer: createUIRenderer({
      els,
      activeStepCount: 108,
      getSoundIconSvg: (mode) => `<svg data-mode="${mode}"></svg>`,
    }),
  };
}

test("counter updates keep beads slider aria value in sync", () => {
  const { els, renderer } = createRenderer();

  renderer.updateCounter({
    round: 1,
    step: 7,
    isRoundLoaderOpen: false,
  });

  assert.equal(els.displayValue.textContent, "7");
  assert.equal(els.displayMax.textContent, "108");
  assert.equal(els.beadsArea.getAttribute("aria-valuenow"), "7");
  assert.equal(els.beadsArea.getAttribute("aria-valuetext"), "7/108");
});

test("live preview updates slider aria value without forcing a display change result", () => {
  const { els, renderer } = createRenderer();

  renderer.updateCounter({
    round: 1,
    step: 7,
    isRoundLoaderOpen: false,
  });

  assert.equal(renderer.updateLivePreviewStep(7), false);
  assert.equal(renderer.updateLivePreviewStep(8), true);
  assert.equal(els.displayValue.textContent, "8");
  assert.equal(els.beadsArea.getAttribute("aria-valuenow"), "8");
  assert.equal(els.beadsArea.getAttribute("aria-valuetext"), "8/108");
});
