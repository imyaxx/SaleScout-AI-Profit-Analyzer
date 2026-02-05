# SaleScout — AI Profit Analyzer

Интерактивный продукт для продавцов на Kaspi: пользователь вводит ссылку на товар и название магазина, система через внутренний API Kaspi рассчитывает позицию, лучшую цену и разницу до ТОП‑1. Визуальный мастер из 4 шагов превращает анализ в эмоциональный AI‑дашборд и ведет к заявке.

## Зачем это
- Быстро показать продавцу реальную позицию и ценовой разрыв до лидера.
- Вовлечь пользователя через интерактивную симуляцию цены и прогноз прибыли.
- Собрать лиды через форму заявки с валидацией и сохранением в MongoDB.

## Стек
**Frontend**
- React 19 + Vite
- TypeScript
- Tailwind CSS через CDN (в `index.html`)
- framer-motion
- lucide-react

**Backend**
- Node.js (ESM)
- Express
- MongoDB (mongoose)

## Архитектура
- Один роут на фронте, 4‑шаговый wizard:
  1. Приветствие
  2. Ввод данных
  2.5. Подтверждение
  3. Анализ (интерактивный AI‑дашборд)
  4. Заявка
- Бэкенд реализует:
  - `/api/analyze` — анализ по Kaspi API
  - `/api/lead` — сохранение заявки в MongoDB

## Структура проекта
```
.
├─ index.html
├─ vite.config.ts
├─ tsconfig.json
├─ package.json
├─ src
│  ├─ App.tsx
│  ├─ index.tsx
│  ├─ components
│  │  ├─ ai-profit
│  │  └─ onboarding
│  │     └─ analysis
│  ├─ hooks
│  ├─ lib
│  ├─ pages
│  └─ types.ts
└─ server
   ├─ package.json
   └─ src
      ├─ index.js
      ├─ routes
      ├─ models
      └─ services
```
**Ключевые зоны**
- `src/components` — UI и шаги онбординга.
- `src/hooks` — пользовательские хуки (например, `useThrottledValue`).
- `src/lib` — бизнес‑логика и подготовка данных для UI.
- `server/src` — API, интеграция с Kaspi и сохранение лидов.

## Переменные окружения (Backend)
Создайте `server/.env`:
```
MONGODB_URI=your_mongodb_uri
PORT=4000
CORS_ORIGIN=http://localhost:3000
```


```

## Запуск
**Frontend**
```
npm install
npm run dev
```

**Backend**
```
npm --prefix server install
npm run dev:api
```

## Что умеет Step 3 (анализ)
- Реальный API Kaspi (без HTML‑парсинга и браузерных парсеров)
- SVG‑график роста прибыли с анимацией линий и точек
- FOMO‑блок “упущенной выгоды”
- Мини‑рейтинг продавцов с reorder‑анимацией
- Симулятор цены без запроса к серверу
- Confidence‑meter и таймер актуальности

## Важно
- Проект работает **только с kaspi.kz**
- Для других маркетплейсов возвращается корректная ошибка
- Внешние UI‑библиотеки не используются
