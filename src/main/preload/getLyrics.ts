import axios from "axios";

import { dbg } from "@common/utils";

const { error } = console;

// @ts-ignore => this has to be dot notation
const lyricApiKey = process.env.VITE_LYRIC_API_KEY;

if (!lyricApiKey)
	throw new Error("Lyric api key is not present: " + lyricApiKey);

export async function searchForLyrics(
	mediaTitle: string,
	mediaArtist: string,
): Promise<PossibleLyrics[]> {
}

async function queryForPossibleLyric(
	mediaTitle: string,
	mediaArtist: string,
): Promise<PossibleLyrics[] | ErrorResponse> {
	if (!lyricApiKey)
		throw new Error("Lyric api key is not present: " + lyricApiKey);

	// From 'https://happi.dev/docs/music' docs.

	const params = {
		// Text to search
		q: `${mediaTitle}${mediaArtist ? ", " + mediaArtist : ""}`,
		lyrics: "0",
		limit: "2",
	};
	const queryUrl = "https://api.happi.dev/v1/music";
	const url = queryUrl + new URLSearchParams(params);

	const res = await axios.get<Track | ErrorResponse>(url, {
		headers: {
			// Happy's way to use the api key:
			"x-happi-key": lyricApiKey,
		},
	});

	dbg({ res, url, params });

	if (!res.data.success)
		return res.data as ErrorResponse;

	const ret: PossibleLyrics[] = (res.data as Track).result.map((
		{ artist = "", track = "", cover = "", api_lyrics = "" },
	) => ({ artist, title: track, imageURL: cover, lyricURL: api_lyrics }));

	return ret;
}

export type PossibleLyrics = Readonly<
	{ artist: string; title: string; imageURL: string; lyricURL: string; }
>;

type Track = Readonly<
	{
		success: boolean;
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

type ErrorResponse = Readonly<{ success: boolean; error: string; }>;
