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
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        name\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n    }\n  }\n": typeof types.MeDocument,
    "\n  query Boards {\n    boards {\n      id\n      name\n      openTaskCount\n      owner {\n        id\n        name\n      }\n    }\n  }\n": typeof types.BoardsDocument,
    "\n  query Board($id: ID!) {\n    board(id: $id) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      tasks {\n        ...TaskFields\n      }\n    }\n  }\n": typeof types.BoardDocument,
    "\n  mutation CreateBoard($input: CreateBoardInput!) {\n    createBoard(input: $input) {\n      id\n      name\n      openTaskCount\n      owner {\n        id\n        name\n      }\n    }\n  }\n": typeof types.CreateBoardDocument,
    "\n  mutation UpdateBoard($input: UpdateBoardInput!) {\n    updateBoard(input: $input) {\n      id\n      name\n    }\n  }\n": typeof types.UpdateBoardDocument,
    "\n  mutation DeleteBoard($id: ID!) {\n    deleteBoard(id: $id)\n  }\n": typeof types.DeleteBoardDocument,
    "\n  subscription BoardActivity {\n    boardActivity {\n      type\n      boardId\n      taskId\n    }\n  }\n": typeof types.BoardActivityDocument,
    "\n  subscription TaskAssigned {\n    taskAssigned {\n      assignedBy {\n        id\n        name\n      }\n      task {\n        id\n        title\n        status\n        assignee {\n          id\n          name\n        }\n      }\n    }\n  }\n": typeof types.TaskAssignedDocument,
    "\n  fragment TaskFields on Task {\n    id\n    title\n    description\n    status\n    updatedAt\n    assignee {\n      id\n      name\n    }\n  }\n": typeof types.TaskFieldsFragmentDoc,
    "\n  query Task($id: ID!) {\n    task(id: $id) {\n      ...TaskFields\n      createdAt\n      board {\n        id\n        name\n      }\n      comments {\n        id\n        body\n        createdAt\n        author {\n          id\n          name\n        }\n      }\n    }\n  }\n": typeof types.TaskDocument,
    "\n  query MyTasks {\n    myTasks {\n      id\n      title\n      status\n      board {\n        id\n        name\n      }\n    }\n  }\n": typeof types.MyTasksDocument,
    "\n  query Users {\n    users {\n      id\n      name\n    }\n  }\n": typeof types.UsersDocument,
    "\n  mutation CreateTask($input: CreateTaskInput!) {\n    createTask(input: $input) {\n      ...TaskFields\n    }\n  }\n": typeof types.CreateTaskDocument,
    "\n  mutation UpdateTask($input: UpdateTaskInput!) {\n    updateTask(input: $input) {\n      ...TaskFields\n    }\n  }\n": typeof types.UpdateTaskDocument,
    "\n  mutation DeleteTask($id: ID!) {\n    deleteTask(id: $id)\n  }\n": typeof types.DeleteTaskDocument,
    "\n  mutation AddComment($input: AddCommentInput!) {\n    addComment(input: $input) {\n      id\n      body\n      createdAt\n      author {\n        id\n        name\n      }\n    }\n  }\n": typeof types.AddCommentDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        name\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      email\n    }\n  }\n": types.MeDocument,
    "\n  query Boards {\n    boards {\n      id\n      name\n      openTaskCount\n      owner {\n        id\n        name\n      }\n    }\n  }\n": types.BoardsDocument,
    "\n  query Board($id: ID!) {\n    board(id: $id) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      tasks {\n        ...TaskFields\n      }\n    }\n  }\n": types.BoardDocument,
    "\n  mutation CreateBoard($input: CreateBoardInput!) {\n    createBoard(input: $input) {\n      id\n      name\n      openTaskCount\n      owner {\n        id\n        name\n      }\n    }\n  }\n": types.CreateBoardDocument,
    "\n  mutation UpdateBoard($input: UpdateBoardInput!) {\n    updateBoard(input: $input) {\n      id\n      name\n    }\n  }\n": types.UpdateBoardDocument,
    "\n  mutation DeleteBoard($id: ID!) {\n    deleteBoard(id: $id)\n  }\n": types.DeleteBoardDocument,
    "\n  subscription BoardActivity {\n    boardActivity {\n      type\n      boardId\n      taskId\n    }\n  }\n": types.BoardActivityDocument,
    "\n  subscription TaskAssigned {\n    taskAssigned {\n      assignedBy {\n        id\n        name\n      }\n      task {\n        id\n        title\n        status\n        assignee {\n          id\n          name\n        }\n      }\n    }\n  }\n": types.TaskAssignedDocument,
    "\n  fragment TaskFields on Task {\n    id\n    title\n    description\n    status\n    updatedAt\n    assignee {\n      id\n      name\n    }\n  }\n": types.TaskFieldsFragmentDoc,
    "\n  query Task($id: ID!) {\n    task(id: $id) {\n      ...TaskFields\n      createdAt\n      board {\n        id\n        name\n      }\n      comments {\n        id\n        body\n        createdAt\n        author {\n          id\n          name\n        }\n      }\n    }\n  }\n": types.TaskDocument,
    "\n  query MyTasks {\n    myTasks {\n      id\n      title\n      status\n      board {\n        id\n        name\n      }\n    }\n  }\n": types.MyTasksDocument,
    "\n  query Users {\n    users {\n      id\n      name\n    }\n  }\n": types.UsersDocument,
    "\n  mutation CreateTask($input: CreateTaskInput!) {\n    createTask(input: $input) {\n      ...TaskFields\n    }\n  }\n": types.CreateTaskDocument,
    "\n  mutation UpdateTask($input: UpdateTaskInput!) {\n    updateTask(input: $input) {\n      ...TaskFields\n    }\n  }\n": types.UpdateTaskDocument,
    "\n  mutation DeleteTask($id: ID!) {\n    deleteTask(id: $id)\n  }\n": types.DeleteTaskDocument,
    "\n  mutation AddComment($input: AddCommentInput!) {\n    addComment(input: $input) {\n      id\n      body\n      createdAt\n      author {\n        id\n        name\n      }\n    }\n  }\n": types.AddCommentDocument,
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
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      user {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): (typeof documents)["\n  mutation Logout {\n    logout\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      name\n      email\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      name\n      email\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Boards {\n    boards {\n      id\n      name\n      openTaskCount\n      owner {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query Boards {\n    boards {\n      id\n      name\n      openTaskCount\n      owner {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Board($id: ID!) {\n    board(id: $id) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      tasks {\n        ...TaskFields\n      }\n    }\n  }\n"): (typeof documents)["\n  query Board($id: ID!) {\n    board(id: $id) {\n      id\n      name\n      owner {\n        id\n        name\n      }\n      tasks {\n        ...TaskFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateBoard($input: CreateBoardInput!) {\n    createBoard(input: $input) {\n      id\n      name\n      openTaskCount\n      owner {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreateBoard($input: CreateBoardInput!) {\n    createBoard(input: $input) {\n      id\n      name\n      openTaskCount\n      owner {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateBoard($input: UpdateBoardInput!) {\n    updateBoard(input: $input) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateBoard($input: UpdateBoardInput!) {\n    updateBoard(input: $input) {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteBoard($id: ID!) {\n    deleteBoard(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteBoard($id: ID!) {\n    deleteBoard(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription BoardActivity {\n    boardActivity {\n      type\n      boardId\n      taskId\n    }\n  }\n"): (typeof documents)["\n  subscription BoardActivity {\n    boardActivity {\n      type\n      boardId\n      taskId\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  subscription TaskAssigned {\n    taskAssigned {\n      assignedBy {\n        id\n        name\n      }\n      task {\n        id\n        title\n        status\n        assignee {\n          id\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription TaskAssigned {\n    taskAssigned {\n      assignedBy {\n        id\n        name\n      }\n      task {\n        id\n        title\n        status\n        assignee {\n          id\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment TaskFields on Task {\n    id\n    title\n    description\n    status\n    updatedAt\n    assignee {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  fragment TaskFields on Task {\n    id\n    title\n    description\n    status\n    updatedAt\n    assignee {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Task($id: ID!) {\n    task(id: $id) {\n      ...TaskFields\n      createdAt\n      board {\n        id\n        name\n      }\n      comments {\n        id\n        body\n        createdAt\n        author {\n          id\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Task($id: ID!) {\n    task(id: $id) {\n      ...TaskFields\n      createdAt\n      board {\n        id\n        name\n      }\n      comments {\n        id\n        body\n        createdAt\n        author {\n          id\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyTasks {\n    myTasks {\n      id\n      title\n      status\n      board {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query MyTasks {\n    myTasks {\n      id\n      title\n      status\n      board {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Users {\n    users {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query Users {\n    users {\n      id\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTask($input: CreateTaskInput!) {\n    createTask(input: $input) {\n      ...TaskFields\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTask($input: CreateTaskInput!) {\n    createTask(input: $input) {\n      ...TaskFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTask($input: UpdateTaskInput!) {\n    updateTask(input: $input) {\n      ...TaskFields\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTask($input: UpdateTaskInput!) {\n    updateTask(input: $input) {\n      ...TaskFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteTask($id: ID!) {\n    deleteTask(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteTask($id: ID!) {\n    deleteTask(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddComment($input: AddCommentInput!) {\n    addComment(input: $input) {\n      id\n      body\n      createdAt\n      author {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddComment($input: AddCommentInput!) {\n    addComment(input: $input) {\n      id\n      body\n      createdAt\n      author {\n        id\n        name\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;