# Data Model

## Основні сутності
- `round`:
  - тип: `number`
  - мінімум: `1`
  - значення: поточний раунд

- `countInRound`:
  - тип: `number`
  - межі: `0..107`
  - значення: прогрес всередині поточного раунду

- `mode`:
  - тип: `"classic" | "beads"`
  - значення: активний спосіб взаємодії

## Похідні значення
- `displayCount`: значення, яке показує дисплей (формат уточнимо).
- `isRoundComplete`: `countInRound === 107` перед натисканням `+`.

## Події
- `INCREMENT`
- `DECREMENT`
- `RESET`
- `SWITCH_MODE`

## Псевдокод переходів
```txt
INCREMENT:
  if countInRound < 107:
    countInRound += 1
  else:
    round += 1
    countInRound = 0

DECREMENT:
  if countInRound > 0:
    countInRound -= 1
  else if round > 1:
    round -= 1
    countInRound = 107
  else:
    no-op
```
