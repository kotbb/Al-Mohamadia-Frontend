"use client";

import { useTranslations } from "next-intl";
import { ItemForm } from "@/app/modules/items/components/item-form";
import { useItemForm } from "@/app/modules/items/hooks/use-item-form";
import { Button } from "@/app/modules/shared/components/button";
import { ErrorState } from "@/app/modules/shared/components/error-state";
import { LoadingState } from "@/app/modules/shared/components/loading-state";
import { Modal } from "@/app/modules/shared/components/modal";

interface ItemFormModalProps {
  open: boolean;
  itemId?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ItemFormModal({
  open,
  itemId,
  onClose,
  onSuccess,
}: ItemFormModalProps) {
  const t = useTranslations("items");
  const tShared = useTranslations("shared");
  const isEdit = Boolean(itemId);

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
  } = useItemForm(itemId ?? undefined);

  const isLoading =
    categoriesStatus === "loading" ||
    (isEdit && (itemStatus === "loading" || itemStatus === "idle"));

  async function handleSubmit() {
    const success = await submit();
    if (success) {
      onSuccess();
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? t("editTitle") : t("addTitle")}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            form="item-form"
            variant="primary"
            disabled={isSubmitting || isLoading || (isEdit && itemStatus === "error")}
          >
            {isSubmitting ? t("saving") : t("save")}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <LoadingState message={tShared("loading")} />
      ) : isEdit && itemStatus === "error" ? (
        <ErrorState title={t("loadError")} message={itemError ?? undefined} />
      ) : (
        <ItemForm
          values={values}
          categories={categories}
          isEdit={isEdit}
          isSubmitting={isSubmitting}
          error={submitError}
          onFieldChange={setField}
          onSubmit={handleSubmit}
          compact
        />
      )}
    </Modal>
  );
}
