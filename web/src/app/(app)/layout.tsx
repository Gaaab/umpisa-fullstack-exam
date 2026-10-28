import type { ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import { AppHeader } from "@/features/auth/app-header";
import { TaskAssignedListener } from "@/features/notifications/task-assigned-listener";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppHeader />
      <TaskAssignedListener />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </ToastProvider>
  );
}
