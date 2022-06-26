import type { IncomingMessage, ServerResponse } from "http";
import type { Path } from "@common/@types/generalTypes";

import { createServer } from "https";

const port = 8080;

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

type TurnServerOffFunction = () => void;

// function fileHandler() {
// 	server.
// }
