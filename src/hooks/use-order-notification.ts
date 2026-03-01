"use client";

import { useCallback, useRef, useEffect } from "react";

// Notification bell sound as a base64 encoded WAV
// Simple two-tone chime
const BELL_SOUND_BASE64 =
  "data:audio/wav;base64,UklGRpQFAABXQVZFZm10IBAAAAABAAEAESsAACJWAAABAAgAZGF0YXAFAACAiJGYnqKkoZ6YkYiAd3BqZmRkZmptdX2EjJOYnJ6enJiTi4N7c2xnZGNkZ2x0fISLkpecn5+cmJKLg3t0bWlmZWZpa3N7goqRl5yenp2YlI2GfnZwa2dmZmpudHuDi5KXnJ+fnJqVjoeAeHJtaWdnaWxye4KJkJabnp+enJiTjIV+d3FsaWdoa2x0e4KKkJabnp+fnZqWkIiBeXNta2hoa21ze4KJkJabn5+fnZiTjYaBenRuamhna2xze4KJkJabn5+fnZmUjoiBeXRuamhoamxze4KJj5Wbnp+fnpmUjoiAenRuamhoa2x0e4OJkJabnp+fnZqVj4mCe3VvamhnamxyeoGIkJabnt+fnpqWkIiCe3VuamhnamxxeoGIj5abnp+fnpuWkImCe3VuamhoamxxeoGIj5abnp+fn5uWkImCe3VvamhnamxyeoGIj5abnp+fnpuWkImCfHVvbGpoamxyeoGIj5abnp+fnpuWkImCe3VvbGpoamxxeoGIj5abnp6fnpuWkImCe3ZvbGprb3R6gIeLj5KUlZWUk5CMiIR/e3dzcXBwcnV4fICEiIuOkJGSkZCOjImGg397eHZzcnFydHd6foCEiIuOkJGRkZCOjImFgn97eHV0cnJzdXd6foGEiIuOkJGRkZCOjImFgn56d3V0cnJzdXh6foCEh4uOkJCRkJCOjImFgn56d3V0cnFzdXd6foCEiIuOkJGRkI+NjImFgn55d3VzcnFzdXh7foGEiIuOkJGRkZCOjIqGgn96eHVzcXFydHd6foCEiIuOkJGRkJCOjImGgn96eHV0c3JydHd7foGEiIuOkJGRkZCOjImGg396eHV0c3JydHd7foGEiIuOkJGRkI+NjImFgn56eHV0cnJzdXh7foGEiIuOkJGRkZCOjImGg396eHV0c3J0dXh7fn+EiIuOkJGRkI+NjImGg396eHV0cnJzdXd7foGFiIuOkJGRkJCOjImGg396eHV0c3J0dXh7fn+EiIuOkJGRkI+OjImGg396eHV0cnJzdXd7foGEiIuNkJGRkJCOjImFg396eHV0c3J0dXh7fn+DiIuOkJGRkI+OjImGg396eHV0cnJzdXd6foGEiIuOkJGRkJCOjImFg396eHV0c3J0dXh7fn+DiIuOkJGRkI+OjImGg396eHV0cnJzdXd6foGEiIuOkJGRkJCOjImGg396eHV0c3J0dXh7foGEiIuOkJGRkI+OjImGgn96eHV0cnJzdXh7foGEiIuOkJGRkJCOjImFg396eHV0c3Jzdnh7fn+EiIuOkJGRkI+OjImGg396eHVzcnJzdHd6foGEiIuOkJGRkI+OjImFg396eHV0c3JzdXd6foGEiIuOkJGRkI+OjImFg396eHV0c3Jzdnh7fn+EiIuOkJCRkI+OjImFg396eHV0cnJzdHd7foGEiIuOkJGRkI+OjImFg396eHV0c3Jzdnh7fn+DiIuOkJCQkI+OjImFg396eHV0cnJzdXd6foGEiIuOkJGRkI+OjImFg396eHV0c3J0dXh7fn+DiIuOkJGRkI+OjImGg396eHV0cnJzdXd6foGEiIuOkJGRkI+OjImFg396eHV0c3Jzdnh7fn+DiIuOkJGRkI+OjImFg396eHV0cnJzdXd7fn+EiIuNkJGRkI+OjImFg396eHV0c3Jzdnh7foGEiIuNkJGRkI+OjImFg396eHV0c3Jzdnh7foGEiIuNkJGRkI+OjImFg396eHV0c3Jzdnh7foGEiIuNkJGRkI+OjImFg396eHVzcnJzdXd6fn+EiIuNkJCQkI+OjImFg396eHV0c3N0dXh6fn+EiIuNkJCQkI+OjImFgn96eHV0c3N0dXh6fn+DiIuNkJCQkI+NjImFgn96eHVzcnN0dXh6fn+DiIuNkJCQkI+NjImFgn96eHVzcnN0dnh6fn+DiIqNkJCQkI+NjImFgn96eHVzcnN0dnh6fn+DiIqN";

export function useOrderNotification() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteractedRef.current) {
        hasInteractedRef.current = true;
        try {
          audioRef.current = new Audio(BELL_SOUND_BASE64);
          audioRef.current.volume = 0.5;
          // Pre-load the audio
          audioRef.current.load();
        } catch {
          // Audio not supported
        }
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, []);

  const playNotification = useCallback(() => {
    if (audioRef.current && hasInteractedRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Browser may block autoplay
      });
    }

    // Also use Web Notification API if available
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🔔 Nowe zamówienie!", {
        body: "Pojawiło się nowe zamówienie do realizacji",
        icon: "/favicon.ico",
      });
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }, []);

  return { playNotification, requestNotificationPermission };
}
