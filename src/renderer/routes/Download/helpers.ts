import { createSignal } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { setDownloadInfo } from "@components/Downloading";
import { getErrorMessage } from "@utils/error";
import { emptyString } from "@common/empty";
import { error } from "@utils/log";
import { dbg } from "@common/debug";

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

export const [getSearchInfo, setSearchInfo] =
	createSignal<SearcherInfo>(defaultSearchInfo);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export const downloadMedia = (): void => {
	const {
		result: { artist, imageURL, title },
		url,
	} = getSearchInfo();

	dbg(`Setting \`DownloadInfo\` to download "${url}".`);
	if (!(title && url)) return;

	// Start download:
	setDownloadInfo({ imageURL, title, url, artist });

	// Reset values:
	setSearchInfo(defaultSearchInfo);
};

////////////////////////////////////////////////

export const search = async (url: string): Promise<void> => {
	if (url.length < 16) return;

	dbg(`Searching for "${url}".`);

	setSearchInfo((prev) => ({
		...prev,
		result: defaultSearchInfo.result,
		error: emptyString,
		isLoading: true,
	}));

	try {
		const { thumbnails, media, title } = (await getBasicInfo(url)).videoDetails;

		const result: UrlMediaMetadata = {
			imageURL: thumbnails.at(-1)?.url ?? "",
			// ^ Highest quality is last in this array.
			artist: media.artist ?? "",
			title,
		};

		setSearchInfo((prev) => ({ ...prev, isLoading: false, result }));
	} catch (err) {
		const [t] = useI18n();

		setSearchInfo((prev) => ({
			...prev,
			result: defaultSearchInfo.result,
			isLoading: false,
			error: getErrorMessage(err).includes("No video id found")
				? t("errors.noVideoIdFound")
				: t("errors.gettingMediaInfo"),
		}));

		error(err);
	}
};

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
