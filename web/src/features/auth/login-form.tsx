"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginDocument } from "@/gql/graphql";

export function LoginForm() {
  const router = useRouter();
  const [login, { loading, error }] = useMutation(LoginDocument);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await login({
        variables: {
          input: {
            email: String(form.get("email")),
            password: String(form.get("password")),
          },
        },
      });
      router.replace("/boards");
    } catch {
      // The error is rendered from the mutation result below.
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Email" name="email" type="email" autoComplete="email" required />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {error && (
        <p role="alert" className="text-meta text-brick">
          {error.message}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
