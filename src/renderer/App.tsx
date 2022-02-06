import { ToastContainer } from "react-toastify";
import { Global } from "@emotion/react";

import { Convert, Download, Favorites, History, Home, Settings } from "@pages";
import { assertUnreachable } from "@utils/utils";
import { Contexts } from "@contexts";
import { usePage } from "@contexts/page";
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

export const App = () => {
	return (
		<Contexts>
			<Global styles={GlobalCSS} />

			<Decorations />

			<Main />
		</Contexts>
	);
};

const Main = () => (
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
