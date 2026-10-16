import type { BadgeVariant } from "@/app/modules/shared/components/badge";

export const AUDIT_ENTITY_TYPES = [
  "User",
  "Customer",
  "Supplier",
  "SalesInvoice",
  "Payment",
  "PurchaseInvoice",
  "SupplierPayment",
  "Item",
  "Category",
  "ExpenseCategory",
  "OperatingExpense",
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export const AUDIT_ACTIONS_BY_ENTITY: Record<AuditEntityType, readonly string[]> = {
  User: ["admin_created", "admin_updated", "admin_deleted"],
  Customer: [
    "customer_created",
    "customer_edited",
    "customer_deleted",
    "customer_merged",
  ],
  Supplier: [
    "supplier_created",
    "supplier_edited",
    "supplier_deleted",
    "supplier_merged",
  ],
  SalesInvoice: ["invoice_created", "invoice_cancelled"],
  Payment: ["payment_recorded", "payment_cancelled"],
  PurchaseInvoice: ["purchase_created", "purchase_cancelled"],
  SupplierPayment: ["supplier_payment_recorded", "supplier_payment_cancelled"],
  Item: [
    "item_created",
    "item_edited",
    "item_deleted",
    "price_changed",
    "stock_adjusted",
  ],
  Category: ["category_created", "category_edited", "category_deleted"],
  ExpenseCategory: ["expense_category_created", "expense_category_updated"],
  OperatingExpense: ["operating_expense_created", "operating_expense_updated", "operating_expense_voided", "operating_expense_deleted"],
};

export const AUDIT_ACTIONS: readonly string[] = AUDIT_ENTITY_TYPES.flatMap(
  (entityType) => AUDIT_ACTIONS_BY_ENTITY[entityType],
);

/** Labels for entity and action codes stored on audit rows. */
export const AUDIT_LABEL_ENTITIES = AUDIT_ENTITY_TYPES;
export const AUDIT_LABEL_ACTIONS = AUDIT_ACTIONS;

export function entityTypesForRole(isSuperAdmin: boolean): readonly AuditEntityType[] {
  if (isSuperAdmin) return AUDIT_ENTITY_TYPES;
  return AUDIT_ENTITY_TYPES.filter((entityType) => entityType !== "User");
}

export function actionsForViewer(
  entityType: string,
  isSuperAdmin: boolean,
): readonly string[] {
  const actions = actionsForEntityType(entityType);
  if (isSuperAdmin) return actions;
  const userActions: readonly string[] = AUDIT_ACTIONS_BY_ENTITY.User;
  return actions.filter((action) => !userActions.includes(action));
}

export const AUDIT_FIELD_KEYS = [
  "username",
  "firstName",
  "lastName",
  "role",
  "isActive",
  "isDeleted",
  "name",
  "phone",
  "address",
  "amountOwed",
  "balance",
  "sourceIds",
  "targetId",
  "sourcesAmountOwedSum",
  "sourcesBalanceSum",
  "supplierId",
  "customerId",
  "amount",
  "method",
  "reversedAt",
  "reversedBy",
  "value",
  "invoiceNumber",
  "type",
  "total",
  "discount",
  "paid",
  "remaining",
  "status",
  "remainingReversed",
  "code",
  "categoryId",
  "pricingMode",
  "unitPrice",
  "cost",
  "stockQuantity",
  "reason",
  "isWood",
  "reorderThreshold",
  "expenseDate",
  "payee",
  "receiptReference",
  "notes",
  "voidedAt",
  "voidedBy",
] as const;

export function isAuditEntityType(value: string): value is AuditEntityType {
  return (AUDIT_ENTITY_TYPES as readonly string[]).includes(value);
}

export function actionsForEntityType(entityType: string): readonly string[] {
  if (!isAuditEntityType(entityType)) return AUDIT_ACTIONS;
  return AUDIT_ACTIONS_BY_ENTITY[entityType];
}

export function auditActionTone(action: string): BadgeVariant {
  if (action.endsWith("_created") || action.endsWith("_recorded")) {
    return "success";
  }
  if (action.endsWith("_deleted") || action.endsWith("_cancelled") || action.endsWith("_voided")) {
    return "danger";
  }
  if (
    action.endsWith("_edited") ||
    action.endsWith("_updated") ||
    action.endsWith("_merged") ||
    action === "price_changed" ||
    action === "stock_adjusted"
  ) {
    return "warning";
  }
  return "info";
}
