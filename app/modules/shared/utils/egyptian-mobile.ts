export function englishDigits(value: string): string {
  return value.replace(/[٠-٩۰-۹]/g, (digit) =>
    String(digit.charCodeAt(0) - (digit <= "٩" ? 0x660 : 0x6f0)),
  );
}

export function normalizeMobile(value: string): string {
  const compact = englishDigits(value).replace(/[\s-]/g, "");
  return compact.startsWith("+20") ? `0${compact.slice(3)}` : compact;
}

export function isOptionalMobile(value: string): boolean {
  return value.trim() === "" || /^01[0125][0-9]{8}$/.test(normalizeMobile(value));
}

/** Returns null to reject an entire edit, including oversized/unsupported pastes. */
export function mobileInputValue(value: string): string | null {
  let digits = englishDigits(value).replace(/[\s-]/g, "");
  if (digits.startsWith("0020")) return null;
  if (digits.startsWith("+20")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[0-9]{0,10}$/.test(digits)) return null;
  return digits ? `0${digits}` : "";
}

export function formatMobileInput(value: string): string {
  const normalized = normalizeMobile(value);
  const digits = normalized.startsWith("0") ? normalized.slice(1) : normalized;
  return digits.replace(/^([0-9]{3})([0-9]{1,3})?([0-9]*)$/, (_, first, second, last) =>
    [first, second, last].filter(Boolean).join(" "),
  );
}
