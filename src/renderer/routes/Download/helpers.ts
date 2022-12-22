import create from "zustand";

import { setDownloadInfo } from "@components/Downloading";
import { getErrorMessage } from "@utils/error";
import { useTranslation } from "@i18n";
import { emptyString } from "@common/empty";
import { error } from "@common/log";
import { dbg } from "@common/debug";

const { getBasicInfo } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

const defaultSearchInfo: SearcherInfo = {
	result: { imageURL: emptyString, artist: emptyString, title: emptyString },
	error: emptyString,
	url: emptyString,
	isLoading: false,
};

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
	if (!(title && url)) return;

	// Start download:
	setDownloadInfo({ imageURL, title, url, artist });

	// Reset values:
	setSearchInfo(defaultSearchInfo);
}

////////////////////////////////////////////////

export const setUrl = (e: React.ChangeEvent<HTMLInputElement>) =>
	setSearchInfo({ url: e.target.value });

////////////////////////////////////////////////

export async function search(url: Readonly<string>): Promise<void> {
	if (url.length < 16) return;

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
		const { t } = useTranslation();

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

type UrlMediaMetadata = {
	imageURL: string;
	artist: string;
	title: string;
};

////////////////////////////////////////////////

type SearcherInfo = {
	result: UrlMediaMetadata;
	isLoading: boolean;
	error: string;
	url: string;
};
