import { graphql } from "@/gql";

// Shared by the board, CreateTask and UpdateTask so cache writes line up.
export const TaskFieldsFragment = graphql(`
  fragment TaskFields on Task {
    id
    title
    description
    status
    updatedAt
    assignee {
      id
      name
    }
  }
`);

export const TaskQuery = graphql(`
  query Task($id: ID!) {
    task(id: $id) {
      ...TaskFields
      createdAt
      board {
        id
        name
      }
      comments {
        id
        body
        createdAt
        author {
          id
          name
        }
      }
    }
  }
`);

export const MyTasksQuery = graphql(`
  query MyTasks {
    myTasks {
      id
      title
      status
      board {
        id
        name
      }
    }
  }
`);

export const UsersQuery = graphql(`
  query Users {
    users {
      id
      name
    }
  }
`);

export const CreateTaskMutation = graphql(`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskFields
    }
  }
`);

export const UpdateTaskMutation = graphql(`
  mutation UpdateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      ...TaskFields
    }
  }
`);

export const DeleteTaskMutation = graphql(`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`);

export const AddCommentMutation = graphql(`
  mutation AddComment($input: AddCommentInput!) {
    addComment(input: $input) {
      id
      body
      createdAt
      author {
        id
        name
      }
    }
  }
`);
