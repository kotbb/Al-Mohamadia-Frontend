/**
 * Builds a stable, readable item code from category + name.
 * Keeps Arabic and Latin letters; uppercases Latin; spaces → `-`.
 */
export function slugifyCodeSegment(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLocaleUpperCase("en-US");
}

export function buildItemCodeBase(categoryName: string, itemName: string): string {
  const category = slugifyCodeSegment(categoryName);
  const name = slugifyCodeSegment(itemName);

  if (!category && !name) return "";
  if (!category) return name;
  if (!name) return category;

  // Avoid PVC-PVC-WHITE when the name already starts with the category slug
  if (name === category || name.startsWith(`${category}-`)) {
    return name;
  }

  return `${category}-${name}`;
}

/** Append -2, -3, … when the base code is already taken (case-insensitive). */
export function ensureUniqueItemCode(
  baseCode: string,
  existingCodes: Iterable<string>,
): string {
  const base = baseCode.trim();
  if (!base) return "";

  const taken = new Set(
    Array.from(existingCodes, (code) => code.trim().toLocaleUpperCase("en-US")),
  );
  const candidate = base.toLocaleUpperCase("en-US");

  if (!taken.has(candidate)) {
    return base;
  }

  let suffix = 2;
  while (taken.has(`${candidate}-${suffix}`)) {
    suffix += 1;
  }
  return `${base}-${suffix}`;
}

export function generateItemCode(
  categoryName: string,
  itemName: string,
  existingCodes: Iterable<string> = [],
): string {
  const base = buildItemCodeBase(categoryName, itemName);
  if (!base) return "";
  return ensureUniqueItemCode(base, existingCodes);
}
