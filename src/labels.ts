export const BADGE_LABELS = [
	"team",
	"play-store-tester",
	"backer-five",
	"sponsor-twenty-five",
	"donator",
] as const;

export type BadgeLabel = (typeof BADGE_LABELS)[number];
