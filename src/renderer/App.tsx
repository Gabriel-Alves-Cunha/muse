import { ToastContainer } from "react-toastify";
import { useEffect } from "react";

import { Convert, Download, Favorites, History, Home } from "@routes";
import { MsgBetweenChildrenEnum } from "@contexts/communicationBetweenChildren";
import { MediaPlayer, Navbar } from "@modules";
import { assertUnreachable } from "@utils/utils";
import { Decorations } from "@components";
import { dbg } from "@common/utils";
import {
	PlaylistActions,
	PlaylistEnum,
	usePlaylists,
	usePage,
	sendMsg,
} from "@contexts";
import {
	type MsgObjectElectronToReact,
	ElectronToReactMessageEnum,
} from "@common/@types/electron-window";
import {
	getMediaFiles,
	MEDIA_LIST,
} from "@contexts/mediaHandler/usePlaylistsHelper";

import { GlobalCSS } from "@styles/global";
import { Content } from "@styles/appStyles";
import "react-toastify/dist/ReactToastify.min.css";

export function App() {
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

const { getState: getPlaylistsFunctions } = usePlaylists;

function Main() {
	useEffect(() => {
		(async () =>
			await getPlaylistsFunctions().searchLocalComputerForMedias())();
	}, []);

	return (
		<Content>
			<Navbar />

			<PageToShow />

			<MediaPlayer />
		</Content>
	);
}

function PageToShow() {
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
}

const { transformPathsToMedias } = window.electron.media;

window.onmessage = async (event: MessageEvent<MsgObjectElectronToReact>) => {
	// @ts-ignore When the message is from react-devtools, ignore it:
	if (event.data.source?.includes("react-devtools")) return;

	dbg("Received message from MessagePort on React side.\ndata =", event.data);

	switch (event.data.type) {
		case ElectronToReactMessageEnum.DISPLAY_DOWNLOADING_MEDIAS: {
			sendMsg({
				type: MsgBetweenChildrenEnum.START_DOWNLOAD,
				value: event.data.downloadValues,
			});
			break;
		} // 1

		case ElectronToReactMessageEnum.ADD_ONE_MEDIA: {
			const { mediaPath } = event.data;

			dbg("At ListenToNotification.ADD_MEDIA:", { mediaPath });

			const media = (await transformPathsToMedias([mediaPath]))[0];

			if (!media) {
				console.error(`Could not transform "${mediaPath}" to media.`);
				break;
			}

			getPlaylistsFunctions().setPlaylists({
				whatToDo: PlaylistActions.ADD_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_MEDIA_LIST,
				media,
			});
			break;
		} // 2

		case ElectronToReactMessageEnum.DELETE_ONE_MEDIA_FROM_COMPUTER: {
			const { mediaPath } = event.data;

			dbg("At ListenToNotification.DELETE_ONE_MEDIA_FROM_COMPUTER:", {
				mediaPath,
			});

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const media = getPlaylistsFunctions()
				.playlists.find(p => p.name === MEDIA_LIST)!
				.list.find(m => m.path === mediaPath);

			if (media) {
				try {
					await getPlaylistsFunctions().deleteMedia(media);
					console.log(`Media "${{ media }}" deleted.`);
				} catch (error) {
					console.error(error);
				}
			}
			break;
		} // 3

		case ElectronToReactMessageEnum.REFRESH_ALL_MEDIA: {
			dbg("At ListenToNotification.REFRESH_ALL_MEDIA:");
			await getPlaylistsFunctions().searchLocalComputerForMedias(true);
			break;
		} // 4

		case ElectronToReactMessageEnum.REFRESH_ONE_MEDIA: {
			const { mediaPath } = event.data;

			dbg("At ListenToNotification.REFRESH_MEDIA:", { mediaPath });

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const mediaIndex = getPlaylistsFunctions()
				.playlists.find(p => p.name === MEDIA_LIST)!
				.list.findIndex(m => m.path === mediaPath);

			if (mediaIndex === -1) {
				console.warn(
					`There should be a media with path = "${mediaPath}" to be refreshed, but there isn't!\nRefreshing all media.`,
				);

				await getPlaylistsFunctions().searchLocalComputerForMedias(true);
				break;
			}

			const refreshedMedia = (await transformPathsToMedias([mediaPath]))[0];

			if (!refreshedMedia) {
				console.error(
					`I wasn't able to transform this path (${mediaPath}) to a media to be refreshed!`,
				);
				break;
			}

			getPlaylistsFunctions().setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_ID,
				type: PlaylistEnum.UPDATE_MEDIA_LIST,
				media: refreshedMedia,
			});
			break;
		} // 5

		case ElectronToReactMessageEnum.REMOVE_ONE_MEDIA: {
			const { mediaPath } = event.data;

			dbg("At ListenToNotification.REMOVE_MEDIA:", { mediaPath });

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const media = getPlaylistsFunctions()
				.playlists.find(p => p.name === MEDIA_LIST)!
				.list.find(m => m.path === mediaPath);

			if (!media) {
				console.error(
					`I wasn't able to find this path "${mediaPath}" to a media to be removed!`,
				);
				break;
			}

			getPlaylistsFunctions().setPlaylists({
				whatToDo: PlaylistActions.REMOVE_ONE_MEDIA,
				type: PlaylistEnum.UPDATE_MEDIA_LIST,
				mediaIndex: media.index,
			});
			break;
		} // 6

		case ElectronToReactMessageEnum.ERROR: {
			console.error("@TODO: ERROR");

			break;
		} // 7

		default: {
			assertUnreachable(event.data);

			console.error(
				`There is no method to handle this event.data: (${typeof event.data}) '`,
				event.data,
				"'\nEvent =",
				event,
			);
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
