import type { Base64, Media, Path } from "@common/@types/generalTypes";

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
	path: Readonly<Path>,
	assureMediaSizeIsGreaterThan60KB: Readonly<boolean>,
	ignoreMediaWithLessThan60Seconds: Readonly<boolean>,
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

			if (ignoreMediaWithLessThan60Seconds === true && durationInSeconds < 60)
				return reject(
					`Skipping "${path}" because the duration is ${durationInSeconds.toPrecision(
						2,
					)} s (less than 60 s)!`,
				);

			if (assureMediaSizeIsGreaterThan60KB === true && length < 60_000)
				return reject(
					`Skipping "${path}" because size is ${length} bytes! (< 60 KB)`,
				);

			/////////////////////////////////////////////
			/////////////////////////////////////////////

			let picture: IPicture | undefined, mimeType: string | undefined, error;
			try {
				picture = pictures[0];
				mimeType = picture?.mimeType;
			} catch (err) {
				error = err;
			}

			const media: Media = {
				image:
					picture !== undefined && mimeType
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

			return resolve([path, media]);
		}, `createMedia('${basename}')`);
	});
}

export async function transformPathsToMedias(
	paths: readonly Path[],
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true,
): Promise<readonly [Path, Media][]> {
	return time(async () => {
		console.groupCollapsed("Creating medias...");

		const promises = paths.map((path) =>
			createMedia(
				path,
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			).catch((e) =>
				console.error(
					`There was a possible error creating media of path: "${path}".\n\n`,
					e,
				),
			),
		);

		// Run promises in parallel:
		const medias = (await Promise.allSettled(promises))
			.map((p) => (p.status === "fulfilled" ? p.value : false))
			.filter(Boolean) as [Path, Media][];

		console.groupEnd();

		return medias;
	}, "transformPathsToMedias");
}
