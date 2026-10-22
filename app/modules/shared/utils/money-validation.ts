export function isMoneyAmount(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value === Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Signed account balance; a negative value represents credit. */
export function isSignedMoneyAmount(value: number): boolean {
  return isMoneyAmount(Math.abs(value));
}
