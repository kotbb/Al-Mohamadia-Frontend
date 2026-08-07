"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/types";
import {
  fetchHealth,
  type HealthData,
} from "@/app/modules/foundation/services/health.service";

type HealthStatus = "idle" | "loading" | "success" | "error";

interface UseHealthResult {
  status: HealthStatus;
  data: HealthData | null;
  errorMessage: string | null;
  refresh: () => void;
}

export function useHealth(): UseHealthResult {
  const [status, setStatus] = useState<HealthStatus>("idle");
  const [data, setData] = useState<HealthData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage(null);

    fetchHealth(controller.signal)
      .then((result) => {
        setData(result);
        setStatus("success");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const message =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : "Request failed";
        setData(null);
        setErrorMessage(message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [tick]);

  return { status, data, errorMessage, refresh };
}
