import type { ChangeEvent } from "react";
import type { videoInfo } from "ytdl-core";

import create from "zustand";

import { MsgEnum, sendMsg } from "@contexts";
import { getErrorMessage } from "@utils/error";
import { dbg } from "@common/utils";

const { getInfo } = electron.media;

export const useDownloadHelper = create<DownloadHelper>((set, get) => ({
	setSearchTerm: ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
		set({
			searcher: {
				searchTerm: value,
				result: undefined,
				isLoading: false,
				error: "",
			},
		}),

	download: (url: string) => {
		const { result } = get().searcher;

		if (!result) return;
		dbg("Sending msg to download", url);

		sendMsg({
			type: MsgEnum.START_DOWNLOAD,
			value: {
				imageURL: result.imageURL,
				canStartDownload: true,
				title: result.title,
				url,
			},
		});
	},

	searcher: {
		result: undefined,
		isLoading: false,
		searchTerm: "",
		error: "",
	},

	search: async (url: string) => {
		const searcher = get().searcher;

		set({ searcher: { ...searcher, isLoading: true, error: "" } });

		try {
			const videoInfo = (await getInfo(url)) as videoInfo;

			const result: UrlMediaMetadata = {
				imageURL: videoInfo.videoDetails.thumbnails.at(-1)?.url ?? "",
				// ^ Highest quality is last in this array.
				artist: videoInfo.videoDetails.media.artist ?? "",
				title: videoInfo.videoDetails.title,
			};

			set({
				searcher: {
					...searcher,
					isLoading: false,
					error: "",
					result,
				},
			});
		} catch (error) {
			set({
				searcher: {
					isLoading: false,
					result: undefined,
					searchTerm: searcher.searchTerm,
					error: getErrorMessage(error).includes("No video id found")
						? "No video ID found!"
						: "There was an error getting media information!",
				},
			});

			throw error;
		}
	},
}));

type DownloadHelper = Readonly<{
	setSearchTerm(e: ChangeEvent<HTMLInputElement>): void;
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
