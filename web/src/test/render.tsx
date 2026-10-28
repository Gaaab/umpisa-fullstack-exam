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

export const alice = { __typename: "User" as const, id: "u1", name: "Alice Santos" };
export const bob = { __typename: "User" as const, id: "u2", name: "Bob Reyes" };
