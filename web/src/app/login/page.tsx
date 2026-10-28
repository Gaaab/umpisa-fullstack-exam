import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <p className="mb-1 font-bold">Taskboard</p>
        <h1 className="mb-6 text-title font-bold">Sign in</h1>
        <LoginForm />
        <p className="mt-5 text-meta text-graphite">
          Demo: alice@example.com / password123
        </p>
      </Card>
    </main>
  );
}
