import type { IncomingMessage, ServerResponse } from "node:http";
import type { Path, QRCodeURL } from "@common/@types/generalTypes";

import { createGzip, createGunzip, constants } from "node:zlib";
import { networkInterfaces, tmpdir } from "node:os";
import { createServer } from "node:http";
import { pipeline } from "node:stream/promises";
import { create } from "archiver";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import {
	createWriteStream,
	createReadStream,
	ReadStream,
	statSync,
} from "node:fs";

import { getFirstKey } from "@utils/map-set";
import { getBasename } from "@common/path";
import { prettyBytes } from "@common/prettyBytes";
import { pathExists } from "./file";
import { time } from "@utils/utils";
import { dbg } from "@common/utils";

const { log, error } = console;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const fileLocation = join(tmpdir(), "medias");
const tarZipFileLocation = fileLocation + ".tar.gz";
// const cmd = `zip -j -0 -v ${fileLocation} `;
const myIp = getMyIpAddress();
let id = 0;

dbg(`My ip address = ${myIp}`);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for `turnServerOn`:

export async function makeItOnlyOneFile(
	filepaths: ReadonlySet<Path>,
): Promise<Readonly<Path>> {
	return await time(async () => { // If only one file, send it directly:
		if (filepaths.size === 1) return getFirstKey(filepaths) as string;

		// Else, make an uncompressed zip file:
		if (await pathExists(tarZipFileLocation)) {
			dbg(`Deleting pre existing file: "${tarZipFileLocation}"`);
			// If this errors, don't throw an error, just log it:
			await unlink(tarZipFileLocation).catch(error);
		}

		const writeStreamToTarZipFile = createWriteStream(tarZipFileLocation).on(
			"error",
			err => {
				throw new Error("Error on writeStreamToTarZipFile!\n" + err);
			},
		);
		const zip = createGzip({ level: constants.Z_NO_COMPRESSION }).on(
			"error",
			err => {
				throw new Error("Error on zip!\n" + err);
			},
		);
		const tarArchiver = create("tar");

		for (const path of filepaths) {
			dbg({ path });
			const fileContents = createReadStream(path);

			const exitNumber = await new Promise<0>((resolve, reject) => {
				dbg("on exitNumber Promise");
				tarArchiver
					.append(fileContents, { name: getBasename(path) })
					.on("entry", () => resolve(0))
					.on("error", err => reject(err))
					.on("pipe", () => dbg("Piping"));
			});

			dbg(`exitNumber for "${path}" = ${exitNumber}`);
		}

		// finalize the archive (ie we are done appending files but streams have to finish yet)
		// 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
		tarArchiver.finalize();

		await pipeline(tarArchiver, zip, writeStreamToTarZipFile).catch(err => {
			throw new Error("Error on entry!\n" + err);
		});

		dbg(
			`pipeline finalized. ${tarZipFileLocation}.size = ${
				prettyBytes(statSync(tarZipFileLocation).size)
			}`,
		);

		return tarZipFileLocation;
	}, "makeItOnlyOneFile");
}

/////////////////////////////////////////////

function getMyIpAddress(): Readonly<string> {
	// Got this from StackOverflow, if this ever fails, replace it.
	const myIp =
		Object
			.values(networkInterfaces())
			.flat()
			.filter(item => !item?.internal && item?.family === "IPv4")
			.find(Boolean)
			?.address ?? "";

	if (!myIp)
		throw new Error(
			"Unable to get your ip address. Sharing medias is not possible!",
		);

	return myIp;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function turnServerOn(oneFilePath: Readonly<Path>): TurnServerOnReturn {
	return time(() => {
		// If there is an error listening to port, we
		// will try again after changing the port:
		let errorListening = false;
		let port = 8_000;

		///////////////////////////////////////////

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
					() => {
						const extractor = extract().on("entry", (_header, stream, next) => {
							// header is the tar header
							// stream is the content body (might be an empty stream)
							// call next when you are done with this entry

							// Ready for next entry:
							stream.on("end", next);
							// Just auto drain the stream:
							stream.resume();
						});

						readStream.pipe(createGunzip()).pipe(extractor).pipe(res).on(
							"finish",
							() => {
								log("Piping to client finished!");
							},
						);
					},
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

				if (await pathExists(tarZipFileLocation)) {
					dbg(`Deleting zip file: "${tarZipFileLocation}"`);
					await unlink(tarZipFileLocation).catch(error);
				}

				if (errorListening) {
					dbg("Restarting server because error 'EADDRINUSE' was found!");
					tryToStartServer();
				}
			})
			.on("connection", socket => {
				dbg("Connected to another device!");

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
		// Return:

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
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type TurnServerOnReturn = Readonly<
	{
		addListener(event: string, listener: (...args: unknown[]) => void): void;
		url: QRCodeURL;
		close(): void;
	}
>;
