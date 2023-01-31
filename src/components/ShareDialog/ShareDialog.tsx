import type { Path, QRCodeURL } from "types/generalTypes";
import type { ClientServerAPI } from "@main/preload/share/server";

import { useEffect, useReducer } from "react";
import { MdClose as CloseIcon } from "react-icons/md";
import { toCanvas } from "qrcode";

import { setFilesToShare, useFilesToShare } from "@contexts/filesToShare";
import { useTranslation } from "@i18n";
import { CenteredModal } from "../CenteredModal";
import { error, assert } from "@utils/log";
import { getMainList } from "@contexts/usePlaylists";
import { emptySet } from "@utils/empty";
import { Loading } from "../Loading";

// const { createServer } = electron.share;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

const qrID = "qrcode-canvas";

export default function ShareDialog() {
	const [server, setServer] = useReducer(reducer, null);
	const { filesToShare } = useFilesToShare();
	const { t } = useTranslation();

	const plural = filesToShare.size > 1 ? "s" : "";
	const shouldModalOpen = filesToShare.size;

	/////////////////////////////////////////

	function reducer(
		_prevValue: ClientServerAPI | null,
		newValue: ClientServerAPI | null,
	): ClientServerAPI | null {
		if (!newValue) {
			// Setting server to null.

			closeShareDialog();

			return null;
		}

		// When the server closes, get rid of it's reference:
		newValue.addListener("close", () => setServer(null));

		return newValue;
	}

	/////////////////////////////////////////

	function onCanvasElementMakeQRCode(canvas: HTMLCanvasElement | null) {
		if (shouldModalOpen && server && canvas)
			makeQrcode(server.url)
				.then()
				.catch((err) => {
					error("Error making QR Code.", err);
					closeShareDialog(server.close);
				});
	}

	/////////////////////////////////////////

	// Create new server:
	useEffect(() => {
		if (!shouldModalOpen) return;

		// 		try {
		// 			const clientServerApi = createServer([...filesToShare]);
		//
		// 			setServer(clientServerApi);
		// 		} catch (err) {
		// 			error(err);
		// 			closeShareDialog();
		// 		}
	}, [filesToShare]);

	/////////////////////////////////////////

	return shouldModalOpen ? (
		<CenteredModal
			onEscape={() => closeShareDialog(server?.close)}
			className="share-dialog-wrapper"
			isOpen
		>
			<button
				onPointerUp={() => closeShareDialog(server?.close)}
				title={t("tooltips.closeShareScreen")}
				className="share-dialog-trigger"
			>
				<CloseIcon />
			</button>

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
		</CenteredModal>
	) : null;
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

function closeShareDialog(closeServerFunction?: () => void): void {
	closeServerFunction?.();

	setFilesToShare(emptySet);
}

/////////////////////////////////////////

function namesOfFilesToShare(filesToShare: ReadonlySet<Path>): JSX.Element[] {
	const mainList = getMainList();

	return Array.from(filesToShare, (id) => (
		<li data-files-to-share key={id}>
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
