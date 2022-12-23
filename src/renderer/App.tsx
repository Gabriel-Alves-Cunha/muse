import { ToastContainer } from "react-toastify";
import { lazy, Suspense } from "react";

import { DecorationsDown, DecorationsTop } from "@components/Decorations";
import { searchLocalComputerForMedias } from "@contexts/usePlaylists";
import { MainGridContainer } from "@components/MainGridContainer";
import { handleWindowMsgs } from "@utils/handleWindowMsgs";
import { ContextMenu } from "@components/ContextMenu";
import { MediaPlayer } from "@components/MediaPlayer";
import { usePage } from "@contexts/page";
import { Navbar } from "@components/Navbar";

import "react-toastify/dist/ReactToastify.min.css";

const ShareDialog = lazy(() => import("./components/ShareDialog"));

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
				<MainGridContainer>
					<Navbar />

					<Suspense>
						<PageToShow />
					</Suspense>

					<MediaPlayer />
				</MainGridContainer>
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

window.addEventListener("message", handleWindowMsgs);

//////////////////////////////////////////

await searchLocalComputerForMedias();
