/** Financial balance tier semantics — see docs/Design-System.md §4 */

export type BalanceTier = "normal" | "attention" | "critical";

export const BALANCE_TIER_CLASSES: Record<
  BalanceTier,
  { text: string; badge: string }
> = {
  normal: {
    text: "text-text-primary font-semibold",
    badge: "",
  },
  attention: {
    text: "text-warning font-semibold",
    badge: "bg-warning/12 text-warning",
  },
  critical: {
    text: "text-danger font-semibold",
    badge: "bg-danger/12 text-danger",
  },
};
