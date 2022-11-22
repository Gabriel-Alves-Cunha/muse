import { observer, useSelector } from "@legendapp/state/react";
import { ToastContainer } from "react-toastify";

import { DecorationsDown, DecorationsTop } from "@components/Decorations";
import { searchLocalComputerForMedias } from "@contexts/usePlaylists";
import { MainGridContainer } from "@components/MainGridContainer";
import { handleWindowMsgs } from "@utils/handleWindowMsgs";
import { ContextMenu } from "@components/ContextMenu";
import { MediaPlayer } from "@components/MediaPlayer";
import { ShareDialog } from "@components/ShareDialog";
import { Favorites } from "@routes/Favorites";
import { Download } from "@routes/Download";
import { useTrace } from "@hooks/useTrace";
import { History } from "@routes/History";
import { Convert } from "@routes/Convert";
import { Navbar } from "@components/Navbar";
import { Home } from "@routes/Home";
import { page } from "@contexts/page";

import "react-toastify/dist/ReactToastify.min.css";

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Main function:

export const App = observer(function App() {
	useTrace("App");

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
				<MainGridContainer>
					<Navbar />

					<PageToRender />

					<MediaPlayer />
				</MainGridContainer>
			</ContextMenu>

			<DecorationsDown />
		</>
	);
});

//////////////////////////////////////////

const pages = {
	Favorites: <Favorites />,
	Download: <Download />,
	Convert: <Convert />,
	History: <History />,
	Home: <Home />,
} as const;

//////////////////////////////////////////

function PageToRender() {
	const currPage = useSelector(() => page.get());

	return pages[currPage];
}

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Do once on app start:

window.addEventListener("message", handleWindowMsgs);

//////////////////////////////////////////

await searchLocalComputerForMedias();
