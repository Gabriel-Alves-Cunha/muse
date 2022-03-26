import { ToastContainer } from "react-toastify";
import { useEffect } from "react";

import { Convert, Download, Favorites, History, Home, Settings } from "@routes";
import { MediaPlayer, Downloading, Converting, Navbar } from "@modules";
import { usePlaylists, usePage } from "@contexts";
import { assertUnreachable } from "@utils/utils";
import { getMediaFiles } from "@contexts/mediaHandler/usePlaylistsHelper";
import { Decorations } from "@components";
import { dbg } from "@common/utils";

import { GlobalCSS } from "@styles/global";
import { Content } from "@styles/appStyles";
import "react-toastify/dist/ReactToastify.min.css";

export function App() {
	GlobalCSS();

	return (
		<>
			<Decorations />

			<Main />
		</>
	);
}

function Main() {
	const { addListeners, searchLocalComputerForMedias } = usePlaylists();

	useEffect(() => {
		(async () => await searchLocalComputerForMedias())();

		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////

		const { port1: reactPort, port2: electronPort } = new MessageChannel();

		window.twoWayComm_React_Electron = addListeners(reactPort);

		dbg("Sending 'async two way comm' to Electron side.");
		window.postMessage("async two way comm", "*", [electronPort]);

		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////

		// listen for files drop
		function listenToDragoverEvent(event: DragEvent) {
			event.stopPropagation();
			event.preventDefault();

			if (!event.dataTransfer) return;

			event.dataTransfer.dropEffect = "copy";
			// ^ Style the drag-and-drop as a "copy file" operation.
		}
		window.addEventListener("dragover", listenToDragoverEvent);

		function listenToDropEvent(event: DragEvent) {
			event.stopPropagation();
			event.preventDefault();

			if (!event.dataTransfer) return;

			const fileList = event.dataTransfer.files;
			console.log("fileList =", fileList);

			const files = getMediaFiles(fileList);

			console.error("@TODO: handle these files droped!", files);
		}
		window.addEventListener("drop", listenToDropEvent);

		return () => {
			window.removeEventListener("dragover", listenToDragoverEvent);
			window.removeEventListener("drop", listenToDropEvent);
		};
	}, [addListeners, searchLocalComputerForMedias]);

	return (
		<Content>
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

			<Navbar />

			<>
				<Downloading />
				<Converting />
			</>

			<>
				<PageToShow />
			</>

			<MediaPlayer />
		</Content>
	);
}

function PageToShow() {
	const page = usePage().page;

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
		case "Settings":
			return <Settings />;
		default:
			return assertUnreachable(page);
	}
}
