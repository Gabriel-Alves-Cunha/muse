import { proxy } from "valtio";

import { createNewDownload } from "@components/Downloading/helper";
import { getErrorMessage } from "@utils/error";
import { translation } from "@i18n";
import { error } from "@common/log";

const { getBasicInfo } = electron.media;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Constants:

export const searchInfo = proxy<SearcherInfo>({
	result: { imageURL: "", artist: "", title: "" },
	isLoading: false,
	error: "",
	url: "",
});

function setDefaultSearchInfo() {
	searchInfo.result = { imageURL: "", artist: "", title: "" };
	searchInfo.isLoading = false;
	searchInfo.error = "";
	searchInfo.url = "";
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper functions:

export function downloadMedia(): void {
	const {
		result: { artist, imageURL, title },
		url,
	} = searchInfo;

	if (!(title && url)) return;

	// Setting 'downloadInfo' will download 'url':
	createNewDownload({ imageURL, title, url, artist, extension: "mp3" });

	// Clear input:
	setDefaultSearchInfo();
}

////////////////////////////////////////////////

export function setUrl(e: React.ChangeEvent<HTMLInputElement>): void {
	// stopping propagation so the space key doesn't toggle play state.
	e.stopPropagation();

	searchInfo.url = e.target.value;
}

////////////////////////////////////////////////

export async function search(url: Readonly<string>): Promise<void> {
	if (url.length < 16) return;

	setDefaultSearchInfo();
	searchInfo.isLoading = true;

	try {
		const { thumbnails, media, title } = (await getBasicInfo(url)).videoDetails;

		const result: UrlMediaMetadata = {
			imageURL: thumbnails.at(-1)?.url ?? "",
			// ^ Highest quality is last in this array.
			artist: media.artist ?? "",
			title,
		};

		searchInfo.isLoading = false;
		searchInfo.result = result;
	} catch (err) {
		const { t } = translation;

		setDefaultSearchInfo();
		searchInfo.error = getErrorMessage(err).includes("No video id found")
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
