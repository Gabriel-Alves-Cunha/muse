import { networkInterfaces } from "node:os";
import { createReadStream } from "node:fs";
import { Path, QRCodeURL } from "@common/@types/generalTypes";
import Router from "koa-router";
import Koa from "koa";

import { getBasenameAndExtension } from "@common/path";
import { prettyPrintStringArray } from "@utils/array";
import { dbg } from "@common/utils";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

const mainPath = "/download/medias/";

export function createServer(filepaths: readonly Path[]): ClientServerAPI {
	const port = 3_010;
	const url: QRCodeURL = `http://${myIp}:${port}`;
	const router = new Router();

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	router.get("/", async (ctx, next) => {
		ctx.body = `\
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Download file(s)</title>
	</head>

	<body>
		<script>
			console.log("Downloading medias...");

			function getBasename(filename) {
				return filename.split("\\U+005C").pop()?.split("/").pop()?.split(".")[0] ?? "";
			}

			function getLastExtension(filename) {
				return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
			}

			function getBasenameAndExtension(filename) {
				return [getBasename(filename), getLastExtension(filename)];
			}

			function downloadURL(url, filename) {
				const a = document.createElement("a");

				a.download = filename;
				a.href = url;

				a.click();
			}

			${prettyPrintStringArray(filepaths)}.forEach((path, index) => {
				const filename = getBasenameAndExtension(path).join(".");
				const urlOfDownload = "${url}${mainPath}" + index;

				downloadURL(urlOfDownload, filename);
			});
		</script>
	</body>
</html>`;

		await next();
	});

	router.get(`${mainPath}:index`, async (ctx, next) => {
		const index = Number(ctx.params["index"]);

		if (Number.isNaN(index))
			throw new Error(`Index not present on params. index = ${index}.`);

		const filePath = filepaths[index];

		if (!filePath)
			throw new Error(
				`Index not within index bounds. index = ${index}, filepaths = ${filepaths}.`,
			);

		////////////////////////////////////////////////
		////////////////////////////////////////////////

		ctx.attachment(getBasenameAndExtension(filePath).join("."));
		ctx.set("Content-Type", "application/octet-stream");

		const fileContents = createReadStream(filePath);
		ctx.body = fileContents;

		////////////////////////////////////////////////
		////////////////////////////////////////////////

		await next();
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	const app = new Koa()
		.use(router.routes())
		.use(router.allowedMethods())
		.on("error", (err: Error) => {
			throw err;
		})
		.on("listen", () => dbg(`Listening on port ${port}`));

	const server = app.listen(port).on("error", (err: Error) => {
		throw err;
	});

	/////////////////////////////////////////////
	/////////////////////////////////////////////

	const clientServerAPI: ClientServerAPI = Object.freeze({
		addListener: (event: string, listener: (...args: unknown[]) => void) =>
			server.addListener(event, listener),
		close: () => server.close(),
		url,
	});

	return clientServerAPI;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions for `createServer`:

const myIp = getMyIpAddress();
dbg(`My ip address = ${myIp}`);

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
// Types:

export type ClientServerAPI = Readonly<
	{
		addListener(event: string, listener: (...args: unknown[]) => void): void;
		url: QRCodeURL;
		close(): void;
	}
>;
