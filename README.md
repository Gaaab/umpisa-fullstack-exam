# Taskboard

A shared team task board, built for the Full Stack Developer technical exam. One NestJS GraphQL API serves two clients: a Next.js web app and a Flutter app (Android, iOS, web).

See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for scope, workflows and acceptance criteria.

## Quick start

Requires Docker with Compose v2.

```bash
docker compose up --build
```

| App | URL |
| --- | --- |
| Web (Next.js) | http://localhost:3000 |
| Flutter web | http://localhost:3001 |
| GraphQL API | http://localhost:4000/graphql |

Sign in with any seeded user. All use the password `password123`:

- `alice@example.com`
- `bob@example.com`
- `carol@example.com`

The first build takes a few minutes because it downloads the Flutter SDK. If port 3000 or 3001 is taken, override it:

```bash
WEB_PORT=3002 FLUTTER_PORT=3003 docker compose up --build
```

## Stack

| Layer | Tech |
| --- | --- |
| API | NestJS 12, GraphQL (Apollo, code-first), Prisma 7, PostgreSQL 17, JWT |
| Web | Next.js 16 (App Router), React 19, Apollo Client 4, Tailwind CSS 4, GraphQL Codegen |
| Mobile | Flutter 3.47, Riverpod 3, go_router, graphql, flutter_secure_storage |
| Tests | Vitest (API, web), Testing Library (web), flutter_test (mobile) |
| Tooling | Docker Compose, GitHub Actions, pnpm |

## Project layout

```
api/      NestJS GraphQL API (Prisma schema, migrations, seed)
web/      Next.js web client
mobile/   Flutter client
docs/     Requirements
```

## Authentication

`login` returns a JWT and also sets it as an httpOnly cookie.

- **Web**: Next.js rewrites `/graphql` to the API, so the cookie is same-origin and never readable from JavaScript. `src/proxy.ts` redirects between `/login` and protected routes based on the cookie.
- **Mobile**: The token is stored in secure storage and sent as `Authorization: Bearer`. A `go_router` redirect guards routes.
- **API**: `GqlAuthGuard` accepts either the cookie or the Bearer header.

## Local development

Node 24, pnpm (via `corepack enable`) and Flutter 3.47 are required.

```bash
docker compose up -d db                     # Postgres only

cd api
pnpm install
pnpm prisma migrate dev                     # apply migrations
pnpm db:seed                                # demo users
pnpm start:dev                              # http://localhost:4000/graphql

cd web
pnpm install
pnpm dev                                    # http://localhost:3000
pnpm codegen                                # after API schema changes

cd mobile
flutter pub get
flutter run -d chrome                       # or an iOS simulator
flutter run --dart-define=API_URL=http://10.0.2.2:4000/graphql   # Android emulator
```

## Tests and checks

```bash
cd api && pnpm lint && pnpm typecheck && pnpm test
cd web && pnpm lint && pnpm typecheck && pnpm test
cd mobile && flutter analyze && flutter test
```

CI runs the same checks on every push (`.github/workflows/ci.yml`).

## Exam requirements

| Requirement | Status | Where |
| --- | --- | --- |
| Login page | Done | `web/src/app/login`, `mobile/lib/features/auth` |
| 2 workflows / 4 screens | In progress | [Requirements](docs/REQUIREMENTS.md#screens) |
| Runs out of the box | Done | `docker compose up --build` |
| Git | Done | This repository |
| README with run instructions | Done | This file |
| Connects to an API | Done | `api/` (GraphQL) |
| Proper routing | Done | Next.js App Router + `proxy.ts`, `go_router` with redirect guard |
| Code structure | Done | Feature folders in each app |
| Unit tests | Done | `*.spec.ts`, `*.test.tsx`, `mobile/test` |
| Dockerized (nice to have) | Done | `docker-compose.yml`, one Dockerfile per app |
| Push notifications (nice to have) | Stretch | GraphQL subscriptions |
| Page analytics (nice to have) | Out of scope | |
