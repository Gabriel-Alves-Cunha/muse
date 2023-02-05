import type { Base64, Media, Path } from "types/generalTypes";

// import { parseBlob } from "music-metadata-browser";

import { File as MediaFile } from "node-taglib-sharp";

import { getAllowedMedias, searchDirectoryResult } from "@utils/file";
import { error, groupEnd, groupCollapsed, dbg } from "@utils/log";
import { getBasename } from "@utils/path";
import {
	randomBackgroundColorForConsole,
	formatDuration,
	time,
} from "@utils/utils";

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

		time(async () => {
			const blob = new File([], path);
			const { size, lastModified } = blob;

			const mediaFile = MediaFile.createFromPath(path);

			console.log({ mediaFile });

			return reject();

			if (assureMediaSizeIsGreaterThan60KB && size < 60_000)
				return reject(
					`Skipping "${path}" because size is ${size} bytes! (< 60 KB)`,
				);

			// const {
			// 	common: { artist = "", album = "", lyrics, picture, genre },
			// 	format: { duration, creationTime },
			// } = await parseBlob(blob, { duration: true });

			if (ignoreMediaWithLessThan60Seconds && duration && duration < 60)
				return reject(
					`Skipping "${path}" because the duration is ${duration.toPrecision(
						2,
					)} s (less than 60 s)!`,
				);

			const image = picture?.[0];
			const mimeType = image?.format;

			const media: Media = {
				image:
					image && mimeType
						? (`data:${mimeType};base64,${image.data.toString(
								"base64",
						  )}` as Base64)
						: "",
				birthTime: creationTime ? creationTime?.getTime() : NaN,
				duration: formatDuration(duration),
				lyrics: lyrics?.join(" ") ?? "",
				genres: genre ?? [],
				title: basename,
				lastModified,
				artist,
				album,
				size,
			};

			dbg(`%c${basename}`, randomColor(), media);

			resolve([path, media]);
		}, `createMedia("${basename}")`);
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
			).catch((e) => error(`Error on single "${path}".\n\n`, e));

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
					).catch(error),
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
