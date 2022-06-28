import type { TurnServerOffFunction } from "@main/preload/share";

import { useEffect, useRef, useState } from "react";
import { Root as PopoverRoot } from "@radix-ui/react-popover";
import { MdClose as Close } from "react-icons/md";
import { toCanvas } from "qrcode";
import create from "zustand";

import { setSettings, useSettings } from "@contexts/settings";
import { emptySet } from "@utils/map-set";
import { port } from "@common/crossCommunication";
import { dbg } from "@common/utils";

import { Loading } from "@styles/appStyles";
import {
	ClosePopoverTrigger,
	PopoverContent,
	PopoverAnchor,
	Canvas,
} from "./styles";

const { turnServerOn, makeItOnlyOneFile, getMyIpAddress } = electron.share;

const qrid = "qrcode-canvas";

const useIsOpen = create(() => ({ isOpen: false }));
const setIsOpen = (isOpen: boolean) => useIsOpen.setState({ isOpen });

export function Share() {
	const serverResponseRef = useRef<TurnServerOffFunction | null>(null);
	// Using this useState because there is a bug in Radix Popover,
	// in wich the first time it opens, on the `onOpenChange` function,
	// the value it receives is the opposite of what it should be.
	const [isFirstTime, setIsFirstTime] = useState(true);
	const { filesToShare } = useSettings();
	const { isOpen } = useIsOpen();

	useEffect(() => {
		dbg("on useEffect. isOpen =", isOpen);
		filesToShare.size > 0 ? setIsOpen(true) : setIsOpen(false);
	}, [filesToShare, isOpen]);

	async function handleOpenState(newIsOpen: boolean) {
		if (isFirstTime) {
			newIsOpen = !newIsOpen;
			setIsFirstTime(false);
		}

		dbg("on handleOpenState()", newIsOpen, filesToShare);
		// This popup for the QR Code will open when `filesToShare.size > 0`.
		// filesToShare.size > 0 ? setIsOpen(true) : setIsOpen(false);

		// const newIsOpen = filesToShare.size > 0;

		if (newIsOpen) {
			const onlyOneFile = await makeItOnlyOneFile(filesToShare);

			serverResponseRef.current = turnServerOn(onlyOneFile);

			const url = `https://${getMyIpAddress()}:${port}`;

			dbg({ newIsOpen, serverResponseRef, url });

			await makeQrcode(url);
		} else {
			serverResponseRef.current?.();

			setSettings({ filesToShare: emptySet });

			setIsFirstTime(true);

			dbg({ newIsOpen, serverResponseRef });
		}
	}

	return (
		<PopoverRoot modal open={isOpen} onOpenChange={handleOpenState}>
			<PopoverAnchor />

			<PopoverContent>
				<ClosePopoverTrigger data-tip="Close share screen">
					<Close />
				</ClosePopoverTrigger>

				<Canvas id={qrid}>
					<Loading />
				</Canvas>
			</PopoverContent>
		</PopoverRoot>
	);
}

async function makeQrcode(url: string): Promise<void> {
	const canvasElement = document.getElementById(qrid) as HTMLCanvasElement;

	await toCanvas(canvasElement, url, {
		errorCorrectionLevel: "H",
		width: 300,
	}).catch(error => console.error("Error making QR Code.", error));
}
