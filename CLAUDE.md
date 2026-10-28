# CLAUDE.md

Taskboard: technical exam project. NestJS GraphQL API serves Next.js web client + Flutter client. Scope + acceptance criteria in `docs/REQUIREMENTS.md`. Run instructions in `README.md`.

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
  - `pnpm prisma migrate dev --name <name>`, `pnpm db:seed`
- `web/`: Next.js 16 App Router, Apollo Client 4, Tailwind 4, Vitest + Testing Library.
  - `pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm codegen`
- `mobile/`: Flutter 3.47, Riverpod 3, go_router, `graphql` package.
  - `flutter run`, `flutter test`, `flutter analyze`, `dart format lib test`
- Local dev DB: `docker compose up -d db`.

## Gotchas

- `api/schema.gql` generated on API boot, committed. After API schema change: boot API, then `pnpm codegen` in `web/`. Commit both.
- Prisma client generated into `api/src/generated` (gitignored) by `postinstall`. After schema edit, run `pnpm prisma generate`.
- Next.js 16 renamed middleware to `proxy.ts`. Read `web/AGENTS.md` + docs in `web/node_modules/next/dist/docs/` before using Next APIs.
- Apollo Client 4 hooks import from `@apollo/client/react`. Test mocks import from `@apollo/client/testing/react`.
- pnpm 12 blocks dep build scripts. Allow in each app's `pnpm-workspace.yaml` under `allowBuilds`.
- Web `/graphql` rewrite destination resolved at build time from `API_URL` build arg.
- Flutter web gets API URL at compile time via `--dart-define=API_URL`. Android emulator needs `http://10.0.2.2:4000/graphql`.
- Flutter Dockerfile clones Flutter at local SDK tag, since prebuilt images lag. Bump both together.