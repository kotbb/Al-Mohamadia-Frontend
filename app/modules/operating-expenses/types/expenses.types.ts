export type PaymentMethod = "cash" | "instapay" | "vodafone_cash" | "bank_transfer" | "check";

export interface ExpenseCategory {
  id: string;
  code: string | null;
  name: string | null;
  isActive: boolean;
}

export interface OperatingExpense {
  id: string;
  categoryId: string;
  amount: number;
  expenseDate: string;
  method: PaymentMethod;
  payee: string | null;
  notes: string | null;
  recordedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  categoryId: string;
  amount: number;
  expenseDate: string;
  method: PaymentMethod;
  payee: string | null;
  notes: string | null;
}

export interface ExpenseList {
  items: OperatingExpense[];
  meta: { page: number; limit: number; total: number };
  summary: { totalAmount: number; count: number; topCategoryId: string | null };
}

export interface ExpenseFilters {
  period: "off" | "day" | "week" | "month" | "year" | "custom";
  periodDate: string;
  from: string;
  to: string;
  categoryId: string;
  method: string;
  search: string;
  page: number;
}

