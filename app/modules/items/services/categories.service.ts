import { apiClient } from "@/lib/api/client";
import type {
  Category,
  ListCategoriesOptions,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "@/app/modules/items/types/items.types";

export async function listCategories(signal?: AbortSignal, options?: ListCategoriesOptions): Promise<Category[]> {
  return apiClient.get<Category[]>(options?.includeItemCount ? "/categories?includeItemCount=true" : "/categories", { signal });
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
