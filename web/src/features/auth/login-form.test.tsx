import type { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LoginMutation } from "./graphql";
import { LoginForm } from "./login-form";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const input = { email: "alice@example.com", password: "password123" };

function renderForm(mock: MockLink.MockedResponse) {
  render(
    <MockedProvider mocks={[mock]}>
      <LoginForm />
    </MockedProvider>,
  );
}

async function submit() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), input.email);
  await user.type(screen.getByLabelText("Password"), input.password);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginForm", () => {
  it("redirects to boards after a successful login", async () => {
    renderForm({
      request: { query: LoginMutation, variables: { input } },
      result: {
        data: {
          login: {
            __typename: "AuthPayload",
            user: { __typename: "User", id: "u1", name: "Alice" },
          },
        },
      },
    });
    await submit();
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/boards"));
  });

  it("shows the API error on bad credentials", async () => {
    renderForm({
      request: { query: LoginMutation, variables: { input } },
      error: new Error("Invalid email or password"),
    });
    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
  });
});
