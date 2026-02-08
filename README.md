# SaleScout — AI Profit Analyzer

Интерактивный продукт для продавцов на Kaspi: пользователь вводит ссылку на товар и название магазина, система через внутренний API Kaspi рассчитывает позицию, лучшую цену и разницу до ТОП‑1. Визуальный мастер из 4 шагов превращает анализ в эмоциональный AI‑дашборд и ведет к заявке.

## Стек

**Frontend**

- React 19 + Vite
- TypeScript
- Tailwind CSS через CDN (в `index.html`)
- framer-motion
- lucide-react
- i18next + react-i18next (RU/KZ/EN)

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
├─ src/
│  ├─ App.tsx                        # Корневой компонент с навбаром
│  ├─ index.tsx                      # Точка входа React
│  ├─ i18n.ts                        # Инициализация i18next (RU/KZ/EN)
│  ├─ types.ts                       # TypeScript‑интерфейсы (AnalyzeRequest, KaspiAnalysis, LeadPayload)
│  ├─ assets/
│  │  └─ sellers-bg.png              # Фон телефона для мини‑рейтинга
│  ├─ components/
│  │  ├─ ui/                         # Переиспользуемые UI‑компоненты
│  │  │  ├─ States.tsx               #   LoadingState / ErrorState
│  │  │  ├─ ErrorBoundary.tsx        #   React Error Boundary
│  │  │  └─ AnimatedNumber.tsx       #   Анимация числовых значений
│  │  ├─ wizard/                     # Шаги онбординг‑визарда
│  │  │  ├─ StepProgress.tsx         #   Прогресс‑бар (4 шага)
│  │  │  ├─ StepWelcome.tsx          #   Шаг 1 — приветствие
│  │  │  ├─ StepInput.tsx            #   Шаг 2 — ввод URL + магазин
│  │  │  ├─ StepConfirm.tsx          #   Шаг 2.5 — подтверждение
│  │  │  └─ StepLeadForm.tsx         #   Шаг 4 — форма заявки
│  │  └─ analysis/                   # Дашборд анализа (шаг 3)
│  │     ├─ StepAnalysis.tsx         #   Оркестратор дашборда
│  │     ├─ ProfitChart.tsx          #   SVG‑график прибыли
│  │     ├─ FomoBlock.tsx            #   FOMO‑блок упущенной выгоды
│  │     ├─ PriceSimulator.tsx       #   Симулятор цены (слайдер)
│  │     └─ PositionRanking.tsx      #   Мини‑рейтинг продавцов
│  ├─ hooks/
│  │  └─ useThrottledValue.ts        # Хук для троттлинга значений
│  ├─ lib/
│  │  ├─ onboardingClient.ts         # API‑клиент (analyzeKaspi, submitLead)
│  │  ├─ utils.ts                    # Утилиты (cn, formatMoney, и др.)
│  │  └─ miniSellerRanking.ts        # Логика мини‑рейтинга продавцов
│  └─ pages/
│     └─ AiProfitAnalyzerPage.tsx    # Главная страница — состояние визарда
└─ server/
   ├─ package.json
   ├─ .env.example
   └─ src/
      ├─ index.js                    # Express + MongoDB подключение
      ├─ models/
      │  ├─ Lead.js                  # Модель заявки
      │  └─ Record.js               # Модель записи анализа
      ├─ routes/
      │  ├─ analyze.js               # POST /api/analyze
      │  ├─ lead.js                  # POST /api/lead
      │  └─ records.js               # GET/POST /api/records
      └─ services/
         └─ kaspiParser.js           # Интеграция с Kaspi API
```

**Ключевые зоны**

| Папка | Назначение |
|-------|-----------|
| `src/components/ui/` | Переиспользуемые UI‑компоненты (состояния загрузки, анимации, error boundary) |
| `src/components/wizard/` | Шаги онбординг‑визарда (приветствие, ввод, подтверждение, заявка) |
| `src/components/analysis/` | Дашборд анализа: график, FOMO, симулятор цены, рейтинг |
| `src/hooks/` | Пользовательские хуки (`useThrottledValue`) |
| `src/lib/` | Бизнес‑логика, API‑клиент и утилиты |
| `src/pages/` | Страницы приложения (управление состоянием визарда) |
| `server/src/` | API, интеграция с Kaspi и сохранение лидов |

## Переменные окружения (Backend)

Создайте `server/.env`:

```
MONGODB_URI=your_mongodb_uri
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

## Запуск

**Frontend**

```bash
npm install
npm run dev
```

**Backend**

```bash
npm --prefix server install
npm run dev:api
```

## Что умеет Step 3 (анализ)

- Реальный API Kaspi (без HTML‑парсинга и браузерных парсеров)
- SVG‑график роста прибыли с анимацией линий и точек
- FOMO‑блок "упущенной выгоды"
- Мини‑рейтинг продавцов с reorder‑анимацией
- Симулятор цены без запроса к серверу

## Локализация

- Сайт поддерживает 3 языка: русский (по умолчанию), казахский и английский.

## Важно

- Проект работает **только с kaspi.kz**
- Для других маркетплейсов возвращается корректная ошибка
- Внешние UI‑библиотеки не используются
