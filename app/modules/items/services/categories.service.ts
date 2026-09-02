import { apiClient } from "@/lib/api/client";
import type { Category } from "@/app/modules/items/types/items.types";

export async function listCategories(signal?: AbortSignal): Promise<Category[]> {
  return apiClient.get<Category[]>("/categories", { signal });
}
