import type { Path, QRCodeURL } from "@common/@types/generalTypes";
import type { AddressInfo } from "node:net";

import { error, log } from "node:console";
import Koa from "koa";

import { myIp, unableToShareMediasError } from "./myIpAddress";
import { router } from "./routes";
import { dbg } from "@common/debug";


/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Setup singleton server:

// Exporting for testing porpuses.
export const app = new Koa()
	.use(router.routes())
	.use(router.allowedMethods())
	.on("error", error);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function createServer(filepaths: readonly Path[]): ClientServerAPI {
	if (!myIp) throw new Error(unableToShareMediasError);

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	app.context["filepaths"] = filepaths;

	log({ ctx: app.context });

	let url = "" as QRCodeURL;
	const server = app
		.on("close", () => dbg("Closing server"))
		.on("error", (err: Error) => {
			throw err;
		})
		.listen(0, () => {
			const osAssignedPort = (server.address() as AddressInfo).port;
			url = `http://${myIp}:${osAssignedPort}`;

			dbg(`Listening on url: ${url}`);
		});

	/////////////////////////////////////////////

	const clientServerAPI: ClientServerAPI = Object.freeze({
		addListener(event: string, listener: (...args: unknown[]) => void) {
			server.addListener(event, listener);
		},
		close() {
			server.close();
		},
		url,
	});

	return clientServerAPI;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type ClientServerAPI = Readonly<{
	addListener(event: string, listener: (...args: unknown[]) => void): void;
	url: QRCodeURL;
	close(): void;
}>;
