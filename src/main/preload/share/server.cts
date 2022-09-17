import type { Path, QRCodeURL } from "@common/@types/generalTypes";

import Koa from "koa";

import { myIp, unableToShareMediasError } from "./myIpAddress.cjs";
import { router } from "./routes.cjs";
import { dbg } from "@common/utils";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Setup singleton server:

const port = 3_111;
const url: QRCodeURL = `http://${myIp}:${port}`;
// Exporting for testing porpuses.
export const app = new Koa()
	.use(router.routes())
	.use(router.allowedMethods())
	.on("error", (err: Error) => {
		throw err;
	})
	.on("listen", () => dbg(`Listening on url: ${url}`));

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function createServer(filepaths: readonly Path[]): ClientServerAPI {
	if (myIp.length === 0) throw unableToShareMediasError;

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	app.context["filepaths"] = filepaths;

	console.log({ ctx: app.context });

	const server = app
		.on("close", () => dbg("Closing server"))
		.on("error", (err: Error) => {
			throw err;
		})
		.listen(port);

	/////////////////////////////////////////////

	const clientServerAPI: ClientServerAPI = Object.freeze({
		addListener: (event: string, listener: (...args: unknown[]) => void) =>
			server.addListener(event, listener),
		close: () => server.close(),
		url,
	});

	return clientServerAPI;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type ClientServerAPI = Readonly<
	{
		addListener(event: string, listener: (...args: unknown[]) => void): void;
		url: QRCodeURL;
		close(): void;
	}
>;
