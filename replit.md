# FlashNPrint (FNP)

A full-stack web application for a university print shop ordering and support system (Van Lang University).

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite 6, Tailwind CSS 4, Radix UI, Framer Motion, React Router 7
- **Backend**: Node.js, Express 5, SQLite (via better-sqlite3)
- **Auth**: JWT + bcryptjs
- **Package Manager**: npm

## Project Structure

- `/src` — React frontend (TypeScript)
  - `/app/components` — Shared UI components
  - `/app/context` — React contexts (Auth, Cart, Language)
  - `/app/pages` — Route-level page components
  - `/app/lib` — API client and utilities
- `/server` — Express backend (JavaScript)
  - `index.js` — Main server, API routes, SQLite DB init
- `/data` — SQLite database storage (`fnp.sqlite`)

## Key Configuration

- **Frontend port**: 5000 (Vite dev server, `0.0.0.0` host, all hosts allowed)
- **Backend port**: 3001 (Express, localhost)
- **API Proxy**: Vite proxies `/api/*` to `http://localhost:3001`
- **Database**: SQLite at `data/fnp.sqlite`

## Running the App

```bash
npm run dev
```

This uses `concurrently` to start both the Express backend and Vite frontend simultaneously.

## Environment Variables

- `JWT_SECRET` — JWT signing secret (defaults to insecure dev value)
- `SQLITE_PATH` — Custom SQLite path (defaults to `data/fnp.sqlite`)
- `PORT` — Backend port (defaults to 3001)
- `RATE_LIMIT_GLOBAL_PER_MIN` — Global rate limit
- `RATE_LIMIT_AUTH_PER_15M` — Auth rate limit
- `RATE_LIMIT_WRITE_PER_MIN` — Write rate limit

## Default Admin

Admin account: `admin@vanlanguni.vn` (password enforced on startup)

## Deployment

- Target: autoscale
- Build: `npm run build`
- Run: `node server/index.js` (backend) + `vite preview` (frontend) on port 5000
