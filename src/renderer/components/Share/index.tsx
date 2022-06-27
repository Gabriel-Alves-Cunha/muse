import type { TurnServerOffFunction } from "@main/preload/share";
import type { Path } from "@common/@types/generalTypes";

import { Root as PopoverRoot } from "@radix-ui/react-popover";
import { useEffect, useRef, useState } from "react";
import { MdClose as Close } from "react-icons/md";
import { toCanvas } from "qrcode";

import {
	ClosePopoverTrigger,
	PopoverContent,
	PopoverAnchor,
	Canvas,
} from "./styles";

const { turnServerOn, makeItOnlyOneFile } = electron.share;

const qrid = "qrcode-canvas";

export function Share({ files }: Props) {
	const turnServerOffRef = useRef<TurnServerOffFunction | null>(null);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		switch (isOpen) {
			case true: {
				const onlyOneFile = makeItOnlyOneFile(files);

				turnServerOffRef.current = turnServerOn(onlyOneFile);
				break;
			}

			default: {
				turnServerOffRef.current?.();
				break;
			}
		}
	}, [files, isOpen]);

	return (
		<PopoverRoot open={isOpen} onOpenChange={setIsOpen}>
			<PopoverAnchor />

			<PopoverContent>
				<ClosePopoverTrigger>
					<Close />
				</ClosePopoverTrigger>

				<Canvas id={qrid}></Canvas>
			</PopoverContent>
		</PopoverRoot>
	);
}

async function makeQrcode(url: string) {
	try {
		const canvasElement = document.getElementById(qrid) as HTMLCanvasElement;

		const generatedQrcode = await toCanvas(canvasElement, url, {
			errorCorrectionLevel: "H",
			width: 400,
		});

		console.log({ generatedQrcode, canvasElement });
	} catch (error) {
		console.error("Error making QR Code.", error);
	}
}

type Props = Readonly<{
	files: Path[];
}>;
