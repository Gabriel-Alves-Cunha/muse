import type { Base64, Media, Path } from "@common/@types/GeneralTypes";

import { File as MediaFile, IPicture } from "node-taglib-sharp";
import { statSync } from "node:fs";

import { randomBackgroundColorForConsole, formatDuration } from "@common/utils";
import { getAllowedMedias, searchDirectoryResult } from "../file";
import { error, groupEnd, groupCollapsed } from "@common/log";
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
				properties: { durationMilliseconds },
				tag: {
					title = basename,
					albumArtists,
					lyrics = "",
					album = "",
					pictures,
					genres,
				},
			} = MediaFile.createFromPath(path);

			const durationInSeconds = durationMilliseconds / 1_000;
			const { birthtimeMs, mtimeMs, size } = statSync(path);

			/////////////////////////////////////////////
			/////////////////////////////////////////////

			if (ignoreMediaWithLessThan60Seconds && durationInSeconds < 60)
				return reject(
					`Skipping "${path}" because the duration is ${durationInSeconds.toPrecision(
						2,
					)} s (less than 60 s)!`,
				);

			if (assureMediaSizeIsGreaterThan60KB && size < 60_000)
				return reject(
					`Skipping "${path}" because size is ${size} bytes! (< 60 KB)`,
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
						: "",
				duration: formatDuration(durationInSeconds),
				artist: albumArtists[0] ?? "",
				birthTime: birthtimeMs,
				lastModified: mtimeMs,
				lastPlayedAt: NaN,
				lyrics,
				genres,
				title,
				album,
				size,
			};

			dbg(`%c${basename}`, randomColor(), { media, picture, mimeType, error });

			resolve([path, media]);
		}, `createMedia('${basename}')`);
	});

export const transformPathsToMedias = (
	path: Path,
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true,
): Promise<[Path, Media][]> =>
	time(async () => {
		groupCollapsed("Creating medias...");

		const medias: [Path, Media][] = [];

		if (path) {
			const media = await createMedia(
				path,
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			).catch((e) => error(`Error on "${path}".\n\n`, e));

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
					).catch((e) => error(`Error on "${path}".\n\n`, e)),
				);

			// Run promises in parallel:
			const fulfilledPromises = await Promise.allSettled(promises);

			for (const fulfilled of fulfilledPromises)
				fulfilled.status === "fulfilled" &&
					medias.push(fulfilled.value as [Path, Media]);
		}

		groupEnd();

		return medias;
	}, "transformPathsToMedias");
