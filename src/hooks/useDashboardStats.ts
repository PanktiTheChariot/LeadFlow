import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import type { DashboardStats } from "@/types";

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<DashboardStats>("/api/dashboard/stats").then((result) => {
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
  }, []);

  return { data, isLoading, error };
}
