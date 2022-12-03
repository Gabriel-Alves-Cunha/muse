import { Component, createSignal } from "solid-js";

import { Routes, Route } from "@solidjs/router";
import { Toaster } from "solid-toast";
import { lazy } from "solid-js";

import { searchLocalComputerForMedias } from "@contexts/usePlaylists";
// import { handleWindowMsgs } from "@utils/handleWindowMsgs";
import { BlurOverlay } from "@components/BlurOverlay";
import { Dialog } from "@components/Dialog";
import { Navbar } from "@components/Navbar";

const Favorites = lazy(() => import("./routes/Favorites"));
const Download = lazy(() => import("./routes/Download"));
const Convert = lazy(() => import("./routes/Convert"));
const History = lazy(() => import("./routes/History"));
const Home = lazy(() => import("./routes/Home"));

export const App: Component = () => {
	const [isOpen, setIsOpen] = createSignal(true);

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

			<button type="button" class="w-5 h-3" onPointerUp={() => setIsOpen(true)}>
				abrir
			</button>

			<Dialog.Content isOpen={isOpen()} onOpenChange={setIsOpen}>
				<BlurOverlay />
				Oi
			</Dialog.Content>

			<Navbar />

			{/* <ShareDialog />

			<DecorationsTop />

			<ContextMenu>
			<MainGridContainer>
				<Navbar />

				<Routes>
					<Route path="/" component={Home} />
				</Routes>

				<MediaPlayer />
			</MainGridContainer>
			</ContextMenu>

			<DecorationsDown /> */}
		</>
	);
};

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
// Do once on app start:

// window.addEventListener("message", handleWindowMsgs);
//
// //////////////////////////////////////////
//
// await searchLocalComputerForMedias();
