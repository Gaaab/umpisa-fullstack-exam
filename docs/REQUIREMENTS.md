# Requirements

## Context

Full Stack Developer technical exam. Timebox: 3 days.

The brief asks for an app with a login page plus 2 workflows or 4 screens (login excluded). The app must run out of the box. It also requires Git, a README, an API connection, proper routing, a sound code structure and unit tests. Nice to have: Docker, push notifications, page analytics.

## Product: Taskboard

Taskboard is a shared task board for a small team. Every signed-in user sees every board. Any task can be assigned to any teammate. The same features ship in two clients:

- **Web**: Next.js (App Router)
- **Mobile**: Flutter, native iOS (primary) and Android

Both clients talk to one NestJS GraphQL API backed by PostgreSQL.

## Access

- Users sign in with email and password. Demo users are seeded; there is no registration.
- Every screen except Login requires a session. Signed-out users are redirected to Login. Signed-in users who open Login are redirected to Boards.
- Web keeps the JWT in an httpOnly cookie. Mobile keeps it in secure storage and sends it as a Bearer token.

## Screens

| # | Screen | Web route | Workflow |
| - | ------ | --------- | -------- |
| 0 | Login | `/login` | n/a |
| 1 | Boards | `/boards` | W1 |
| 2 | Board (kanban) | `/boards/[id]` | W1, W2 |
| 3 | Task detail | `/tasks/[id]` | W2 |
| 4 | My tasks | `/my-tasks` | W2 |

## Workflow 1: Board management

- **W1.1** As a user, I see all boards with their task counts.
  - The list shows the name, owner and number of open tasks per board.
  - An empty state shows when no boards exist.
- **W1.2** As a user, I create a board.
  - The name is required, max 60 characters.
  - The new board appears in the list without a page reload.
- **W1.3** As a user, I open a board and see its tasks grouped by status.
  - The columns are To do, In progress and Done.
- **W1.4** As the board owner, I rename or delete my board.
  - Deleting asks for confirmation and removes the board's tasks.

## Workflow 2: Task lifecycle

- **W2.1** As a user, I add a task to a board.
  - The title is required. The description and assignee are optional.
  - New tasks start in To do.
- **W2.2** As a user, I move a task between statuses.
  - On the board, moving a task updates its column immediately.
  - If the server rejects the move, the task returns to its column.
- **W2.3** As a user, I open a task to edit its title, description, status and assignee, or to delete it.
  - Deleting asks for confirmation and returns to the task's board.
- **W2.4** As a user, I comment on a task.
  - Comments show the author and time, oldest first.
- **W2.5** As a user, I see all tasks assigned to me across boards (My tasks).
  - Tasks are grouped by status and link to Task detail.

## Data model

- **User**: id, email (unique), name, passwordHash, createdAt
- **Board**: id, name, ownerId, createdAt
- **Task**: id, boardId, title, description?, status (`TODO` | `IN_PROGRESS` | `DONE`), assigneeId?, createdAt, updatedAt
- **Comment**: id, taskId, authorId, body, createdAt

## GraphQL API

- Queries: `health`, `me`, `users`, `boards`, `board(id)`, `task(id)`, `myTasks`
- Mutations: `login`, `logout`, `createBoard`, `updateBoard`, `deleteBoard`, `createTask`, `updateTask`, `deleteTask`, `addComment`
- Subscription: `taskAssigned`, which reaches only the new assignee and only when someone else assigns the task.
- Inputs are trimmed and validated (`class-validator`). Only the board owner can rename or delete a board.

Both clients use the same operation names: Login, Logout, Me, Boards, Board, CreateBoard, UpdateBoard, DeleteBoard, Task, MyTasks, Users, CreateTask, UpdateTask, DeleteTask, AddComment, TaskAssigned.

## Non-functional

- `docker compose up --build` starts the database, API and web client with no extra setup. The mobile app runs from the Flutter SDK on the iOS Simulator or an Android emulator against that API.
- Unit tests in all three apps. CI runs lint, typecheck/analyze and tests on every push.
- Linting uses each tool's default config.
- Web components are built from a small shared UI kit. Flutter screens share reusable widgets.

## Out of scope

- Registration, password reset, board membership and permissions beyond board ownership
- Refresh tokens
- End-to-end tests
- Page analytics
- OS-level push through APNs or FCM (notifications are in-app and browser only)
- A Flutter web build (the mobile client is native only)

## Notifications (nice to have)

- **N1** When someone else assigns me a task, I am notified live through the `taskAssigned` GraphQL subscription.
  - Web shows a toast linking to the task. If I enabled notifications and the tab is in the background, it also shows a browser notification.
  - Mobile shows a banner with a "View" action that opens the task.
  - My tasks refreshes on its own.
