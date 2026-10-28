import type { ReactNode } from "react";
import { AppHeader } from "@/features/auth/app-header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 p-6">{children}</main>
    </>
  );
}
