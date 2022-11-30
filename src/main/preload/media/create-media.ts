import type { Base64, Media, Path } from "@common/@types/generalTypes";

import { error, groupEnd, groupCollapsed } from "node:console";
import { File as MediaFile, IPicture } from "node-taglib-sharp";
import { statSync } from "node:fs";

import { randomBackgroundColorForConsole, formatDuration } from "@common/utils";
import { emptyString } from "@common/empty";
import { getBasename } from "@common/path";
import { time } from "@utils/utils";
import { dbg } from "@common/debug";

/////////////////////////////////////////////

const randomColor = randomBackgroundColorForConsole();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

async function createMedia(
	path: Path,
	assureMediaSizeIsGreaterThan60KB: boolean,
	ignoreMediaWithLessThan60Seconds: boolean,
): Promise<readonly [Path, Media]> {
	return new Promise((resolve, reject) => {
		const basename = getBasename(path);

		time(() => {
			const {
				fileAbstraction: { readStream: { length } },
				properties: { durationMilliseconds },
				tag: {
					lyrics = emptyString,
					album = emptyString,
					title = basename,
					albumArtists,
					pictures,
					genres,
				},
			} = MediaFile.createFromPath(path);

			const durationInSeconds = durationMilliseconds / 1_000;

			/////////////////////////////////////////////
			/////////////////////////////////////////////

			if (ignoreMediaWithLessThan60Seconds && durationInSeconds < 60)
				return reject(
					`Skipping "${path}" because the duration is ${durationInSeconds.toPrecision(
						2,
					)} s (less than 60 s)!`,
				);

			if (assureMediaSizeIsGreaterThan60KB && length < 60_000)
				return reject(
					`Skipping "${path}" because size is ${length} bytes! (< 60 KB)`,
				);

			/////////////////////////////////////////////
			/////////////////////////////////////////////

			let picture: IPicture | undefined;
			let mimeType: string | undefined;
			let error: Error | undefined;
			try {
				picture = pictures[0];
				mimeType = picture?.mimeType;
			} catch (err) {
				error = err as Error;
			}

			const media: Media = {
				image:
					picture && mimeType
						? (`data:${mimeType};base64,${picture.data.toBase64String()}` as Base64)
						: emptyString,
				duration: formatDuration(durationInSeconds),
				artist: albumArtists[0] ?? emptyString,
				birthTime: statSync(path).birthtimeMs,
				size: length,
				lyrics,
				genres,
				title,
				album,
			};

			dbg(`%c${basename}`, randomColor(), { media, picture, mimeType, error });

			resolve([path, media]);
		}, `createMedia('${basename}')`);
	});
}

export async function transformPathsToMedias(
	paths: readonly Path[],
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true,
): Promise<readonly [Path, Media][]> {
	return time(async () => {
		groupCollapsed("Creating medias...");

		const promises: Promise<void | readonly [Path, Media]>[] = [];

		for (const path of paths)
			promises.push(
				createMedia(
					path,
					assureMediaSizeIsGreaterThan60KB,
					ignoreMediaWithLessThan60Seconds,
				).catch((e) =>
					error(
						`There was a possible error creating media of path: "${path}".\n\n`,
						e,
					),
				),
			);

		// Run promises in parallel:
		const fulfilledPromises = await Promise.allSettled(promises);

		const medias: [Path, Media][] = [];

		for (const fulfilled of fulfilledPromises)
			fulfilled.status === "fulfilled" &&
				medias.push(fulfilled.value as [Path, Media]);

		groupEnd();

		return medias;
	}, "transformPathsToMedias");
}
