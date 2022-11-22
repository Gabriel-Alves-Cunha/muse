import { observable } from "@legendapp/state";

import { getErrorMessage } from "@utils/error";
import { downloadInfo } from "@components/Downloading";
import { emptyString } from "@common/empty";
import { dbg } from "@common/debug";
import { t } from "@components/I18n";

const { getBasicInfo } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

const defaultSearchInfo: SearcherInfo = Object.freeze({
	result: { imageURL: emptyString, artist: emptyString, title: emptyString },
	error: emptyString,
	url: emptyString,
	isLoading: false,
});

export const searchInfo = observable<SearcherInfo>({ ...defaultSearchInfo });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function downloadMedia(): void {
	const {
		result: { artist, imageURL, title },
		url,
	} = searchInfo.peek();

	dbg(`Setting \`DownloadInfo\` to download "${url}".`);
	if (title.length === 0 || url.length === 0) return;

	// Start download:
	downloadInfo.set({ imageURL, title, url, artist, extension: "mp3" });

	// Reset values:
	searchInfo.set({ ...defaultSearchInfo });
}

////////////////////////////////////////////////

export async function search(url: Readonly<string>): Promise<void> {
	if (url.length < 16) return;

	dbg(`Searching for "${url}".`);

	searchInfo.set((prev) => ({
		...prev,
		result: defaultSearchInfo.result,
		error: emptyString,
		isLoading: true,
	}));

	try {
		const { thumbnails, media, title } = (await getBasicInfo(url)).videoDetails;

		const result: UrlMediaMetadata = {
			imageURL: thumbnails.at(-1)?.url ?? emptyString,
			// ^ Highest quality is last in this array.
			artist: media.artist ?? emptyString,
			title,
		};

		searchInfo.set((prev) => ({ ...prev, isLoading: false, result }));
	} catch (error) {
		searchInfo.set((prev) => ({
			...prev,
			result: defaultSearchInfo.result,
			isLoading: false,
			error: getErrorMessage(error).includes("No video id found")
				? t("errors.noVideoIdFound")
				: t("errors.gettingMediaInfo"),
		}));

		console.error(error);
	}
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

type UrlMediaMetadata = Readonly<{
	imageURL: string;
	artist: string;
	title: string;
}>;

////////////////////////////////////////////////

type SearcherInfo = {
	result: UrlMediaMetadata;
	isLoading: boolean;
	error: string;
	url: string;
};
