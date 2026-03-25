/** Spending tiers (VND) — aligned with profile benefits UI. */
export const TIER_MINS = [0, 200_000, 500_000, 1_000_000] as const;

export type TierIndex = 0 | 1 | 2 | 3;

export function tierIndexForSpent(spent: number): TierIndex {
  const s = Math.max(0, spent);
  if (s >= TIER_MINS[3]) return 3;
  if (s >= TIER_MINS[2]) return 2;
  if (s >= TIER_MINS[1]) return 1;
  return 0;
}

/** Progress 0–100 toward the next tier; 100 when already at top tier. */
export function tierProgressPercent(spent: number): number {
  const idx = tierIndexForSpent(spent);
  if (idx >= 3) return 100;
  const lo = TIER_MINS[idx];
  const hi = TIER_MINS[idx + 1];
  const p = ((spent - lo) / (hi - lo)) * 100;
  return Math.max(0, Math.min(100, p));
}

/** Simple loyalty points for display (1 pt per 1.000đ spent). */
export function loyaltyPointsFromSpent(spent: number): number {
  return Math.floor(Math.max(0, spent) / 1000);
}

export function nextTierMinSpent(spent: number): number | null {
  const idx = tierIndexForSpent(spent);
  if (idx >= 3) return null;
  return TIER_MINS[idx + 1];
}
