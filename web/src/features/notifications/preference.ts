"use client";

import { useSyncExternalStore } from "react";

const KEY = "taskboard:notify";
const listeners = new Set<() => void>();

export function browserNotificationsEnabled() {
  return (
    typeof Notification !== "undefined" &&
    Notification.permission === "granted" &&
    localStorage.getItem(KEY) === "on"
  );
}

export function setBrowserNotifications(on: boolean) {
  localStorage.setItem(KEY, on ? "on" : "off");
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useBrowserNotifications() {
  return useSyncExternalStore(subscribe, browserNotificationsEnabled, () => false);
}
