import type { Page } from "@common/@types/generalTypes";

import { ToastContainer } from "react-toastify";

import { searchLocalComputerForMedias } from "@contexts/mediaHandler/usePlaylists";
import { handleWindowMsgs } from "@utils/handleWindowMsgs";
import { Decorations } from "@components/Decorations";
import { ContextMenu } from "@components/ContextMenu";
import { MediaPlayer } from "@modules/MediaPlayer";
import { Favorites } from "@routes/Favorites";
import { Download } from "@routes/Download";
import { History } from "@routes/History";
import { usePage } from "@contexts/page";
import { Convert } from "@routes/Convert";
import { Navbar } from "@modules/Navbar";
import { Home } from "@routes/Home";

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
				draggable
			/>

			<Decorations />

			<ContextMenu>
				<Main />
			</ContextMenu>
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

	return pages[page];
};

const pages: Readonly<Record<Page, JSX.Element>> = Object.freeze({
	Favorites: <Favorites />,
	Download: <Download />,
	Convert: <Convert />,
	History: <History />,
	Home: <Home />,
});

window.onmessage = handleWindowMsgs;

await searchLocalComputerForMedias();
