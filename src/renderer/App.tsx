import { ToastContainer } from "react-toastify";
import { useEffect } from "react";

import { Favorites, Download, Convert, History, Home } from "@routes";
import { electronSource, type MsgWithSource } from "@common/crossCommunication";
import { getItemAndIndex, remove, replace } from "@utils/array";
import { ERROR_KIND, Path, ProgressStatus } from "@common/@types/typesAndEnums";
import { ContextMenu, Decorations } from "@components";
import { MediaPlayer, Navbar } from "@modules";
import { assertUnreachable } from "@utils/utils";
import { setDownloadInfo } from "@modules/Downloading";
import { dbg } from "@common/utils";
import {
	searchLocalComputerForMedias,
	downloadsToBeConfirmed,
	convertsToBeConfirmed,
	setDownloadingList,
	getDownloadingList,
	getConvertingList,
	setConvertingList,
	PlaylistActions,
	getMediaFiles,
	PlaylistEnum,
	setPlaylists,
	getPlaylists,
	deleteMedia,
	MediaUrl,
	usePage,
} from "@contexts";
import {
	type MsgObjectElectronToReact,
	ElectronToReactMessageEnum,
} from "@common/@types/electron-window";

import { GlobalCSS } from "@styles/global";
import { Content } from "@styles/appStyles";
import "react-toastify/dist/ReactToastify.min.css";

export function App() {
	useEffect(() => {
		(async () => searchLocalComputerForMedias(true))();
	}, []);

	GlobalCSS();

	return (
		<>
			<ToastContainer
				hideProgressBar={false}
				position="top-right"
				pauseOnFocusLoss
				autoClose={5000}
				closeOnClick
				pauseOnHover
				newestOnTop
				draggable
			/>

			<Decorations />

			<ContextMenu>
				<Main />
			</ContextMenu>
		</>
	);
}

const Main = () => (
	<Content>
		<Navbar />

		<PageToShow />

		<MediaPlayer />
	</Content>
);

const PageToShow = () => {
	const { page } = usePage();

	switch (page) {
		case "Convert":
			return <Convert />;
		case "Download":
			return <Download />;
		case "Favorites":
			return <Favorites />;
		case "History":
			return <History />;
		case "Home":
			return <Home />;
		default:
			return assertUnreachable(page);
	}
};

const { transformPathsToMedias } = electron.media;

window.onmessage = async (
	event: MessageEvent<MsgWithSource<MsgObjectElectronToReact>>
) => {
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

			try {
				// In here, there has to be a download to be confirmed:
				if (downloadsToBeConfirmed.has(msg.url)) {
					const downloadingList = getDownloadingList();
					const [download, index] = getItemAndIndex(
						downloadingList,
						download => download.url === msg.url
					);

					if (index === -1)
						throw new Error(
							ERROR_KIND.DOWNLOAD_TO_BE_CONFIRMED_NOT_ON_DOWNLOADING_LIST
						);

					setDownloadingList(
						replace(downloadingList, index, {
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							...download!,
							status: ProgressStatus.ACTIVE,
						})
					);

					// Since downloadToBeConfirmed is now handled,
					// delete it from the map:
					downloadsToBeConfirmed.delete(msg.url);
				} else
					throw new Error(
						ERROR_KIND.DOWNLOAD_TO_BE_CONFIRMED_NOT_ON_DOWNLOADS_TO_BE_CONFIRMED_LIST
					);
			} catch (error) {
				handleErrors(error as ERROR_KIND, msg.url);
			}
			break;
		}

		case ElectronToReactMessageEnum.NEW_COVERSION_CREATED: {
			dbg("New conversion created.");

			try {
				// In here, there has to be a conversion to be confirmed:
				if (convertsToBeConfirmed.has(msg.path)) {
					const convertingList = getConvertingList();
					const [convertingMedia, index] = getItemAndIndex(
						convertingList,
						convertingMedia => convertingMedia.path === msg.path
					);

					if (index === -1)
						throw new Error(
							ERROR_KIND.CONVERTION_TO_BE_CONFIRMED_NOT_ON_CONVERTS_TO_BE_CONFIRMED_LIST
						);

					setConvertingList(
						replace(convertingList, index, {
							// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
							...convertingMedia!,
							status: ProgressStatus.ACTIVE,
						})
					);

					// Since convertsToBeConfirmed is now handled,
					// delete it from the map:
					convertsToBeConfirmed.delete(msg.path);
				} else
					throw new Error(
						ERROR_KIND.CONVERTION_TO_BE_CONFIRMED_NOT_ON_CONVERTING_LIST
					);
			} catch (error) {
				handleErrors(error as ERROR_KIND, msg.path);
			}
			break;
		}

		case ElectronToReactMessageEnum.CREATE_CONVERSION_FAILED: {
			try {
				console.error("Create conversion failed!");

				// In here, there has to be a conversion to be confirmed:
				if (convertsToBeConfirmed.has(msg.path)) {
					const convertingList = getConvertingList();
					const index = convertingList.findIndex(
						convertingMedia => convertingMedia.path === msg.path
					);

					if (index === -1)
						throw new Error(
							ERROR_KIND.CONVERTION_TO_BE_CONFIRMED_NOT_ON_CONVERTS_TO_BE_CONFIRMED_LIST
						);

					setConvertingList(remove(convertingList, index));

					// Since convertsToBeConfirmed is now handled,
					// delete it from the map:
					convertsToBeConfirmed.delete(msg.path);
				} else
					throw new Error(
						ERROR_KIND.CONVERTION_TO_BE_CONFIRMED_NOT_ON_CONVERTS_TO_BE_CONFIRMED_LIST
					);
			} catch (error) {
				handleErrors(error as ERROR_KIND, msg.path);
			}
			break;
		}

		case ElectronToReactMessageEnum.CREATE_DOWNLOAD_FAILED: {
			try {
				console.error("Download failed!");

				// In here, there has to be a download to be confirmed:
				if (downloadsToBeConfirmed.has(msg.url)) {
					const downloadingList = getDownloadingList();
					const index = downloadingList.findIndex(
						download => download.url === msg.url
					);

					if (index === -1)
						throw new Error(
							ERROR_KIND.DOWNLOAD_TO_BE_CONFIRMED_NOT_ON_DOWNLOADING_LIST
						);

					setDownloadingList(remove(downloadingList, index));

					// Since downloadToBeConfirmed is now handled,
					// delete it from the map:
					downloadsToBeConfirmed.delete(msg.url);
				} else
					throw new Error(
						ERROR_KIND.DOWNLOAD_TO_BE_CONFIRMED_NOT_ON_DOWNLOADS_TO_BE_CONFIRMED_LIST
					);
			} catch (error) {
				handleErrors(error as ERROR_KIND, msg.url);
			}
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
				whatToDo: PlaylistActions.ADD_ONE_MEDIA_BY_ID,
				type: PlaylistEnum.UPDATE_MAIN_LIST,
				media,
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
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_ID,
				type: PlaylistEnum.UPDATE_MAIN_LIST,
				media: refreshedMedia,
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
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_ID,
				type: PlaylistEnum.UPDATE_MAIN_LIST,
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
};

