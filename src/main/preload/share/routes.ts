import type { Middleware } from "koa";
import type { Path } from "@common/@types/generalTypes";

import Router from "koa-router";

import { getBasenameAndLastExtension } from "@common/path";
import { prettyPrintStringArray } from "@utils/array";
import { log, throwErr } from "@common/log";

export const router = new Router();

const mainUrlPath = "/download/medias/";

/////////////////////////////////////////////
/////////////////////////////////////////////

const downloadAll: Middleware = async (ctx, next) => {
	// TODO: find a better way to download all songs!!! maybe sip again...

	const filepaths: readonly Path[] = ctx["filepaths"];
	const { url } = ctx;

	ctx.response.body = `\
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
log("Downloading medias...");

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

				// document.appendChild(a);

				a.click();
			}

			${prettyPrintStringArray(filepaths)}.forEach((path, index) => {
				const filename = getBasenameAndExtension(path).join(".");
				const urlOfDownload = "${url}${mainUrlPath}" + index;

				downloadURL(urlOfDownload, filename);
			});
		</script>
	</body>
</html>`;

	await next();
};

router.get("/", downloadAll);

/////////////////////////////////////////////
/////////////////////////////////////////////

const downloadOneByIndex: Middleware = async (ctx, next) => {
	const filepaths: readonly Path[] = ctx["filepaths"];

	log("filepaths from middleware downloadOneByIndex:", filepaths);

	const index = Number(ctx.params.index);

	if (isNaN(index)) throwErr(`Index not present on params. index = ${index}.`);

	const filePath = filepaths[index];

	if (!filePath)
		throwErr(
			`Index not within index bounds. index = ${index}, filepaths = ${filepaths}.`,
		);

	////////////////////////////////////////////////
	////////////////////////////////////////////////

	ctx.attachment(getBasenameAndLastExtension(filePath as string).join("."));
	ctx.set("Content-Type", "application/octet-stream");

	const fileContents = createReadStream(filePath as string);
	ctx.body = fileContents;

	////////////////////////////////////////////////
	////////////////////////////////////////////////

	await next();
};

router.get(`${mainUrlPath}:index`, downloadOneByIndex);
