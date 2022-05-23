import create from "zustand";

import { setDownloadInfo } from "@modules/Downloading";
import { getErrorMessage } from "@utils/error";
import { dbg } from "@common/utils";

const { getBasicInfo } = electron.media;

const defaultSearchInfo: SearcherInfo = Object.freeze({
	result: undefined,
	isLoading: false,
	error: "",
	url: "",
});

export const useSearchInfo = create<SearcherInfo>(() => defaultSearchInfo);
export const { setState: setSearchInfo, getState: searchInfo } = useSearchInfo;

export const downloadMedia = () => {
	const { result, url } = searchInfo();

	if (!result) return;
	dbg(`Setting \`DownloadInfo\` to download "${url}".`);

	// Start download:
	setDownloadInfo({
		imageURL: result.imageURL,
		canStartDownload: true,
		title: result.title,
		url,
	});

	// Reset values:
	setSearchInfo(defaultSearchInfo);
};

export const search = async () => {
	const { url } = searchInfo();

	if (!url || url.length < 10) return;

	dbg(`Searching for "${url}".`);

	setSearchInfo({
		result: undefined,
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
			isLoading: false,
			result: undefined,
			error: getErrorMessage(error).includes("No video id found")
				? "No video ID found!"
				: "There was an error getting media information!",
		});

		console.error(error);
	}
};

type UrlMediaMetadata = Readonly<{
	imageURL: string;
	artist: string;
	title: string;
}>;

type SearcherInfo = Readonly<{
	result: UrlMediaMetadata | undefined;
	isLoading: boolean;
	error: string;
	url: string;
}>;
