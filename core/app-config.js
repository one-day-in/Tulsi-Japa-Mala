// Centralized runtime configuration for Tulsi Japa Mala.

export const TOTAL_BEADS = 158;
export const ACTIVE_BEAD_MIN_INDEX = 26;
export const ACTIVE_BEAD_MAX_INDEX = 133;
export const ACTIVE_STEP_COUNT = ACTIVE_BEAD_MAX_INDEX - ACTIVE_BEAD_MIN_INDEX + 1;
export const STORAGE_KEY = "hare-krishna-counter-state-v1";

export const SWIPE_THRESHOLD_PX = 22;
export const DESKTOP_BEAD_SIZE_PX = 150;
export const MOBILE_BEAD_SIZE_PX = 105;
export const BEAD_GAP_PX = 24;
export const KNOT_ASPECT_RATIO = 187 / 267;

export const BEAD_STYLES = ["style1", "style2", "style3"];
export const BACKGROUND_STYLES = ["bg1", "bg2", "bg3", "bg4", "bg5"];
export const SOUND_MODES = ["off", "click", "mantra"];

export const VISUAL_BEAD_MIN_INDEX = 1;
export const VISUAL_BEAD_MAX_INDEX = TOTAL_BEADS;
// Virtual 0/109 markers around the active 108-bead run.
export const TERMINAL_BEAD_LOW_INDEX = ACTIVE_BEAD_MIN_INDEX - 1;
export const TERMINAL_BEAD_HIGH_INDEX = ACTIVE_BEAD_MAX_INDEX + 1;

export const BEAD_IMAGE_SRCS = [
  "./assets/beads-lite/style1.jpg",
  "./assets/beads-lite/style2.jpg",
  "./assets/beads-lite/style3.jpg",
];

export const BACKGROUND_IMAGE_SRCS = [
  "./assets/backgrounds/bg1.jpg",
  "./assets/backgrounds/bg2.jpg",
  "./assets/backgrounds/bg3.jpg",
  "./assets/backgrounds/bg4.jpg",
  "./assets/backgrounds/bg5.jpg",
];

export const BACKGROUND_IMAGE_BY_STYLE = {
  bg1: "./assets/backgrounds/bg1.jpg",
  bg2: "./assets/backgrounds/bg2.jpg",
  bg3: "./assets/backgrounds/bg3.jpg",
  bg4: "./assets/backgrounds/bg4.jpg",
  bg5: "./assets/backgrounds/bg5.jpg",
};

export const KNOT_IMAGE_SRC = "./assets/rope-knot-lite.png";
export const TERMINAL_BEAD_STYLE_SRC = "./assets/beads-lite/terminal-bead-style.png";
export const TERMINAL_TAIL_SRC = "./assets/beads-lite/terminal-tail.png";

export const WHEEL_MIN_STEP_TRIGGER_RATIO = 0.22;
export const WHEEL_MOMENTUM_MS = 120;
export const WHEEL_MIN_SETTLE_MS = 190;
export const WHEEL_MAX_SETTLE_MS = 360;
export const DRAG_COMMIT_MIN_PX = 28;

export const HAPTIC_MS = 10;
export const MANTRA_SRC_M4A = "./assets/audio/mantra.m4a";
export const MANTRA_SRC_MP3 = "./assets/audio/mantra.mp3";
export const MANTRA_UNLOCK_EARLY_SEC = 0.12;
export const STEP_SOUND_SRC = "./assets/audio/step-click.m4a";

export const ROUND_LOADER_MS = 2000;

export const STATE_DOMAIN_CONFIG = Object.freeze({
  activeBeadMinIndex: ACTIVE_BEAD_MIN_INDEX,
  activeBeadMaxIndex: ACTIVE_BEAD_MAX_INDEX,
  beadStyles: BEAD_STYLES,
  backgroundStyles: BACKGROUND_STYLES,
  defaultBeadStyle: "style1",
  defaultBackgroundStyle: "bg1",
});
