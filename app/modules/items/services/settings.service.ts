import { apiClient } from "@/lib/api/client";
import type {
  BaseReferencePrice,
  UpdateBaseReferencePriceInput,
} from "@/app/modules/items/types/items.types";

export async function getBaseReferencePrice(
  signal?: AbortSignal,
): Promise<BaseReferencePrice> {
  return apiClient.get<BaseReferencePrice>("/settings/base-reference-price", {
    signal,
  });
}

export async function updateBaseReferencePrice(
  input: UpdateBaseReferencePriceInput,
): Promise<BaseReferencePrice> {
  return apiClient.put<BaseReferencePrice>(
    "/settings/base-reference-price",
    input,
  );
}
