import { ToastContainer } from "react-toastify";
import { Global } from "@emotion/react";
import { Outlet } from "react-router-dom";

import { Contexts } from "@contexts";
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
			<Outlet />
		</>

		<MediaPlayer />
	</MainView>
);

App.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "App",
};

Main.whyDidYouRender = {
	customName: "Main",
};
