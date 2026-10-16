import { DashedAddButton } from "@/app/modules/shared/components/dashed-add-button";

interface AddInvoiceLineButtonProps {
  label: string;
  onClick: () => void;
}

export function AddInvoiceLineButton({
  label,
  onClick,
}: AddInvoiceLineButtonProps) {
  return (
    <div className="mt-3 flex justify-end">
      <DashedAddButton label={label} onClick={onClick} />
    </div>
  );
}
