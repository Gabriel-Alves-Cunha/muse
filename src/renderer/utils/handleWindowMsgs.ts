import { electronSource, type MsgWithSource } from "@common/crossCommunication";
import { assertUnreachable } from "./utils";
import { setDownloadInfo } from "@modules/Downloading";
import { downloadingList } from "@contexts/downloadList";
import { ProgressStatus } from "@common/enums";
import { convertingList } from "@contexts/convertList";
import { getMediaFiles } from "@contexts/mediaHandler/usePlaylistsHelper";
import { dbg } from "@common/utils";
import {
	searchLocalComputerForMedias,
	PlaylistActions,
	getPlaylists,
	WhatToDo,
	setPlaylists,
	deleteMedia,
} from "@contexts/mediaHandler/usePlaylists";
import {
	type MsgObjectElectronToReact,
	ElectronToReactMessageEnum,
} from "@common/@types/electron-window";

const { transformPathsToMedias } = electron.media;

// listen for files drop
function listenToDragoverEvent(event: DragEvent) {
	event.stopPropagation();
	event.preventDefault();

	if (!event.dataTransfer) return;

	event.dataTransfer.dropEffect = "copy";
	// ^ Style the drag-and-drop as a "copy file" operation.
}

function listenToDropEvent(event: DragEvent) {
	event.stopPropagation();
	event.preventDefault();

	if (!event.dataTransfer) return;

	const fileList = event.dataTransfer.files;
	const files = getMediaFiles(fileList);

	console.log({ fileList, files });
	console.warn("@TODO: handle these files droped!", files);
}

window.addEventListener("dragover", listenToDragoverEvent);
window.addEventListener("drop", listenToDropEvent);

