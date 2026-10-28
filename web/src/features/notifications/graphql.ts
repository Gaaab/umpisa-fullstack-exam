import { graphql } from "@/gql";

export const TaskAssignedSubscription = graphql(`
  subscription TaskAssigned {
    taskAssigned {
      assignedBy {
        id
        name
      }
      task {
        id
        title
        status
        assignee {
          id
          name
        }
      }
    }
  }
`);
