// End-to-end API smoke test against a running, seeded API.
// Usage: pnpm smoke  (API_URL defaults to http://localhost:4000/graphql)
// Creates its own board and deletes it at the end.
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';

const API_URL = process.env.API_URL ?? 'http://localhost:4000/graphql';
const WS_URL = API_URL.replace(/^http/, 'ws');
let failed = 0;

async function gql(query, variables, token) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

function check(label, ok, detail = '') {
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}${ok || !detail ? '' : `: ${detail}`}`);
}

async function login(email) {
  const { data } = await gql(
    'mutation($i: LoginInput!) { login(input: $i) { accessToken user { id } } }',
    { i: { email, password: 'password123' } },
  );
  return data.login;
}

const alice = await login('alice@example.com');
const bob = await login('bob@example.com');

const boards = await gql('{ boards { name openTaskCount owner { name } } }', {}, alice.accessToken);
check('seeded boards are listed', boards.data?.boards.length >= 2, JSON.stringify(boards));

const blank = await gql('mutation { createBoard(input: { name: "   " }) { id } }', {}, alice.accessToken);
check('blank board name is rejected', blank.errors?.[0].message === 'Board name is required');

const board = (
  await gql('mutation { createBoard(input: { name: "  Smoke test  " }) { id name } }', {}, alice.accessToken)
).data.createBoard;
check('board is created with a trimmed name', board.name === 'Smoke test');

const forbidden = await gql(
  'mutation($i: UpdateBoardInput!) { updateBoard(input: $i) { id } }',
  { i: { id: board.id, name: 'Hijacked' } },
  bob.accessToken,
);
check('only the owner can rename', forbidden.errors?.[0].extensions.code === 'FORBIDDEN');

// Bob listens over WebSocket while Alice assigns him a task.
const ws = createClient({
  url: WS_URL,
  webSocketImpl: WebSocket,
  connectionParams: { authorization: `Bearer ${bob.accessToken}` },
});
const notification = new Promise((resolve) => {
  ws.subscribe(
    { query: 'subscription { taskAssigned { task { title } assignedBy { name } } }' },
    { next: resolve, error: (e) => resolve({ error: String(e) }), complete: () => {} },
  );
  setTimeout(() => resolve({ error: 'timeout' }), 5000);
});
await new Promise((r) => setTimeout(r, 300));

const task = (
  await gql(
    'mutation($i: CreateTaskInput!) { createTask(input: $i) { id status assignee { name } } }',
    { i: { boardId: board.id, title: 'Smoke task', assigneeId: bob.user.id } },
    alice.accessToken,
  )
).data.createTask;
check('task starts in TODO with its assignee', task.status === 'TODO' && task.assignee.name === 'Bob Reyes');

const message = await notification;
check(
  'assignee receives taskAssigned',
  message.data?.taskAssigned.assignedBy.name === 'Alice Santos',
  JSON.stringify(message),
);
await ws.dispose();

const anonymous = createClient({ url: WS_URL, webSocketImpl: WebSocket, lazy: false, retryAttempts: 0, onNonLazyError: () => {} });
const closeCode = await new Promise((resolve) => {
  anonymous.on('closed', (event) => resolve(event.code));
  setTimeout(() => resolve('timeout'), 3000);
});
check('unauthenticated WebSocket is rejected', closeCode === 4403, String(closeCode));

const moved = (
  await gql(
    'mutation($i: UpdateTaskInput!) { updateTask(input: $i) { status assignee { name } } }',
    { i: { id: task.id, status: 'IN_PROGRESS', assigneeId: null } },
    alice.accessToken,
  )
).data.updateTask;
check('task moves and unassigns', moved.status === 'IN_PROGRESS' && moved.assignee === null);

const comment = (
  await gql(
    'mutation($i: AddCommentInput!) { addComment(input: $i) { author { name } } }',
    { i: { taskId: task.id, body: 'Looks good' } },
    bob.accessToken,
  )
).data.addComment;
check('comment records its author', comment.author.name === 'Bob Reyes');

const detail = (
  await gql('query($id: ID!) { task(id: $id) { board { name } comments { body } } }', { id: task.id }, alice.accessToken)
).data.task;
check('task detail resolves board and comments', detail.board.name === 'Smoke test' && detail.comments.length === 1);

const users = (await gql('{ users { name } }', {}, bob.accessToken)).data.users;
check('users are listed', users.length >= 3);

await gql('mutation($id: ID!) { deleteBoard(id: $id) }', { id: board.id }, alice.accessToken);
const gone = await gql('query($id: ID!) { task(id: $id) { id } }', { id: task.id }, alice.accessToken);
check('deleting a board removes its tasks', gone.errors?.[0].message === 'Task not found');

const anonymousQuery = await gql('{ boards { id } }');
check('unauthenticated query is rejected', anonymousQuery.errors?.[0].extensions.code === 'UNAUTHENTICATED');

console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
