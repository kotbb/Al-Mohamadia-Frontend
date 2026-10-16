export function isMoneyAmount(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value === Math.round((value + Number.EPSILON) * 100) / 100;
}
