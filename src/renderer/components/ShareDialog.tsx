import type { ClientServerAPI } from "@main/preload/share/server";
import type { QRCodeURL } from "@common/@types/GeneralTypes";

import { useEffect, useReducer } from "react";
import { MdClose as CloseIcon } from "react-icons/md";
import { toCanvas } from "qrcode";

import { selectT, useTranslator } from "@i18n";
import { CenteredModal } from "./CenteredModal";
import { error, assert } from "@common/log";
import { getPlaylists } from "@contexts/playlists";
import { Loading } from "./Loading";
import {
	clearAllFilesToShare,
	filesToShareRef,
	getFilesToShare,
} from "@contexts/filesToShare";

const { createServer } = electronApi.share;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

const qrID = "qrcode-canvas";

export function ShareDialog(): JSX.Element | null {
	const [server, setServer] = useReducer(reducer, null);
	const filesToShare = filesToShareRef().current;
	const t = useTranslator(selectT);

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

	function onCanvasElementMakeQRCode(canvas: HTMLCanvasElement | null): void {
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

		try {
			setServer(createServer([...filesToShare]));
		} catch (err) {
			error(err);
			closeShareDialog();
		}
	}, [filesToShare, shouldModalOpen]);

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

				<ol>{namesOfFilesToShare()}</ol>
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

	clearAllFilesToShare();
}

/////////////////////////////////////////

function namesOfFilesToShare(): JSX.Element[] {
	const mainList = getPlaylists().sortedByTitleAndMainList;

	return Array.from(getFilesToShare(), (id) => (
		<li data-files-to-share key={id}>
			{mainList.get(id)?.title ?? "<Untitled>"}
		</li>
	));
}

/////////////////////////////////////////

async function makeQrcode(url: QRCodeURL): Promise<void> {
	const canvasElement = document.getElementById(qrID) as HTMLCanvasElement;

	assert(canvasElement, "There is no canvas element!");

	await toCanvas(canvasElement, url, { errorCorrectionLevel: "H", width: 300 });
}
