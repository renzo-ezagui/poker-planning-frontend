# poker-planning-frontend

The table: a React + React Three Fiber app where players pick cards in secret and
the host flips them all at once. Includes the join flow, host sign-in/sign-up
(username or Google), the host dashboard with invite link + QR, chat, results,
moderation and a built-in manual at `/help`.

## Local development

1. Start a [poker-planning-backend](https://github.com/renzo-ezagui/poker-planning-backend)
   checkout (its compose file works out of the box).
2. `docker compose up --build` (or `npm install && npm run dev`).
3. Open `http://localhost:5173`, go to **Host a table** → **Create account**,
   open a table, and join it from a second browser window.

## Configuration (build time)

| Variable | Default | |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | Backend URL, or a same-origin path such as `/api` behind a reverse proxy |
| `VITE_SOCKET_URL` | `http://localhost:3000` | Socket.IO endpoint; `/` means same origin |
| `VITE_PUBLIC_URL` | — | Public base URL used for invite links and QR codes |

Serving UI, API and websocket from one origin is recommended: the host session
cookie is `SameSite=Strict`.

## Routes

`/` home · `/r/:code` table · `/admin/login` host sign-in / sign-up ·
`/admin` host dashboard · `/help` user manual

## Design notes

- Palette and type live as CSS variables at the top of `src/index.css`
  (felt green, cream cards, brass accents; Fraunces + Instrument Sans).
- Card faces/backs and the felt are drawn procedurally (`src/scene/textures.ts`),
  and the sounds are synthesized with WebAudio (`src/lib/sound.ts`). There are no
  binary assets to license.
- Low-power devices (narrow screens or ≤ 4 CPU cores) render without shadows or
  antialiasing, at 1× pixel ratio. Portrait screens rotate the table so it fills
  the screen.
- The three.js scene is lazy-loaded, so the home and host pages stay light.

## Themes

Each table has a theme, picked by the host when opening it or switched live from the
host controls (`room:theme`). A theme is one entry in `src/themes/index.ts`:

- **scene:** table colours, geometry detail, avatar shape, decor, torches, and
  `pixelScale` (renders the canvas at a fraction of the resolution and upscales with
  hard pixels)
- **sound:** `soft` or `chiptune` (`src/lib/sound.ts`)
- **copy:** the few strings with personality ("Current quest", "Party in sync!")
- **CSS:** token overrides under `[data-theme='<id>']` in `src/index.css`
- **card art:** per-theme branches in `src/scene/textures.ts` (the dungeon uses a
  5×7 bitmap font from `src/scene/pixelFont.ts`)

To add a theme, extend `THEMES` there and `THEMES` in the backend's `room.schema.ts`.

## Running tests

`npm run test`

## Contributing

PRs welcome. CI runs `npm audit` and the test suite on every PR.
