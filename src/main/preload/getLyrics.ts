import { lyricApiKey, lyricsAPI } from "@main/utils";
import { dbg, stringifyJson } from "@common/utils";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export async function searchForLyricsAndImage(
	mediaTitle: string,
	mediaArtist: string,
	mediaImage: string,
): Promise<LyricsResponse> {
	dbg({ mediaTitle, mediaImage, mediaArtist });

	const [possibleLyric] = await queryForPossibleLyric(mediaTitle, mediaArtist);

	if (!possibleLyric)
		throw new Error("No lyrics found!");

	const image = !mediaImage ? await queryForImage(possibleLyric.imageURL) : "";
	const lyric = await queryForLyric(possibleLyric.lyricURL);
	const albumName = possibleLyric.albumName;

	dbg({ lyric, image, albumName });

	const ret: LyricsResponse = { lyric, image, albumName };

	return ret;
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

async function queryForPossibleLyric(
	mediaTitle: string,
	mediaArtist: string,
): Promise<PossibleLyrics[]> {
	if (!mediaTitle || !mediaArtist)
		throw new Error(
			`Required argument is empty: ${
				stringifyJson({ mediaArtist, mediaTitle })
			}`,
		);

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
		await (await fetch(lyricsAPI + "?" + params.toString(), {
			headers: {
				"Content-Type": "application/json",
				"x-happi-key": lyricApiKey,
			},
			method: "GET",
		}))
			.json() as Track | ErrorResponse;

	dbg({ queryForPossibleLyric: jsonRes });

	if (!jsonRes.success)
		throw new Error(jsonRes.error);

	const possibleLyrics: PossibleLyrics[] = jsonRes.result.map((
		{ artist = "", track = "", cover = "", api_lyrics = "", album = "" },
	) => ({
		lyricURL: api_lyrics,
		albumName: album,
		imageURL: cover,
		title: track,
		artist,
	}));

	return possibleLyrics;
}

/////////////////////////////////////////

async function queryForLyric(lyricURL: string): Promise<string> {
	dbg(`Querying for lyricURL = "${lyricURL}".`);

	const jsonRes =
		await (await fetch(lyricURL, {
			headers: {
				"Content-Type": "application/json",
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

async function queryForImage(imageURL: string): Promise<string> {
	dbg(`Querying for lyricURL = "${imageURL}".`);

	const blob =
		await (await fetch(imageURL, { redirect: "follow", method: "GET" })).blob();

	dbg({ blob });

	const base64 = await blobToBase64(blob);

	return base64;
}

/////////////////////////////////////////

function blobToBase64(blob: Blob): Promise<string> {
	const reader = new FileReader();
	reader.readAsDataURL(blob);

	return new Promise(resolve => {
		reader.onloadend = () => {
			resolve(reader.result as string);
		};
	});
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type PossibleLyrics = Readonly<
	{
		albumName: string;
		imageURL: string;
		lyricURL: string;
		artist: string;
		title: string;
	}
>;

/////////////////////////////////////////

interface QueryForLyricsSuccessResponse {
	success: true;
	result: { lyrics: string; };
}

/////////////////////////////////////////

// From Happy's docs:
interface Track {
	success: true;
	result: [
		{
			track: string;
			artist: string;
			album: string;
			cover: string;
			api_album: string;
			api_lyrics: string;
		},
	];
}

/////////////////////////////////////////

type ErrorResponse = Readonly<{ success: false; error: string; }>;

/////////////////////////////////////////

export type LyricsResponse = Readonly<
	{ image: string; lyric: string; albumName: string; }
>;