function handleErrors(error: ERROR_KIND, str: MediaUrl | Path) {
	dbg("At handleErrors.");

	switch (error) {
		case ERROR_KIND.DOWNLOAD_TO_BE_CONFIRMED_NOT_ON_DOWNLOADS_TO_BE_CONFIRMED_LIST: {
			const downloadingList = getDownloadingList();

			// If the download is not in the `downloadsToBeConfirmed` list, handle error:
			console.error(
				"There should be a download to be confirmed on `downloadsToBeConfirmed`, but there is none!"
			);

			// On the possibility that the download is on the `downloadingList`, let's remove it:
			const index = downloadingList.findIndex(download => download.url === str);

			if (index === -1) return;
			else setDownloadingList(remove(downloadingList, index));
			break;
		}

		case ERROR_KIND.DOWNLOAD_TO_BE_CONFIRMED_NOT_ON_DOWNLOADING_LIST: {
			const downloadingList = getDownloadingList();

			// If the download is not in the list, handle error:
			console.error(
				"There should be a download to be confirmed on `downloadingList`, but there is none!"
			);

			// On the possibility that the download is on the `downloadingList`, let's remove it:
			const index = downloadingList.findIndex(download => download.url === str);

			if (index === -1) return;
			else setDownloadingList(remove(downloadingList, index));
			break;
		}

		case ERROR_KIND.CONVERTION_TO_BE_CONFIRMED_NOT_ON_CONVERTING_LIST: {
			const convertingList = getConvertingList();

			// If the conversion is not in the list, handle error:
			console.error(
				"There should be a convertion to be confirmed on `convertingList`, but there is none!"
			);

			// On the possibility that the conversion is on the `convertingList`, let's remove it:
			const index = convertingList.findIndex(
				convertingMedia => convertingMedia.path === str
			);

			if (index === -1) return;
			else setConvertingList(remove(convertingList, index));
			break;
		}

		case ERROR_KIND.CONVERTION_TO_BE_CONFIRMED_NOT_ON_CONVERTS_TO_BE_CONFIRMED_LIST: {
			const convertingList = getConvertingList();

			// If the download is not in the `downloadsToBeConfirmed` list, handle error:
			console.error(
				"There should be a conversion to be confirmed on `convertsToBeConfirmed`, but there is none!"
			);

			// On the possibility that the download is on the `downloadingList`, let's remove it:
			const index = convertingList.findIndex(
				convertingMedia => convertingMedia.path === str
			);

			if (index === -1) return;
			else setConvertingList(remove(convertingList, index));
			break;
		}

		case ERROR_KIND.CREATE_DOWNLOAD_FAILED: {
			console.error("I wasn't able to create a download for this media: ", str);

			break;
		}

		case ERROR_KIND.CREATE_CONVERSION_FAILED: {
			console.error(
				"I wasn't able to create a conversion for this media: ",
				str
			);

			break;
		}

		default:
			assertUnreachable(error);
			break;
	}
}

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
	console.info("@TODO: handle these files droped!", files);
}

window.addEventListener("dragover", listenToDragoverEvent);
window.addEventListener("drop", listenToDropEvent);
