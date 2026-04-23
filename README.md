# Expense Tracker

Minimal full-stack expense tracker built for the assignment with a Node.js backend and a React frontend.

## Live Links

- Frontend: https://expense-tracker-frontend-pi-two.vercel.app/
- Backend API: https://expense-tracker-b1fo.onrender.com
- Repository: https://github.com/Shriyash1234/expense-tracker

Note: the backend is hosted on Render's free tier, so the first request after inactivity may take a short time while the service wakes up.

## Features

- Create expenses with amount, category, optional description, and date.
- View expenses in a table with a visible total for the current list.
- Filter by predefined categories.
- Filter by period using presets (`Today`, `This week`, `This month`) or a custom date range.
- Sort the table by date from the `Date` column header.
- Retry-safe create flow using idempotency keys.
- Loading, empty, and error states in the UI.

## Tech Stack

- Backend: Node.js, TypeScript, Express, MongoDB, Mongoose, Zod
- Frontend: Vite, React, TypeScript, TanStack Query, shadcn-style UI components, Tailwind CSS
- Testing: Vitest, Supertest, mongodb-memory-server
- Deployment: Render for the API, Vercel for the frontend, MongoDB Atlas for persistence

## Key Design Decisions

- MongoDB was chosen because it is quick to deploy with Atlas, fits this small document-shaped data model, and remains structured through Mongoose and Zod validation.
- Money is stored as integer paise (`amountPaise`) instead of floating-point numbers to avoid rounding issues.
- Expense dates are stored as `YYYY-MM-DD` strings to avoid timezone drift for calendar dates.
- `POST /expenses` requires an `Idempotency-Key` header and stores a request fingerprint so client retries, refreshes, and double submits do not create duplicates.
- The frontend keeps the active draft and idempotency key in `localStorage`, so users can safely retry after slow or failed requests.
- Description is optional to reduce entry friction; amount, category, and date are required.

## API

### `POST /expenses`

Headers:

- `Idempotency-Key: <unique-value>`

Body:

```json
{
  "amount": "123.45",
  "category": "Food",
  "description": "Lunch",
  "date": "2026-04-23"
}
```

`description` may be omitted or empty.

### `GET /expenses`

Optional query params:

- `category`
- `sort=date_desc`
- `fromDate=YYYY-MM-DD`
- `toDate=YYYY-MM-DD`

## Local Setup

### Prerequisites

- Node.js 24+
- npm 11+
- MongoDB locally or a MongoDB Atlas connection string

### Install

```bash
npm install
```

### Configure environment

Backend env in `backend/.env`:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=expense-tracker
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

Frontend env in `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

### Run locally

```bash
npm run dev:backend
npm run dev:frontend
```

### Build and test

```bash
npm run build
npm run test
```

## Deployment

### Backend on Render

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Environment variables:
  - `MONGODB_URI`
  - `MONGODB_DB_NAME`
  - `PORT`
  - `CORS_ORIGIN=https://<your-vercel-domain>`
- Optional: use `render.yaml` from the repo root to prefill the backend service setup.

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_API_BASE_URL=https://<your-render-domain>`

## Assignment Coverage

- Required create/list/filter/sort/total flows are implemented.
- Retry and refresh safety are handled with backend idempotency and frontend draft persistence.
- Money handling avoids floats by storing paise as integers.
- Basic validation prevents invalid amounts, missing required fields, and future expense dates.
- Automated backend tests cover creation, idempotent replay, idempotency conflict, future dates, optional descriptions, category filtering, and date-range filtering.

## Trade-offs

- No authentication or multi-user ownership because the assignment scope is a small personal tool.
- No edit/delete flow yet; the focus is correctness for create/review behavior.
- No pagination because the dataset is expected to be small for the exercise.
- No frontend automated tests yet; backend integration tests cover the highest-risk correctness paths.
- Categories are predefined in the frontend instead of backend-managed to keep the feature small and reduce inconsistent category names.

## Intentionally Not Done

- Summary by category view
- Charts or advanced reporting
- CSV export
- Full deployment automation
