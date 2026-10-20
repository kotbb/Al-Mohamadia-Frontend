import type { SalesInvoicePeriod } from "@/app/modules/invoices/types/invoices.types";

export type { SalesInvoicePeriod };

export interface DashboardToday {
  sales: number;
  estimatedProfit: number;
  invoiceCount: number;
  collected: number;
}

export interface DashboardDebt {
  totalDebt: number;
  debtorCount: number;
}

export interface DashboardPeriod {
  period: SalesInvoicePeriod | "custom";
  date: string;
  from: string;
  to: string;
}

export interface DashboardSalesSeriesPoint {
  bucketStart: string;
  sales: number;
}

export interface DashboardTopSellingItem {
  itemId: string;
  name: string | null;
  code: string | null;
  quantity: number;
  revenue: number;
}

export interface DashboardResponse {
  today: DashboardToday;
  periodFinancials: { sales: number; estimatedGrossProfit: number };
  debt: DashboardDebt;
  period: DashboardPeriod;
  salesSeries: DashboardSalesSeriesPoint[];
  topSellingItems: DashboardTopSellingItem[];
}

export interface GetDashboardQuery {
  period?: SalesInvoicePeriod;
  date?: string;
  from?: string;
  to?: string;
}
