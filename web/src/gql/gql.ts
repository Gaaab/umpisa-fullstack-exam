/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation TokenLogin($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}\n\nquery Users {\n  users {\n    ...UserFields\n  }\n}": typeof types.LoginDocument,
    "query Boards {\n  boards {\n    ...BoardFields\n  }\n}\n\nquery Board($id: ID!) {\n  board(id: $id) {\n    ...BoardFields\n    tasks {\n      ...TaskFields\n    }\n  }\n}\n\nmutation CreateBoard($input: CreateBoardInput!) {\n  createBoard(input: $input) {\n    ...BoardFields\n  }\n}\n\nmutation UpdateBoard($input: UpdateBoardInput!) {\n  updateBoard(input: $input) {\n    ...BoardFields\n  }\n}\n\nmutation DeleteBoard($id: ID!) {\n  deleteBoard(id: $id)\n}": typeof types.BoardsDocument,
    "fragment UserFields on User {\n  id\n  name\n  email\n}\n\nfragment BoardFields on Board {\n  id\n  name\n  openTaskCount\n  owner {\n    ...UserFields\n  }\n}\n\nfragment TaskFields on Task {\n  id\n  title\n  description\n  status\n  createdAt\n  updatedAt\n  assignee {\n    ...UserFields\n  }\n}\n\nfragment CommentFields on Comment {\n  id\n  body\n  createdAt\n  author {\n    ...UserFields\n  }\n}": typeof types.UserFieldsFragmentDoc,
    "subscription BoardActivity {\n  boardActivity {\n    type\n    boardId\n    taskId\n  }\n}\n\nsubscription TaskAssigned {\n  taskAssigned {\n    assignedBy {\n      ...UserFields\n    }\n    task {\n      id\n      title\n      status\n      assignee {\n        ...UserFields\n      }\n    }\n  }\n}": typeof types.BoardActivityDocument,
    "query Task($id: ID!) {\n  task(id: $id) {\n    ...TaskFields\n    board {\n      id\n      name\n    }\n    comments {\n      ...CommentFields\n    }\n  }\n}\n\nquery MyTasks {\n  myTasks {\n    id\n    title\n    status\n    board {\n      id\n      name\n    }\n  }\n}\n\nmutation CreateTask($input: CreateTaskInput!) {\n  createTask(input: $input) {\n    ...TaskFields\n  }\n}\n\nmutation UpdateTask($input: UpdateTaskInput!) {\n  updateTask(input: $input) {\n    ...TaskFields\n  }\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation AddComment($input: AddCommentInput!) {\n  addComment(input: $input) {\n    ...CommentFields\n  }\n}": typeof types.TaskDocument,
};
const documents: Documents = {
    "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation TokenLogin($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}\n\nquery Users {\n  users {\n    ...UserFields\n  }\n}": types.LoginDocument,
    "query Boards {\n  boards {\n    ...BoardFields\n  }\n}\n\nquery Board($id: ID!) {\n  board(id: $id) {\n    ...BoardFields\n    tasks {\n      ...TaskFields\n    }\n  }\n}\n\nmutation CreateBoard($input: CreateBoardInput!) {\n  createBoard(input: $input) {\n    ...BoardFields\n  }\n}\n\nmutation UpdateBoard($input: UpdateBoardInput!) {\n  updateBoard(input: $input) {\n    ...BoardFields\n  }\n}\n\nmutation DeleteBoard($id: ID!) {\n  deleteBoard(id: $id)\n}": types.BoardsDocument,
    "fragment UserFields on User {\n  id\n  name\n  email\n}\n\nfragment BoardFields on Board {\n  id\n  name\n  openTaskCount\n  owner {\n    ...UserFields\n  }\n}\n\nfragment TaskFields on Task {\n  id\n  title\n  description\n  status\n  createdAt\n  updatedAt\n  assignee {\n    ...UserFields\n  }\n}\n\nfragment CommentFields on Comment {\n  id\n  body\n  createdAt\n  author {\n    ...UserFields\n  }\n}": types.UserFieldsFragmentDoc,
    "subscription BoardActivity {\n  boardActivity {\n    type\n    boardId\n    taskId\n  }\n}\n\nsubscription TaskAssigned {\n  taskAssigned {\n    assignedBy {\n      ...UserFields\n    }\n    task {\n      id\n      title\n      status\n      assignee {\n        ...UserFields\n      }\n    }\n  }\n}": types.BoardActivityDocument,
    "query Task($id: ID!) {\n  task(id: $id) {\n    ...TaskFields\n    board {\n      id\n      name\n    }\n    comments {\n      ...CommentFields\n    }\n  }\n}\n\nquery MyTasks {\n  myTasks {\n    id\n    title\n    status\n    board {\n      id\n      name\n    }\n  }\n}\n\nmutation CreateTask($input: CreateTaskInput!) {\n  createTask(input: $input) {\n    ...TaskFields\n  }\n}\n\nmutation UpdateTask($input: UpdateTaskInput!) {\n  updateTask(input: $input) {\n    ...TaskFields\n  }\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation AddComment($input: AddCommentInput!) {\n  addComment(input: $input) {\n    ...CommentFields\n  }\n}": types.TaskDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation TokenLogin($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}\n\nquery Users {\n  users {\n    ...UserFields\n  }\n}"): (typeof documents)["mutation Login($input: LoginInput!) {\n  login(input: $input) {\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation TokenLogin($input: LoginInput!) {\n  login(input: $input) {\n    accessToken\n    user {\n      ...UserFields\n    }\n  }\n}\n\nmutation Logout {\n  logout\n}\n\nquery Me {\n  me {\n    ...UserFields\n  }\n}\n\nquery Users {\n  users {\n    ...UserFields\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Boards {\n  boards {\n    ...BoardFields\n  }\n}\n\nquery Board($id: ID!) {\n  board(id: $id) {\n    ...BoardFields\n    tasks {\n      ...TaskFields\n    }\n  }\n}\n\nmutation CreateBoard($input: CreateBoardInput!) {\n  createBoard(input: $input) {\n    ...BoardFields\n  }\n}\n\nmutation UpdateBoard($input: UpdateBoardInput!) {\n  updateBoard(input: $input) {\n    ...BoardFields\n  }\n}\n\nmutation DeleteBoard($id: ID!) {\n  deleteBoard(id: $id)\n}"): (typeof documents)["query Boards {\n  boards {\n    ...BoardFields\n  }\n}\n\nquery Board($id: ID!) {\n  board(id: $id) {\n    ...BoardFields\n    tasks {\n      ...TaskFields\n    }\n  }\n}\n\nmutation CreateBoard($input: CreateBoardInput!) {\n  createBoard(input: $input) {\n    ...BoardFields\n  }\n}\n\nmutation UpdateBoard($input: UpdateBoardInput!) {\n  updateBoard(input: $input) {\n    ...BoardFields\n  }\n}\n\nmutation DeleteBoard($id: ID!) {\n  deleteBoard(id: $id)\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment UserFields on User {\n  id\n  name\n  email\n}\n\nfragment BoardFields on Board {\n  id\n  name\n  openTaskCount\n  owner {\n    ...UserFields\n  }\n}\n\nfragment TaskFields on Task {\n  id\n  title\n  description\n  status\n  createdAt\n  updatedAt\n  assignee {\n    ...UserFields\n  }\n}\n\nfragment CommentFields on Comment {\n  id\n  body\n  createdAt\n  author {\n    ...UserFields\n  }\n}"): (typeof documents)["fragment UserFields on User {\n  id\n  name\n  email\n}\n\nfragment BoardFields on Board {\n  id\n  name\n  openTaskCount\n  owner {\n    ...UserFields\n  }\n}\n\nfragment TaskFields on Task {\n  id\n  title\n  description\n  status\n  createdAt\n  updatedAt\n  assignee {\n    ...UserFields\n  }\n}\n\nfragment CommentFields on Comment {\n  id\n  body\n  createdAt\n  author {\n    ...UserFields\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "subscription BoardActivity {\n  boardActivity {\n    type\n    boardId\n    taskId\n  }\n}\n\nsubscription TaskAssigned {\n  taskAssigned {\n    assignedBy {\n      ...UserFields\n    }\n    task {\n      id\n      title\n      status\n      assignee {\n        ...UserFields\n      }\n    }\n  }\n}"): (typeof documents)["subscription BoardActivity {\n  boardActivity {\n    type\n    boardId\n    taskId\n  }\n}\n\nsubscription TaskAssigned {\n  taskAssigned {\n    assignedBy {\n      ...UserFields\n    }\n    task {\n      id\n      title\n      status\n      assignee {\n        ...UserFields\n      }\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query Task($id: ID!) {\n  task(id: $id) {\n    ...TaskFields\n    board {\n      id\n      name\n    }\n    comments {\n      ...CommentFields\n    }\n  }\n}\n\nquery MyTasks {\n  myTasks {\n    id\n    title\n    status\n    board {\n      id\n      name\n    }\n  }\n}\n\nmutation CreateTask($input: CreateTaskInput!) {\n  createTask(input: $input) {\n    ...TaskFields\n  }\n}\n\nmutation UpdateTask($input: UpdateTaskInput!) {\n  updateTask(input: $input) {\n    ...TaskFields\n  }\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation AddComment($input: AddCommentInput!) {\n  addComment(input: $input) {\n    ...CommentFields\n  }\n}"): (typeof documents)["query Task($id: ID!) {\n  task(id: $id) {\n    ...TaskFields\n    board {\n      id\n      name\n    }\n    comments {\n      ...CommentFields\n    }\n  }\n}\n\nquery MyTasks {\n  myTasks {\n    id\n    title\n    status\n    board {\n      id\n      name\n    }\n  }\n}\n\nmutation CreateTask($input: CreateTaskInput!) {\n  createTask(input: $input) {\n    ...TaskFields\n  }\n}\n\nmutation UpdateTask($input: UpdateTaskInput!) {\n  updateTask(input: $input) {\n    ...TaskFields\n  }\n}\n\nmutation DeleteTask($id: ID!) {\n  deleteTask(id: $id)\n}\n\nmutation AddComment($input: AddCommentInput!) {\n  addComment(input: $input) {\n    ...CommentFields\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;