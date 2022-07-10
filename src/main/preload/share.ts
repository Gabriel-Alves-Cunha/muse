import type { IncomingMessage, ServerResponse } from "node:http";
import type { Path, QRCodeURL } from "@common/@types/generalTypes";

import { createReadStream, ReadStream } from "node:fs";
import { networkInterfaces, tmpdir } from "node:os";
import { exec as syncExec } from "node:child_process";
import { createServer } from "node:http";
import { promisify } from "node:util";
import { unlink } from "node:fs/promises";
import { join } from "node:path";

import { getFirstKey } from "@utils/map-set";
import { getBasename } from "@common/path";
import { pathExists } from "./file";
import { time } from "@utils/utils";
import { dbg } from "@common/utils";

const { log, error } = console;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const fileLocation = join(tmpdir(), "medias");
const zipFileLocation = fileLocation + ".zip";
const cmd = `zip -j -0 -v ${fileLocation} `;
const myIp = getMyIpAddress();
let id = 0;

dbg(`My ip address = ${myIp}`);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for `turnServerOn`:

const exec = promisify(syncExec);

/////////////////////////////////////////////

// TODO: if ever to make Muse for Windows, see to make this portable!
export async function makeItOnlyOneFile(
	filepaths: ReadonlySet<Path>,
): Promise<Readonly<Path>> {
	const mediasSeparatedBySpaceAndSurroundedByQuotationMarks = [...filepaths]
		.map(filepath => `"${filepath}"`)
		.join(" ");

	// If only one file, send it directly:
	if (filepaths.size === 1) return getFirstKey(filepaths) as string;

	// Else, make an uncompressed zip file:
	try {
		const start = performance.now();

		if (await pathExists(zipFileLocation)) {
			dbg(`Deleting pre existing file: "${zipFileLocation}"`);
			// If this errors, don't throw an error, just log it:
			await unlink(zipFileLocation).catch(error);
		}

		// Full command to execute on shell:
		const fullCmd = cmd + mediasSeparatedBySpaceAndSurroundedByQuotationMarks;

		const { stdout, stderr } = await exec(fullCmd);

		dbg("zip stdout:", stdout);
		dbg("zip stderr:", stderr);

		const time = performance.now() - start;

		dbg("makeItOnlyOneFile took:", time);
	} catch (error) {
		throw new Error("Error ziping medias! " + error);
	}

	return zipFileLocation;
}

/////////////////////////////////////////////

function getMyIpAddress(): Readonly<string> {
	// Got this from StackOverflow, if this ever fails, replace it.
	return Object
		.values(networkInterfaces())
		.flat()
		.filter(item => !item?.internal && item?.family === "IPv4")
		.find(Boolean)
		?.address ?? "";
}

/////////////////////////////////////////////
// Main function:

export function turnServerOn(oneFilePath: Readonly<Path>): TurnServerOnReturn {
	return time(() => {
		// If there is an error listening to port, we
		// will try again after changing the port:
		let errorListening = false;
		let port = 8_000;

		function handleCloseServer(err: Error): void {
			error("Error on server. Closing it.", { err });

			// @ts-ignore => err.code does exists here.
			if (err.code === "EADDRINUSE") {
				// The error is of address in use, so
				// increase the port and try again.
				errorListening = true;
				port += 10;
			}

			server.close();
		}

		///////////////////////////////////////////

		function tryToStartServer(): void {
			errorListening = false;
			++id;

			server.listen(
				port,
				myIp,
				() => log(`Server '${id}' is running on http://${myIp}:${port}`),
			);
		}

		///////////////////////////////////////////

		async function handleDownloadMedia(
			req: IncomingMessage,
			res: ServerResponse,
		): Promise<void> {
			// Log possible request error:
			req.on("error", err => {
				error("Error on request.", { err });

				// Clean up:
				req.destroy(err);
				server.close();
			});

			// Preparing the response to the client:
			res
				.setHeader(
					"Content-Disposition",
					`attachment;filename=${getBasename(oneFilePath)}`,
				)
				.setHeader("Content-Type", "application/octet-stream")
				.setHeader("Accept-Encoding", "gzip")
				// Log possible response error:
				.on("error", err => {
					error("Error on response!", { err });

					// Clean up:
					res.end();
					server.close();
				});

			// The file will be streamed to the client:
			const readStream: ReadStream = createReadStream(oneFilePath)
				.on(
					"open",
					// We do a simple call to readStream.pipe(). This just pipes the
					// read stream to the response object (which goes to the client):
					() =>
						readStream.pipe(res).on("error", err => {
							// Log possible piping error:
							error("Error piping readStream!", { err });

							// Clean up:
							res.end();
							server.close();
						}),
				)
				// Log possible readStream error:
				.on("error", err => {
					error("Error on downloadMedias's readStream.", { err });

					// Clean up:
					res.end();
					server.close();
				})
				// On end, close communication, but keep the
				// server open for more possible requests:
				.on("end", () => {
					dbg("Ended reading `oneFilePath`.");
					res.end();
				});
		}

		///////////////////////////////////////////

		// We create a new server object via the http module's
		// createServer() function. This server accepts HTTP
		// requests and passes them on to our downloadMedias()
		// function, a callback function that fires when the
		// server receives a request.
		const server = createServer(handleDownloadMedia)
			.on("close", async () => {
				dbg("Closing server from NodeJS side.");

				if (await pathExists(zipFileLocation)) {
					dbg(`Deleting zip file: "${zipFileLocation}"`);
					await unlink(zipFileLocation).catch(error);
				}

				if (errorListening) {
					dbg("Restarting server because error 'EADDRINUSE' was found!");
					tryToStartServer();
				}
			})
			.on("connection", socket => {
				dbg("Connected to another computer!");

				// Log possible socket error:
				socket.on("error", err => error("Error on socket!", { err })).on(
					"close",
					() => log("Closing socket from NodeJS side."),
				);
			})
			.on("error", handleCloseServer);

		///////////////////////////////////////////

		tryToStartServer();

		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////

		const responseApi: TurnServerOnReturn = Object.freeze({
			addListener: (event: string, listener: (...args: unknown[]) => void) =>
				server.addListener(event, listener),
			url: `http://${myIp}:${port}`,
			close: () => server.close(),
		});

		return responseApi;
	}, `turnServerOn("${oneFilePath}")`);
}

/////////////////////////////////////////////

export type TurnServerOnReturn = Readonly<
	{
		addListener(event: string, listener: (...args: unknown[]) => void): void;
		url: QRCodeURL;
		close(): void;
	}
>;
