import type { ChangeEvent } from "react";
import type { videoInfo } from "ytdl-core";

import { getErrorMessage } from "@utils/error";
import { dbg } from "@common/utils";
import {
	Type as MsgType,
	sendMsg,
} from "@contexts/communicationBetweenChildren/helpers";

import create from "zustand";

const { getInfo } = electron.media;

export const useDownloadHelper = create<DownloadHelper>((set, get) => ({
	setSearchTerm: (e: ChangeEvent<HTMLInputElement>) =>
		set({
			searcher: {
				searchTerm: e.target.value,
				result: undefined,
				isLoading: false,
				error: "",
			},
		}),

	download: (url: string) => {
		const searcher = get().searcher;

		if (!searcher.result) return;
		dbg("Sending msg to download", url);

		sendMsg({
			value: {
				imageURL: searcher.result.imageURL,
				title: searcher.result.title,
				canStartDownload: true,
				url,
			},
			type: MsgType.START_DOWNLOAD,
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
		let metadata: UrlMediaMetadata | undefined = undefined;

		try {
			const info = (await getInfo(url)) as videoInfo;
			const title = info.videoDetails.title;

			metadata = {
				imageURL: info.videoDetails.thumbnails.at(-1)?.url ?? "",
				// ^ Highest quality is last in this array.
				songTitle: info.videoDetails.media.song ?? title,
				artist: info.videoDetails.media.artist ?? "",
				title,
			};
		} catch (error) {
			if (getErrorMessage(error).includes("No video id found"))
				set({
					searcher: {
						...searcher,
						isLoading: false,
						error: "No video ID found!",
					},
				});
			else
				set({
					searcher: {
						...searcher,
						isLoading: false,
						error: "There was an error getting media information!",
					},
				});

			throw error;
		} finally {
			set({
				searcher: {
					...searcher,
					isLoading: false,
					result: metadata,
					error: "",
				},
			});
		}
	},
}));

type DownloadHelper = {
	setSearchTerm(e: ChangeEvent<HTMLInputElement>): void;
	search(url: string): Promise<void>;
	download(url: string): void;
	searcher: SearcherProps;
};

type UrlMediaMetadata = Readonly<{
	songTitle: string;
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
