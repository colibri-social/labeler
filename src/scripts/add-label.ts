import * as p from "@clack/prompts";
import { LabelerServer } from "@skyware/labeler";
import color from "picocolors";
import { loadEnv } from "../env.js";
import { BADGE_LABELS } from "../labels.js";

const CUSTOM_VALUE = "__custom__";

process.on("unhandledRejection", (err) => {
	p.cancel(err instanceof Error ? err.message : String(err));
	process.exit(1);
});

const resolveDid = async (input: string): Promise<string> => {
	if (input.startsWith("did:")) return input;

	const handle = input.replace(/^@/, "");
	const res = await fetch(
		`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`,
	);
	if (!res.ok) {
		throw new Error(
			`Could not resolve handle "${handle}" (HTTP ${res.status})`,
		);
	}

	const body = (await res.json()) as { did: string };
	return body.did;
};

const main = async () => {
	p.intro(color.bgMagenta(color.black(" colibri-labeler ")));

	let env: ReturnType<typeof loadEnv>;
	try {
		env = loadEnv();
	} catch (err) {
		p.cancel(err instanceof Error ? err.message : String(err));
		process.exit(1);
	}
	const server = new LabelerServer(env);

	const target = await p.text({
		message: "User handle or DID",
		placeholder: "alice.bsky.social or did:plc:...",
		validate: (value) =>
			!value || value.trim().length === 0 ? "Required" : undefined,
	});
	if (p.isCancel(target)) {
		p.cancel("Cancelled.");
		process.exit(0);
	}

	const resolveSpinner = p.spinner();
	resolveSpinner.start("Resolving DID");
	let did: string;
	try {
		did = await resolveDid(target.trim());
		resolveSpinner.stop(`Resolved to ${color.dim(did)}`);
	} catch (err) {
		resolveSpinner.error("Failed to resolve");
		p.log.error(err instanceof Error ? err.message : String(err));
		process.exit(1);
	}

	const badgeChoice = await p.select<string>({
		message: "Which badge?",
		options: [
			...BADGE_LABELS.map((val) => ({ value: val, label: val })),
			{ value: CUSTOM_VALUE, label: "Custom value…" },
		],
	});
	if (p.isCancel(badgeChoice)) {
		p.cancel("Cancelled.");
		process.exit(0);
	}

	let val = badgeChoice;
	if (badgeChoice === CUSTOM_VALUE) {
		const custom = await p.text({
			message: "Label value (lowercase, kebab-case)",
			validate: (value) =>
				value && /^[a-z0-9-]+$/.test(value)
					? undefined
					: "Lowercase letters, digits, and hyphens only",
		});
		if (p.isCancel(custom)) {
			p.cancel("Cancelled.");
			process.exit(0);
		}
		val = custom;
	}

	const action = await p.select<"create" | "negate">({
		message: `"${val}" — grant or revoke?`,
		options: [
			{ value: "create", label: "Grant" },
			{ value: "negate", label: "Revoke" },
		],
	});
	if (p.isCancel(action)) {
		p.cancel("Cancelled.");
		process.exit(0);
	}

	const verb = action === "create" ? "Grant" : "Revoke";
	const preposition = action === "create" ? "to" : "from";
	const confirmed = await p.confirm({
		message: `${verb} "${val}" ${preposition} ${did}?`,
	});
	if (p.isCancel(confirmed) || !confirmed) {
		p.cancel("Cancelled.");
		process.exit(0);
	}

	const applySpinner = p.spinner();
	applySpinner.start("Applying label");
	try {
		await server.createLabels({ uri: did }, { [action]: [val] });
		applySpinner.stop("Applied");
	} catch (err) {
		applySpinner.error("Failed");
		p.log.error(err instanceof Error ? err.message : String(err));
		process.exit(1);
	}

	p.outro(
		`${color.green(`${verb.toLowerCase()}ed`)} "${val}" ${preposition} ${color.dim(did)}`,
	);
	process.exit(0);
};

main().catch((err) => {
	p.cancel(err instanceof Error ? err.message : String(err));
	process.exit(1);
});
