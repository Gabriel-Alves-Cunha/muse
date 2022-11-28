import type { Base64 } from "@common/@types/generalTypes";

import { lyricApiKey, lyricsAPI } from "@main/utils";
import { stringifyJson } from "@common/utils";
import { emptyString } from "@common/empty";
import { dbg } from "@common/debug";

const { error } = console;

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

export async function searchForLyricsAndImage(
	mediaTitle: string,
	mediaArtist: string,
	getImage: boolean,
): Promise<LyricsResponse> {
	if (!(mediaTitle && mediaArtist))
		throw new Error(
			`Required argument is empty: ${stringifyJson({
				mediaArtist,
				mediaTitle,
			})}`,
		);

	dbg({ mediaTitle, getImage, mediaArtist });

	const { albumName, imageURL, lyricURL } = await queryForPossibleLyric(
		mediaTitle,
		mediaArtist,
	);

	const image = getImage ? await queryForImage(imageURL) : emptyString;
	const lyric = await queryForLyric(lyricURL);

	dbg({ lyric, image, albumName });

	const lyricsResponse: LyricsResponse = { lyric, image, albumName };

	return lyricsResponse;
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

async function queryForPossibleLyric(
	mediaTitle: string,
	mediaArtist: string,
): Promise<PossibleLyrics> {
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

	if (jsonRes.success === false) throw new Error(jsonRes.error);

	const [track] = jsonRes.result;

	if (!track?.api_lyrics) throw new Error("No lyrics found!");

	const {
		api_lyrics: lyricURL,
		album: albumName,
		cover: imageURL,
		track: title,
	} = track;

	const possibleLyrics: PossibleLyrics = {
		albumName,
		lyricURL,
		imageURL,
		title,
	};

	return possibleLyrics;
}

/////////////////////////////////////////

async function queryForLyric(lyricURL: string): Promise<string> {
	dbg(`Querying for lyricURL = "${lyricURL}".`);

	const jsonRes = (await (await fetch(lyricURL, { method, headers })).json()) as
		| QueryForLyricsSuccessResponse
		| ErrorResponse;

	dbg({ queryForLyricJSONResponse: jsonRes });

	if (jsonRes.success === false) {
		error(jsonRes.error);

		return emptyString;
	}

	return jsonRes.result.lyrics;
}

/////////////////////////////////////////

async function queryForImage(imageURL: Readonly<string>): Promise<Base64> {
	dbg(`Querying for lyricURL = "${imageURL}".`);

	const blob = await (
		await fetch(imageURL, { redirect: "follow", method })
	).blob();

	const base64 = await blobToBase64(blob);

	dbg({ blob, base64 });

	return base64;
}

/////////////////////////////////////////

function blobToBase64(blob: Blob): Promise<Base64> {
	const reader = new FileReader();
	reader.readAsDataURL(blob);

	return new Promise((resolve, reject) => {
		reader.onerror = () => reject("Error reading on blobToBase64!");
		reader.onloadend = () => resolve(reader.result as Base64);
	});
}

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
