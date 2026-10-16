import type { DimensionDefaultsForm } from "@/app/modules/items/types/dimension-defaults-form.types";
import type {
  Category,
  Item,
  PricingMode,
} from "@/app/modules/items/types/items.types";

export type LoadStatus = "idle" | "loading" | "success" | "error";

export interface ItemFormValues {
  dimensionDefaults: DimensionDefaultsForm;
  code: string;
  name: string;
  categoryId: string;
  pricingMode: PricingMode;
  unitPrice: string;
  cost: string;
  reorderThreshold: string;
  stockQuantity: string;
  isActive: boolean;
}

export interface UseItemFormResult {
  categories: Category[];
  categoriesStatus: LoadStatus;
  item: Item | null;
  itemStatus: LoadStatus;
  itemError: string | null;
  values: ItemFormValues;
  setField: <K extends keyof ItemFormValues>(
    key: K,
    value: ItemFormValues[K],
  ) => void;
  /** True when the code was last set by the user (stop auto-updating). */
  codeIsManual: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  submit: () => Promise<boolean>;
}
