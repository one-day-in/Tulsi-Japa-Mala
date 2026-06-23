// Template renderer: generates repeated modal option blocks.

function renderBeadStyleOptions(container) {
  if (!container) return;
  container.innerHTML = `
    <button class="style-option style-1" type="button" data-style="style1">
      <span class="style-dot"></span>
      <span id="styleOptionLabel1" class="visually-hidden">Стиль 1</span>
    </button>
    <button class="style-option style-2" type="button" data-style="style2">
      <span class="style-dot"></span>
      <span id="styleOptionLabel2" class="visually-hidden">Стиль 2</span>
    </button>
    <button class="style-option style-3" type="button" data-style="style3">
      <span class="style-dot"></span>
      <span id="styleOptionLabel3" class="visually-hidden">Стиль 3</span>
    </button>
  `;
}

function renderBackgroundStyleOptions(container) {
  if (!container) return;
  container.innerHTML = `
    <button class="style-option bg-option bg-1" type="button" data-background-style="bg1">
      <span class="bg-dot"></span>
      <span id="bgOptionLabel1" class="visually-hidden">Фон 1</span>
    </button>
    <button class="style-option bg-option bg-2" type="button" data-background-style="bg2">
      <span class="bg-dot"></span>
      <span id="bgOptionLabel2" class="visually-hidden">Фон 2</span>
    </button>
    <button class="style-option bg-option bg-3" type="button" data-background-style="bg3">
      <span class="bg-dot"></span>
      <span id="bgOptionLabel3" class="visually-hidden">Фон 3</span>
    </button>
    <button class="style-option bg-option bg-4" type="button" data-background-style="bg4">
      <span class="bg-dot"></span>
      <span id="bgOptionLabel4" class="visually-hidden">Фон 4</span>
    </button>
    <button class="style-option bg-option bg-5" type="button" data-background-style="bg5">
      <span class="bg-dot"></span>
      <span id="bgOptionLabel5" class="visually-hidden">Фон 5</span>
    </button>
  `;
}

function renderSoundModeOptions(container) {
  if (!container) return;
  container.innerHTML = `
    <button class="sound-option" type="button" data-sound-mode="off">
      <span class="sound-icon" aria-hidden="true"></span>
      <span id="soundModeLabelOff">Без звуку</span>
    </button>
    <button class="sound-option" type="button" data-sound-mode="click">
      <span class="sound-icon" aria-hidden="true"></span>
      <span id="soundModeLabelClick">Клік</span>
    </button>
    <button class="sound-option" type="button" data-sound-mode="mantra">
      <span class="sound-icon" aria-hidden="true"></span>
      <span id="soundModeLabelMantra">Мантра</span>
    </button>
  `;
}

export function renderModalOptionTemplates() {
  renderBeadStyleOptions(document.getElementById("beadStyleOptions"));
  renderBackgroundStyleOptions(document.getElementById("backgroundStyleOptions"));
  renderSoundModeOptions(document.getElementById("soundModeOptions"));
}
