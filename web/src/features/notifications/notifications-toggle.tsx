"use client";

import { useToast } from "@/components/ui/toast";
import { setBrowserNotifications, useBrowserNotifications } from "./preference";

export function NotificationsToggle() {
  const enabled = useBrowserNotifications();
  const toast = useToast();

  async function toggle() {
    if (enabled) return setBrowserNotifications(false);
    if (typeof Notification === "undefined") {
      return toast("This browser doesn't support notifications.", { tone: "error" });
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return toast("Notifications are blocked. Allow them in your browser settings.", {
        tone: "error",
      });
    }
    setBrowserNotifications(true);
    toast("Browser notifications on");
  }

  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={toggle}
      title={enabled ? "Browser notifications are on" : "Turn on browser notifications"}
      className={`inline-flex size-9 items-center justify-center rounded-full transition-colors ${
        enabled ? "bg-cobalt/10 text-cobalt" : "text-graphite hover:bg-wall hover:text-ink"
      }`}
    >
      <span className="sr-only">Browser notifications</span>
      <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        {!enabled && <path d="m3 3 18 18" />}
      </svg>
    </button>
  );
}
