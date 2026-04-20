"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { prependNotification, type Notification } from "@/hooks/useNotifications";
import { getApiUrl } from "@/lib/config";

const RECONNECT_DELAY_MS = 5_000;

export function useNotificationStream() {
  const { user } = useAuth();
  const esRef    = useRef<EventSource | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) {
      esRef.current?.close();
      esRef.current = null;
      return;
    }

    function connect() {
      if (typeof EventSource === "undefined") return;

      const url = `${getApiUrl()}/api/notifications/stream`;
      const es  = new EventSource(url, { withCredentials: true });
      esRef.current = es;

      es.addEventListener("notification", (evt) => {
        try {
          const n: Notification = JSON.parse((evt as MessageEvent).data);
          prependNotification(n);
        } catch {
          // malformed frame — ignore
        }
      });

      es.addEventListener("error", () => {
        es.close();
        esRef.current = null;
        // Manual reconnect — browser's native retry can stall after repeated failures
        timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      });
    }

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user]);
}
