"use client";

import { useMutation } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoginMutation } from "./graphql";

export function LoginForm() {
  const router = useRouter();
  const [login, { loading, error }] = useMutation(LoginMutation);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        <p role="alert" className="text-sm text-red-600">
          {error.message}
        </p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
