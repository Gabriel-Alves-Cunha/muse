import type { IncomingMessage, ServerResponse } from "node:http";
import type { Path } from "@common/@types/generalTypes";

import { createServer } from "node:https";
import { promisify } from "node:util";
import { exec } from "node:child_process";

import { port } from "@common/crossCommunication";

const execCmd = promisify(exec);

export function turnServerOn(filePath: Path): TurnServerOffFunction {
	const server = createServer(requestListener);

	function requestListener(req: IncomingMessage, res: ServerResponse) {
		const myIpAddress = req.socket.localAddress;

		res.setHeader("Content-Disposition", `attachment;filename=${filePath}`);
		res.setHeader("Content-Type", "application/octet-stream");
		res.end("Your IP Addresss is: " + myIpAddress);
	}

	server.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});

	return () => server.close();
}

export async function makeItOnlyOneFile(filepaths: Path[]): Promise<Path> {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	if (filepaths.length === 1) return filepaths[0]!;

	const mediasDir = "medias";
	const zipFile = `${mediasDir}.zip` as const;

	// Else, make a zip file:
	const { stdout, stderr } = await execCmd(
		`zip -0 -v ${mediasDir} ${filepaths.join(" ")}`,
	);

	console.log(stdout);
	console.log(stderr);

	return zipFile;
}

export type TurnServerOffFunction = () => void;
