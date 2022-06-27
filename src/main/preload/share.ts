import type { IncomingMessage, ServerResponse } from "node:http";
import type { Path } from "@common/@types/generalTypes";

import { createServer, type Server } from "node:https";
import { promisify } from "node:util";
import { exec } from "node:child_process";

import { port } from "@common/crossCommunication";
import { time } from "@utils/utils";

const execCmd = promisify(exec);

export function turnServerOn(filePath: Path): TurnServerOnResponse {
	let myIpAddress: string | undefined;
	const server = createServer(requestListener);

	function requestListener(req: IncomingMessage, res: ServerResponse) {
		myIpAddress = req.socket.localAddress;

		res.setHeader("Content-Disposition", `attachment;filename=${filePath}`);
		res.setHeader("Content-Type", "application/octet-stream");
		res.end("Your IP Addresss is: " + myIpAddress);
	}

	server.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});

	if (!myIpAddress) {
		server.close();
		throw new Error(
			"No IP address found. Without it, the QR code cannot be made!",
		);
	}

	return { turnServerOff: () => server.close(), myIpAddress };
}

// TODO: if ever to make Muse for Windows, see to make this portable!
export async function makeItOnlyOneFile(filepaths: Path[]): Promise<Path> {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	if (filepaths.length === 1) return filepaths[0]!;

	const mediasDir = "medias";
	const zipFile = `${mediasDir}.zip` as const;

	// Else, make a zip file:
	time(
		() =>
			execCmd(`zip -0 -v ${mediasDir} ${filepaths.join(" ")}`).then(
				({ stdout, stderr }) => {
					console.log(stdout);
					console.log(stderr);
				},
			),
		"async exec",
	);

	return zipFile;
}

export type TurnServerOnResponse = Readonly<
	{ turnServerOff(): Server; myIpAddress: string; }
>;
