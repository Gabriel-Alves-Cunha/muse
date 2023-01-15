import { create } from "zustand";

import { setDownloadInfo } from "@components/Downloading";
import { getErrorMessage } from "@utils/error";
import { useTranslation } from "@i18n";
import { error } from "@common/log";
import { dbg } from "@common/debug";

const { getBasicInfo } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

const defaultSearchInfo: SearcherInfo = {
	result: { imageURL: "", artist: "", title: "" },
	isLoading: false,
	error: "",
	url: "",
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

	if (!(title && url)) return;

	// Setting 'downloadInfo' will download 'url':
	setDownloadInfo({ imageURL, title, url, artist });

	// Clear input:
	setSearchInfo(defaultSearchInfo);
}

////////////////////////////////////////////////

export function setUrl(e: React.ChangeEvent<HTMLInputElement>): void {
	// stopping propagation so the space key doesn't toggle play state.
	e.stopPropagation();

	setSearchInfo({ url: e.target.value });
}

////////////////////////////////////////////////

export async function search(url: Readonly<string>): Promise<void> {
	if (url.length < 16) return;

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
	} catch (err) {
		const { t } = useTranslation.getState();

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
