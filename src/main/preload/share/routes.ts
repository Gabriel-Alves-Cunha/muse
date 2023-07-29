import type { IncomingMessage, ServerResponse } from "node:http";

import { createReadStream } from "node:fs";

export const router: Router = (filepaths) => ({
	"/download/medias/": (req, res) => {
		let body = "";

		req
			.on("data", (chunk: string) => {
				body += chunk;
			})
			.on("end", () => {
				let fileCount = 0;

				console.log({ filepaths, body });

				res.writeHead(200, {
					"Content-Type": "application/octet-stream",
				});

				for (const filepath of filepaths)
					createReadStream(filepath)
						.pipe(res)
						.on("end", () => {
							++fileCount;

							if (fileCount === filepaths.size) res.end();
						});
			});
	},
});

type Handler = (req: IncomingMessage, res: ServerResponse) => void;

type Router = (filepaths: ReadonlySet<string>) => { [url: string]: Handler };
