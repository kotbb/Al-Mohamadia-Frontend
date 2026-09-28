"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { useInventory } from "@/app/modules/inventory/hooks/use-inventory";
import { InventoryKpiCards } from "@/app/modules/inventory/components/inventory-kpi-cards";
import { StockFilters } from "@/app/modules/inventory/components/stock-filters";
import { StockTable } from "@/app/modules/inventory/components/stock-table";
import { StockAdjustmentModal } from "@/app/modules/inventory/components/stock-adjustment-modal";
import { ReorderThresholdModal } from "@/app/modules/inventory/components/reorder-threshold-modal";
import { CategoryValuationModal } from "@/app/modules/inventory/components/category-valuation-modal";
import { Toast } from "@/app/modules/shared/components/toast";
import { Button } from "@/app/modules/shared/components/button";
import type { StockItem } from "@/app/modules/inventory/types/inventory.types";

export function InventoryPage() {
  const t = useTranslations("inventory");
  const history = useAuditHistory({
    entityType: "Item",
    defaultAction: "stock_adjusted",
  });
  const itemHistory = useAuditHistory({ entityType: "Item" });

  const {
    items,
    summary,
    page: stockPage,
    totalPages: stockTotalPages,
    setPage: setStockPage,
    categoryId,
    setCategoryId,
    statusFilter,
    setStatusFilter,
    searchInput,
    setSearchInput,
    categories,
    listStatus: stockListStatus,
    valuation,
    refresh: refreshStock,
  } = useInventory();

  const [isCategoryValuationOpen, setIsCategoryValuationOpen] = useState(false);
  const [selectedAdjustItem, setSelectedAdjustItem] = useState<StockItem | null>(null);
  const [selectedThresholdItem, setSelectedThresholdItem] = useState<StockItem | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastVariant, setToastVariant] = useState<"success" | "danger">("success");

  const showToast = (message: string, variant: "success" | "danger" = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setToastOpen(true);
  };

  const handleAdjustSuccess = (msg?: string) => {
    refreshStock();
    showToast(msg || t("adjustSuccess"));
  };

  const handleThresholdSuccess = (msg?: string) => {
    refreshStock();
    showToast(msg || t("thresholdSuccess"));
  };

  return (
    <AppShell
      title={t("title")}
      subtitle={t("subtitle")}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {history.button}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="min-h-10 rounded-lg px-3.5 text-sm inline-flex items-center gap-2"
            onClick={() => setIsCategoryValuationOpen(true)}
          >
            <LayersIcon className="h-4 w-4 shrink-0 text-text-secondary" />
            <span>{t("viewCategoryBreakdown")}</span>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {history.modal}
        {itemHistory.modal}
        {/* KPI Summary Cards */}
        <InventoryKpiCards
          valuation={valuation}
          summary={summary}
          onSelectStatusFilter={setStatusFilter}
        />

        <div className="flex flex-col gap-4">
          <StockFilters
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categories={categories}
            summary={summary}
          />

          <StockTable
            items={items}
            isLoading={stockListStatus === "loading"}
            page={stockPage}
            totalPages={stockTotalPages}
            onPageChange={setStockPage}
            onAdjustStock={(item) => setSelectedAdjustItem(item)}
            onUpdateThreshold={(item) => setSelectedThresholdItem(item)}
            onViewAdjustmentsForItem={(item) =>
              itemHistory.openRecord(item.id, item.name)
            }
          />
        </div>

        {/* Modals */}
        <CategoryValuationModal
          isOpen={isCategoryValuationOpen}
          onClose={() => setIsCategoryValuationOpen(false)}
          categories={valuation?.categories || []}
        />

        <StockAdjustmentModal
          isOpen={selectedAdjustItem !== null}
          onClose={() => setSelectedAdjustItem(null)}
          item={selectedAdjustItem}
          onSuccess={handleAdjustSuccess}
        />

        <ReorderThresholdModal
          isOpen={selectedThresholdItem !== null}
          onClose={() => setSelectedThresholdItem(null)}
          item={selectedThresholdItem}
          onSuccess={handleThresholdSuccess}
        />

        {/* Toast Feedback */}
        <Toast
          open={toastOpen}
          message={toastMessage}
          variant={toastVariant}
          onClose={() => setToastOpen(false)}
        />
      </div>
    </AppShell>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
