import type { TurnServerOnReturn } from "@main/preload/share";
import type { Path, QRCodeURL } from "@common/@types/generalTypes";

import { useCallback, useEffect, useState } from "react";
import { MdClose as Close } from "react-icons/md";
import { toCanvas } from "qrcode";
import { Dialog } from "@radix-ui/react-dialog";

import { setSettings, useSettings } from "@contexts/settings";
import { getBasename } from "@common/path";
import { emptySet } from "@utils/map-set";
import { dbg } from "@common/utils";

import { CloseDialogTrigger, StyledDialogShareContent, Canvas } from "./styles";
import { StyledDialogBlurOverlay } from "../MediaListKind/MediaOptions/styles";
import { Loading } from "@styles/appStyles";

const { turnServerOn, makeItOnlyOneFile } = electron.share;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Constants:

const qrid = "qrcode-canvas";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ShareDialog() {
	const [server, setServer] = useState<TurnServerOnReturn | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { filesToShare } = useSettings();

	/////////////////////////////////////////

	const isPlural = filesToShare.size > 1;

	/////////////////////////////////////////

	const onCanvasElementMakeQRCode = useCallback(
		async (canvas: HTMLCanvasElement | null) => {
			if (!canvas || !isDialogOpen || !server) return;

			try {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				await makeQrcode(server.url);
			} catch (error) {
				console.error("Error making QR Code.", error);
				closePopover(server.close);
			}
		},
		[isDialogOpen, server],
	);

	/////////////////////////////////////////

	function handleDialogOpenStates(newValue: boolean) {
		if (newValue === false) server?.close();

		setIsDialogOpen(newValue);
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

	useEffect(() => {
		function closeShareDialogOnEsc({ key }: KeyboardEvent) {
			if (key === "Escape" && isDialogOpen) closePopover(server?.close);
		}

		window.addEventListener("keydown", closeShareDialogOnEsc);

		return () => window.removeEventListener("keydown", closeShareDialogOnEsc);
	}, [isDialogOpen, server]);

	/////////////////////////////////////////

	useEffect(() => {
		(async function createNewServer() {
			const shouldDialogOpen = filesToShare.size > 0;

			setIsDialogOpen(shouldDialogOpen);

			if (!shouldDialogOpen) return;

			try {
				const onlyOneFile = await makeItOnlyOneFile(filesToShare);
				const response = turnServerOn(onlyOneFile);

				setServer(response);
			} catch (error) {
				console.error(error);
				closePopover();
			}
		})();
	}, [filesToShare]);

	/////////////////////////////////////////

	return (
		<Dialog modal open={isDialogOpen} onOpenChange={handleDialogOpenStates}>
			<StyledDialogBlurOverlay />

			<StyledDialogShareContent className="notransition">
				<CloseDialogTrigger
					onClick={() =>
						closePopover(server?.close)}
					data-tip="Close share screen"
				>
					<Close />
				</CloseDialogTrigger>

				<>
					<div>
						<p>Sharing media{isPlural && "s"}:</p>

						<ol>{namesOfFilesToShare(filesToShare)}</ol>
					</div>

					<Canvas ref={onCanvasElementMakeQRCode} id={qrid}>
						<Loading />
					</Canvas>
				</>
			</StyledDialogShareContent>
		</Dialog>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper functions:

function closePopover(closeServerFunction?: () => void) {
	closeServerFunction?.();

	setSettings({ filesToShare: emptySet });
}

/////////////////////////////////////////

function namesOfFilesToShare(filesToShare: ReadonlySet<Path>): JSX.Element[] {
	const list: JSX.Element[] = [];

	filesToShare.forEach(path =>
		list.push(<li key={path}>{getBasename(path)}</li>)
	);

	return list;
}

/////////////////////////////////////////

async function makeQrcode(url: QRCodeURL): Promise<void> {
	dbg(`Making QR Code for "${url}"`);

	const canvasElement = document.getElementById(qrid) as HTMLCanvasElement;

	console.assert(canvasElement, "There is no canvas element!");

	await toCanvas(canvasElement, url, { errorCorrectionLevel: "H", width: 300 });
}
