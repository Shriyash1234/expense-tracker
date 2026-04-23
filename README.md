# Expense Tracker

Minimal full-stack expense tracker built for the assignment with a Node.js backend and a React frontend.

## Tech Stack

- Backend: Node.js, TypeScript, Express, MongoDB, Mongoose, Zod
- Frontend: Vite, React, TypeScript, TanStack Query
- Testing: Vitest, Supertest, mongodb-memory-server
- Deployment target: Render for the API, Vercel for the frontend, MongoDB Atlas for persistence

## Why MongoDB

MongoDB was chosen because it is fast to stand up in a timeboxed exercise, easy to host on Atlas, and still gives enough structure for this app through a strict Mongoose schema and API validation. The data shape is simple and document-friendly, so the trade-off is acceptable for this version.

## Key Design Decisions

- Money is stored as `amountPaise` integers in the database rather than floats to avoid rounding issues.
- Expense `date` is stored as a `YYYY-MM-DD` string so the calendar date does not shift because of timezone conversions.
- `POST /expenses` uses an `Idempotency-Key` header and stores a request fingerprint so client retries, refreshes, or repeated clicks do not create duplicate rows.
- The frontend keeps the in-progress form draft and idempotency key in `localStorage`, which makes retry-after-refresh safe.

## Project Structure

- `backend/` Express API
- `frontend/` Vite React app

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

### `GET /expenses`

Optional query params:

- `category`
- `sort=date_desc`

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

In one terminal:

```bash
npm run dev:backend
```

In another terminal:

```bash
npm run dev:frontend
```

### Build

```bash
npm run build
```

### Test

```bash
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

## Timebox Trade-offs

- No authentication or multi-user support
- No edit/delete flow
- No pagination
- No frontend test suite yet
- Category is free text instead of a managed list

## What Was Intentionally Not Done

- Summary by category view
- Charts or advanced reporting
- Optimistic UI updates
- Full deployment automation

## Verification

- Backend TypeScript build passes
- Frontend production build passes
- Backend API tests cover creation, idempotent replay, idempotency conflict, filtering, and newest-first sorting
