# BilliardHallPro — Admin Frontend

Web-based admin dashboard for BilliardHallPro. Built with React, TypeScript, Vite, and Mantine. Talks to the Django REST API backend for tables, sessions, schedules, players, and staff authentication.

## Tech Stack

- **React** + **TypeScript** — UI and type-safe data models
- **Vite** — dev server and build tooling
- **Mantine** — component library (`@mantine/core`, `@mantine/form`, `@mantine/hooks`, `@mantine/dates`, `@mantine/notifications`)
- **React Router** — client-side routing and navigation
- **Axios** — HTTP client, configured for session-based auth against Django

## Prerequisites

- **Node.js** 18+ and **npm** (check with `node -v` and `npm -v`)
- The **Django backend** running locally (see the backend README) — this frontend expects it at `http://localhost:8000` by default
- Both frontend and backend should be accessed via the same hostname (`localhost`, not `127.0.0.1`) — see [Common Issues](#common-issues) below for why this matters

## Getting Started

### 1. Clone and install dependencies

```bash
cd poolhall-admin
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (same level as `package.json`):

```
VITE_API_BASE_URL=http://localhost:8000/api/
```

> Vite only exposes environment variables prefixed with `VITE_` to client-side code — this is a Vite convention, not something specific to this project. Any variable without that prefix will be `undefined` in the app.

If you haven't already wired `src/api/client.ts` to read from this variable, update it:


Add `.env` to `.gitignore` if it isn't already there — don't commit environment-specific config, especially once this points at staging/production URLs.

### 3. Start the dev server

```bash
npm run dev
```

By default this runs at `http://localhost:5173`. Check your terminal output — Vite will auto-increment the port if 5173 is already in use, which matters for the CORS setup below.

### 4. Confirm the backend is reachable

With the Django server also running (`python manage.py runserver`), visit `http://localhost:5173` in your browser. You should be redirected to `/login`. Log in with a valid staff account.

If you see a 403 or network error instead, check the [Common Issues](#common-issues) section — this is almost always a CORS or cookie configuration mismatch between the two servers.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with hot module reloading |
| `npm run build` | Type-check and produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally, for a final check before deploying |
| `npm run lint` | Run ESLint across the project (if configured) |

## Project Structure

```
src/
├── api/            # Typed API client + per-resource request functions
│   ├── client.ts   # Shared axios instance, CSRF header handling
│   ├── auth.ts
│   ├── sessions.ts
│   ├── players.ts
│   └── queue.ts
├── components/     # Reusable UI components (cards, modals, badges)
├── context/        # React context providers (AuthContext)
├── pages/          # Route-level screens
├── types/          # Shared TypeScript types, mirroring Django serializers
├── App.tsx         # Route definitions
└── main.tsx        # App entry point, provider setup
```

## Backend Connection Requirements

This app authenticates using **Django session cookies**, not token-based auth. A few things need to line up on the backend for this to work correctly:

**`settings.py` on the Django side must include:**

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # match your actual Vite dev server origin exactly
]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
]
```

**Why `localhost`, not `127.0.0.1`:** browsers treat these as different origins even though they resolve to the same machine. If you log into the Django admin at `127.0.0.1:8000` but the frontend calls `localhost:8000`, the session cookie won't be sent, and every API request will 403. Pick one hostname and use it consistently everywhere — backend admin login, `VITE_API_BASE_URL`, and `CORS_ALLOWED_ORIGINS` should all agree.

## Common Issues

**403 Forbidden on API calls despite being logged in:**
Check the Network tab response body for the specific `detail` message. Most often this is the `localhost` vs `127.0.0.1` mismatch described above, or a missing `CSRF_TRUSTED_ORIGINS` entry on the backend for non-GET requests.

**CORS errors in the console:**
Confirm the Vite dev server's actual port matches an entry in the backend's `CORS_ALLOWED_ORIGINS` exactly — Vite will silently use a different port than 5173 if that one's already taken, and the mismatch won't be obvious unless you check the terminal output.

## Deployment Notes

Before deploying anywhere reachable over a real network:

- Serve both frontend and backend over **HTTPS** — session cookies carry credentials and must not travel in plaintext
- Update `VITE_API_BASE_URL` to the production API URL
- Update the backend's `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` to the production frontend domain
- Set `SESSION_COOKIE_SECURE = True` and `CSRF_COOKIE_SECURE = True` on the Django side so cookies are never sent over plain HTTP