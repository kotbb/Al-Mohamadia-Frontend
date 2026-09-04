import { apiClient } from "@/lib/api/client";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/app/modules/items/types/items.types";

export async function listCategories(signal?: AbortSignal): Promise<Category[]> {
  return apiClient.get<Category[]>("/categories", { signal });
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<Category> {
  return apiClient.post<Category>("/categories", input);
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category> {
  return apiClient.patch<Category>(`/categories/${id}`, input);
}

export async function deleteCategory(id: string): Promise<Category> {
  return apiClient.delete<Category>(`/categories/${id}`);
}
