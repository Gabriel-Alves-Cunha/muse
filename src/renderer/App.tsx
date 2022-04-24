import { ToastContainer } from "react-toastify";
import { useEffect } from "react";

import { Favorites, Download, Convert, History, Home } from "@routes";
import { electronSource, type MsgWithSource } from "@common/crossCommunication";
import { MediaPlayer, Navbar } from "@modules";
import { assertUnreachable } from "@utils/utils";
import { setDownloadValues } from "@modules/Downloading";
import { Decorations } from "@components";
import { dbg } from "@common/utils";
import {
	searchLocalComputerForMedias,
	PlaylistActions,
	getMediaFiles,
	PlaylistEnum,
	setPlaylists,
	getPlaylists,
	deleteMedia,
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
				rtl={false}
				draggable
			/>

			<Decorations />

			<Main />
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
	event: MessageEvent<MsgWithSource<MsgObjectElectronToReact>>,
) => {
	if (event.data.source !== electronSource) return;

	dbg("Received message from Electron.\ndata =", event.data);
	const msg = event.data.msg;

	switch (msg.type) {
		case ElectronToReactMessageEnum.DISPLAY_DOWNLOADING_MEDIAS: {
			setDownloadValues({
				downloadValues: msg.downloadValues,
			});
			break;
		} // 1

		case ElectronToReactMessageEnum.ADD_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("At ListenToNotification.ADD_MEDIA:", { mediaPath });

			const [media] = await transformPathsToMedias([mediaPath]);

			if (!media) {
				console.error(`Could not transform "${mediaPath}" to media.`);
				break;
			}

			setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_MAIN_LIST,
				media,
			});
			break;
		} // 2

		case ElectronToReactMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER: {
			const { mediaPath } = msg;

			dbg("At ListenToNotification.DELETE_ONE_MEDIA_FROM_COMPUTER:", {
				mediaPath,
			});

			const media = getPlaylists().mainList.find(p => p.path === mediaPath);

			if (!media) {
				console.error("Could not find media to delete.");
				break;
			}

			try {
				await deleteMedia(media);
				console.log(`Media "${{ media }}" deleted.`);
			} catch (error) {
				console.error(error);
			}
			break;
		} // 3

		case ElectronToReactMessageEnum.REFRESH_ALL_MEDIA: {
			dbg("At ListenToNotification.REFRESH_ALL_MEDIA:");
			await searchLocalComputerForMedias(true);
			break;
		} // 4

		case ElectronToReactMessageEnum.REFRESH_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("At ListenToNotification.REFRESH_MEDIA:", { data: msg });

			const mediaIndex = getPlaylists().mainList.findIndex(
				m => m.path === mediaPath,
			);

			if (mediaIndex === -1) {
				console.warn(
					`There should be a media with path = "${mediaPath}" to be refreshed, but there isn't!\nRefreshing all media.`,
				);

				await searchLocalComputerForMedias(true);
				break;
			}

			const [refreshedMedia] = await transformPathsToMedias([mediaPath]);

			if (!refreshedMedia) {
				console.error(
					`I wasn't able to transform this path (${mediaPath}) to a media to be refreshed!\nRefreshing all media.`,
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
		} // 5

		case ElectronToReactMessageEnum.REMOVE_ONE_MEDIA: {
			const { mediaPath } = msg;

			dbg("At ListenToNotification.REMOVE_MEDIA:", { mediaPath });

			const media = getPlaylists().mainList.find(m => m.path === mediaPath);

			if (!media) {
				console.error(
					`I wasn't able to find this path "${mediaPath}" to a media to be removed!`,
				);
				break;
			}

			setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA_BY_ID,
				type: PlaylistEnum.UPDATE_MAIN_LIST,
				mediaID: media.id,
			});
			break;
		} // 6

		case ElectronToReactMessageEnum.ERROR: {
			console.error("@TODO: ERROR", msg.error);

			break;
		} // 7

		default: {
			console.error(
				`There is no method to handle this event.data: (${typeof msg}) '`,
				msg,
				"'\nEvent =",
				event,
			);

			assertUnreachable(msg);
			break;
		}
	}
};

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
	console.log({ fileList });

	const files = getMediaFiles(fileList);

	console.error("@TODO: handle these files droped!", files);
}

window.addEventListener("dragover", listenToDragoverEvent);
window.addEventListener("drop", listenToDropEvent);
