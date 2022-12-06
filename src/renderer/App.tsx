import { Component, createSignal } from "solid-js";

import { Routes, Route } from "@solidjs/router";
import { Toaster } from "solid-toast";
import { lazy } from "solid-js";

import { DecorationsDown, DecorationsTop } from "@components/Decorations";
import { searchLocalComputerForMedias } from "@contexts/playlists";
import { MainGridContainer } from "@components/MainGridContainer";
import { handleWindowMsgs } from "@utils/handleWindowMsgs";
import { ShareDialog } from "@components/ShareDialog";
import { ContextMenu } from "@components/ContextMenu";
import { MediaPlayer } from "@components/MediaPlayer";
import { Navbar } from "@components/Navbar";

const Favorites = lazy(() => import("./routes/Favorites"));
const Download = lazy(() => import("./routes/Download"));
const Convert = lazy(() => import("./routes/Convert"));
const History = lazy(() => import("./routes/History"));
const Home = lazy(() => import("./routes/Home"));

export const App: Component = () => {
	const [isCtxMenuOpen, setIsCtxMenuOpen] = createSignal(true);

	return (
		<>
			<Toaster
				position="top-right"
				gutter={8}
				toastOptions={{
					// Add a delay before the toast is removed
					// This can be used to time the toast exit animation
					unmountDelay: 200,
					duration: 5_000,
				}}
			/>

			<ShareDialog />

			<DecorationsTop />

			<ContextMenu isOpen={isCtxMenuOpen()} setIsOpen={setIsCtxMenuOpen}>
				<MainGridContainer>
					<Navbar />

					<Routes>
						<Route path="/favorites" component={Favorites} />
						<Route path="/download" component={Download} />
						<Route path="/history" component={History} />
						<Route path="/convert" component={Convert} />
						<Route path="/home" component={Home} />
					</Routes>

					<MediaPlayer />
				</MainGridContainer>
			</ContextMenu>

			<DecorationsDown />
		</>
	);
};

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Do once on app start:

window.addEventListener("message", handleWindowMsgs);

//////////////////////////////////////////

await searchLocalComputerForMedias();
