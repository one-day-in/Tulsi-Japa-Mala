# Tulsi Japa Mala

Односторінковий мобільно-орієнтований вебпроєкт для підрахунку повторів (кліків) з раундами по 108.

## Ціль
- Мати один екран без скролу сторінки.
- У `header` розмістити панель керування.
- У `body` показувати лічильник у двох режимах:
  - `Classic`: кнопки `+` і `-` + дисплей числа.
  - `Beads`: вертикальна стрічка бусин, де жест вниз = `+1`, вгору = `-1`.

## Базова логіка
- `countInRound`: значення в межах `0..107`.
- `round`: номер раунду, стартує з `1`.
- Крок `+1`:
  - якщо `countInRound` стає `108`, тоді `round += 1`, `countInRound = 0`.
- Крок `-1`:
  - якщо `countInRound > 0`, просто `countInRound -= 1`.
  - якщо `countInRound == 0` і `round > 1`, тоді `round -= 1`, `countInRound = 107`.
  - якщо `round == 1` і `countInRound == 0`, значення не змінюється.

## Документація
- [Product Brief](./docs/product-brief.md)
- [Technical Plan](./docs/technical-plan.md)
- [Data Model](./docs/data-model.md)
- [Open Questions](./docs/open-questions.md)

## Поточний статус
- Реалізовано базовий UI:
  - `index.html`
  - `styles.css`
  - `app.js`
- Підтримано 2 режими (`Classic`, `Beads`), round logic `108`, повний reset.
- Збереження стану в `localStorage`.
