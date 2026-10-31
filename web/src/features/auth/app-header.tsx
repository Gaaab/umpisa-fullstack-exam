"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationsToggle } from "@/features/notifications/notifications-toggle";
import { LogoutDocument, MeDocument } from "@/gql/graphql";

const links = [
  { href: "/boards", label: "Boards", segment: "boards" },
  { href: "/my-tasks", label: "My tasks", segment: "my-tasks" },
];

function Nav({ active }: { active?: string | null }) {
  return (
    <nav aria-label="Main" className="flex self-stretch">
      {links.map((link) => {
        const current = link.segment === active;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            className={`flex items-center border-b-2 px-2 font-semibold whitespace-nowrap transition-colors sm:px-3 ${
              current
                ? "border-cobalt text-ink"
                : "border-transparent text-graphite hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveNav() {
  return <Nav active={useSelectedLayoutSegment()} />;
}

export function AppHeader() {
  const router = useRouter();
  const { data, error } = useQuery(MeDocument);
  const [logout, { client }] = useMutation(LogoutDocument);

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
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
        {/* Phones need the room for nav; the Boards tab covers the same link. */}
        <Link href="/boards" className="hidden font-bold sm:inline">
          Taskboard
        </Link>
        {/* Dynamic routes resolve the active segment at request time. */}
        <Suspense fallback={<Nav />}>
          <ActiveNav />
        </Suspense>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <NotificationsToggle />
          {data && <Avatar name={data.me.name} size="md" />}
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
