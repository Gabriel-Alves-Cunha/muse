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
					closeModal(server.close);
				});
	}

	/////////////////////////////////////////

	// When the server closes, get rid of it's reference:
	useEffect(() => {
		server?.addListener("close", () => {
			setServer(null);
			closeModal();
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
			closeModal();
		}
	}, [filesToShare]);

	/////////////////////////////////////////

	return shouldModalOpen ? (
		<OpenedCenteredModal
			className="share-dialog-wrapper"
			htmlTargetName={shareModalId}
			onKeyUp={(e) => {
				if (e.key === "Escape" && !isAModifierKeyPressed(e))
					closeModal(server?.close);
			}}
		>
			<CloseOpenedCenteredModal
				onPointerUp={() => closeModal(server?.close)}
				title={t("tooltips.closeShareScreen")}
				className="share-dialog-trigger"
				htmlFor={shareModalId}
			>
				<CloseIcon />
			</CloseOpenedCenteredModal>

			<div className="share-dialog-text-wrapper">
				<p>
					{t("dialogs.sharingMedia")}
					{plural}:
				</p>

				<ol>{namesOfFilesToShare(filesToShare)}</ol>
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

function closeModal(closeServerFunction?: () => void): void {
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
	const canvasElement = document.getElementById(qrID) as HTMLCanvasElement;

	assert(canvasElement, "There is no canvas element!");

	await toCanvas(canvasElement, url, { errorCorrectionLevel: "H", width: 300 });
}
