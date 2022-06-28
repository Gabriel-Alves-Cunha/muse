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
import { port } from "@common/crossCommunication";
import { time } from "@utils/utils";
import { dbg } from "@common/utils";

const exec = promisify(syncExec);

export function turnServerOn(oneFilePath: Path): TurnServerOffFunction {
	return time(() => {
		const server = createServer(requestListener).listen(port, () => {
			console.log(`Server is running on port ${port}.`);
		}).on("close", () => console.log("Closing server.")).on("error", err => {
			console.error("Error at the server. Closing it.", err);
			server.close();
		});

		async function requestListener(_req: IncomingMessage, res: ServerResponse) {
			dbg("on requestListener()");

			res.setHeader(
				"Content-Disposition",
				`attachment;filename=${oneFilePath}`,
			);
			res.setHeader("Content-Type", "application/octet-stream");
			res.setHeader("Accept-Encoding", "gzip");
			res.write("First chunk");

			dbg({ res });

			const readStream: ReadStream = createReadStream(oneFilePath).on(
				"open",
				// We replaced all the event handlers with a simple call to readStream.pipe()
				// This just pipes the read stream to the response object (which goes to the client)
				() => readStream.pipe(res),
			).on("error", err => {
				console.error(err);
				res.end(err);
			}).on("end", () => {
				dbg("Ended reading `oneFilePath`.");
			});

			res.on("data", async data => {
				const output = createWriteStream("medias").on("finish", () => {
					const msg = "Finished writing the unziped file on client.";
					dbg(msg);
					res.end(msg);
				});

				try {
					await pipeline(data, createGunzip(), output);
				} catch (error) {
					console.error("Pipeline failed.", error);
				}
			});
		}

		return () => server.close();
	}, `turnServerOn(${oneFilePath})`);
}

// TODO: if ever to make Muse for Windows, see to make this portable!
export async function makeItOnlyOneFile(
	filepaths: ReadonlySet<Path>,
): Promise<Path> {
	dbg(`on makeItOnlyOneFile(${[...filepaths].join(" ")})`);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	if (filepaths.size === 1) return getFirstKey(filepaths)!;

	const mediasDir = "medias";
	const zipFile = `${mediasDir}.zip` as const;
	const cmd = `zip -0 -v ${mediasDir} ${[...filepaths].join(" ")}`;

	dbg({ cmd });

	// Else, make a zip file:
	time(() =>
		exec(cmd).then(({ stdout, stderr }) => {
			console.log("zip stdout:\n\n", stdout);
			console.log("\n\nzip stderr:", stderr);
		}), "async exec");

	return zipFile;
}

let cachedIp = "";
export function getMyIpAddress(): Readonly<string> {
	if (cachedIp) return cachedIp;

	const myIp = time(
		() =>
			Object.values(networkInterfaces()).flat().filter(item =>
				!item?.internal && item?.family === "IPv4"
			).find(Boolean)?.address,
		"myIp",
	);

	dbg("myIp =", myIp);

	cachedIp = myIp ?? "";

	return cachedIp;
}

export type TurnServerOffFunction = () => Server;
