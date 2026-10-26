"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useLocale } from "next-intl";
import type { Item } from "@/app/modules/items/types/items.types";

interface ItemComboboxProps {
  labels: { label: string; placeholder: string; empty: string };
  items: Item[];
  eligibleInactiveItemIds?: string[];
  value: string;
  name: string;
  onSelect: (itemId: string) => void;
}

export function ItemCombobox({ items, value, name, onSelect, labels, eligibleInactiveItemIds = [] }: ItemComboboxProps) {
  const locale = useLocale();
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef(new Map<string, HTMLLIElement>());
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const selected = items.find((item) => item.id === value);
  const search = (query ?? "").trim().toLocaleLowerCase(locale);
  const orderedItems = useMemo(() => {
    const collator = new Intl.Collator(locale, { sensitivity: "base", numeric: true });
    // Missing legacy dates follow dated categories; IDs keep ties deterministic.
    const categoryTime = (item: Item) => {
      const time = Date.parse(item.category.createdAt ?? "");
      return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
    };
    return [...items].sort((a, b) => categoryTime(a) - categoryTime(b) ||
      a.category.id.localeCompare(b.category.id) || collator.compare(a.name, b.name) || a.id.localeCompare(b.id));
  }, [items, locale]);
  const options = orderedItems.filter((item) => (item.isActive || item.id === value || eligibleInactiveItemIds.includes(item.id)) &&
    (!search || item.name.toLocaleLowerCase(locale).includes(search) || item.category.name.toLocaleLowerCase(locale).includes(search)));
  const activeIndex = options.findIndex((item) => item.id === activeId);
  const groups = Map.groupBy(options.map((item, index) => ({ item, index })), ({ item }) => item.category.id);

  function close() {
    setOpen(false);
    setQuery(null);
    setActiveId(null);
  }

  function choose(item: Item) {
    if (item.id !== value) onSelect(item.id);
    close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (open) { event.preventDefault(); event.stopPropagation(); }
      close();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (!options.length) return;
      const nextIndex = event.key === "ArrowDown" ? (activeIndex + 1) % options.length
        : (activeIndex <= 0 ? options.length : activeIndex) - 1;
      setActiveId(options[nextIndex].id);
      optionRefs.current.get(options[nextIndex].id)?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      if (query === null && selected && activeIndex < 0) close();
      else if (options.length) choose(options[activeIndex >= 0 ? activeIndex : 0]);
    }
  }

  return (
    <div className="relative min-w-0 w-full sm:col-span-2 lg:col-span-1"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) close(); }}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-text-secondary">{labels.label}</label>
      <div className="relative">
        <input ref={inputRef} id={id} name={name} role="combobox" type="text" autoComplete="off"
          aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-options`}
          aria-activedescendant={open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          value={query ?? selected?.name ?? ""} placeholder={labels.placeholder}
          className="ds-focus-input min-h-11 w-full rounded-xl border border-border bg-surface ps-3 pe-9 text-sm text-text-primary placeholder:text-text-muted"
          onFocus={(event) => { setOpen(true); setActiveId(null); event.currentTarget.select(); }}
          onClick={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setActiveId(null); setOpen(true); }}
          onKeyDown={handleKeyDown} />
        <svg className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </div>
      {open ? (
        <ul id={`${id}-options`} role="listbox" aria-label={labels.label}
          className="absolute z-20 mt-1 max-h-[min(32rem,60dvh)] w-full min-w-0 overflow-auto rounded-xl border border-border bg-surface py-1 shadow-[var(--shadow-1)]">
          {options.length ? Array.from(groups, ([category, entries]) => (
            <li key={category} role="presentation">
              <div role="group" aria-labelledby={`${id}-category-${entries[0].index}`}>
                <div id={`${id}-category-${entries[0].index}`} role="presentation"
                  className="sticky top-0 z-10 bg-surface px-3 py-2 text-start text-base font-bold text-text-primary">
                  {entries[0].item.category.name}
                </div>
                <ul role="presentation">
                  {entries.map(({ item, index }) => (
                    <li key={item.id} id={`${id}-option-${index}`} role="option" aria-selected={item.id === value}
                      ref={(element) => { if (element) optionRefs.current.set(item.id, element); else optionRefs.current.delete(item.id); }}
                      className={`flex min-h-11 cursor-pointer items-center ps-5 pe-3 py-2 text-start ${item.id === activeId ? "bg-surface-muted" : "hover:bg-surface-muted"}`}
                      onPointerDown={(event) => event.preventDefault()} onPointerMove={() => setActiveId(item.id)} onClick={() => choose(item)}>
                      <span className="break-words text-base font-normal text-text-primary">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )) : <li role="presentation" className="px-3 py-3 text-sm text-text-secondary"><span role="status">{labels.empty}</span></li>}
        </ul>
      ) : null}
    </div>
  );
}
