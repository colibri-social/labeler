import { LabelerServer } from "@skyware/labeler";

const did = process.env.LABELER_DID;
const signingKey = process.env.LABELER_SIGNING_KEY;
const dbUrl = process.env.LABELER_DB_URL;
const dbToken = process.env.LABELER_DB_TOKEN;
const port = Number(process.env.LABELER_PORT ?? 14831);

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

export const server = new LabelerServer({ did, signingKey, dbUrl, dbToken });

server.start(port, (error, address) => {
	if (error) {
		console.error(error);
		process.exit(1);
	}

	console.log(`colibri-labeler listening on ${address}`);
});
