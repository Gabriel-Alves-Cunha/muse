import type { TurnServerOnResponse } from "@main/preload/share";

import { Root as PopoverRoot } from "@radix-ui/react-popover";
import { useEffect, useRef } from "react";
import { MdClose as Close } from "react-icons/md";
import { toCanvas } from "qrcode";

import { setSettings, useSettings } from "@contexts/settings";
import { port } from "@common/crossCommunication";

import { Loading } from "@styles/appStyles";
import {
	ClosePopoverTrigger,
	PopoverContent,
	PopoverAnchor,
	Canvas,
} from "./styles";

const { turnServerOn, makeItOnlyOneFile } = electron.share;

const qrid = "qrcode-canvas";

export function Share() {
	const serverResponseRef = useRef<TurnServerOnResponse | null>(null);
	const { files, open } = useSettings().share;

	useEffect(() => {
		(async () => {
			if (open) {
				const onlyOneFile = await makeItOnlyOneFile(files);

				if (!onlyOneFile)
					return console.error("There should be a file to share:", {
						onlyOneFile,
					});

				serverResponseRef.current = turnServerOn(onlyOneFile);

				const url = `https://${serverResponseRef.current.myIpAddress}:${port}`;

				await makeQrcode(url);
			} else {
				serverResponseRef.current?.turnServerOff();
			}
		})();
	}, [files, open]);

	return (
		<PopoverRoot open={open} onOpenChange={openOrCloseSharePopup}>
			<PopoverAnchor />

			<PopoverContent>
				<ClosePopoverTrigger>
					<Close />
				</ClosePopoverTrigger>

				<Canvas id={qrid}>
					<Loading />
				</Canvas>
			</PopoverContent>
		</PopoverRoot>
	);
}

async function makeQrcode(url: string) {
	const canvasElement = document.getElementById(qrid) as HTMLCanvasElement;

	const generatedQrcode = await toCanvas(canvasElement, url, {
		errorCorrectionLevel: "H",
		width: 400,
	}).catch(error => console.error("Error making QR Code.", error));

	console.log({ generatedQrcode, canvasElement });
}

function openOrCloseSharePopup(newValue: boolean) {
	newValue
		? setSettings(prev => ({
				share: { open: true, files: prev.share.files },
		  }))
		: setSettings({ share: { open: false, files: [] } });
}
