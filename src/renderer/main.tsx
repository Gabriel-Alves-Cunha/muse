// import "./wdyr"; // <-- Has to be the first import.

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StrictMode } from "react";
import { render } from "react-dom";

import { Favorites, Settings, Download, Convert, History, Home } from "@pages";
import { App } from "./App";

render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />}>
					{/* <Route index element={<MediaPlayer />} > */}
					<Route path="favorites" element={<Favorites />} />
					<Route path="download" element={<Download />} />
					<Route path="settings" element={<Settings />} />
					<Route path="convert" element={<Convert />} />
					<Route path="history" element={<History />} />
					<Route path="home" element={<Home />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>,
	document.getElementById("root")
);
