export interface PrizeTier {
  name: string;
  /** The lowest score that wins this prize. */
  minScore: number;
}

/** The best prize a score has earned, or undefined if it earned none. */
export function prizeFor(score: number, tiers: readonly PrizeTier[]): PrizeTier | undefined {
  return [...tiers].sort((a, b) => b.minScore - a.minScore).find((tier) => score >= tier.minScore);
}
