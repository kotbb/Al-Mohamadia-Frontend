import { apiClient } from "@/lib/api/client";

export interface HealthData {
  status: string;
}

export async function fetchHealth(signal?: AbortSignal): Promise<HealthData> {
  return apiClient.get<HealthData>("/health", { signal });
}
