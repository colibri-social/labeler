import { LabelerServer } from "@skyware/labeler";
import { loadEnv } from "./env.js";

process.on("unhandledRejection", (err) => {
	console.error(err);
	process.exit(1);
});

const env = loadEnv();

export const server = new LabelerServer(env);

server.app.server.prependListener("request", (_req, res) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
});

server.start({ port: env.port, host: env.host }, (error, address) => {
	if (error) {
		console.error(error);
		process.exit(1);
	}

	console.log(`colibri-labeler listening on ${address}`);
});
