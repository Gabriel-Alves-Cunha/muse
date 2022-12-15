import type { Base64, ID, Media, Path } from "@common/@types/generalTypes";

import { error, groupEnd, groupCollapsed } from "node:console";
import { File as MediaFile, IPicture } from "node-taglib-sharp";
import { randomUUID } from "node:crypto";
import { statSync } from "node:fs";

import { randomBackgroundColorForConsole, formatDuration } from "@common/utils";
import { getAllowedMedias, searchDirectoryResult } from "../file";
import { emptyString } from "@common/empty";
import { getBasename } from "@common/path";
import { time } from "@utils/utils";
import { dbg } from "@common/debug";

/////////////////////////////////////////////

const randomColor = randomBackgroundColorForConsole();

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const createMedia = async (
	path: Path,
	assureMediaSizeIsGreaterThan60KB: boolean,
	ignoreMediaWithLessThan60Seconds: boolean,
): Promise<[Path, Media]> =>
	new Promise((resolve, reject) => {
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
				path,
			};

			dbg(`%c${basename}`, randomColor(), { media, picture, mimeType, error });

			resolve([randomUUID(), media]);
		}, `createMedia('${basename}')`);
	});

export const transformPathsToMedias = (
	path: Path | undefined,
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true,
): Promise<[Path, Media][]> =>
	time(async () => {
		groupCollapsed("Creating medias...");

		const medias: [ID, Media][] = [];

		if (path) {
			const media = await createMedia(
				path,
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			).catch((e) =>
				error(
					`There was a possible error creating media of path: "${path}".\n\n`,
					e,
				),
			);

			if (media) medias.push(media);
		} else {
			const promises: Promise<void | readonly [Path, Media]>[] = [];
			const paths = getAllowedMedias(await searchDirectoryResult());

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

			for (const fulfilled of fulfilledPromises)
				fulfilled.status === "fulfilled" &&
					medias.push(fulfilled.value as [ID, Media]);
		}

		groupEnd();

		return medias;
	}, "transformPathsToMedias");
