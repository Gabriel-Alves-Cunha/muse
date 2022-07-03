import type { IncomingMessage, ServerResponse } from "node:http";
import type { Path, QRCodeURL } from "@common/@types/generalTypes";

import { createReadStream, ReadStream } from "node:fs";
import { networkInterfaces, tmpdir } from "node:os";
import { exec as syncExec } from "node:child_process";
import { createServer } from "node:http";
import { promisify } from "node:util";
import { unlink } from "node:fs/promises";
import { join } from "node:path";

import { dbg, getBasename } from "@common/utils";
import { getFirstKey } from "@utils/map-set";
import { pathExists } from "./media";
import { time } from "@utils/utils";

const { log, error } = console;
const exec = promisify(syncExec);

const fileLocation = join(tmpdir(), "medias");
const zipFileLocation = fileLocation + ".zip";
const cmd = `zip -j -0 -v ${fileLocation} `;
const hostname = getMyIpAddress();
let cachedIp = "";
let id = 0;

export function turnServerOn(oneFilePath: Path): TurnServerOnReturn {
	return time(() => {
		let errorListening = false;
		let port = 8_000;

		function handleCloseServer(err: Error) {
			error("Error listening. Closing server.", err);

			// @ts-ignore => err.code does exists here.
			if (err.code === "EADDRINUSE") {
				errorListening = true;
				port += 10;
			}

			server.close();
		}

		function tryToStartServer(): void {
			errorListening = false;
			++id;

			server.listen(
				port,
				hostname,
				() => log(`Server '${id}' is running on http://${hostname}:${port}`),
			);
		}

		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////

		async function handleDownloadMedia(
			req: IncomingMessage,
			res: ServerResponse,
		) {
			req.on("error", err => {
				error("Error on request.", { err });
				req.destroy();
				server.close();
			});

			res
				.setHeader(
					"Content-Disposition",
					`attachment;filename=${getBasename(oneFilePath)}`,
				)
				.setHeader("Content-Type", "application/octet-stream")
				.setHeader("Accept-Encoding", "gzip")
				.on("error", err => {
					error("Error on response!", { err });
					res.end();
					server.close();
				});

			const readStream: ReadStream = createReadStream(oneFilePath)
				.on(
					"open",
					// We replaced all the event handlers with a simple call to readStream.pipe()
					// This just pipes the read stream to the response object (which goes to the client)
					() =>
						readStream.pipe(res).on("error", err => {
							error("Error piping readStream!", { err });
							res.end();
							server.close();
						}),
				)
				.on("error", err => {
					error("Error on downloadMedias's readStream.", { err });
					res.end();
					server.close();
				})
				.on("end", () => {
					dbg("Ended reading `oneFilePath`.");
					res.end();
				});
		}

		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////

		// We create a new server object via the https module's
		// createServer() function. This server accepts HTTP
		// requests and passes them on to our downloadMedias()
		// function, a callback function that fires when the
		// server begins to listen.
		const server = createServer(handleDownloadMedia)
			.on("close", async () => {
				dbg(`Closing server from NodeJS side.\nDeleting "${zipFileLocation}".`);

				if (await pathExists(zipFileLocation)) {
					dbg(`Deleting file: "${zipFileLocation}"`);
					await unlink(zipFileLocation).catch(error);
				}

				if (errorListening) {
					dbg("Restarting server because error 'EADDRINUSE' was found!");
					tryToStartServer();
				}
			})
			.on("connection", socket => {
				dbg("Connected to another computer!");

				socket.on("error", err => error("Error on socket!", err)).on(
					"close",
					() => log("Closing socket from NodeJS side."),
				);
			})
			.on("error", handleCloseServer);

		tryToStartServer();

		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////

		const ret: TurnServerOnReturn = {
			addListener: (event: string, listener: (...args: unknown[]) => void) =>
				server.addListener(event, listener),
			url: `http://${hostname}:${port}`,
			close: () => server.close(),
		};

		return ret;
	}, `turnServerOn("${oneFilePath}")`);
}

// TODO: if ever to make Muse for Windows, see to make this portable!
export async function makeItOnlyOneFile(
	filepaths: ReadonlySet<Path>,
): Promise<Path> {
	return await time(async () => {
		const mediasSeparatedBySpaceAndSurroundedByQuotationMarks = [...filepaths]
			.map(filepath => `"${filepath}"`)
			.join(" ");

		// If only one file, send it directly:
		if (filepaths.size === 1) return getFirstKey(filepaths) as string;

		// Else, make an uncompressed zip file:
		try {
			if (await pathExists(zipFileLocation)) {
				dbg(`Deleting pre existing file: "${zipFileLocation}"`);
				await unlink(zipFileLocation).catch(error);
			}

			const command = cmd + mediasSeparatedBySpaceAndSurroundedByQuotationMarks;

			const { stdout, stderr } = await exec(command);

			dbg("zip stdout:", stdout);
			dbg("zip stderr:", stderr);
		} catch (error) {
			throw new Error("Error ziping medias! " + error);
		}

		return zipFileLocation;
	}, "async exec");
}

function getMyIpAddress(): Readonly<string> {
	if (cachedIp) return cachedIp;

	const myIp = Object
		.values(networkInterfaces())
		.flat()
		.filter(item => !item?.internal && item?.family === "IPv4")
		.find(Boolean)
		?.address;

	dbg(`My ip address = ${myIp}`);

	cachedIp = myIp ?? "";

	return cachedIp;
}

export type TurnServerOnReturn = Readonly<
	{
		addListener(event: string, listener: (...args: unknown[]) => void): void;
		url: QRCodeURL;
		close(): void;
	}
>;
