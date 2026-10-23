"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { AccountOption, AccountComboboxProps } from "@/app/modules/shared/types/account-combobox.types";

export function AccountCombobox<T extends AccountOption>({
  name, labels, originalAccount,
  query, onQueryChange, results, loading, allAccounts, allAccountsLoading,
  selectedAccount, onSelect, onClear, focusOnMount = false,
}: AccountComboboxProps<T>) {
  const id = useId();
  const listId = `${id}-options`;
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const searching = query.trim().length > 0;
  const isLoading = searching ? loading : allAccountsLoading;
  const available = searching ? results : allAccounts;
  const options = [...available.filter((account) => account.isActive && !account.isDeleted)];
  if (originalAccount && !originalAccount.isDeleted &&
    !options.some((account) => account.id === originalAccount.id) &&
    (!searching || originalAccount.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))) {
    options.push(originalAccount);
  }
  const activeIndex = options.findIndex((account) => account.id === activeId);
  const activeOptionId = open && !isLoading && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined;

  useEffect(() => {
    if (focusOnMount) inputRef.current?.focus();
  }, [focusOnMount]);

  function choose(accountId: string) {
    const account = options.find((option) => option.id === accountId);
    if (!account) return;
    onSelect(account);
    onQueryChange("");
    setActiveId(null);
    setOpen(false);
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
      listRef.current?.querySelectorAll<HTMLLIElement>('[role="option"]')[nextIndex]?.scrollIntoView({ block: "nearest" });
      return;
    }
    if (event.key === "Enter" && open) {
      event.preventDefault();
      if (selectedAccount && activeIndex < 0) {
        setOpen(false);
        return;
      }
      if (!isLoading && options.length > 0) choose(options[activeIndex >= 0 ? activeIndex : 0].id);
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
        {labels.label}
      </label>
      <div className="relative">
        <input ref={inputRef} id={id} name={name} role="combobox" type="text"
          autoComplete="off" aria-autocomplete="list" aria-expanded={open}
          aria-controls={listId} aria-activedescendant={activeOptionId}
          value={selectedAccount?.name ?? query} placeholder={labels.placeholder}
          className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface ps-4 pe-24 text-base text-text-primary placeholder:text-text-muted"
          onFocus={(event) => {
            setOpen(true);
            setActiveId(selectedAccount?.id ?? null);
            if (selectedAccount) event.currentTarget.select();
          }} onClick={(event) => {
            setOpen(true);
            setActiveId(selectedAccount?.id ?? null);
            if (selectedAccount) event.currentTarget.select();
          }}
          onChange={(event) => {
            if (selectedAccount) onClear();
            onQueryChange(event.target.value);
            setActiveId(null);
            setOpen(true);
          }} onKeyDown={handleKeyDown} />
        {selectedAccount || query ? (
          <button type="button" className="ds-focus-ring absolute inset-y-0 end-1 my-1 rounded-lg px-3 text-sm font-medium text-text-secondary hover:bg-surface-muted"
            onClick={() => {
              onClear();
              onQueryChange("");
              setActiveId(null);
              setOpen(true);
              inputRef.current?.focus();
            }}>
            {labels.clear}
          </button>
        ) : null}
      </div>
      {open ? (
        <ul ref={listRef} id={listId} role="listbox" aria-label={labels.label} aria-busy={isLoading}
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-border bg-surface py-1 shadow-[var(--shadow-1)]">
          {isLoading ? <li role="presentation" className="px-4 py-3 text-sm text-text-secondary"><span role="status">{labels.loading}</span></li>
            : options.length === 0 ? <li role="presentation" className="px-4 py-3 text-sm text-text-secondary"><span role="status">{labels.empty}</span></li>
              : options.map((account, index) => {
                const accountId = account.id;
                return (
                <li key={account.id} id={`${id}-option-${index}`} role="option"
                  aria-selected={selectedAccount?.id === account.id}
                  className={`flex min-h-11 cursor-pointer flex-col gap-0.5 px-4 py-3 text-start ${account.id === activeId ? "bg-surface-muted" : "hover:bg-surface-muted"}`}
                  onPointerDown={(event) => event.preventDefault()}
                  onPointerMove={() => setActiveId(account.id)} onClick={() => choose(accountId)}>
                  <span className="font-medium text-text-primary">{account.name}</span>
                </li>
                );
              })}
        </ul>
      ) : null}
    </div>
  );
}
