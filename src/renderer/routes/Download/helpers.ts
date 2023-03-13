import { proxy } from "valtio";

import { createNewDownload } from "@components/Downloading/helper";
import { getErrorMessage } from "@utils/error";
import { translation } from "@i18n";
import { error } from "@common/log";

const { getBasicInfo } = electronApi.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const searchResult = proxy<SearcherInfo>({
	result: { imageURL: "", artist: "", title: "" },
	isLoading: false,
	error: "",
	url: "",
});

function setDefaultSearchInfo() {
	searchResult.result = { imageURL: "", artist: "", title: "" };
	searchResult.isLoading = false;
	searchResult.error = "";
	searchResult.url = "";
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function downloadMedia(): void {
	const {
		result: { artist, imageURL, title },
		url,
	} = searchResult;

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

	searchResult.url = e.target.value;
}

////////////////////////////////////////////////

export async function search(url: string): Promise<void> {
	if (url.length < 16) return;

	setDefaultSearchInfo();
	searchResult.isLoading = true;

	try {
		const { thumbnails, media, title } = (await getBasicInfo(url)).videoDetails;

		const result: UrlMediaMetadata = {
			imageURL: thumbnails.at(-1)?.url ?? "",
			// ^ Highest quality is last in this array.
			artist: media.artist ?? "",
			title,
		};

		searchResult.isLoading = false;
		searchResult.result = result;
	} catch (err) {
		const { t } = translation;

		setDefaultSearchInfo();
		searchResult.error = getErrorMessage(err).includes("No video id found")
			? t("errors.noVideoIdFound")
			: t("errors.gettingMediaInfo");

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
