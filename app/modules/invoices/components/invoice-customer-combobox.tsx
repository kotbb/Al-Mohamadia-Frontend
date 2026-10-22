"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import type { Customer } from "@/app/modules/customers/types/customers.types";

interface InvoiceCustomerComboboxProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: Customer[];
  loading: boolean;
  allCustomers: Customer[];
  allCustomersLoading: boolean;
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
  onClear: () => void;
  focusOnMount?: boolean;
}

export function InvoiceCustomerCombobox({
  query, onQueryChange, results, loading, allCustomers, allCustomersLoading,
  selectedCustomer, onSelect, onClear, focusOnMount = false,
}: InvoiceCustomerComboboxProps) {
  const t = useTranslations("invoices");
  const shared = useTranslations("shared");
  const id = useId();
  const listId = `${id}-options`;
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef(new Map<string, HTMLLIElement>());
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const searching = query.trim().length > 0;
  const isLoading = searching ? loading : allCustomersLoading;
  const options = (searching ? results : allCustomers).filter((customer) => customer.isActive);
  const activeIndex = options.findIndex((customer) => customer.id === activeId);
  const activeOptionId = open && !isLoading && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined;

  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount]);

  function choose(customer: Customer) {
    onSelect(customer);
    onQueryChange("");
    setActiveId(null);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        event.stopPropagation();
      }
      setOpen(false);
      setActiveId(null);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (isLoading || options.length === 0) return;
      const nextIndex = event.key === "ArrowDown"
        ? (activeIndex + 1) % options.length
        : (activeIndex <= 0 ? options.length : activeIndex) - 1;
      const next = options[nextIndex];
      setActiveId(next.id);
      optionRefs.current.get(next.id)?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (event.key === "Enter" && open) {
      event.preventDefault();
      if (selectedCustomer && activeIndex < 0) {
        setOpen(false);
        return;
      }
      if (!isLoading && options.length > 0) choose(options[activeIndex >= 0 ? activeIndex : 0]);
    }
  }

  return (
    <div className="relative min-w-0" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        setOpen(false);
        setActiveId(null);
      }
    }}>
      <label htmlFor={id} className="mb-1.5 block text-base font-medium text-text-secondary">
        {t("customerSearchLabel")}
      </label>
      <div className="relative">
        <input ref={inputRef} id={id} name="customerSearch" role="combobox" type="text"
          autoComplete="off" aria-autocomplete="list" aria-expanded={open}
          aria-controls={listId} aria-activedescendant={activeOptionId}
          value={selectedCustomer?.name ?? query} placeholder={t("customerSearchPlaceholder")}
          className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface ps-4 pe-24 text-base text-text-primary placeholder:text-text-muted"
          onFocus={(event) => {
            setOpen(true);
            setActiveId(selectedCustomer?.id ?? null);
            if (selectedCustomer) event.currentTarget.select();
          }} onClick={(event) => {
            setOpen(true);
            setActiveId(selectedCustomer?.id ?? null);
            if (selectedCustomer) event.currentTarget.select();
          }}
          onChange={(event) => {
            if (selectedCustomer) onClear();
            onQueryChange(event.target.value);
            setActiveId(null);
            setOpen(true);
          }} onKeyDown={handleKeyDown} />
        {selectedCustomer || query ? (
          <button type="button" className="ds-focus-ring absolute inset-y-0 end-1 my-1 rounded-lg px-3 text-sm font-medium text-text-secondary hover:bg-surface-muted"
            onClick={() => {
              onClear();
              onQueryChange("");
              setActiveId(null);
              setOpen(true);
              inputRef.current?.focus();
            }}>
            {t("customerClear")}
          </button>
        ) : null}
      </div>
      {open ? (
        <ul id={listId} role="listbox" aria-label={t("customerSearchLabel")} aria-busy={isLoading}
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-surface py-1 shadow-[var(--shadow-1)]">
          {isLoading ? <li role="presentation" className="px-4 py-3 text-sm text-text-secondary"><span role="status">{shared("loading")}</span></li>
            : options.length === 0 ? <li role="presentation" className="px-4 py-3 text-sm text-text-secondary"><span role="status">{t("noCustomersFound")}</span></li>
              : options.map((customer, index) => (
                <li key={customer.id} id={`${id}-option-${index}`} role="option"
                  aria-selected={selectedCustomer?.id === customer.id}
                  ref={(element) => { if (element) optionRefs.current.set(customer.id, element); else optionRefs.current.delete(customer.id); }}
                  className={`flex min-h-11 cursor-pointer flex-col gap-0.5 px-4 py-3 text-start ${customer.id === activeId ? "bg-surface-muted" : "hover:bg-surface-muted"}`}
                  onPointerDown={(event) => event.preventDefault()}
                  onPointerMove={() => setActiveId(customer.id)} onClick={() => choose(customer)}>
                  <span className="font-medium text-text-primary">{customer.name}</span>
                </li>
              ))}
        </ul>
      ) : null}
    </div>
  );
}
