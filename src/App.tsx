import { ToastContainer } from "react-toastify";
import { lazy, Suspense } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { DecorationsDown, DecorationsTop } from "@components/Decorations";
import { searchLocalComputerForMedias } from "@contexts/usePlaylists";
import { listenToAllBackendMessages } from "@utils/handleMsgsToFrontend";
import { watchClipboard } from "@modules/watchClipboard";
import { ContextMenu } from "@components/ContextMenu";
import { MediaPlayer } from "@components/MediaPlayer";
import { usePage } from "@contexts/page";
import { Navbar } from "@components/Navbar";
import { log } from "@utils/log";

import "react-toastify/dist/ReactToastify.min.css";
import { checkForUpdate } from "./utils/checkForUpdate";

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export function App() {
	return (
		<>
			<ToastContainer
				hideProgressBar={false}
				position="top-right"
				autoClose={5_000}
				pauseOnFocusLoss
				closeOnClick
				pauseOnHover
				newestOnTop
				draggable
			/>

			<DecorationsTop />

			<ContextMenu>
				<div data-main-grid-container>
					<Navbar />

					<Suspense>
						<PageToShow />
					</Suspense>

					<MediaPlayer />
				</div>
			</ContextMenu>

			<DecorationsDown />
		</>
	);
}

//////////////////////////////////////////

const pages = {
	Favorites: lazy(() => import("./routes/Favorites")),
	Download: lazy(() => import("./routes/Download")),
	Convert: lazy(() => import("./routes/Convert")),
	History: lazy(() => import("./routes/History")),
	Home: lazy(() => import("./routes/Home")),
} as const;

function PageToShow() {
	const { page } = usePage();

	const Page = pages[page];

	return <Page />;
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Do once on app start:

await listenToAllBackendMessages();

//////////////////////////////////////////

await searchLocalComputerForMedias();

//////////////////////////////////////////

// This will wait for the window to load:
window.addEventListener("load", async () => {
	log("Page is fully loaded.");

	await invoke("close_splashscreen");

	await watchClipboard();

	await checkForUpdate();
});
