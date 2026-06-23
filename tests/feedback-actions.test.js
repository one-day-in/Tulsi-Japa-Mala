import assert from "node:assert/strict";
import test from "node:test";

import { createRuntimeActions } from "../runtime/runtime-actions.js";

function createFeedbackContext(overrides = {}) {
  const els = {
    feedbackCopyBtn: { disabled: false },
    feedbackEmailBtn: { disabled: false },
    feedbackStatus: { textContent: "" },
    feedbackTelegramBtn: { disabled: false },
    feedbackText: { value: "" },
  };

  return {
    els,
    actions: createRuntimeActions({
      els,
      feedbackEmail: "owner@example.com",
      feedbackEmailSubject: "Test feedback",
      feedbackTelegramUrl: "https://t.me/example",
      getAssetsManager: () => ({}),
      getAudioFlowController: () => null,
      getRoundFlowController: () => null,
      getUIFlowController: () => null,
      getWheelMotionController: () => null,
      i18nManager: { applyTranslations: () => {} },
      requestRender: () => {},
      setWheelIndex: () => {},
      stateDomainConfig: { activeBeadMaxIndex: 134 },
      storageKey: "test",
      t: (path) => path,
      ...overrides,
    }),
  };
}

test("feedback email action builds a mailto URL from the textarea", () => {
  const originalWindow = globalThis.window;
  globalThis.window = { location: { href: "" } };

  try {
    const { actions, els } = createFeedbackContext();
    els.feedbackText.value = "Great app";

    actions.onFeedbackEmail();

    assert.equal(
      globalThis.window.location.href,
      "mailto:owner@example.com?subject=Test%20feedback&body=Great%20app%0A%0A---%0ATulsi%20Japa%20Mala%20feedback",
    );
    assert.equal(els.feedbackStatus.textContent, "feedback.emailOpened");
  } finally {
    globalThis.window = originalWindow;
  }
});

test("feedback email action reports empty text without opening mail", () => {
  const originalWindow = globalThis.window;
  globalThis.window = { location: { href: "" } };

  try {
    const { actions, els } = createFeedbackContext();

    actions.onFeedbackEmail();

    assert.equal(globalThis.window.location.href, "");
    assert.equal(els.feedbackStatus.textContent, "feedback.empty");
  } finally {
    globalThis.window = originalWindow;
  }
});

test("feedback copy action writes the textarea text to clipboard", async () => {
  const originalNavigator = globalThis.navigator;
  let copiedText = "";
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      clipboard: {
        writeText: async (text) => {
          copiedText = text;
        },
      },
    },
  });

  try {
    const { actions, els } = createFeedbackContext();
    els.feedbackText.value = "Please improve the counter";

    await actions.onFeedbackCopy();

    assert.equal(copiedText, "Please improve the counter");
    assert.equal(els.feedbackStatus.textContent, "feedback.copied");
  } finally {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
});
