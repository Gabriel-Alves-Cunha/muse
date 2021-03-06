import type { Media, Path, ImgString } from "@common/@types/generalTypes";

import { File as MediaFile, IPicture } from "node-taglib-sharp";
import { lstatSync } from "node:fs";

import { dbg, formatDuration } from "@common/utils";
import { getBasename } from "@common/path";
import { time } from "@utils/utils";

const { error } = console;

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
				tag: { pictures, title, album, genres, albumArtists, lyrics },
				fileAbstraction: { readStream: { length } },
				properties: { durationMilliseconds },
			} = MediaFile.createFromPath(path);

			const durationInSeconds = durationMilliseconds / 1_000;

			/////////////////////////////////////////////
			/////////////////////////////////////////////

			if (ignoreMediaWithLessThan60Seconds && durationInSeconds < 60)
				return reject(
					`Skipping "${path}" because the duration is ${
						durationInSeconds.toPrecision(3)
					} s (less than 60 s)!`,
				);

			if (assureMediaSizeIsGreaterThan60KB && length < 60_000)
				return reject(
					`Skipping "${path}" because size is ${length} bytes! (< 60 KB)`,
				);

			/////////////////////////////////////////////
			/////////////////////////////////////////////

			const picture: IPicture | undefined = pictures[0];
			const mimeType = picture?.mimeType;

			const media: Media = {
				image: picture && mimeType ?
					`data:${mimeType};base64,${picture.data.toBase64String()}` as ImgString :
					"",
				duration: formatDuration(durationInSeconds),
				birthTime: lstatSync(path).birthtimeMs,
				artist: albumArtists[0] ?? "",
				title: title ?? basename,
				lyrics: lyrics ?? "",
				album: album ?? "",
				isSelected: false,
				size: length,
				genres,
			};

			dbg(basename, media);

			return resolve([path, media]);
		}, `createMedia("${basename}")`);
	});
}

export async function transformPathsToMedias(
	paths: readonly Path[],
	assureMediaSizeIsGreaterThan60KB = true,
	ignoreMediaWithLessThan60Seconds = true,
): Promise<readonly [Path, Media][]> {
	return time(async () => {
		console.groupCollapsed("Creating medias...");

		const promises = paths.map(path =>
			createMedia(
				path,
				assureMediaSizeIsGreaterThan60KB,
				ignoreMediaWithLessThan60Seconds,
			)
				.catch(e =>
					error(`There was an error creating media of path = "${path}".\n\n`, e)
				)
		);

		// Run promises in parallel:
		const medias = (await Promise.allSettled(promises))
			.map(p => (p.status === "fulfilled" ? p.value : false))
			.filter(Boolean) as [Path, Media][];

		console.groupEnd();

		return medias;
	}, "create and transform paths to medias");
}
