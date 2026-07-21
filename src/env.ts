export type LabelerEnv = {
	did: string;
	signingKey: string;
	dbUrl: string;
	dbToken: string;
	port: number;
	host: string;
};

export const loadEnv = (): LabelerEnv => {
	const did = process.env.LABELER_DID;
	const signingKey = process.env.LABELER_SIGNING_KEY;
	const dbUrl = process.env.LABELER_DB_URL;
	const dbToken = process.env.LABELER_DB_TOKEN;

	if (!did || !signingKey) {
		throw new Error(
			"LABELER_DID and LABELER_SIGNING_KEY must be set. Run `pnpm setup` first.",
		);
	}

	if (!dbUrl || !dbToken) {
		throw new Error(
			"LABELER_DB_URL and LABELER_DB_TOKEN must be set (remote libSQL instance).",
		);
	}

	return {
		did,
		signingKey,
		dbUrl,
		dbToken,
		port: Number(process.env.LABELER_PORT ?? 14831),
		host: process.env.LABELER_HOST ?? "0.0.0.0",
	};
};
