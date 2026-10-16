"use client";

import type { HTMLAttributes } from "react";
import { useRouter } from "@/i18n/navigation";
import { canNavigateRow } from "../utils/row-navigation";

interface NavigableTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  href: string;
  disabled?: boolean;
}

export function NavigableTableRow({
  href,
  disabled = false,
  className = "",
  onClick,
  ...props
}: NavigableTableRowProps) {
  const router = useRouter();
  return (
    <tr
      {...props}
      className={`${disabled ? "" : "group/record cursor-pointer"} ${className}`}
      onClick={(event) => {
        onClick?.(event);
        const target = event.target as Element;
        if (
          canNavigateRow({
            disabled,
            button: event.button,
            modified:
              event.ctrlKey || event.metaKey || event.shiftKey || event.altKey,
            defaultPrevented: event.defaultPrevented,
            interactiveTarget:
              !event.currentTarget.contains(target) ||
              Boolean(
                target.closest(
                  'a,button,input,select,textarea,label,[role="button"],[role="menu"],[role="menuitem"],[contenteditable]:not([contenteditable="false"])',
                ),
              ),
            textSelected: Boolean(window.getSelection()?.toString()),
          })
        )
          router.push(href);
      }}
    />
  );
}
