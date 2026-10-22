export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  balance: number;
  financialSummary?: { totalInvoiced: number; totalPaid: number };
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerListMeta {
  page: number;
  limit: number;
  total: number;
}

export interface CustomerListSummary {
  totalDebt: number;
}

export interface CustomerListResponse {
  items: Customer[];
  meta: CustomerListMeta;
  summary: CustomerListSummary;
}

export interface ListCustomersFilters {
  q?: string;
  hasDebt?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string | null;
  address?: string;
  balance?: number;
}

export interface UpdateCustomerInput {
  balance?: number;
  name?: string;
  phone?: string | null;
  address?: string;
  isActive?: boolean;
}

export interface MergeCustomersInput {
  targetId: string;
  sourceIds: string[];
  name?: string;
  phone?: string | null;
}
