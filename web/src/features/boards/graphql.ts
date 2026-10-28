import { graphql } from "@/gql";

export const BoardsQuery = graphql(`
  query Boards {
    boards {
      id
      name
      openTaskCount
      owner {
        id
        name
      }
    }
  }
`);

export const BoardQuery = graphql(`
  query Board($id: ID!) {
    board(id: $id) {
      id
      name
      owner {
        id
        name
      }
      tasks {
        ...TaskFields
      }
    }
  }
`);

export const CreateBoardMutation = graphql(`
  mutation CreateBoard($input: CreateBoardInput!) {
    createBoard(input: $input) {
      id
      name
      openTaskCount
      owner {
        id
        name
      }
    }
  }
`);

export const UpdateBoardMutation = graphql(`
  mutation UpdateBoard($input: UpdateBoardInput!) {
    updateBoard(input: $input) {
      id
      name
    }
  }
`);

export const DeleteBoardMutation = graphql(`
  mutation DeleteBoard($id: ID!) {
    deleteBoard(id: $id)
  }
`);
