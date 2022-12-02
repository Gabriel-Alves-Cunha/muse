import type { Path, QRCodeURL } from "@common/@types/generalTypes";
import type { ClientServerAPI } from "@main/preload/share/server";

import { type JSX, createEffect, createSignal } from "solid-js";
import { toCanvas } from "qrcode";
import { useI18n } from "@solid-primitives/i18n";

import { setSettings, useSettings } from "@contexts/settings";
import { error, assert } from "@utils/log";
import { BlurOverlay } from "./BlurOverlay";
import { getBasename } from "@common/path";
import { CloseIcon } from "@icons/CloseIcon";
import { emptySet } from "@common/empty";
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
	const filesToShare = useSettings((state) => state.filesToShare);
	const [isDialogOpen, setIsDialogOpen] = createSignal(false);
	const [t] = useI18n();

	const plural = () => (filesToShare.size > 1 ? "s" : "");

	/////////////////////////////////////////

	async function onCanvasElementMakeQRCode(canvas: HTMLCanvasElement | null) {
		if (!(canvas && isDialogOpen() && server())) return;

		await makeQrcode(server()!.url).catch((err) => {
			error("Error making QR Code.", err);
			closePopover(server()!.close);
		});
	}

	/////////////////////////////////////////

	function handleDialogOpenStates(newValue: boolean): void {
		if (!newValue) server()?.close();

		setIsDialogOpen(newValue);
	}

	/////////////////////////////////////////

	// When the server closes, get rid of it's reference:
	createEffect(() => {
		server()?.addListener("close", () => {
			setTimeout(() => setServer(null), 1_000);
			closePopover();
		});
	});

	/////////////////////////////////////////

	createEffect(function createNewServer() {
		const shouldDialogOpen = filesToShare.size > 0;

		setIsDialogOpen(shouldDialogOpen);

		if (!shouldDialogOpen) return;

		try {
			const clientServerApi = createServer([...filesToShare]);

			setServer(clientServerApi);
		} catch (err) {
			error(err);
			closePopover();
		}
	});

	/////////////////////////////////////////

	return (
		<Dialog.Content
			class="absolute flex flex-col justify-between items-center w-80 h-80 text-center m-auto bottom-0 right-0 left-0 top-0 shadow-popover bg-popover z-20 rounded-xl no-transition"
			onOpenChange={handleDialogOpenStates}
			isOpen={isDialogOpen()}
			modal
		>
			<BlurOverlay />

			<Dialog.Close
				class="absolute justify-center items-center w-7 h-7 right-1 top-1 cursor-pointer z-10 bg-none border-none rounded-full font-secondary tracking-wider text-base leading-none hover:opacity-5 focus:opacity-5"
				title={t("tooltips.closeShareScreen")}
				onPointerUp={() =>
					closePopover(server()?.close)
				}
				// zIndex: 155,
			>
				<CloseIcon class="fill-accent" />
			</Dialog.Close>

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
				ref={onCanvasElementMakeQRCode}
				id={qrID}
			>
				<Loading />
			</canvas>
		</Dialog.Content>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

function closePopover(closeServerFunction?: () => void): void {
	closeServerFunction?.();

	setSettings({ filesToShare: emptySet });
}

/////////////////////////////////////////

const namesOfFilesToShare = (filesToShare: ReadonlySet<Path>): JSX.Element[] =>
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
