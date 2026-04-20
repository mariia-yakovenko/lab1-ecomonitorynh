# єПовітря — моніторинг якості повітря

Навчальний веб-додаток з моніторингу якості повітря в містах України.
Лабораторна робота №1 з дисципліни «Веб-розробка».

> Усі дані станцій та вимірювань є навчальними

---

## технічний стек

| технологія           | версія    | призначення                       |
| -------------------- | --------- | --------------------------------- |
| Next.js (App Router) | 16.2.4    | фреймворк, SSR/SSG/API routes     |
| TypeScript           | 5.x       | строга типізація                  |
| React                | 19.x      | UI                                |
| Bootstrap            | 5.3 (CDN) | базова сітка та компоненти        |
| e-Ukraine            | local     | шрифт (`.otf`, `next/font/local`) |
| Node.js              | ≥ 18      | серверне середовище               |

---

## структура проєкту

```
lab1-ecomonitorynh/
│
├── app/                        # App Router — сторінки та API
│   ├── layout.tsx              # кореневий layout: шрифт, Bootstrap CDN, Navbar, Footer
│   ├── globals.css             # глобальні стилі та дизайн-система
│   ├── page.tsx                # головна сторінка (SSR, force-dynamic)
│   ├── not-found.tsx           # 404
│   │
│   ├── about/
│   │   └── page.tsx            # «про проєкт» (SSG — статична)
│   │
│   ├── guide/
│   │   └── page.tsx            # «довідник забруднювачів» (SSG — статична)
│   │
│   ├── station/
│   │   └── [id]/
│   │       └── page.tsx        # детальна сторінка станції (SSG + generateStaticParams)
│   │
│   └── api/
│       ├── stations/
│       │   ├── route.ts        # GET /api/stations — список, фільтрація, сортування, пагінація
│       │   └── [id]/
│       │       └── route.ts    # GET /api/stations/:id — одна станція
│       ├── measurements/
│       │   └── route.ts        # GET /api/measurements?stationId=&from=&to= — часові ряди
│       └── current/
│           └── route.ts        # GET /api/current[?stationId=] — поточні показники
│
├── components/
│   ├── Navbar.tsx              # навігація (клієнтський компонент, usePathname)
│   ├── Footer.tsx              # підвал
│   ├── StationCard.tsx         # картка станції (список)
│   └── AqiBadge.tsx            # бейдж категорії AQI + утиліта aqiColorClass
│
├── types/
│   └── index.ts                # всі TypeScript-інтерфейси
│
├── lib/
│   └── data.ts                 # mock-дані: 7 станцій, генерація часових рядів (48 год.)
│
└── public/
    └── fonts/                  # шрифт e-Ukraine (.otf, усі ваги)
```

---

## TypeScript-інтерфейси (`types/index.ts`)

| інтерфейс / тип           | призначення                                         |
| ------------------------- | --------------------------------------------------- | ----------- | ------------ | ---------- |
| `AirQualityData`          | концентрації PM2.5, PM10, NO₂, SO₂, CO, O₃ + AQI    |
| `MonitoringStation`       | назва, місто, адреса, координати, тип, поточні дані |
| `Measurement`             | одне вимірювання (stationId, timestamp, дані)       |
| `TimeSeries`              | набір вимірювань за período                         |
| `ApiResponse<T>`          | обгортка успішної відповіді API із полем `meta`     |
| `ResponseMeta`            | пагінація: total, page, limit, totalPages           |
| `ApiError`                | структура помилки (success: false, error, code)     |
| `StationsQueryParams`     | параметри запиту до `/api/stations`                 |
| `MeasurementsQueryParams` | параметри запиту до `/api/measurements`             |
| `StationType`             | union: 'міська'                                     | 'приміська' | 'промислова' | 'сільська' |
| `AirQualityCategory`      | union: 5 категорій від «добре» до «дуже небезпечно» |

---

## API endpoints

### `GET /api/stations`

повертає список станцій з фільтрацією, сортуванням та пагінацією.

| параметр | тип    | за замовч. | опис                                   |
| -------- | ------ | ---------- | -------------------------------------- |
| `city`   | string | —          | фільтр за містом                       |
| `type`   | string | —          | фільтр за типом станції                |
| `sort`   | string | `name`     | поле сортування: `name`, `city`, `aqi` |
| `order`  | string | `asc`      | напрямок: `asc` / `desc`               |
| `page`   | number | `1`        | номер сторінки                         |
| `limit`  | number | `20`       | кількість записів (макс. 50)           |

**приклад відповіді:**

```json
{
  "success": true,
  "data": [ { "id": "kyiv-obolon", "name": "Оболонь", ... } ],
  "meta": { "total": 7, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### `GET /api/stations/:id`

повертає одну станцію за `id`.

**помилки:** `404` якщо станцію не знайдено.

### `GET /api/measurements`

повертає часовий ряд вимірювань для станції.

| параметр    | обов. | опис                          |
| ----------- | ----- | ----------------------------- |
| `stationId` | ✓     | id станції                    |
| `from`      | —     | початок періоду (ISO 8601)    |
| `to`        | —     | кінець періоду (ISO 8601)     |
| `page`      | —     | пагінація                     |
| `limit`     | —     | кількість записів (макс. 200) |

### `GET /api/current`

поточні показники — для всіх станцій або для однієї (`?stationId=`).

---

## рендеринг сторінок

| сторінка        | метод | пояснення                                                            |
| --------------- | ----- | -------------------------------------------------------------------- |
| `/`             | SSR   | `export const dynamic = 'force-dynamic'` — рендер при кожному запиті |
| `/about`        | SSG   | статична, без даних із запиту                                        |
| `/guide`        | SSG   | статична, без даних із запиту                                        |
| `/station/[id]` | SSG   | `generateStaticParams` — всі 7 сторінок пре-рендеряться при білді    |

---

## запуск

```bash
# встановити залежності
npm install

# режим розробки
npm run dev

# production-білд
npm run build
npm run start
```

відкрити: [http://localhost:3000](http://localhost:3000)

---

## кольорова система

| змінна            | значення  | призначення                   |
| ----------------- | --------- | ----------------------------- |
| `--color-bg`      | `#F4F2EB` | фон сторінки (bone off-white) |
| `--color-surface` | `#FAFAF5` | фон карток та блоків          |
| `--color-primary` | `#636B2F` | основний колір (mossy green)  |
| `--color-accent`  | `#D4DE95` | акцент (light yellow-green)   |
| `--color-navy`    | `#0F0E47` | підвал (deep navy)            |
| `--color-text`    | `#3D4127` | основний текст                |
