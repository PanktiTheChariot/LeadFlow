import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { LeadDTO, PaginatedResult } from "@/types";

export interface LeadsQuery {
  search?: string;
  status?: string;
  assignedUserId?: string;
  page: number;
  pageSize: number;
}

export function useLeads(query: LeadsQuery) {
  const [data, setData] = useState<PaginatedResult<LeadDTO> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const queryKey = JSON.stringify([
    query.search,
    query.status,
    query.assignedUserId,
    query.page,
    query.pageSize,
    reloadToken,
  ]);

  // "Reset state when a dependency changes" during render, not inside the
  // effect - avoids the setState-in-effect footgun while still flipping back
  // to loading synchronously the moment a new query is requested.
  const [trackedKey, setTrackedKey] = useState(queryKey);
  if (trackedKey !== queryKey) {
    setTrackedKey(queryKey);
    setIsLoading(true);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    if (query.assignedUserId) params.set("assignedUserId", query.assignedUserId);
    params.set("page", String(query.page));
    params.set("pageSize", String(query.pageSize));

    apiFetch<PaginatedResult<LeadDTO>>(`/api/leads?${params.toString()}`).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setData(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data, isLoading, error, refetch };
}
