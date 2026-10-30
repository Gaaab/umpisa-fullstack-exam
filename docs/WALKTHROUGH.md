# Walkthrough

A checklist for presenting Taskboard in a technical interview: what to prepare, what to demo, where the code lives, and why it is built this way.

## Before the call

- [ ] Fresh data: `docker compose down -v && docker compose up --build`
- [ ] CI is green, and `pnpm smoke` (api), `pnpm rehearse` (web) and the iOS integration test all pass
- [ ] iOS Simulator booted, and `cd mobile && flutter run` shows the sign-in screen
- [ ] Two browser profiles open, one signed in as Alice and one as Bob
- [ ] Editor open on the files in the code tour below

## Demo (about 5 minutes)

1. Sign in with a wrong password, then sign in properly as Alice.
2. Create a board with an empty name to show validation, then create a real one.
3. Add a task assigned to Bob. Bob's window gets the toast live.
4. Move the task by drag and drop and by the Move menu. It moves instantly and rolls back if the server rejects it.
5. Open the task: edit it, post a comment, then check My tasks.
6. In Bob's window, open Alice's board: Bob has no rename or delete. As Alice, delete the task and then the board, and sign out.
7. Repeat steps 1 to 5 in the iOS app: tab bar, lane switcher, swipe to move, sheets.

## Code tour

| Topic | Where | Point to make |
| --- | --- | --- |
| Layout | `api/`, `web/`, `mobile/`, `docs/` | Three independent apps in plain folders, with no workspace tooling to maintain |
| Data model | `api/prisma/schema.prisma` | Relations, cascade deletes, indexes on foreign keys |
| GraphQL schema | `api/src/boards/boards.resolver.ts` | Code-first: decorated classes generate `schema.gql`. Resolvers stay thin; services hold the rules |
| N+1 queries | `api/src/boards/boards.service.ts` | Field resolvers use `findUnique`, which Prisma batches per tick |
| Validation | `api/src/common/validation.ts`, `api/src/**/*.inputs.ts` | `class-validator` with trimming and readable messages |
| Auth | `api/src/auth/gql-auth.guard.ts`, `api/src/auth/token.ts` | Cookie for web, Bearer for mobile, both checked by one guard |
| Live updates | `api/src/app.module.ts` (`onConnect`), `api/src/tasks/tasks.service.ts` (`notifyAssignee`) | The WebSocket authenticates once; events go only to the new assignee |
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
- **Typed codegen on web, hand-written models in Flutter:** both are type-safe, and Flutter skips a `build_runner` step.
- **Riverpod and go_router over Bloc:** less boilerplate. `select` limits rebuilds.
- **Optimistic moves:** moving cards is the most frequent action, so it should feel instant. Errors roll back with a message.
- **Native-only Flutter:** the web client already covers browsers, so Flutter web was cut to keep scope focused.
- **Rehearsals kept out of CI:** they need a live stack and a browser or simulator. CI runs the fast, deterministic unit tests.

## Known limits and next steps

- Any signed-in user can delete any task. Next: board membership and roles.
- A single 7-day JWT with no refresh token. Next: short-lived access tokens with refresh rotation.
- The in-memory PubSub works for one API instance only. Next: Redis PubSub to scale out.
- Notifications are in-app and in the browser only. Next: APNs and FCM.
- Lists are not paginated. Next: cursor pagination once boards grow.
- `JWT_SECRET` has a local default and the cookie is not `secure`. Both must change behind HTTPS in production.

## Numbers

- Unit tests: API 22, web 25, mobile 32.
- Rehearsals: the API smoke test has 13 checks, the web browser run has 21 steps, and the iOS Simulator demo has 12 steps.
