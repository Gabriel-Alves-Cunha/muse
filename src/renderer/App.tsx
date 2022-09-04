import type { Page } from "@common/@types/generalTypes.js";

import { ToastContainer } from "react-toastify";

import { DecorationsDown, DecorationsTop } from "@components/Decorations";
import { searchLocalComputerForMedias } from "@contexts/usePlaylists";
import { handleWindowMsgs } from "@utils/handleWindowMsgs";
import { ContextMenu } from "@components/ContextMenu";
import { MediaPlayer } from "@components/MediaPlayer";
import { ShareDialog } from "@components/ShareDialog";
import { Favorites } from "@routes/Favorites";
import { GlobalCSS } from "@styles/global";
import { Download } from "@routes/Download";
import { Content } from "@styles/appStyles";
import { History } from "@routes/History";
import { usePage } from "@contexts/page";
import { Convert } from "@routes/Convert";
import { Navbar } from "@components/Navbar";
import { Home } from "@routes/Home";

import "react-toastify/dist/ReactToastify.min.css";

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export function App() {
	GlobalCSS();

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
				<Main />
			</ContextMenu>

			<DecorationsDown />
		</>
	);
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Helper functions:

function Main() {
	return (
		<Content>
			<Navbar />

			<PageToShow />

			<MediaPlayer />
		</Content>
	);
}

//////////////////////////////////////////

const pages: Readonly<Record<Page, JSX.Element>> = Object.freeze({
	Favorites: <Favorites />,
	Download: <Download />,
	Convert: <Convert />,
	History: <History />,
	Home: <Home />,
});

function PageToShow() {
	const { page } = usePage();

	return pages[page];
}

//////////////////////////////////////////
// Do once on app start:

window.addEventListener("message", handleWindowMsgs);

//////////////////////////////////////////

await searchLocalComputerForMedias();
