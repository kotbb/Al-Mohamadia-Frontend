import { apiClient } from "@/lib/api/client";
import type {
  DashboardResponse,
  GetDashboardQuery,
} from "@/app/modules/dashboard/types/dashboard.types";

function buildDashboardQuery(query: GetDashboardQuery): string {
  const params = new URLSearchParams();
  params.set("period", query.period);
  params.set("date", query.date);
  return `/dashboard?${params.toString()}`;
}

export async function getDashboard(
  query: GetDashboardQuery,
  signal?: AbortSignal,
): Promise<DashboardResponse> {
  return apiClient.get<DashboardResponse>(buildDashboardQuery(query), {
    signal,
  });
}
