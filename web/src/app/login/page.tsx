import { Card } from "@/components/ui/card";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Sign in to Taskboard</h1>
        <LoginForm />
        <p className="mt-4 text-xs text-zinc-500">
          Demo: alice@example.com / password123
        </p>
      </Card>
    </main>
  );
}
