import type { Base64 } from "@common/@types/generalTypes";

import { lyricApiKey, lyricsAPI } from "@main/utils";
import { error, throwErr } from "@common/log";
import { emptyString } from "@common/empty";
import { dbg } from "@common/debug";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const headers = {
	"x-happi-key": lyricApiKey ?? emptyString,
	"content-type": "application/json",
};

const method = "GET";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const searchForLyricsAndImage = async (
	mediaTitle: string,
	mediaArtist: string,
	getImage: boolean,
): Promise<LyricsResponse> => {
	if (!(mediaTitle && mediaArtist))
		throwErr(
			`Required argument can't be empty: mediaArtist = "${mediaArtist}"; mediaTitle = "${mediaTitle}"`,
		);

	dbg({ mediaTitle, getImage, mediaArtist });

	const { albumName, imageURL, lyricURL } = await queryForPossibleLyric(
		mediaTitle,
		mediaArtist,
	);

	const image = getImage ? await queryForImage(imageURL) : emptyString;
	const lyric = await queryForLyric(lyricURL);

	dbg({ lyric, image, albumName });

	return { lyric, image, albumName } satisfies LyricsResponse;
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const queryForPossibleLyric = async (
	mediaTitle: string,
	mediaArtist: string,
): Promise<PossibleLyrics> => {
	// From 'https://happi.dev/docs/music' docs:
	const params = new URLSearchParams({
		// Text to search:
		q: `${mediaTitle}, ${mediaArtist}`,
		// Return only tracks with lyrics:
		lyrics: "1", // "1" for true, "0" for false.
		// Limit (Max 50):
		limit: "1",
	}).toString();

	const jsonRes = (await (
		await fetch(`${lyricsAPI}?${params}`, { headers, method })
	).json()) as Track | ErrorResponse;

	dbg({ queryForPossibleLyric: jsonRes });

	if (!jsonRes.success) throwErr(jsonRes.error);

	const [track] = (jsonRes as Track).result;

	if (!track?.api_lyrics) throwErr("No lyrics found!");

	return {
		lyricURL: track.api_lyrics,
		albumName: track.album,
		imageURL: track.cover,
		title: track.track,
	} satisfies PossibleLyrics;
};

/////////////////////////////////////////

const queryForLyric = async (lyricURL: string): Promise<string> => {
	dbg(`Querying for lyricURL: "${lyricURL}".`);

	const jsonRes = (await (await fetch(lyricURL, { method, headers })).json()) as
		| QueryForLyricsSuccessResponse
		| ErrorResponse;

	dbg({ queryForLyricJSONResponse: jsonRes });

	if (!jsonRes.success) {
		error(jsonRes.error);

		return emptyString;
	}

	return jsonRes.result.lyrics;
};

/////////////////////////////////////////

const queryForImage = async (imageURL: string): Promise<Base64> => {
	dbg(`Querying for lyricURL = "${imageURL}".`);

	const blob = await (
		await fetch(imageURL, { redirect: "follow", method })
	).blob();

	const base64 = await blobToBase64(blob);

	dbg({ blob, base64 });

	return base64;
};

/////////////////////////////////////////

const blobToBase64 = (blob: Blob): Promise<Base64> => {
	const reader = new FileReader();
	reader.readAsDataURL(blob);

	return new Promise((resolve, reject) => {
		reader.onerror = () => reject("Error reading on blobToBase64!");
		reader.onloadend = () => resolve(reader.result as Base64);
	});
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

interface PossibleLyrics {
	readonly albumName: string;
	readonly imageURL: string;
	readonly lyricURL: string;
	readonly title: string;
}

/////////////////////////////////////////

interface QueryForLyricsSuccessResponse {
	readonly result: { lyrics: string };
	readonly success: true;
}

/////////////////////////////////////////

// From Happy's docs:
interface Track {
	readonly success: true;
	readonly result: readonly [
		{ api_lyrics: string; track: string; album: string; cover: string },
	];
}

/////////////////////////////////////////

interface ErrorResponse {
	readonly success: false;
	readonly error: string;
}

/////////////////////////////////////////

export interface LyricsResponse {
	readonly albumName: string;
	readonly image: string;
	readonly lyric: string;
}
