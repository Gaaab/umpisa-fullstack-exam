# Taskboard

A shared task board for small teams, built for the Full Stack Developer technical exam. One NestJS GraphQL API serves two clients: a Next.js web app and an iOS-first Flutter mobile app (iOS and Android).

- [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md): workflows, acceptance criteria, API surface
- [docs/DESIGN.md](docs/DESIGN.md): visual direction, tokens, layouts, copy
- [docs/CHECKLIST.md](docs/CHECKLIST.md): setup, environment variables, seed data, rehearsal and demo checklist
- [docs/WALKTHROUGH.md](docs/WALKTHROUGH.md): demo order, code tour, decisions and trade-offs

## Quick start

Requires Docker with Compose v2.

```bash
docker compose up --build
```

| App | URL |
| --- | --- |
| Web (Next.js) | http://localhost:3000 |
| GraphQL API | http://localhost:4000/graphql |

Sign in with any seeded user. All use the password `password123`:

- `alice@example.com`, who owns "Website relaunch"
- `bob@example.com`, who owns "Mobile app beta"
- `carol@example.com`

If port 3000 is taken, run `WEB_PORT=3002 docker compose up --build`.

### Mobile app (iOS Simulator)

Requires Flutter 3.47 and Xcode. Keep the Docker stack running, then:

```bash
cd mobile
flutter pub get
open -a Simulator
flutter run                     # picks the booted iPhone simulator
```

The app reaches the API at `http://localhost:4000/graphql` by default. On an Android emulator, run:

```bash
flutter run --dart-define=API_URL=http://10.0.2.2:4000/graphql
```

## What it does

- **Boards (workflow 1):** see every board with its owner and open-task count, create a board, open it as a kanban with three lanes, and rename or delete your own boards.
- **Tasks (workflow 2):** add a task, then move it between To do, In progress and Done. On web you drag the card or use its Move menu. On iOS you swipe the card or use its action sheet. Moves update instantly and roll back if the server rejects them. Open a task to edit it, assign it, comment on it or delete it. My tasks lists everything assigned to you, grouped by status.
- **Live notifications:** when someone assigns you a task, you get a toast on web (plus a browser notification if you enabled them and the tab is hidden) or a banner on mobile. This is delivered through a GraphQL subscription over WebSocket.

| Screen | Web route | Mobile route |
| --- | --- | --- |
| Login | `/login` | `/login` |
| Boards | `/boards` | `/boards` (Boards tab) |
| Board | `/boards/[id]` | `/boards/:id` |
| Task detail | `/tasks/[id]` | `/tasks/:id` |
| My tasks | `/my-tasks` | `/my-tasks` (My tasks tab) |

## Stack

| Layer | Tech |
| --- | --- |
| API | NestJS 12, GraphQL (Apollo, code-first, graphql-ws subscriptions), Prisma 7, PostgreSQL 17, JWT, class-validator |
| Web | Next.js 16 (App Router), React 19, Apollo Client 4, Tailwind CSS 4, GraphQL Codegen |
| Mobile | Flutter 3.47 (iOS, Android), Riverpod 3, go_router, graphql, flutter_secure_storage |
| Tests | Vitest (API, web), Testing Library (web), flutter_test + integration_test (mobile) |
| Tooling | Docker Compose, GitHub Actions, pnpm |

## Project layout

```
api/      NestJS GraphQL API: auth, boards, tasks, users; Prisma schema, migrations, seed
web/      Next.js client: src/app routes, src/features/*, src/components/ui
mobile/   Flutter client: lib/core, lib/features/*, lib/widgets, integration_test
docs/     Requirements and design spec
```

## How it works

- **Auth.** `login` returns a JWT and also sets it as an httpOnly cookie.
  - The web app proxies `/graphql` through a Next.js rewrite, so the cookie is same-origin and never readable from JavaScript. `src/proxy.ts` redirects between `/login` and protected routes.
  - The mobile app stores the token in the iOS Keychain or Android Keystore and sends `Authorization: Bearer`. A `go_router` redirect guards its routes.
  - The API's `GqlAuthGuard` accepts either.
- **Data loading.** Nested fields (board owner, task assignee, comments) are resolved with `findUnique` lookups. Prisma batches lookups made in the same tick, so lists don't cause N+1 queries.
- **Notifications.** Subscriptions authenticate once, when the WebSocket connects: web sends the cookie, mobile sends a Bearer token in `connectionParams`. An event reaches only the new assignee.
- **Optimistic UI.** Moving a task updates the board immediately: through Apollo `optimisticResponse` on web, and through local Riverpod state with a haptic tick on iOS. The move is reverted if the mutation fails.

## Local development

You need Node 24 with pnpm (`corepack enable`) and Flutter 3.47.

```bash
docker compose up -d db          # Postgres only

cd api
pnpm install
pnpm prisma migrate dev          # apply migrations
pnpm db:seed                     # demo users, boards, tasks (pnpm db:reset to wipe)
pnpm start:dev                   # http://localhost:4000/graphql

cd web
pnpm install
pnpm dev                         # http://localhost:3000
pnpm codegen                     # after API schema changes

cd mobile
flutter pub get
flutter run
```

## Tests and checks

```bash
cd api && pnpm lint && pnpm typecheck && pnpm test
cd web && pnpm lint && pnpm typecheck && pnpm test
cd mobile && flutter analyze && flutter test
```

CI runs the same checks on every push (`.github/workflows/ci.yml`).

## Rehearsal

These run against a live stack. Each creates its own data and cleans it up.

```bash
cd api && pnpm smoke                       # API: 13 checks incl. live notifications
cd web && pnpm rehearse                    # Web: 21 browser steps as Alice and Bob (needs Chrome)
cd mobile && flutter test integration_test/app_test.dart -d <simulator-id>   # iOS app on a simulator
```

Set `WEB_URL` or `API_URL` if you changed the ports. See [docs/CHECKLIST.md](docs/CHECKLIST.md) for the full pre-demo checklist.

## Exam requirements

| Requirement | Status | Where |
| --- | --- | --- |
| Login page | Done | `web/src/app/login`, `mobile/lib/features/auth` |
| 2 workflows / 4 screens | Done | Boards and Tasks workflows, 4 screens per client ([Requirements](docs/REQUIREMENTS.md#screens)) |
| Runs out of the box | Done | `docker compose up --build` (web + API); mobile through `flutter run` |
| Git | Done | This repository |
| README with run instructions | Done | This file |
| Connects to an API | Done | `api/` (GraphQL over HTTP and WebSocket) |
| Proper routing | Done | Next.js App Router + `proxy.ts`; `go_router` with a redirect guard and tab shell |
| Code structure | Done | Feature modules in each app, shared UI kits |
| Unit tests | Done | `api/src/**/*.spec.ts`, `web/src/**/*.test.tsx`, `mobile/test` |
| Dockerized app (nice to have) | Done | `docker-compose.yml`, Dockerfiles in `api/` and `web/` |
| Push notifications (nice to have) | Done (in-app and browser) | `taskAssigned` subscription; OS push through APNs/FCM is out of scope |
| Page analytics (nice to have) | Out of scope | |
