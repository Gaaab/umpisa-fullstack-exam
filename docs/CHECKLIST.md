# Setup and rehearsal checklist

Use this before a demo or a submission. Tick each box top to bottom.

## 1. Prerequisites

- [ ] Docker with Compose v2 (`docker compose version`)
- [ ] Node 24 and pnpm through Corepack (`node -v`, `corepack enable`)
- [ ] Google Chrome, for `pnpm rehearse`
- [ ] Flutter 3.47.8 (`flutter --version`) and `flutter doctor` with no iOS issues
- [ ] Xcode with an iOS 26 simulator (`xcrun simctl list devices available`)
- [ ] Optional: Android Studio with an emulator

## 2. Ports

| Port | Service | If taken |
| --- | --- | --- |
| 5432 | Postgres | Stop the other Postgres |
| 4000 | API | Stop the other process (check with `lsof -iTCP:4000 -sTCP:LISTEN`) |
| 3000 | Web | Run with `WEB_PORT=3002 docker compose up --build` |

## 3. Environment variables

Nothing needs to be set for a default run. Every value has a default that matches `docker-compose.yml`.

| App | Variable | Default | Where it is read |
| --- | --- | --- | --- |
| API | `PORT` | `4000` | `api/src/config.ts` |
| API | `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/taskboard` | API and Prisma CLI |
| API | `JWT_SECRET` | `dev-only-secret` | Signs login tokens; set a real one outside local use |
| Web | `API_URL` | `http://localhost:4000` | `/graphql` rewrite, resolved at build time |
| Web | `NEXT_PUBLIC_WS_URL` | `ws://localhost:4000/graphql` | Live notifications, inlined at build time |
| Mobile | `API_URL` (`--dart-define`) | `http://localhost:4000/graphql` | Use `http://10.0.2.2:4000/graphql` on an Android emulator |
| Compose | `WEB_PORT`, `JWT_SECRET` | `3000`, `dev-only-secret` | `docker-compose.yml` |

- **API:** `cp api/.env.example api/.env` for local overrides. The API and the Prisma CLI load it, and real environment variables win.
- **Web:** `cp web/.env.example web/.env.local`. Next.js loads it in dev and at build time.

## 4. Start: Docker (what graders run)

- [ ] `docker compose up --build`
- [ ] `docker compose ps` shows `db` and `api` as healthy and `web` as up
- [ ] http://localhost:3000 opens the sign-in page
- [ ] `curl -s localhost:4000/graphql -H 'Content-Type: application/json' -d '{"query":"{health}"}'` returns `{"data":{"health":"ok"}}`

The API container applies migrations and runs the seed on every start.

## 5. Start: local development

- [ ] `docker compose up -d db`
- [ ] `cd api && pnpm install && pnpm prisma migrate dev && pnpm db:seed && pnpm start:dev`
- [ ] `cd web && pnpm install && pnpm dev`
- [ ] `cd mobile && flutter pub get && xcrun simctl boot "iPhone 17 Pro" && flutter run`. The device window is Simulator on Xcode 26 and earlier, DeviceHub on Xcode 27.

## 6. Seed data

`pnpm db:seed` (in `api/`) is safe to run repeatedly:

- **Users are upserted.** Each of the 3 users uses password `password123`:
  - `alice@example.com` (Alice Santos)
  - `bob@example.com` (Bob Reyes)
  - `carol@example.com` (Carol Cruz)
- **Demo boards are created only when the database has no boards**, so restarts keep your edits:
  - Website relaunch, owned by Alice: 4 tasks across all three lanes (one unassigned) and 2 comments
  - Mobile app beta, owned by Bob: 3 tasks

| Goal | Command |
| --- | --- |
| Add missing demo users | `cd api && pnpm db:seed` |
| Wipe and reseed the local database | `cd api && pnpm db:reset` (asks Prisma to drop everything) |
| Wipe and reseed the Docker database | `docker compose down -v && docker compose up --build` |
| Check what is in the database | `docker compose exec db psql -U postgres -d taskboard -c 'select name from "Board"'` |

`pnpm db:reset` refuses to run when an AI agent invokes it. Run it yourself.

## 7. Automated rehearsal

With the stack running and seeded:

- [ ] CI is green on the latest commit (`gh run list -L 1`)
- [ ] API: `cd api && pnpm smoke` runs 13 checks, including live notifications and WebSocket auth
- [ ] Web: `cd web && WEB_URL=http://localhost:3000 pnpm rehearse` runs 21 browser steps as Alice and Bob, with no console errors
- [ ] iOS: `cd mobile && flutter test integration_test/app_test.dart -d <simulator id>` runs the whole demo in 12 steps. Alice drives the app; Bob, acting through the API, hands her a task, which must arrive live. Find the id with `xcrun simctl list devices booted`.
- [ ] Optional: record the iOS run with `xcrun simctl io <simulator id> recordVideo demo.mov` (stop with Ctrl+C)
- [ ] Unit tests: `pnpm test` in `api/` and `web/`, `flutter test` in `mobile/`

Every script creates its own data and deletes it at the end.

## 8. Manual demo script

Run it once on web and once on the iOS Simulator.

- [ ] Signed-out visit to `/boards` lands on sign in. A wrong password shows "Invalid email or password".
- [ ] Sign in as Alice and see both boards with owner and open count.
- [ ] Try to create a board with an empty name and see the error. Then create "Demo board".
- [ ] Open it and see three lanes. Add a task assigned to Bob.
- [ ] Bob is signed in elsewhere (second browser profile or the simulator) and gets "Alice Santos assigned you …".
- [ ] Move the task:
  - Web: use the Move menu, then drag the card.
  - iOS: swipe the card or use "⋯", and feel the haptic on a device.
- [ ] Open the task, edit the title, Save changes, post a comment.
- [ ] My tasks groups Bob's work by status.
- [ ] Bob opens Alice's board and sees no Rename or Delete.
- [ ] Delete the task, rename the board, delete the board.
- [ ] Sign out, and protected pages redirect again.
- [ ] Narrow the browser to phone width: lanes scroll sideways and the page itself does not.

## 9. Before submitting

- [ ] Wipe demo data (`docker compose down -v`), then rerun section 4 from a fresh clone (`gh repo clone Gaaab/umpisa-fullstack-exam`)
- [ ] README instructions still match what you just did
- [ ] Graders can access the repository (collaborators added, or the repo made public)

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `EADDRINUSE :4000` | A previous API is still running. Stop it, including any leftover `node dist/main` process. |
| Sign-in fails with a network error | The API is down, or `API_URL` was wrong at build time. Rebuild web. |
| No live notifications on web | `NEXT_PUBLIC_WS_URL` must be reachable from the browser. Rebuild web after changing it. |
| Simulator cannot reach the API | The API must listen on the host's port 4000. The iOS Simulator shares the host's `localhost`. |
| Android emulator cannot reach the API | Run with `--dart-define=API_URL=http://10.0.2.2:4000/graphql` |
| `Cannot find module '../generated/prisma/...'` | Run `pnpm prisma generate` in `api/` |
| Seed changes do not appear | Boards seed only into an empty database. Reset it (section 6). |
