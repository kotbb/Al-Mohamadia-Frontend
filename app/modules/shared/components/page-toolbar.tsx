import type { ReactNode } from "react";

interface PageToolbarProps {
  children?: ReactNode;
  actions?: ReactNode;
}

export function PageToolbar({ children, actions }: PageToolbarProps) {
  return (
    <div className="mb-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      {children ? (
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          {children}
        </div>
      ) : (
        <div className="flex-1" />
      )}
      {actions ? (
        <div className="flex shrink-0 items-end gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
