import type { Path, QRCodeURL } from "@common/@types/generalTypes";
import type { ClientServerAPI } from "@main/preload/share/server.cjs";

import { useCallback, useEffect, useState } from "react";
import { MdClose as Close } from "react-icons/md";
import { toCanvas } from "qrcode";
import { Dialog } from "@radix-ui/react-dialog";

import { setSettings, useSettings } from "@contexts/settings";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { getBasename } from "@common/path";
import { emptySet } from "@common/empty";
import { dbg } from "@common/utils";
import { t } from "@components/I18n";

import { CloseDialogTrigger, StyledDialogShareContent, Canvas } from "./styles";
import { StyledDialogBlurOverlay } from "../MediaListKind/MediaOptions/styles";
import { Loading } from "@styles/appStyles";

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

const filesToShareSelector = (state: ReturnType<typeof useSettings.getState>) =>
	state.filesToShare;

export function ShareDialog() {
	const [server, setServer] = useState<ClientServerAPI | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const filesToShare = useSettings(filesToShareSelector);

	const plural = filesToShare.size > 1 ? "s" : "";

	/////////////////////////////////////////

	const onCanvasElementMakeQRCode = useCallback(
		async (canvas: HTMLCanvasElement | null) => {
			if (canvas === null || isDialogOpen === false || server === null) return;

			await makeQrcode(server.url).catch(err => {
				console.error("Error making QR Code.", err);
				closePopover(server.close);
			});
		},
		[isDialogOpen, server],
	);

	/////////////////////////////////////////

	function handleDialogOpenStates(newValue: boolean): void {
		if (newValue === false) server?.close();

		setIsDialogOpen(newValue);
	}

	/////////////////////////////////////////

	// When the server closes, get rid of it's reference:
	useEffect(() => {
		server?.addListener("close", () => {
			setTimeout(() => setServer(null), 1_000);
			closePopover();
		});
	}, [server]);

	/////////////////////////////////////////

	useEffect(() => {
		function closeShareDialogOnEsc(e: KeyboardEvent) {
			if (
				e.key === "Escape" && isDialogOpen === true &&
				isAModifierKeyPressed(e) === false
			)
				closePopover(server?.close);
		}

		document.addEventListener("keyup", closeShareDialogOnEsc);

		return () => document.removeEventListener("keyup", closeShareDialogOnEsc);
	}, [isDialogOpen, server]);

	/////////////////////////////////////////

	useEffect(function createNewServer() {
		const shouldDialogOpen = filesToShare.size > 0;

		setIsDialogOpen(shouldDialogOpen);

		if (shouldDialogOpen === false) return;

		try {
			const clientServerApi = createServer([...filesToShare]);

			setServer(clientServerApi);
		} catch (error) {
			console.error(error);
			closePopover();
		}
	}, [filesToShare]);

	/////////////////////////////////////////

	return (
		<Dialog modal open={isDialogOpen} onOpenChange={handleDialogOpenStates}>
			<StyledDialogBlurOverlay />

			<StyledDialogShareContent className="notransition">
				<CloseDialogTrigger
					aria-label={t("tooltips.closeShareScreen")}
					title={t("tooltips.closeShareScreen")}
					onPointerUp={() =>
						closePopover(server?.close)}
				>
					<Close />
				</CloseDialogTrigger>

				<div>
					<p>{t("dialogs.sharingMedia")}{plural}:</p>

					<ol>{namesOfFilesToShare(filesToShare)}</ol>
				</div>

				<Canvas ref={onCanvasElementMakeQRCode} id={qrID}>
					<Loading />
				</Canvas>
			</StyledDialogShareContent>
		</Dialog>
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
	Array.from(filesToShare, path => <li key={path}>{getBasename(path)}</li>);

/////////////////////////////////////////

async function makeQrcode(url: QRCodeURL): Promise<void> {
	dbg(`Making QR Code for "${url}"`);

	const canvasElement = document.getElementById(qrID) as HTMLCanvasElement;

	console.assert(canvasElement, "There is no canvas element!");

	await toCanvas(canvasElement, url, { errorCorrectionLevel: "H", width: 300 });
}
