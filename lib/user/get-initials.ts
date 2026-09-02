/** Initials from first + last name, falling back to username. */
export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  username?: string | null,
): string {
  const first = firstName?.trim()?.[0];
  const last = lastName?.trim()?.[0];
  if (first && last) {
    return `${first}${last}`.toUpperCase();
  }
  if (first) {
    return first.toUpperCase();
  }

  const fallback = username?.trim() ?? "";
  if (!fallback) return "?";
  const parts = fallback.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return fallback.slice(0, 2).toUpperCase();
}

export function getDisplayName(
  firstName?: string | null,
  lastName?: string | null,
  username?: string | null,
): string {
  const full = `${firstName?.trim() ?? ""} ${lastName?.trim() ?? ""}`.trim();
  return full || username?.trim() || "";
}
