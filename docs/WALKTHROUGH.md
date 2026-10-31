# Walkthrough

A checklist for presenting Taskboard in a technical interview: what to prepare, what to demo, where the code lives, and why it is built this way.

## Before the call

- [ ] Fresh data: `docker compose down -v && docker compose up --build`
- [ ] CI is green, and `pnpm smoke` (api), `pnpm rehearse` (web) and the iOS integration test all pass
- [ ] iOS Simulator booted (`xcrun simctl boot "iPhone 17 Pro"`; window in Simulator or Xcode 27's DeviceHub), and `cd mobile && flutter run` shows the sign-in screen
- [ ] Two browser profiles open, one signed in as Alice and one as Bob
- [ ] Editor open on the files in the code tour below

## Demo (about 5 minutes)

1. Sign in with a wrong password, then sign in properly as Alice.
2. Create a board with an empty name to show validation, then create a real one.
3. Add a task assigned to Bob. Bob's window gets the toast live.
4. Move the task by drag and drop and by the Move menu. It moves instantly and rolls back if the server rejects it.
5. Open the task: edit it, post a comment, then check My tasks.
6. In Bob's window, open Alice's board: Bob has no rename or delete.
7. Live sync: open the same board on the iPhone as Alice and in the browser as Bob. Add, move and comment on either side, and the other updates within a second. Delete the board as Alice, and Bob's page sends him back with a message.
8. Repeat steps 1 to 5 in the iOS app: tab bar, lane switcher, swipe to move, sheets.

## Code tour

| Topic | Where | Point to make |
| --- | --- | --- |
| Layout | `api/`, `web/`, `mobile/`, `docs/` | Three independent apps in plain folders, with no workspace tooling to maintain |
| Data model | `api/prisma/schema.prisma` | Relations, cascade deletes, indexes on foreign keys |
| GraphQL contract | `graphql/operations/*.graphql`, `web/codegen.ts`, `web/scripts/codegen-dart.cjs` | One file per area defines every operation. One codegen run validates them against the schema and generates web types and Dart constants. CI fails on drift |
| GraphQL schema | `api/src/boards/boards.resolver.ts` | Code-first: decorated classes generate `schema.gql`. Resolvers stay thin; services hold the rules |
| N+1 queries | `api/src/boards/boards.service.ts` | Field resolvers use `findUnique`, which Prisma batches per tick |
| Validation | `api/src/common/validation.ts`, `api/src/**/*.inputs.ts` | `class-validator` with trimming and readable messages |
| Auth | `api/src/auth/gql-auth.guard.ts`, `api/src/auth/token.ts` | Cookie for web, Bearer for mobile, both checked by one guard |
| Live updates | `api/src/app.module.ts` (`onConnect`), `api/src/boards/board-activity.ts`, `api/src/tasks/tasks.service.ts` | The WebSocket authenticates once. `boardActivity` streams every change; `taskAssigned` goes only to the new assignee |
| Live sync (web) | `web/src/features/live-sync/board-activity-listener.tsx` | Refetches only visible queries; leaves deleted pages; the actor keeps their own feedback |
| Live sync (iOS) | `mobile/lib/core/live_client.dart`, `mobile/lib/features/boards/board_activity.dart` | One socket per user for both subscriptions; pending moves survive refetches |
| Web routing | `web/src/proxy.ts`, `web/next.config.ts` | Same-origin `/graphql` rewrite keeps the token in an httpOnly cookie |
| Web data | `web/src/lib/apollo-provider.tsx`, `web/src/features/tasks/use-move-task.ts` | Split HTTP/WebSocket link, `optimisticResponse`, cache policies |
| Web UI | `web/src/components/ui`, `web/src/app/globals.css` | Reusable primitives built on the design tokens in `docs/DESIGN.md` |
| Mobile state | `mobile/lib/features/boards/boards_providers.dart` | Riverpod notifier; a failed optimistic move reverts only that card |
| Mobile routing | `mobile/lib/core/router.dart` | `go_router` auth redirect plus `StatefulShellRoute` tabs |
| Mobile live | `mobile/lib/features/tasks/task_assigned.dart` | Its own WebSocket per signed-in user, rebuilt on sign-in and sign-out |
| Tests | `*.spec.ts`, `*.test.tsx`, `mobile/test`, `mobile/integration_test` | Behaviour-focused unit tests, plus live rehearsals |

## Decisions and trade-offs

- **GraphQL over REST:** nested reads (board, then tasks, then assignee) take one request, and subscriptions handle live updates. The cost is watching for N+1 queries and keeping client caches correct.
- **NestJS code-first:** the TypeScript classes are the schema, so there's one place to change. Web codegen reads the generated schema.
- **Prisma 7 over the 8 release candidate:** stable beats new for an exam.
- **Cookie on web, Bearer on mobile:** the web token is never readable by JavaScript, which limits what an XSS attack could steal. On mobile the token lives in the Keychain or Keystore.
- **One operation source, two generated adapters:** operations are written once in `graphql/operations`. Web gets typed documents, and mobile gets validated Dart constants from a 40-line codegen plugin. Dart models stay hand-written, so there's no `build_runner` step; the shared fragments keep every field both clients parse in one place.
- **`Login` vs `TokenLogin`:** sharing operations made the token visible as a choice. Web never selects it, so the httpOnly cookie guarantee holds; mobile selects it for secure storage.
- **Riverpod and go_router over Bloc:** less boilerplate. `select` limits rebuilds.
- **Optimistic moves:** moving cards is the most frequent action, so it should feel instant. Errors roll back with a message.
- **Native-only Flutter:** the web client already covers browsers, so Flutter web was cut to keep scope focused.
- **Events say what changed, clients refetch:** the payload is just `{ type, boardId, taskId }`. Refetching what's on screen is simpler and always correct, compared with patching client caches from event data. The cost is a few small queries per event.
- **Rehearsals kept out of CI:** they need a live stack and a browser or simulator. CI runs the fast, deterministic unit tests.

## Known limits and next steps

- Any signed-in user can delete any task. Next: board membership and roles.
- A single 7-day JWT with no refresh token. Next: short-lived access tokens with refresh rotation.
- The in-memory PubSub works for one API instance only. Next: Redis PubSub to scale out.
- Every client receives every board event, which is fine for one shared team. Next: per-board channels once boards have members.
- Events missed while a socket reconnects are not replayed. Next: refetch on reconnect. Pull-to-refresh covers it today.
- Notifications are in-app and in the browser only. Next: APNs and FCM.
- Lists are not paginated. Next: cursor pagination once boards grow.
- `JWT_SECRET` has a local default and the cookie is not `secure`. Both must change behind HTTPS in production.

## Numbers

- Unit tests: API 24, web 31, mobile 39.
- Rehearsals: the API smoke test has 14 checks, the web browser run has 29 steps, and the iOS Simulator demo has 13 steps.
- Cross-client live sync measured at 93 to 476 ms between the iPhone simulator and Chrome.
