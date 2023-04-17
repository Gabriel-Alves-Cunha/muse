import type { Page } from "@common/@types/GeneralTypes";

import { ToastContainer } from "react-toastify";
import { Suspense } from "react";

import { DecorationsDown, DecorationsTop } from "@components/Decorations";
import { searchLocalComputerForMedias } from "@contexts/playlists";
import { handleWindowMsgsFromElectron } from "@utils/handleWindowMsgs";
import { ContextMenu } from "@components/ContextMenu";
import { MediaPlayer } from "@components/MediaPlayer";
import { ShareDialog } from "@components/ShareDialog";
import { Favorites } from "./routes/Favorites";
import { Download } from "./routes/Download";
import { Convert } from "./routes/Convert";
import { History } from "./routes/History";
import { pageRef } from "@contexts/page";
import { Navbar } from "@components/Navbar";
import { Home } from "./routes/Home";

import "react-toastify/dist/ReactToastify.min.css";

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export function App(): JSX.Element {
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

			<ShareDialog />

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

const pages: Readonly<Record<Page, JSX.Element>> = {
	Favorites: <Favorites />,
	Download: <Download />,
	Convert: <Convert />,
	History: <History />,
	Home: <Home />,
} as const;

function PageToShow(): JSX.Element {
	const page = pageRef().current;

	return pages[page];
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Do once on window load:

searchLocalComputerForMedias();

window.addEventListener(
	"load",
	(): void => {
		window.addEventListener("message", handleWindowMsgsFromElectron);

		// Remove splash screen:
		document.getElementById("splashscreen")?.remove();
	},
	{ once: true },
);
