import type { Path, QRCodeURL } from "@common/@types/generalTypes";
import type { ClientServerAPI } from "@main/preload/share/server";

import { type JSX, createEffect, createSignal } from "solid-js";
import { toCanvas } from "qrcode";
import { useI18n } from "@solid-primitives/i18n";

import { getFilesToShare, setFilesToShare } from "@contexts/filesToShare";
import { error, assert } from "@utils/log";
import { getBasename } from "@common/path";
import { CloseIcon } from "@icons/CloseIcon";
import { Loading } from "./Loading";
import { Dialog } from "./Dialog";

const { createServer } = electron.share;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const qrID = "qrcode-canvas";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ShareDialog() {
	const [server, setServer] = createSignal<ClientServerAPI | null>(null);
	const [isOpen, setIsOpen] = createSignal(false);
	const filesToShare = getFilesToShare();
	const [t] = useI18n();

	const plural = () => (filesToShare.size > 1 ? "s" : "");

	/////////////////////////////////////////

	const onCanvasElementGoMakeQRCode = (
		canvas: HTMLCanvasElement | null,
	): void => {
		if (!(canvas && isOpen() && server())) return;

		makeQrcode(server()!.url)
			.then()
			.catch((err) => {
				error("Error making QR Code.", err);
				setIsOpen(false);
			});
	};

	/////////////////////////////////////////

	// Create a new server and open dialog when there is files to share.
	createEffect(() => {
		const shouldDialogOpen = filesToShare.size > 0;

		setIsOpen(shouldDialogOpen);

		if (!shouldDialogOpen) return;

		try {
			const clientServerApi = createServer([...filesToShare]);

			setServer(clientServerApi);
		} catch (err) {
			error(err);
			setIsOpen(false);
		}
	});

	createEffect(() => {
		// If is closing:
		if (!isOpen()) {
			server()?.close();
			// When the server closes, get rid of it's reference:
			server()?.addListener("close", () => setServer(null));

			const filesToShare = getFilesToShare();

			filesToShare.clear();

			setFilesToShare(filesToShare);
		}
	});

	/////////////////////////////////////////

	return (
		<Dialog
			class="absolute flex flex-col justify-between items-center w-80 h-80 text-center m-auto bottom-0 right-0 left-0 top-0 shadow-popover bg-popover z-20 rounded-xl no-transition"
			setIsOpen={setIsOpen}
			isOpen={isOpen()}
			overlay="blur"
			modal
		>
			<button
				class="absolute justify-center items-center w-7 h-7 right-1 top-1 cursor-pointer z-10 bg-none border-none rounded-full font-secondary tracking-wider text-base leading-none hover:opacity-5 focus:opacity-5"
				onPointerUp={() => setIsOpen(false)}
				title={t("tooltips.closeShareScreen")}
				type="button"
				// zIndex: 155,
			>
				<CloseIcon class="fill-accent" />
			</button>

			<div class="relative w-80 p-2">
				<p class="relative mt-6 font-primary tracking-wider text-xl text-normal font-medium overflow-ellipsis whitespace-nowrap overflow-hidden">
					{t("dialogs.sharingMedia")}
					{plural}:
				</p>

				<ol class="list-item relative h-32 mt-4 overflow-x-hidden scroll scroll-1">
					{namesOfFilesToShare(filesToShare)}
				</ol>
			</div>

			<canvas
				class="relative w-80 h-80 rounded-xl"
				ref={onCanvasElementGoMakeQRCode}
				id={qrID}
			>
				<Loading />
			</canvas>
		</Dialog>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

const namesOfFilesToShare = (filesToShare: Set<Path>): JSX.Element[] =>
	Array.from(filesToShare, (path) => (
		<li class="list-item relative mx-3 list-decimal-zero text-start font-primary tracking-wider text-lg text-normal font-medium overflow-ellipsis whitespace-nowrap marker:text-accent marker:font-normal">
			{getBasename(path)}
		</li>
	));

/////////////////////////////////////////

async function makeQrcode(url: QRCodeURL): Promise<void> {
	const canvasElement = document.getElementById(qrID) as HTMLCanvasElement;

	assert(canvasElement, "There is no canvas element!");

	await toCanvas(canvasElement, url, { errorCorrectionLevel: "H", width: 300 });
}
