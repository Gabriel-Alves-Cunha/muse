import type { Path, QRCodeURL } from "@common/@types/generalTypes";
import type { ClientServerAPI } from "@main/preload/share/server";

import { MdClose as CloseIcon } from "react-icons/md";
import { useEffect, useState } from "react";
import { toCanvas } from "qrcode";

import { setFilesToShare, useFilesToShare } from "@contexts/filesToShare";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { useTranslation } from "@i18n";
import { error, assert } from "@common/log";
import { getMainList } from "@contexts/usePlaylists";
import { emptySet } from "@common/empty";
import { Loading } from "./Loading";
import { dbg } from "@common/debug";
import {
	CloseOpenedCenteredModal,
	OpenedCenteredModal,
} from "./OpenedCenteredModal";

const { createServer } = electron.share;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const shareModalId = "share-modal";
const qrID = "qrcode-canvas";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export default function ShareDialog() {
	const [server, setServer] = useState<ClientServerAPI | null>(null);
	const { filesToShare } = useFilesToShare();
	const { t } = useTranslation();

	const plural = filesToShare.size > 1 ? "s" : "";
	const shouldModalOpen = filesToShare.size;

	/////////////////////////////////////////

	function onCanvasElementMakeQRCode(canvas: HTMLCanvasElement | null) {
		if (canvas && shouldModalOpen && server)
			makeQrcode(server.url)
				.then()
				.catch((err) => {
					error("Error making QR Code.", err);
					closePopover(server.close);
				});
	}

	/////////////////////////////////////////

	// When the server closes, get rid of it's reference:
	useEffect(() => {
		server?.addListener("close", () => {
			setServer(null);
			closePopover();
		});
	}, [server]);

	/////////////////////////////////////////

	// Create new server:
	useEffect(() => {
		if (!shouldModalOpen) return;

		try {
			const clientServerApi = createServer([...filesToShare]);

			setServer(clientServerApi);
		} catch (err) {
			error(err);
			closePopover();
		}
	}, [filesToShare]);

	/////////////////////////////////////////

	return shouldModalOpen ? (
		<OpenedCenteredModal
			className="absolute flex flex-col justify-between items-center w-80 h-80 text-center m-auto bottom-0 right-0 left-0 top-0 shadow-popover bg-popover z-20 rounded-xl no-transition"
			htmlTargetName={shareModalId}
			onKeyUp={(e) => {
				if (e.key === "Escape" && !isAModifierKeyPressed(e))
					closePopover(server?.close);
			}}
		>
			<CloseOpenedCenteredModal
				className="absolute justify-center items-center w-7 h-7 right-1 top-1 cursor-pointer z-10 bg-none border-none rounded-full font-secondary tracking-wider text-base leading-none hover:opacity-5 focus:opacity-5"
				onPointerUp={() => closePopover(server?.close)}
				title={t("tooltips.closeShareScreen")}
				htmlFor={shareModalId}
				// zIndex: 155,
			>
				<CloseIcon className="fill-accent" />
			</CloseOpenedCenteredModal>

			<div className="relative w-80 p-2">
				<p className="relative mt-6 font-primary tracking-wider text-xl text-normal font-medium overflow-ellipsis whitespace-nowrap overflow-hidden">
					{t("dialogs.sharingMedia")}
					{plural}:
				</p>

				<ol className="list-item relative h-32 mt-4 overflow-x-hidden scroll scroll-1">
					{namesOfFilesToShare(filesToShare)}
				</ol>
			</div>

			<canvas
				className="relative w-80 h-80 rounded-xl"
				ref={onCanvasElementMakeQRCode}
				id={qrID}
			>
				<Loading />
			</canvas>
		</OpenedCenteredModal>
	) : null;
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

function closePopover(closeServerFunction?: () => void): void {
	closeServerFunction?.();

	setFilesToShare(emptySet);
}

/////////////////////////////////////////

function namesOfFilesToShare(filesToShare: ReadonlySet<Path>): JSX.Element[] {
	const mainList = getMainList();

	return Array.from(filesToShare, (id) => (
		<li
			className="list-item relative mx-3 list-decimal-zero text-start font-primary tracking-wider text-lg text-normal font-medium overflow-ellipsis whitespace-nowrap marker:text-accent marker:font-normal"
			key={id}
		>
			{mainList.get(id)?.title}
		</li>
	));
}

/////////////////////////////////////////

async function makeQrcode(url: QRCodeURL): Promise<void> {
	dbg(`Making QR Code for "${url}"`);

	const canvasElement = document.getElementById(qrID) as HTMLCanvasElement;

	assert(canvasElement, "There is no canvas element!");

	await toCanvas(canvasElement, url, { errorCorrectionLevel: "H", width: 300 });
}
