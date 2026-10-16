export const RATE_LIMIT_STORAGE_KEY = "login-rate-limit-until";

export function readStoredRetryAt(): number | null {
  const fromLocal = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
  const raw = fromLocal ?? sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
  const until = raw === null ? NaN : Number(raw);
  sessionStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  if (!Number.isFinite(until) || until <= Date.now()) {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
    return null;
  }
  if (fromLocal === null) {
    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, String(until));
  }
  return until;
}

export function storeRetryAt(until: number) {
  localStorage.setItem(RATE_LIMIT_STORAGE_KEY, String(until));
}

export function clearStoredRetryAt() {
  localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
}
