import type { AddressInfo } from "node:net";
import type { QRCodeURL } from "@common/@types/GeneralTypes";

import { createServer as httpCreateServer } from "node:http";

import { myIp, unableToShareMediasError } from "./myIpAddress";
import { throwErr } from "@common/log";
import { dbg } from "@common/debug";

import { router } from "./routes";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function createServer(filepaths: ReadonlySet<string>): ClientServerAPI {
	if (!myIp) throwErr(unableToShareMediasError);

	let url = "" as QRCodeURL;

	const server = httpCreateServer(
		{
			connectionsCheckingInterval: 10_000,
			requestTimeout: 1_000,
		},
		(req, res) => {
			const { url } = req;

			if (!url) {
				throwErr("There is no url in the request!");
			}

			const handler = router(filepaths)[url];

			if (handler) {
				handler(req, res);
			} else {
				res
					.writeHead(400, {
						"Content-Type": "text/plain",
					})
					.end("404 Not Found");

				throwErr(`There is no handler for url: "${url}"`);
			}
		},
	)
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

	return {
		addListener(event: string, listener: (...args: unknown[]) => void) {
			server.addListener(event, listener);
		},
		close() {
			server.close();
		},
		url,
	} satisfies ClientServerAPI;
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
