import { useLocale, useTranslations } from "next-intl";
import { RowActionsMenu } from "@/app/modules/shared/components/row-actions-menu";
import { EmptyState } from "@/app/modules/shared/components/empty-state";
import { formatMoney } from "@/app/modules/shared/utils/format-money";
import type { LedgerMovement } from "../types/personal-ledger.types";
import { formatLedgerDate, ledgerMethodLabel, ledgerMethods } from "../utils/personal-ledger-form.util";

interface Props {
  rows: LedgerMovement[]; onView: (row: LedgerMovement) => void;
  onEdit: (row: LedgerMovement) => void; onDelete: (row: LedgerMovement) => void;
  onContact?: (id: string) => void; showContact?: boolean;
}

export function PersonalLedgerTable({ rows, onView, onEdit, onDelete, onContact, showContact = true }: Props) {
  const t = useTranslations("personalLedger");
  const locale = useLocale();
  const methodLabels = Object.fromEntries(ledgerMethods.map((method) => [method, t(`methods.${method}`)])) as Record<typeof ledgerMethods[number], string>;
  if (!rows.length) return <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />;
  const columns = ["date", ...(showContact ? ["person"] : []), "type", "amount", "method", "notes", "actions"] as const;
  return <div className="overflow-x-auto rounded-shell border border-border bg-surface">
    <table className="w-full min-w-[48rem] border-collapse text-sm lg:text-base">
      <thead className="bg-surface-muted"><tr className="border-b border-border">{columns.map((key) => <th key={key} scope="col" className="px-4 py-3 text-start font-medium text-text-secondary">{t(key)}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id} className="cursor-pointer border-b border-border transition-colors last:border-b-0 hover:bg-surface-muted/50"
        onClick={(event) => {
          const target = event.target as Element;
          if (!event.currentTarget.contains(target) || target.closest("button,a,[role=menuitem]")) return;
          if (window.getSelection()?.toString()) return;
          onView(row);
        }}>
        <td className="whitespace-nowrap px-4 py-3 text-text-secondary"><button type="button" className="ds-focus-ring rounded text-start hover:underline" onClick={() => onView(row)}>{formatLedgerDate(row.movementDate, locale)}</button></td>
        {showContact ? <td className="px-4 py-3 font-medium text-text-primary"><button type="button" className="ds-focus-ring rounded text-start hover:underline" onClick={() => onContact ? onContact(row.contactId) : onView(row)}>{row.contactName}</button></td> : null}
        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1 text-sm ${row.type === "deposit" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}><span aria-hidden="true">{row.type === "deposit" ? "+" : "−"}</span>{t(row.type)}</span></td>
        <td className={`whitespace-nowrap px-4 py-3 font-semibold tabular-nums ${row.type === "deposit" ? "text-success" : "text-danger"}`}><bdi>{formatMoney(row.amount, locale === "ar" ? "ar-EG-u-nu-latn" : locale)} {t("currency")}</bdi></td>
        <td className="px-4 py-3 text-text-secondary">{ledgerMethodLabel(row.method, methodLabels)}</td>
        <td className="max-w-64 whitespace-pre-wrap break-words px-4 py-3 text-text-secondary">{row.notes || ""}</td>
        <td className="px-3 py-2"><RowActionsMenu label={t("actions")} size="default" items={[
          { id: "view", label: t("view"), onSelect: () => onView(row) },
          { id: "edit", label: t("edit"), onSelect: () => onEdit(row) },
          { id: "delete", label: t("delete"), tone: "danger", onSelect: () => onDelete(row) },
        ]} /></td>
      </tr>)}</tbody>
    </table>
  </div>;
}
