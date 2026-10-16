"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { HubTabs, type HubTabItem } from "./hub-tabs";

export function HubNavigation() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  // 1. Sales & Customers Hub: customers, invoices, payments
  const isSalesHub =
    pathname.startsWith("/customers") ||
    pathname.startsWith("/invoices") ||
    pathname === "/payments" ||
    pathname.startsWith("/payments/");

  if (isSalesHub) {
    const tabs: HubTabItem[] = [
      { key: "invoices", label: t("invoices"), href: "/invoices" },
      { key: "customers", label: t("customers"), href: "/customers" },
      { key: "payments", label: t("customerPayments"), href: "/payments" },
    ];
    return <HubTabs tabs={tabs} />;
  }

  // 2. Procurement & Suppliers Hub: suppliers, purchases, supplier-payments
  const isProcurementHub =
    pathname.startsWith("/suppliers") ||
    pathname.startsWith("/purchases") ||
    pathname.startsWith("/supplier-payments");

  if (isProcurementHub) {
    const tabs: HubTabItem[] = [
      { key: "purchases", label: t("purchases"), href: "/purchases" },
      { key: "suppliers", label: t("suppliers"), href: "/suppliers" },
      {
        key: "supplierPayments",
        label: t("supplierPayments"),
        href: "/supplier-payments",
      },
    ];
    return <HubTabs tabs={tabs} />;
  }

  // 3. Inventory & Catalog Hub: items, categories, inventory
  const isInventoryHub =
    pathname.startsWith("/items") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/inventory");

  if (isInventoryHub) {
    const tabs: HubTabItem[] = [
      { key: "inventory", label: t("inventory"), href: "/inventory" },
      { key: "items", label: t("items"), href: "/items" },
      { key: "categories", label: t("categories"), href: "/categories" },
    ];
    return <HubTabs tabs={tabs} />;
  }

  return null;
}
