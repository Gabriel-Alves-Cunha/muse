import { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";

import { DecorationsDown, DecorationsTop } from "@components/Decorations";
import { searchLocalComputerForMedias } from "@contexts/usePlaylists";
import { listenToAllBackendMessages } from "@utils/handleMsgsToFrontend";
import { ContextMenu } from "@components/ContextMenu";
import { MediaPlayer } from "@components/MediaPlayer";
import { usePage } from "@contexts/page";
import { Navbar } from "@components/Navbar";

import "react-toastify/dist/ReactToastify.min.css";

const ShareDialog = lazy(() => import("./components/ShareDialog/ShareDialog"));

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

			<Suspense>
				<ShareDialog />
			</Suspense>

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

setTimeout(
	() =>
		import("@modules/watchClipboard").then((m) => m.watchClipboard().then()),
	2_000,
);
