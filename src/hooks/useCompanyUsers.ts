import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { UserSummaryDTO } from "@/server/services/userService";

export function useCompanyUsers(enabled: boolean) {
  const [users, setUsers] = useState<UserSummaryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [reloadToken, setReloadToken] = useState(0);

  const requestKey = `${enabled}:${reloadToken}`;
  const [trackedKey, setTrackedKey] = useState(requestKey);
  if (trackedKey !== requestKey) {
    setTrackedKey(requestKey);
    if (enabled) setIsLoading(true);
  }

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    apiFetch<{ users: UserSummaryDTO[] }>("/api/users").then((result) => {
      if (cancelled) return;
      if (result.ok) setUsers(result.data.users);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { users, isLoading, refetch };
}
