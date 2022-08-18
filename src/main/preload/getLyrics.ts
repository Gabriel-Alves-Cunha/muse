import { lyricApiKey, lyricsAPI } from "@main/utils";
import { dbg, stringifyJson } from "@common/utils";
import { Base64 } from "@common/@types/generalTypes";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export async function searchForLyricsAndImage(
	mediaTitle: Readonly<string>,
	mediaArtist: Readonly<string>,
	getImage: Readonly<boolean>,
): Promise<LyricsResponse> {
	if (!mediaTitle || !mediaArtist)
		throw new Error(
			`Required argument is empty: ${
				stringifyJson({ mediaArtist, mediaTitle })
			}`,
		);

	dbg({ mediaTitle, getImage, mediaArtist });

	const { albumName, imageURL, lyricURL } = await queryForPossibleLyric(
		mediaTitle,
		mediaArtist,
	);

	const image = getImage ? await queryForImage(imageURL) : "";
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
	mediaTitle: Readonly<string>,
	mediaArtist: Readonly<string>,
): Promise<PossibleLyrics> {
	// From 'https://happi.dev/docs/music' docs:
	const params = new URLSearchParams({
		// Text to search:
		q: `${mediaTitle}, ${mediaArtist}`,
		// Return only tracks with lyrics:
		lyrics: "1", // 1 for true, 0 for false.
		// Limit (Max 50):
		limit: "1",
	});

	const jsonRes =
		await (await fetch(`${lyricsAPI}?${params.toString()}`, {
			headers: {
				"content-type": "application/json",
				"x-happi-key": lyricApiKey,
			},
			method: "GET",
		}))
			.json() as Track | ErrorResponse;

	dbg({ queryForPossibleLyric: jsonRes });

	if (!jsonRes.success)
		throw new Error(jsonRes.error);

	const [track] = jsonRes.result;

	if (!track)
		throw new Error("No lyrics found!");

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

async function queryForLyric(
	lyricURL: Readonly<string>,
): Promise<Readonly<string>> {
	dbg(`Querying for lyricURL = "${lyricURL}".`);

	const jsonRes =
		await (await fetch(lyricURL, {
			headers: {
				"content-type": "application/json",
				"x-happi-key": lyricApiKey,
			},
			method: "GET",
		}))
			.json() as ErrorResponse | QueryForLyricsSuccessResponse;

	dbg({ queryForLyricJSONResponse: jsonRes });

	if (!jsonRes.success) {
		console.error(jsonRes.error);

		return "";
	}

	return jsonRes.result.lyrics;
}

/////////////////////////////////////////

async function queryForImage(imageURL: Readonly<string>): Promise<Base64> {
	dbg(`Querying for lyricURL = "${imageURL}".`);

	const blob =
		await (await fetch(imageURL, { redirect: "follow", method: "GET" })).blob();

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

type PossibleLyrics = Readonly<
	{ albumName: string; imageURL: string; lyricURL: string; title: string; }
>;

/////////////////////////////////////////

interface QueryForLyricsSuccessResponse {
	result: { lyrics: string; };
	success: true;
}

/////////////////////////////////////////

// From Happy's docs:
interface Track {
	success: true;
	result: [
		{ api_lyrics: string; track: string; album: string; cover: string; },
	];
}

/////////////////////////////////////////

type ErrorResponse = Readonly<{ success: false; error: string; }>;

/////////////////////////////////////////

export type LyricsResponse = Readonly<
	{ image: string; lyric: string; albumName: string; }
>;
