import type { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { ToastProvider } from "@/components/ui/toast";

export function renderWithApollo(ui: ReactElement, mocks: MockLink.MockedResponse[] = []) {
  return render(
    <MockedProvider mocks={mocks}>
      <ToastProvider>{ui}</ToastProvider>
    </MockedProvider>,
  );
}

const user = (id: string, name: string, email: string) => ({
  __typename: "User" as const,
  id,
  name,
  email,
});

export const alice = user("u1", "Alice Santos", "alice@example.com");
export const bob = user("u2", "Bob Reyes", "bob@example.com");
