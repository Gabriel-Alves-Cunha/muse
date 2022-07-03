import type { Page } from "@common/@types/generalTypes";

import { ToastContainer } from "react-toastify";
import ReactTooltip from "react-tooltip";

import { searchLocalComputerForMedias } from "@contexts/mediaHandler/usePlaylists";
import { handleWindowMsgs } from "@utils/handleWindowMsgs";
import { Decorations } from "@components/Decorations";
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

			<ReactTooltip
				backgroundColor="#181818"
				globalEventOff="click"
				className="tooltip"
				delayShow={1_000}
				textColor="white"
				delayHide={20}
				effect="solid"
				multiline
				border
			/>

			<ShareDialog />

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

function PageToShow() {
	const { page } = usePage();

	return pages[page];
}

const pages: Readonly<Record<Page, JSX.Element>> = Object.freeze({
	Favorites: <Favorites />,
	Download: <Download />,
	Convert: <Convert />,
	History: <History />,
	Home: <Home />,
});

window.addEventListener("message", handleWindowMsgs);

await searchLocalComputerForMedias();
