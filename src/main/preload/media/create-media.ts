import type { Media, Path, ImgString } from "@common/@types/generalTypes";

import { File as MediaFile, IPicture } from "node-taglib-sharp";
import { lstatSync } from "node:fs";
import { log } from "node:console";

import { dbg, formatDuration } from "@common/utils";
import { prettyBytes } from "@common/prettyBytes";
import { getBasename } from "@common/path";
import { time } from "@utils/utils";

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
				tag: { pictures, title, album, genres, albumArtists },
				fileAbstraction: { readStream: { length } },
				properties: { durationMilliseconds },
			} = MediaFile.createFromPath(path);

			const durationInSeconds = durationMilliseconds / 1_000;

			if (ignoreMediaWithLessThan60Seconds && durationInSeconds < 60) {
				log(
					`Skipping "${path}" because the duration is ${
						durationInSeconds.toPrecision(3)
					} s (less than 60 s)!`,
				);
				return reject();
			}

			const size = prettyBytes(length);

			if (assureMediaSizeIsGreaterThan60KB && length < 60_000) {
				log(`Skipping "${path}" because size is ${size} bytes! (< 60 KB)`);
				return reject();
			}

			const picture: IPicture | undefined = pictures[0];
			const mimeType = picture?.mimeType;
			let img = "";
			if (picture && mimeType) {
				const str = picture.data.toBase64String();
				dbg({ Base64String: str });
				// If the picture wasn't made by us. (That's the only way I found to
				// make this work, cause, when we didn't make the picture in
				// `writeTag`, we can't decode it!):
				// picture.type === PictureType.NotAPicture ||
				// picture.type === PictureType.Other ?
				// Buffer.from(picture.data.data).toString("base64") :
				// picture.data.toString();
				img = `data:${mimeType};base64,${str}` as ImgString;
			}

			const media: Media = {
				duration: formatDuration(durationInSeconds),
				birthTime: lstatSync(path).birthtimeMs,
				artist: albumArtists[0] ?? "",
				title: title ?? basename,
				isSelected: false,
				genres,
				album,
				size,
				img,
			};

			dbg(basename, {
				tag: { pictures, album, genres, albumArtists },
				properties: { durationMilliseconds },
			});

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
		);

		// Run promises in parallel:
		const medias = (await Promise.allSettled(promises))
			.map(p => (p.status === "fulfilled" ? p.value : false))
			.filter(Boolean) as [Path, Media][];

		console.groupEnd();

		return medias;
	}, "transformPathsToMedias");
}
