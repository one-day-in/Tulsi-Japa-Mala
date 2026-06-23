import assert from "node:assert/strict";
import test from "node:test";

import { createAudioFlowController } from "../flows/audio-flow.js";
import { createAudioManager } from "../managers/audio-manager.js";

function installFakeAudio({ playImpl } = {}) {
  const originalAudio = globalThis.Audio;
  const originalWindow = globalThis.window;
  const instances = [];

  class FakeAudio {
    constructor(src = "") {
      this.src = src;
      this.currentTime = 0;
      this.duration = 0.1;
      this.listeners = new Map();
      instances.push(this);
    }

    addEventListener(type, handler) {
      this.listeners.set(type, handler);
    }

    dispatch(type) {
      this.listeners.get(type)?.();
    }

    load() {}

    pause() {}

    play() {
      return playImpl ? playImpl(this) : Promise.resolve();
    }

    setAttribute() {}
  }

  globalThis.Audio = FakeAudio;
  globalThis.window = {
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    setTimeout: globalThis.setTimeout.bind(globalThis),
  };

  return {
    instances,
    restore() {
      globalThis.Audio = originalAudio;
      globalThis.window = originalWindow;
    },
  };
}

function createModalState() {
  return {
    isResetConfirmOpen: () => false,
    isRoundLoaderOpen: () => false,
  };
}

test("click sound playback does not block step input", () => {
  const fakeAudio = installFakeAudio();

  try {
    const manager = createAudioManager({
      clickLockFallbackMs: 50,
      mantraSrcM4A: "mantra.m4a",
      mantraSrcMP3: "mantra.mp3",
      mantraUnlockEarlySec: 0.12,
      stepSoundSrc: "step-click.m4a",
    });

    assert.equal(manager.playStepSound("click"), true);
    assert.equal(manager.getLockState().isClickLocked, true);
    assert.equal(
      manager.isStepBlocked({
        isResetConfirmOpen: false,
        isRoundLoaderOpen: false,
        soundMode: "click",
      }),
      false,
    );
  } finally {
    fakeAudio.restore();
  }
});

test("click sound lock clears even if the browser never emits ended", async () => {
  const fakeAudio = installFakeAudio();

  try {
    const manager = createAudioManager({
      clickLockFallbackMs: 5,
      mantraSrcM4A: "mantra.m4a",
      mantraSrcMP3: "mantra.mp3",
      mantraUnlockEarlySec: 0.12,
      stepSoundSrc: "step-click.m4a",
    });

    manager.playStepSound("click");
    assert.equal(manager.getLockState().isClickLocked, true);

    await new Promise((resolve) => {
      setTimeout(resolve, 15);
    });

    assert.equal(manager.getLockState().isClickLocked, false);
  } finally {
    fakeAudio.restore();
  }
});

test("audio flow fallback never blocks click mode on a stale click lock", () => {
  const flow = createAudioFlowController({
    getAudioManager: () => null,
    getLocks: () => ({ isClickLocked: true, isMantraLocked: false }),
    getModalManager: createModalState,
    getSoundMode: () => "click",
    onPlayMantraStep: () => {},
    setLocks: () => {},
  });

  assert.equal(flow.isStepBlocked(), false);
});

test("audio flow still blocks mantra while mantra lock is active", () => {
  const flow = createAudioFlowController({
    getAudioManager: () => null,
    getLocks: () => ({ isClickLocked: false, isMantraLocked: true }),
    getModalManager: createModalState,
    getSoundMode: () => "mantra",
    onPlayMantraStep: () => {},
    setLocks: () => {},
  });

  assert.equal(flow.isStepBlocked(), true);
});

test("audio unlock can retry after a rejected first attempt", async () => {
  let playCalls = 0;
  const fakeAudio = installFakeAudio({
    playImpl: () => {
      playCalls += 1;
      return playCalls === 1 ? Promise.reject(new Error("blocked")) : Promise.resolve();
    },
  });

  try {
    const manager = createAudioManager({
      clickLockFallbackMs: 5,
      mantraSrcM4A: "mantra.m4a",
      mantraSrcMP3: "mantra.mp3",
      mantraUnlockEarlySec: 0.12,
      stepSoundSrc: "step-click.m4a",
    });

    manager.unlockAudioFromGesture();
    await Promise.resolve();
    manager.unlockAudioFromGesture();
    await Promise.resolve();

    assert.equal(playCalls, 2);
  } finally {
    fakeAudio.restore();
  }
});
