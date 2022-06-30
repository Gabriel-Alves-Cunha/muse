import type { turnServerOnReturn } from "@main/preload/share";

import { useEffect, useState } from "react";
import { MdClose as Close } from "react-icons/md";
import { toCanvas } from "qrcode";

import { setSettings, useSettings } from "@contexts/settings";
import { emptySet } from "@utils/map-set";
import { dbg } from "@common/utils";

import { ClosePopoverTrigger, PopoverContent, Canvas } from "./styles";
import { Loading } from "@styles/appStyles";

const { turnServerOn, makeItOnlyOneFile } = electron.share;

const qrid = "qrcode-canvas";

export function SharePopover() {
	const [server, setServer] =
		useState<Readonly<turnServerOnReturn | null>>(null);
	const { filesToShare } = useSettings();

	const isOpen = filesToShare.size > 0;

	function closePopover() {
		server?.close();

		setSettings({ filesToShare: emptySet });
	}

	useEffect(() => {
		// When the server closes, get rid of it's reference
		server?.addListener("close", () => {
			dbg("Getting rid of the server reference on React.");
			setServer(null);
		});
	}, [server]);

	useEffect(() => {
		function closeSharePopoverOnEsc({ key }: KeyboardEvent) {
			if (key === "Escape" && isOpen) {
				server?.close();

				setSettings({ filesToShare: emptySet });
			}
		}

		window.addEventListener("keydown", closeSharePopoverOnEsc);

		return () => window.removeEventListener("keydown", closeSharePopoverOnEsc);
	}, [isOpen, server]);

	useEffect(() => {
		(async function handleOpenState() {
			dbg("on handleOpenState()", isOpen, filesToShare);

			if (!isOpen) return;

			try {
				const onlyOneFile = await makeItOnlyOneFile(filesToShare);
				const response = turnServerOn(onlyOneFile);

				setServer(response);

				const { port, hostname } = response;

				const url = `https://${hostname}:${port}`;

				dbg("on handleOpenState()", { isOpen, response, url });

				await makeQrcode(url);
			} catch (error) {
				console.error(error);
				// Close popover
				setSettings({ filesToShare: emptySet });
			}
		})();
	}, [filesToShare, isOpen]);

	return isOpen ? (
		<PopoverContent
			className="notransition"
			data-open={isOpen}
			data-side="left"
		>
			<ClosePopoverTrigger data-tip="Close share screen" onClick={closePopover}>
				<Close />
			</ClosePopoverTrigger>

			<Canvas id={qrid}>
				<Loading />
			</Canvas>
		</PopoverContent>
	) : null;
}

async function makeQrcode(url: string): Promise<void> {
	dbg(`Making QR Code for "${url}"`);

	const canvasElement = document.getElementById(qrid) as HTMLCanvasElement;

	await toCanvas(canvasElement, url, {
		errorCorrectionLevel: "H",
		width: 300,
	}).catch(error => console.error("Error making QR Code.", error));
}
