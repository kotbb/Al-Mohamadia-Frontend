"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { AppShell } from "@/app/layout/app-shell";
import { useAuditHistory } from "@/app/modules/audit/hooks/use-audit-history";
import { ItemForm } from "@/app/modules/items/components/item-form";
import { useItemForm } from "@/app/modules/items/hooks/use-item-form";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { SurfaceCard } from "@/app/modules/shared/components/surface-card";

interface ItemFormPageProps {
  itemId?: string;
}

export function ItemFormPage({ itemId }: ItemFormPageProps) {
  const t = useTranslations("items");
  const tAudit = useTranslations("audit");
  const tShared = useTranslations("shared");
  const router = useRouter();
  const isEdit = Boolean(itemId);
  const history = useAuditHistory({ entityType: "Item" });

  const {
    categories,
    categoriesStatus,
    itemStatus,
    itemError,
    values,
    setField,
    isSubmitting,
    submitError,
    submit,
  } = useItemForm(itemId);

  const isLoading =
    categoriesStatus === "loading" ||
    (isEdit && (itemStatus === "loading" || itemStatus === "idle"));

  async function handleSubmit() {
    const success = await submit();
    if (success) {
      router.push("/items");
    }
  }

  const title = isEdit ? t("editTitle") : t("addTitle");
  const subtitle = isEdit ? t("editSubtitle") : t("addSubtitle");

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
      actions={
        isEdit && itemId ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="min-h-10 rounded-lg px-3.5 text-sm"
            disabled={isLoading || !(values.name.trim() || values.code.trim())}
            onClick={() =>
              history.openRecord(
                itemId,
                values.name.trim() || values.code.trim(),
              )
            }
          >
            {tAudit("viewHistory")}
          </Button>
        ) : undefined
      }
    >
      {history.modal}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link
          href="/items"
          className="ds-focus-ring inline-flex w-fit items-center gap-2 text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          <BackIcon />
          {t("backToItems")}
        </Link>

        {isLoading ? (
          <LoadingState message={tShared("loading")} />
        ) : isEdit && itemStatus === "error" ? (
          <ErrorState title={t("loadError")} message={itemError ?? undefined} />
        ) : (
          <SurfaceCard>
            <ItemForm
              values={values}
              categories={categories}
              isEdit={isEdit}
              isSubmitting={isSubmitting}
              error={submitError}
              onFieldChange={setField}
              onSubmit={handleSubmit}
            />

            <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={() => router.push("/items")}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                form="item-form"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("saving") : t("save")}
              </Button>
            </div>
          </SurfaceCard>
        )}
      </div>
    </AppShell>
  );
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M10 3 5 8l5 5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
