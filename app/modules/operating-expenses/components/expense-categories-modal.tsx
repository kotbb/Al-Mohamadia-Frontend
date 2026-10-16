"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/app/modules/shared/components/button";
import { DashedAddButton } from "@/app/modules/shared/components/dashed-add-button";
import { Modal } from "@/app/modules/shared/components/modal";
import type { OperatingExpensesViewModel } from "../types/use-operating-expenses.types";

const inputClass = "ds-focus-ring min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary";

export function ExpenseCategoriesModal({ model }: { model: OperatingExpensesViewModel }) {
  const t = useTranslations("operatingExpenses");
  const [adding, setAdding] = useState(false);

  return (
    <Modal open={model.categoryOpen} onClose={model.closeCategories} title={t("manageCategories")}>
      <div className="space-y-3">
        {model.categories.map((row) => <div key={row.id} className="flex items-center justify-between gap-2 border-b border-border py-2">
          <span className={row.isActive ? "font-medium" : "text-text-muted"}>{model.categoryLabel(row.id)}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => model.startRename(row)}>{t("rename")}</Button>
            <Button size="sm" variant="secondary" disabled={model.saving} onClick={() => void model.toggleCategory(row)}>
              {row.isActive ? t("deactivate") : t("activate")}
            </Button>
          </div>
        </div>)}
        {!adding && !model.renaming ? <div className="flex justify-end"><DashedAddButton label={t("addCategoryLine")} onClick={() => setAdding(true)} /></div> : null}
        {(adding || model.renaming) && <label className="block text-sm">{model.renaming ? t("rename") : t("newCategory")}
          <input value={model.categoryName} maxLength={80} onChange={(event) => model.setCategoryName(event.target.value)} className={inputClass} />
        </label>}
        {model.mutationError && <p role="alert" className="text-danger">{model.mutationError}</p>}
        {(adding || model.renaming) && <div className="flex justify-end gap-2">
          {model.renaming && <Button variant="secondary" onClick={model.cancelRename}>{t("cancel")}</Button>}
          {!model.renaming && <Button variant="secondary" onClick={() => { setAdding(false); model.setCategoryName(""); }}>{t("cancel")}</Button>}
          <Button disabled={model.saving || !model.categoryName.trim()} onClick={async () => { if (await model.saveCategory()) setAdding(false); }}>{t("save")}</Button>
        </div>}
      </div>
    </Modal>
  );
}
