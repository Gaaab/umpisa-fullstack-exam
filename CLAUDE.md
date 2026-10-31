# CLAUDE.md

Taskboard: technical exam project. NestJS GraphQL API serves Next.js web client + Flutter client. Scope + acceptance criteria in `docs/REQUIREMENTS.md`. Visual tokens, layout, copy in `docs/DESIGN.md` (follow it; use `frontend-design` + `ui-ux-pro-max` skills for UI work). Run instructions in `README.md`.

## Working rules

- Use caveman skill (full) for chat replies, save tokens. Code, comments, commits, docs stay normal English.
- Exam, not product. No over-engineering. No layers, abstractions, shared packages or deps current feature not need.
- Write optimized, lean code. Flutter: `const` widgets, `ref.watch(provider.select(...))` to limit rebuilds. Web: keep client bundles small. No premature perf work.
- Comments only where "why" not obvious. Max 1-2 short lines. No docblocks restating code.
- Keep feature parity: every workflow ships in web + mobile with same GraphQL operation names.
- Every feature adds unit tests in app it touches.
- Commit with Conventional Commits (`feat(api): ...`, `fix(web): ...`), directly on `main`.
- Must run out of box: after changes, `docker compose up --build` must still work.

## Layout and commands

- `api/`: NestJS 12 (ESM, `.js` import suffixes), code-first GraphQL, Prisma 7, Vitest, oxlint.
  - `pnpm start:dev`, `pnpm test`, `pnpm lint`, `pnpm typecheck`
  - `pnpm prisma migrate dev --name <name>`, `pnpm db:seed`, `pnpm db:reset` (Prisma blocks it for AI agents: ask user)
  - `pnpm smoke`: live API check (needs running seeded API)
- `web/`: Next.js 16 App Router, Apollo Client 4, Tailwind 4, Vitest + Testing Library.
  - `pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm codegen`
  - `pnpm rehearse`: browser run of all workflows via Chrome (`WEB_URL`, default :3000)
- `mobile/`: Flutter 3.47, Riverpod 3, go_router, `graphql` package. Native only (iOS first, Android); no Flutter web, not in Docker. Verify on iOS Simulator.
  - `flutter run`, `flutter test`, `flutter analyze`, `dart format lib test integration_test`
  - `flutter test integration_test/app_test.dart -d <simulator>`: drives real app against local API (manual, not CI)
- Local dev DB: `docker compose up -d db`.
- Setup, env vars, seed data, rehearsal steps: `docs/CHECKLIST.md`. Keep it in sync when commands or seed change.
- API loads optional `api/.env` (`process.loadEnvFile`); web reads `web/.env.local`.

## Gotchas

- `api/schema.gql` generated on API boot, committed. After API schema change: boot API, then `pnpm codegen` in `web/`. Commit both.
- Prisma client generated into `api/src/generated` (gitignored) by `postinstall`. Prisma 7 `migrate dev` no longer regenerates: run `pnpm prisma generate` after every schema edit.
- Every board/task/comment mutation must publish via `BoardActivity.publish` (api/src/boards/board-activity.ts); clients refetch on-screen data from `boardActivity`. New mutation without publish = clients go stale.
- Field resolvers use `findUnique` lookups; Prisma batches same-tick `findUnique` calls, so no DataLoader needed.
- Subscriptions: `graphql-ws` `onConnect` verifies token (Bearer in `connectionParams` or `token` cookie on upgrade), stores `user` on context. Nest Apollo driver sets `req` to ws context object on subscriptions, so `GqlAuthGuard` checks `user` first.
- Restarting API: kill leftover `node dist/main` too, else new process hits `EADDRINUSE` and old code keeps serving.
- Next.js 16 renamed middleware to `proxy.ts`. Read `web/AGENTS.md` + docs in `web/node_modules/next/dist/docs/` before using Next APIs.
- Apollo Client 4 hooks import from `@apollo/client/react`. Test mocks import from `@apollo/client/testing/react`.
- pnpm 12 blocks dep build scripts. Allow in each app's `pnpm-workspace.yaml` under `allowBuilds`.
- Web `/graphql` rewrite destination resolved at build time from `API_URL` build arg.
- Flutter gets API URL at compile time via `--dart-define=API_URL` (default `http://localhost:4000/graphql`, fine for iOS Simulator). Android emulator needs `http://10.0.2.2:4000/graphql`.
- CI pins Flutter `3.47.8` in `.github/workflows/ci.yml`. Bump with local SDK.