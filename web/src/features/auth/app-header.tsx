"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogoutMutation, MeQuery } from "./graphql";

export function AppHeader() {
  const router = useRouter();
  const { data, error } = useQuery(MeQuery);
  const [logout, { client }] = useMutation(LogoutMutation);

  async function signOut() {
    await logout();
    await client.clearStore();
    router.replace("/login");
  }

  // A stale cookie passes the proxy check but fails here, so clear it.
  useEffect(() => {
    if (error) void signOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3">
      <span className="font-semibold">Taskboard</span>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-600">{data?.me.name}</span>
        <Button variant="secondary" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
