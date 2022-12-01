import { Component, createSignal } from "solid-js";

import { Routes, Route } from "@solidjs/router";
import { Toaster } from "solid-toast";
import { lazy } from "solid-js";

import { searchLocalComputerForMedias } from "@contexts/usePlaylists";
import { handleWindowMsgs } from "@utils/handleWindowMsgs";
import { Dialog } from "@components/Dialog";

const Home = lazy(() => import("./pages/Home"));

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

			<Dialog isOpen={isOpen()} onOpenChange={setIsOpen}>
				Oi
			</Dialog>

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

window.addEventListener("message", handleWindowMsgs);

//////////////////////////////////////////

await searchLocalComputerForMedias();
