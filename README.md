# poker-planning-frontend

React + React Three Fiber frontend for Poker Planning — 3D room scene, admin
dashboard, chat/stats overlays.

## Local development

1. Copy `.env.example` to `.env`.
2. Start a `poker-planning-backend` checkout too (see its README) — this
   frontend needs a live backend at `VITE_API_URL`/`VITE_SOCKET_URL`.
3. `docker compose up --build`
4. Open `http://localhost:5173`.

## Running tests

`npm run test`

## Contributing

PRs welcome. CI runs `npm audit` and the test suite on every PR.
