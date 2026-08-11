"use client";

import { useState } from "react";
import { OAUTH_MESSAGE_TYPE } from "@/lib/oauth/constants";

type OAuthIntent = "login" | "signup";

/** Centers a popup window the way most "Sign in with X" flows do, accounting for multi-monitor setups. */
function openCenteredPopup(url: string, name: string, width: number, height: number): Window | null {
  const left = (window.screenX ?? 0) + Math.max(0, (window.outerWidth - width) / 2);
  const top = (window.screenY ?? 0) + Math.max(0, (window.outerHeight - height) / 2);
  return window.open(
    url,
    name,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
  );
}

/**
 * Shared by LoginForm and SignupForm - opens the Google OAuth flow in a small
 * popup instead of navigating the current tab away, and resolves once the
 * callback bridge page posts a result back (see the callback route's
 * `bridgeResponse`). `intent` decides what the backend does when no existing
 * user matches the Google account: "login" fails, "signup" provisions a new
 * company.
 */
export function useGoogleOAuthPopup() {
  const [isLoading, setIsLoading] = useState(false);

  function start(
    intent: OAuthIntent,
    handlers: { onSuccess: () => void; onError: (code: string) => void },
  ) {
    const popup = openCenteredPopup(
      `/api/auth/oauth/google/start?intent=${intent}`,
      "leadflow-google-oauth",
      480,
      640,
    );
    if (!popup) {
      handlers.onError("popup_blocked");
      return;
    }

    setIsLoading(true);

    function cleanup() {
      window.removeEventListener("message", handleMessage);
      clearInterval(pollTimer);
      setIsLoading(false);
    }

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== OAUTH_MESSAGE_TYPE) return;
      cleanup();
      if (event.data.ok) handlers.onSuccess();
      else handlers.onError(event.data.error);
    }

    window.addEventListener("message", handleMessage);

    // The popup can also be closed manually before completing - without this,
    // the listener (and the loading state) would hang around forever.
    const pollTimer = setInterval(() => {
      if (popup.closed) cleanup();
    }, 500);
  }

  return { start, isLoading };
}
