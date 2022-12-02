import type { MediaBeingDownloaded } from "@components/Downloading";
import type { ValuesOf } from "@common/@types/utils";

import create from "solid-zustand";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// For testing:
import { progressStatus } from "@common/enums";
import { getRandomInt } from "@utils/utils";

const { port1: testPort } = new MessageChannel();
const testDownloadingMedias: [MediaUrl, MediaBeingDownloaded][] = Array.from(
	{
		length: 10,
	},
	(_, index) => {
		let status: ValuesOf<typeof progressStatus> = progressStatus.ACTIVE;

		{
			const random1_5 = getRandomInt(0, 5);
			switch (random1_5) {
				case 0: {
					status = progressStatus.ACTIVE;
					break;
				}

				case 1: {
					status = progressStatus.CANCEL;
					break;
				}

				case 2: {
					status = progressStatus.FAILED;
					break;
				}

				case 3: {
					status = progressStatus.SUCCESS;
					break;
				}

				default:
					break;
			}
		}
		const path: MediaUrl = `http://test-${index}.com`;
		const media: MediaBeingDownloaded = {
			title: `donwload-test-${index}`,
			percentage: 50,
			port: testPort,
			imageURL: "",
			status,
		};

		return [path, media];
	},
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main functions:

export const useDownloadingList = create<DownloadingList>(() => ({
	downloadingList: new Map(testDownloadingMedias),
}));

////////////////////////////////////////////////

export const getDownloadingList = () =>
	useDownloadingList.getState().downloadingList;

////////////////////////////////////////////////

export const setDownloadingList = (
	downloadingList: DownloadingList["downloadingList"],
) => useDownloadingList.setState({ downloadingList });

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

export type DownloadingList = Readonly<{
	downloadingList: ReadonlyMap<MediaUrl, MediaBeingDownloaded>;
}>;

export type MediaUrl = Readonly<string>;
