import { ToastContainer } from "react-toastify";
import { Global } from "@emotion/react";

import { Convert, Download, Favorites, History, Home, Settings } from "@pages";
import { assertUnreachable } from "@utils/utils";
import { getMediaFiles } from "./contexts/mediaHandler/usePlaylistsHelper";
import { usePlaylists } from "./contexts/mediaHandler/usePlaylists";
import { useEffect } from "react";
import { Contexts } from "@contexts";
import { usePage } from "@contexts/page";
import { dbg } from "@common/utils";
import {
	Decorations,
	MediaPlayer,
	Downloading,
	Converting,
	Navbar,
} from "@components";

import { GlobalCSS } from "@styles/global";
import { MainView } from "@styles/appStyles";
import "react-toastify/dist/ReactToastify.min.css";

export const App = () => (
	<Contexts>
		<Global styles={GlobalCSS} />

		<Decorations />

		<Main />
	</Contexts>
);

let renders = 0;
function Main() {
	++renders;
	console.assert(renders === 1);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<MainView>
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
		</MainView>
	);
}

const PageToShow = () => {
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
};

App.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "App",
};

Main.whyDidYouRender = {
	customName: "Main",
};
