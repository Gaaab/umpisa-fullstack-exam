import type { Metadata } from "next";
import { MyTasks } from "@/features/tasks/my-tasks";

export const metadata: Metadata = { title: "My tasks" };

export default function MyTasksPage() {
  return (
    <>
      <h1 className="mb-6 text-title font-bold">My tasks</h1>
      <MyTasks />
    </>
  );
}
