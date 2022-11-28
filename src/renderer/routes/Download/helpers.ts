import create from "zustand";

import { setDownloadInfo } from "@components/Downloading";
import { getErrorMessage } from "@utils/error";
import { emptyString } from "@common/empty";
import { dbg } from "@common/debug";
import { t } from "@components/I18n";

const { getBasicInfo } = electron.media;
const { error } = console;

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

export const useSearchInfo = create<SearcherInfo>(() => defaultSearchInfo);

export const { setState: setSearchInfo, getState: searchInfo } = useSearchInfo;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function downloadMedia(): void {
	const {
		result: { artist, imageURL, title },
		url,
	} = searchInfo();

	dbg(`Setting \`DownloadInfo\` to download "${url}".`);
	if (title.length === 0 || url.length === 0) return;

	// Start download:
	setDownloadInfo({ imageURL, title, url, artist });

	// Reset values:
	setSearchInfo(defaultSearchInfo);
}

////////////////////////////////////////////////

export async function search(url: Readonly<string>): Promise<void> {
	if (url.length < 16) return;

	dbg(`Searching for "${url}".`);

	setSearchInfo({
		result: defaultSearchInfo.result,
		error: emptyString,
		isLoading: true,
	});

	try {
		const { thumbnails, media, title } = (await getBasicInfo(url)).videoDetails;

		const result: UrlMediaMetadata = {
			imageURL: thumbnails.at(-1)?.url ?? emptyString,
			// ^ Highest quality is last in this array.
			artist: media.artist ?? emptyString,
			title,
		};

		setSearchInfo({ isLoading: false, result });
	} catch (err) {
		setSearchInfo({
			result: defaultSearchInfo.result,
			isLoading: false,
			error: getErrorMessage(err).includes("No video id found")
				? t("errors.noVideoIdFound")
				: t("errors.gettingMediaInfo"),
		});

		error(err);
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

type SearcherInfo = Readonly<{
	result: UrlMediaMetadata;
	isLoading: boolean;
	error: string;
	url: string;
}>;
