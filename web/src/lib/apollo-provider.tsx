"use client";

import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { OperationTypeNode } from "graphql";
import { createClient } from "graphql-ws";
import { useState, type ReactNode } from "react";

function createLink() {
  const http = new HttpLink({ uri: "/graphql" });
  if (typeof window === "undefined") return http;
  // The browser sends the auth cookie on the upgrade, so no connectionParams.
  const ws = new GraphQLWsLink(
    createClient({ url: process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/graphql" }),
  );
  return ApolloLink.split(
    ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
    ws,
    http,
  );
}

export function AppApolloProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new ApolloClient({
        link: createLink(),
        cache: new InMemoryCache({
          // Lists come back whole from the server, so replace instead of merging.
          typePolicies: {
            Board: { fields: { tasks: { merge: false } } },
            Query: { fields: { boards: { merge: false }, myTasks: { merge: false } } },
          },
        }),
        // Boards are shared, so show cached data but always revalidate.
        defaultOptions: { watchQuery: { fetchPolicy: "cache-and-network" } },
      }),
  );
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
