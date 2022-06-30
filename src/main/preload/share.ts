import type { IncomingMessage, ServerResponse } from "node:http";
import type { Path } from "@common/@types/generalTypes";

import { createReadStream, createWriteStream, ReadStream } from "node:fs";
import { createServer, type Server } from "node:https";
import { networkInterfaces } from "node:os";
import { exec as syncExec } from "node:child_process";
import { createGunzip } from "node:zlib";
import { promisify } from "node:util";
import { pipeline } from "node:stream/promises";

import { getFirstKey } from "@utils/map-set";
import { time } from "@utils/utils";
import { dbg } from "@common/utils";

const exec = promisify(syncExec);

export function turnServerOn(oneFilePath: Path): turnServerOnReturn {
	return time(() => {
		const hostname = getMyIpAddress();
		let errorListening = false;
		let port = 8_000;

		function handleCloseServer(err: Error) {
			dbg("on handleCloseServer()", { err });
			console.error("Error listening. Closing server.", err);

			// @ts-ignore => err.code does exists here.
			if (err.code === "EADDRINUSE") {
				errorListening = true;
				port += 10;
			}

			server.close();
		}

		function tryToStartServer(server: Server): void {
			errorListening = false;

			server.listen(
				port,
				hostname,
				() => console.log(`Server is running on https://${hostname}:${port}`),
			);
		}

		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////

		async function downloadMedias(_req: IncomingMessage, res: ServerResponse) {
			dbg("on downloadMedias()", { _req, res });

			res.setHeader(
				"Content-Disposition",
				`attachment;filename=${oneFilePath}`,
			);
			res.setHeader("Content-Type", "application/octet-stream");
			res.setHeader("Accept-Encoding", "gzip");
			res.write("First message to client!");

			res.on("data", async data => {
				const output = createWriteStream("medias").on("finish", () => {
					const msg = "Finished writing the unziped file on client.";
					dbg(msg);
					res.end(msg);
				});

				try {
					await pipeline(data, createGunzip(), output);
				} catch (error) {
					console.error("Pipeline failed on res.on('data')!", error);
				}
			});

			const readStream: ReadStream = createReadStream(oneFilePath)
				.on(
					"open",
					// We replaced all the event handlers with a simple call to readStream.pipe()
					// This just pipes the read stream to the response object (which goes to the client)
					() => readStream.pipe(res),
				)
				.on("error", err => {
					console.error("Error on downloadMedias's readStream.", err);
					res.end(err);
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
		// createServer() function. This server accepts HTTPS
		// requests and passes them on to our downloadMedias()
		// function, a callback function that fires when the
		// server begins to listen.
		const server = createServer(downloadMedias)
			.on("close", () => {
				console.log("Closing server from NodeJS side.");

				if (errorListening) {
					dbg("Restarting server because error 'EADDRINUSE' was found!");
					tryToStartServer(server);
				}
			})
			.on("connection", () => {
				console.log("Connected to another computer!");
			})
			.on("error", handleCloseServer);

		tryToStartServer(server);

		///////////////////////////////////////////
		///////////////////////////////////////////
		///////////////////////////////////////////

		const ret: turnServerOnReturn = {
			addListener: (
				event: string,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				listener: (...args: any[]) => void,
			) => server.addListener(event, listener),
			close: () => server.close(),
			hostname,
			port,
		};

		return ret;
	}, `turnServerOn(${oneFilePath})`);
}

// TODO: if ever to make Muse for Windows, see to make this portable!
export async function makeItOnlyOneFile(
	filepaths: ReadonlySet<Path>,
): Promise<Path> {
	return await time(async () => {
		const mediasSeparatedBySpaceAndSurroundedByQuotationMarks = [...filepaths]
			.map(filepath => `"${filepath}"`)
			.join(" ");

		dbg(
			`on makeItOnlyOneFile(${mediasSeparatedBySpaceAndSurroundedByQuotationMarks})`,
		);

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		if (filepaths.size === 1) return getFirstKey(filepaths)!;

		const mediasDir = "medias";

		const cmd =
			`zip -0 -v ${mediasDir} ${mediasSeparatedBySpaceAndSurroundedByQuotationMarks}`;

		dbg({ cmd });

		// Else, make a zip file:
		try {
			const { stdout, stderr } = await exec(cmd);

			console.log("zip stdout:\n\n", stdout);
			console.log("\n\nzip stderr:", stderr);
		} catch (error) {
			throw new Error("Error ziping medias!" + error);
		}

		return `${mediasDir}.zip` as const;
	}, "async exec");
}

let cachedIp = "";
function getMyIpAddress(): Readonly<string> {
	if (cachedIp) return cachedIp;

	const myIp = time(
		() =>
			Object
				.values(networkInterfaces())
				.flat()
				.filter(item => !item?.internal && item?.family === "IPv4")
				.find(Boolean)
				?.address,
		"myIp",
	);

	dbg("myIp =", myIp);

	cachedIp = myIp ?? "";

	return cachedIp;
}

export type turnServerOnReturn = Readonly<{
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	addListener(event: string, listener: (...args: any[]) => void): void;
	hostname: string;
	close(): void;
	port: number;
}>;
