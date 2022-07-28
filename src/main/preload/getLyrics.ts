/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { ImgString } from "@common/@types/generalTypes";

import { get } from "node:http";
import axios from "axios";

import { dbg, stringifyJson } from "@common/utils";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const lyricApiKey = "1996d0wcfWZB02aebwtkAYhcnERFnAbOGlDiIPWDNdnh3K0955cZpHov";

if (!lyricApiKey)
	throw new Error(
		"Lyric api key is not present: " + lyricApiKey + "\nimport.meta.env = " +
			stringifyJson(import.meta.env),
	);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export async function searchForLyricsAndImage(
	mediaTitle: string,
	mediaImage: string,
	mediaArtist: string,
): Promise<LyricAndImage> {
	const possibleLyrics = await queryForPossibleLyric(mediaTitle, mediaArtist);

	if (possibleLyrics.length === 0)
		throw new Error("No lyrics found!");

	const lyric = await queryForLyric(possibleLyrics[0]!.lyricURL);
	const image = !mediaImage ?
		await queryForImage(possibleLyrics[0]!.imageURL) :
		"";

	dbg({ lyric, image });

	const ret: LyricAndImage = { lyric, image };

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
	if (!lyricApiKey || !mediaTitle || !mediaArtist)
		throw new Error(
			`Required argument is empty: ${{ mediaArtist, lyricApiKey, mediaTitle }}`,
		);

	// From 'https://happi.dev/docs/music' docs.

	const queryUrl = "https://api.happi.dev/v1/music";
	const params = {
		// Text to search
		q: `${mediaTitle}, ${mediaArtist}`,
		lyrics: "0",
		limit: "1",
	};

	const res = await axios.get<Track | ErrorResponse>(queryUrl, {
		headers: {
			// Happy's way to use the api key:
			"x-happi-key": lyricApiKey,
		},
		params,
	});

	dbg("`queryForPossibleLyric` response =", res);

	if (!res.data.success)
		throw new Error(res.data.error);

	const possibleLyrics: PossibleLyrics[] = (res.data as Track).result.map((
		{ artist = "", track = "", cover = "", api_lyrics = "" },
	) => ({ artist, title: track, imageURL: cover, lyricURL: api_lyrics }));

	return possibleLyrics;
}

/////////////////////////////////////////

async function queryForLyric(lyricURL: string): Promise<string> {
	dbg(`Querying for lyricURL = "${lyricURL}"...`);

	const res = await axios.get<ErrorResponse | QueryForLyricsSuccessResponse>(
		lyricURL,
		{
			headers: {
				// Happy's way to use the api key:
				"x-happi-key": lyricApiKey,
			},
		},
	);

	dbg("`queryForLyric` response =", res);

	if (!res.data.success) throw new Error((res.data as ErrorResponse).error);

	return (res.data as QueryForLyricsSuccessResponse).lyrics;
}

/////////////////////////////////////////

async function queryForImage(imageURL: string): Promise<ImgString> {
	return new Promise((resolve, reject) =>
		get(imageURL, res => {
			res.setEncoding("base64");

			let img = `data:${res.headers["content-type"]};base64,` as ImgString;

			res.on("data", data => {
				img += data;
			});

			resolve(img);
		})
			.on("error", e => {
				console.error("Got error getting image on Electron side!\n\n", e);
				return reject(e);
			})
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type PossibleLyrics = Readonly<
	{ imageURL: string; lyricURL: string; artist: string; title: string; }
>;

/////////////////////////////////////////

type QueryForLyricsSuccessResponse = Readonly<
	{ success: true; lyrics: string; }
>;

/////////////////////////////////////////

// From Happy's docs:
type Track = Readonly<
	{
		success: true;
		length: number;
		result: [
			{
				track: string;
				id_track: number;
				artist: string;
				haslyrics: boolean;
				id_artist: number;
				album: string;
				bpm: number;
				id_album: number;
				cover: string;
				lang: string /* ISO 639-1 */;
				api_artist: string;
				api_albums: string;
				api_album: string;
				api_tracks: string;
				api_track: string;
				api_lyrics: string;
			},
		];
	}
>;

/////////////////////////////////////////

type ErrorResponse = Readonly<{ success: false; error: string; }>;

/////////////////////////////////////////

export type LyricAndImage = Readonly<{ image: string; lyric: string; }>;
