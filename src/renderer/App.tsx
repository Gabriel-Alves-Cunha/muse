import { ToastContainer } from "react-toastify";
import { useEffect } from "react";
import { Global } from "@emotion/react";

import { Convert, Download, Favorites, History, Home, Settings } from "@pages";
import { MediaPlayer, Downloading, Converting } from "@modules";
import { usePlaylists, usePage } from "@contexts";
import { Decorations, Navbar } from "@components";
import { assertUnreachable } from "@utils/utils";
import { getMediaFiles } from "@contexts/mediaHandler/usePlaylistsHelper";
import { dbg } from "@common/utils";

import { GlobalCSS } from "@styles/global";
import { MainView } from "@styles/appStyles";
import "react-toastify/dist/ReactToastify.min.css";
import { Page } from "@common/@types/typesAndEnums";

export function App() {
	return (
		<>
			<Global styles={GlobalCSS} />

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

const selector = ({ page }: { page: Page }) => page;
function PageToShow() {
	const page = usePage(selector);

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

PageToShow.whyDidYouRender = {
	logOnDifferentValues: true,
	customName: "PageToShow",
};

App.whyDidYouRender = {
	logOnDifferentValues: true,
	customName: "App",
};

Main.whyDidYouRender = {
	logOnDifferentValues: true,
	customName: "Main",
};
