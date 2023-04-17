import { create } from "zustand";

import { createNewDownload } from "@components/Downloading/helper";
import { getErrorMessage } from "@utils/error";
import { error } from "@common/log";
import { t } from "@i18n";

const { getBasicInfo } = electronApi.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

const defaultSearchInfo: SearcherInfo = {
	result: { imageURL: "", artist: "", title: "" },
	isLoading: false,
	error: "",
	url: "",
} as const;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main functions:

export const useSearchInfo = create<SearcherInfo>(() => defaultSearchInfo);

export const { getState: getSearchInfo, setState: setSearchInfo } =
	useSearchInfo;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

const setDefaultSearchInfo = (): void => setSearchInfo(defaultSearchInfo);

////////////////////////////////////////////////

export const selectIsLoading = (state: SearcherInfo): boolean =>
	state.isLoading;

////////////////////////////////////////////////

export const selectResult = (state: SearcherInfo): SearcherInfo["result"] =>
	state.result;

////////////////////////////////////////////////

export function downloadMedia(): void {
	const {
		result: { artist, imageURL, title },
		url,
	} = getSearchInfo();

	if (!(title && url)) return;

	// Setting 'downloadInfo' will download 'url':
	createNewDownload({ imageURL, title, url, artist, extension: "mp3" });

	// Clear input:
	setDefaultSearchInfo();
}

////////////////////////////////////////////////

export function setUrl(e: React.ChangeEvent<HTMLInputElement>): void {
	// stopping propagation so the space key doesn't toggle play media.
	e.stopPropagation();

	setSearchInfo({ url: e.target.value });
}

////////////////////////////////////////////////

export async function search(url: string): Promise<void> {
	if (url.length < 16) return;

	setSearchInfo({ isLoading: true });

	try {
		const { thumbnails, media, title } = (await getBasicInfo(url)).videoDetails;

		const result: UrlMediaMetadata = {
			imageURL: thumbnails.at(-1)?.url ?? "",
			// ^ Highest quality is last in this array.
			artist: media.artist ?? "",
			title,
		};

		setSearchInfo({ result, isLoading: false });
	} catch (err) {
		error(err);

		setSearchInfo({
			isLoading: false,
			error: getErrorMessage(err).includes("No video id found")
				? t("errors.noVideoIdFound")
				: t("errors.gettingMediaInfo"),
		});
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

export type SearcherInfo = Readonly<{
	result: UrlMediaMetadata;
	isLoading: boolean;
	error: string;
	url: string;
}>;
