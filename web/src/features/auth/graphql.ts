import { graphql } from "@/gql";

export const LoginMutation = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        name
      }
    }
  }
`);

export const LogoutMutation = graphql(`
  mutation Logout {
    logout
  }
`);

export const MeQuery = graphql(`
  query Me {
    me {
      id
      name
      email
    }
  }
`);
