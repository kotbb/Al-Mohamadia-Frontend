import type { Category } from "@/app/modules/items/types/items.types";

export type ListStatus = "idle" | "loading" | "success" | "error";

export type CategoriesToastKind =
  "created" | "updated" | "activated" | "deactivated" | "deleted";

export interface CategoriesToastState {
  kind: CategoriesToastKind;
  variant: "success" | "danger";
}

export type CategoriesConfirmKind = "deactivate" | "activate" | "delete" | null;

export interface CategoryListRow extends Category {
  itemCount: number;
}

export interface CategoriesFilters {
  search: string;
  isActive: "all" | "active" | "inactive";
}

export interface UseCategoriesResult {
  categories: CategoryListRow[];
  pageCategories: CategoryListRow[];
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  filters: CategoriesFilters;
  setSearch: (value: string) => void;
  setIsActive: (value: CategoriesFilters["isActive"]) => void;
  hasFilters: boolean;
  listStatus: ListStatus;
  listError: string | null;
  refresh: () => void;
  formMode: "create" | "edit";
  isFormOpen: boolean;
  openCreate: () => void;
  openEdit: (category: CategoryListRow) => void;
  closeForm: () => void;
  formName: string;
  setFormName: (value: string) => void;
  isSaving: boolean;
  formError: string | null;
  submitForm: () => Promise<void>;
  toast: CategoriesToastState | null;
  clearToast: () => void;
  confirmKind: CategoriesConfirmKind;
  confirmCategory: CategoryListRow | null;
  isConfirming: boolean;
  confirmError: string | null;
  openDeactivateConfirm: (category: CategoryListRow) => void;
  openActivateConfirm: (category: CategoryListRow) => void;
  openDeleteConfirm: (category: CategoryListRow) => void;
  closeConfirm: () => void;
  submitConfirm: () => Promise<void>;
}
