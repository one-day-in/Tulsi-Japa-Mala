# Tulsi Japa Mala

Мобільно-орієнтований односторінковий вебзастосунок для джапа-підрахунку.

## Основне
- Режим бусин (вертикальний wheel-like скрол, 1 свайп = 1 крок).
- Раунди по 108 бусин.
- Стан зберігається в `localStorage`.
- Підтримка звукових режимів.
- Адаптований UI для мобільних і desktop.

## Технічний стек
- Vite 5
- Vanilla JS (модульна архітектура)
- CSS (розбитий на модулі через `styles.css` як агрегатор)

## Локальний запуск
```bash
npm ci
npm run dev
```

## Продакшн збірка
```bash
npm run build
npm run preview
```

## GitHub Pages
Деплой налаштований через GitHub Actions:
- Workflow: `.github/workflows/deploy-pages.yml`
- Тригер: пуш у `main`
- Артефакт: `dist/`

Після першого пушу:
1. У GitHub репозиторії відкрий `Settings -> Pages`.
2. Переконайся, що Source = `GitHub Actions`.
3. Дочекайся завершення workflow `Deploy to GitHub Pages`.

Очікувана адреса:
- `https://one-day-in.github.io/Tulsi-Japa-Mala/`

## Документація
- [Product Brief](./docs/product-brief.md)
- [Technical Plan](./docs/technical-plan.md)
- [Data Model](./docs/data-model.md)
- [Open Questions](./docs/open-questions.md)
