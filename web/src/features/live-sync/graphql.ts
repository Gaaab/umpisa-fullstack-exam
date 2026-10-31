import { graphql } from "@/gql";

export const BoardActivitySubscription = graphql(`
  subscription BoardActivity {
    boardActivity {
      type
      boardId
      taskId
    }
  }
`);
