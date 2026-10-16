import type { Item } from "@/app/modules/items/types/items.types";

interface CategorizedItemOptionsProps {
  items: Item[];
  locale: string;
}

export function CategorizedItemOptions({
  items,
  locale,
}: CategorizedItemOptionsProps) {
  const collator = new Intl.Collator(locale, {
    sensitivity: "base",
    numeric: true,
  });
  const grouped = Map.groupBy(items, (item) => item.category.name);

  return Array.from(grouped.entries())
    .sort(([a], [b]) => collator.compare(a, b))
    .map(([category, categoryItems]) => (
      <optgroup key={category} label={category}>
        {categoryItems
          .toSorted((a, b) => collator.compare(a.name, b.name))
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
      </optgroup>
    ));
}
