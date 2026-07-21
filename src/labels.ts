export const BADGE_LABELS = ["team", "play-store-tester"] as const;

export type BadgeLabel = (typeof BADGE_LABELS)[number];
