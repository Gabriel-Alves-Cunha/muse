import create from "zustand";

import { setDownloadInfo } from "@components/Downloading";
import { getErrorMessage } from "@utils/error";
import { dbg } from "@common/utils";

const { getBasicInfo } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

const defaultSearchInfo: SearcherInfo = Object.freeze({
	result: { imageURL: "", artist: "", title: "" },
	isLoading: false,
	error: "",
	url: "",
});

export const useSearchInfo = create<SearcherInfo>(() => defaultSearchInfo);

export const { setState: setSearchInfo, getState: searchInfo } = useSearchInfo;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function downloadMedia(): void {
	const { result: { artist, imageURL, title }, url } = searchInfo();

	dbg(`Setting \`DownloadInfo\` to download "${url}".`);
	if (!title || !url) return;

	// Start download:
	setDownloadInfo({ imageURL, title, url, artist });

	// Reset values:
	setSearchInfo(defaultSearchInfo);
}

////////////////////////////////////////////////

export async function search(url: Readonly<string>): Promise<void> {
	if (!url || url.length < 8) return;

	dbg(`Searching for "${url}".`);

	setSearchInfo({
		result: defaultSearchInfo.result,
		isLoading: true,
		error: "",
	});

	try {
		const { thumbnails, media, title } = (await getBasicInfo(url)).videoDetails;

		const result: UrlMediaMetadata = {
			imageURL: thumbnails.at(-1)?.url ?? "",
			// ^ Highest quality is last in this array.
			artist: media.artist ?? "",
			title,
		};

		setSearchInfo({ isLoading: false, result });
	} catch (error) {
		setSearchInfo({
			result: defaultSearchInfo.result,
			isLoading: false,
			error: getErrorMessage(error).includes("No video id found") ?
				"No video ID found!" :
				"There was an error getting media information!",
		});

		console.error(error);
	}
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

type UrlMediaMetadata = Readonly<
	{ imageURL: string; artist: string; title: string; }
>;

////////////////////////////////////////////////

type SearcherInfo = Readonly<
	{ result: UrlMediaMetadata; isLoading: boolean; error: string; url: string; }
>;