export async function handleWindowMsgs(
	event: MessageEvent<MsgWithSource<MsgObjectElectronToReact>>
): Promise<void> {
	if (event.data.source !== electronSource) return;

	dbg("Received message from Electron.\ndata =", event.data);
	const { msg } = event.data;

	switch (msg.type) {
		case ElectronToReactMessageEnum.CREATE_A_NEW_DOWNLOAD: {
			dbg("Create a new download.");
			setDownloadInfo(msg.downloadInfo);
			break;
		}

		case ElectronToReactMessageEnum.NEW_DOWNLOAD_CREATED: {
			dbg("New download created.");

			const downloadingList_ = downloadingList();
			// In here, there has to be a download WAITING:
			const download = downloadingList().get(msg.url);

			dbg({ downloadingList_, url: msg.url, download });

			if (!download) {
				console.error(
					"There should be a download to be confirmed on `downloadingList`, but there is none!"
				);
				break;
			}

			downloadingList_.set(msg.url, {
				...download,
				status: ProgressStatus.ACTIVE,
			});
			break;
		}

		case ElectronToReactMessageEnum.NEW_COVERSION_CREATED: {
			dbg("New conversion created.");

			const convertingList_ = convertingList();
			// In here, there has to be a conversion WAITING:
			const convertingMedia = convertingList_.get(msg.path);

			dbg({ convertingList_, path: msg.path, convertingMedia });

			// In here, there has to be a conversion WAITING
			if (!convertingMedia) {
				console.error(
					"There should be a convertion to be confirmed on `convertingList`, but there is none!"
				);
				break;
			}

			convertingList().set(msg.path, {
				...convertingMedia,
				status: ProgressStatus.ACTIVE,
			});
			break;
		}

		case ElectronToReactMessageEnum.CREATE_CONVERSION_FAILED: {
			console.error("Create conversion failed!");

			const convertingList_ = convertingList();
			// In here, there has to be a conversion WAITING
			const convertingMedia = convertingList_.get(msg.path);

			dbg({ convertingList_, path: msg.path, convertingMedia });

			if (!convertingMedia) {
				console.error(
					"There should be a convertion to be confirmed on `convertingList`, but there is none!"
				);
				break;
			}

			convertingList().set(msg.path, {
				...convertingMedia,
				status: ProgressStatus.FAILED,
			});
			break;
		}

		case ElectronToReactMessageEnum.CREATE_DOWNLOAD_FAILED: {
			console.error("Download failed!");

			const downloadingList_ = downloadingList();
			// In here, there has to be a download WAITING:
			const download = downloadingList().get(msg.url);

			dbg({ downloadingList_, url: msg.url, download });

			if (!download) {
				console.error(
					"There should be a download to be confirmed on `downloadingList`, but there is none!"
				);
				break;
			}

			downloadingList_.set(msg.url, {
				...download,
				status: ProgressStatus.FAILED,
			});
			break;
		}

		case ElectronToReactMessageEnum.ADD_ONE_MEDIA: {
			dbg("Add one media.");

			const { mediaPath } = msg;

			dbg("At ListenToNotification.ADD_MEDIA:", { mediaPath });

			const [media] = await transformPathsToMedias([mediaPath]);

			if (!media) {
				console.error(`Could not transform "${mediaPath}" to media.`);
				break;
			}

			setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: WhatToDo.UPDATE_MAIN_LIST,
				newMedia: media,
			});
			break;
		}

		case ElectronToReactMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER: {
			dbg("Delete one media from computer.");

			const { mediaPath } = msg;

			dbg("At ListenToNotification.DELETE_ONE_MEDIA_FROM_COMPUTER:", {
				mediaPath,
			});

			const media = getPlaylists().mainList.find(p => p.path === mediaPath);

			if (!media) {
				console.error("Could not find media to delete.");
				break;
			}

			deleteMedia(media)
				.then(() => console.log(`Media "${{ media }}" deleted.`))
				.catch(console.error);
			break;
		}

		case ElectronToReactMessageEnum.REFRESH_ALL_MEDIA: {
			dbg("Refresh all media.");
			await searchLocalComputerForMedias(true);
			break;
		}

		case ElectronToReactMessageEnum.REFRESH_ONE_MEDIA: {
			dbg("Refresh one media.");

			const { mediaPath } = msg;

			dbg("At ElectronToReactMessageEnum.REFRESH_MEDIA:", { data: msg });

			const mediaIndex = getPlaylists().mainList.findIndex(
				m => m.path === mediaPath
			);

			if (mediaIndex === -1) {
				console.warn(
					`There should be a media with path = "${mediaPath}" to be refreshed, but there isn't!\nRefreshing all media instead.`
				);
				await searchLocalComputerForMedias(true);
				break;
			}

			const [refreshedMedia] = await transformPathsToMedias([mediaPath]);

			if (!refreshedMedia) {
				console.error(
					`I wasn't able to transform this path (${mediaPath}) to a media to be refreshed!\nRefreshing all media.`
				);
				await searchLocalComputerForMedias(true);
				break;
			}

			setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
				type: WhatToDo.UPDATE_MAIN_LIST,
				newMedia: refreshedMedia,
			});
			break;
		}

		case ElectronToReactMessageEnum.REMOVE_ONE_MEDIA: {
			dbg("Remove one media.");

			const { mediaPath } = msg;

			dbg("At ElectronToReactMessageEnum.REMOVE_MEDIA:", { mediaPath });

			const media = getPlaylists().mainList.find(m => m.path === mediaPath);

			if (!media) {
				console.error(
					`I wasn't able to find this path "${mediaPath}" to a media to be removed!`
				);
				break;
			}

			setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_PATH,
				type: WhatToDo.UPDATE_MAIN_LIST,
				mediaID: media.id,
			});
			break;
		}

		case ElectronToReactMessageEnum.ERROR: {
			console.error("@TODO: ERROR", msg.error);

			break;
		}

		default: {
			console.error(
				`There is no method to handle this event.data: (${typeof msg}) '`,
				msg,
				"'\nEvent =",
				event
			);

			assertUnreachable(msg);
			break;
		}
	}
}
