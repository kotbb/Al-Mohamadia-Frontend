export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  amountOwed: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface SupplierListSummary {
  totalOwed: number;
}

export interface SupplierListResponse {
  items: Supplier[];
  meta: SupplierListMeta;
  summary: SupplierListSummary;
}

export interface ListSuppliersFilters {
  q?: string;
  hasDebt?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateSupplierInput {
  name: string;
  phone?: string | null;
  address?: string;
  amountOwed?: number;
}

export interface UpdateSupplierInput {
  name?: string;
  phone?: string | null;
  address?: string;
  isActive?: boolean;
}

export interface MergeSuppliersInput {
  targetId: string;
  sourceIds: string[];
  name?: string;
  phone?: string | null;
}
