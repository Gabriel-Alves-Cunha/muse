import create from "zustand";

import { setDownloadValues } from "@modules/Downloading";
import { getErrorMessage } from "@utils/error";
import { dbg } from "@common/utils";

const { getBasicInfo } = electron.media;

export const useDownloadHelper = create<DownloadHelper>((set, get) => ({
	searcher: {
		result: undefined,
		isLoading: false,
		searchTerm: "",
		error: "",
	},

	download: (url: string) => {
		const { result } = get().searcher;

		if (!result) return;
		dbg(`Sending msg to download "${url}".`);

		// Start download:
		setDownloadValues({
			downloadValues: {
				imageURL: result.imageURL,
				canStartDownload: true,
				title: result.title,
				url,
			},
		});

		// Reset values:
		set({
			searcher: {
				result: undefined,
				isLoading: false,
				searchTerm: "",
				error: "",
			},
		});
	},

	search: async (url: string) => {
		dbg(`Searching for "${url}".`);

		set({
			searcher: {
				result: undefined,
				searchTerm: url,
				isLoading: true,
				error: "",
			},
		});

		try {
			const { videoDetails } = await getBasicInfo(url);

			const result: UrlMediaMetadata = {
				imageURL: videoDetails.thumbnails.at(-1)?.url ?? "",
				// ^ Highest quality is last in this array.
				artist: videoDetails.media.artist ?? "",
				title: videoDetails.title,
			};

			set(({ searcher: { searchTerm } }) => ({
				searcher: {
					isLoading: false,
					searchTerm,
					error: "",
					result,
				},
			}));
		} catch (error) {
			set(({ searcher: { searchTerm } }) => ({
				searcher: {
					isLoading: false,
					result: undefined,
					searchTerm,
					error: getErrorMessage(error).includes("No video id found")
						? "No video ID found!"
						: "There was an error getting media information!",
				},
			}));

			console.error(error);
		}
	},
}));

export const { getState: getDownloadHelper, setState: setDowloadHelper } =
	useDownloadHelper;
export const { download, search } = getDownloadHelper();

type DownloadHelper = Readonly<{
	search(url: string): Promise<void>;
	download(url: string): void;
	searcher: SearcherProps;
}>;

type UrlMediaMetadata = Readonly<{
	imageURL: string;
	artist: string;
	title: string;
}>;

type SearcherProps = Readonly<{
	result: UrlMediaMetadata | undefined;
	isLoading: boolean;
	searchTerm: string;
	error: string;
}>;
