import type { Path, QRCodeURL } from "@common/@types/generalTypes";
import type { ClientServerAPI } from "@main/preload/share/server";

import { Content, Close } from "@radix-ui/react-dialog";
import { toCanvas } from "qrcode";
import { Dialog } from "@radix-ui/react-dialog";

import { setSettings, useSettings } from "@contexts/settings";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { error, assert } from "@utils/log";
import { BlurOverlay } from "./BlurOverlay";
import { getBasename } from "@common/path";
import { CloseIcon } from "@icons/CloseIcon";
import { emptySet } from "@common/empty";
import { Loading } from "@components/Loading";
import { dbg } from "@common/debug";
import { t } from "@components/I18n";

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

			await makeQrcode(server.url).catch((err) => {
				error("Error making QR Code.", err);
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
				e.key === "Escape" &&
				isDialogOpen === true &&
				isAModifierKeyPressed(e) === false
			)
				closePopover(server?.close);
		}

		document.addEventListener("keyup", closeShareDialogOnEsc);

		return () => document.removeEventListener("keyup", closeShareDialogOnEsc);
	}, [isDialogOpen, server]);

	/////////////////////////////////////////

	useEffect(
		function createNewServer() {
			const shouldDialogOpen = filesToShare.size > 0;

			setIsDialogOpen(shouldDialogOpen);

			if (shouldDialogOpen === false) return;

			try {
				const clientServerApi = createServer([...filesToShare]);

				setServer(clientServerApi);
			} catch (err) {
				error(err);
				closePopover();
			}
		},
		[filesToShare],
	);

	/////////////////////////////////////////

	return (
		<Dialog modal open={isDialogOpen} onOpenChange={handleDialogOpenStates}>
			<BlurOverlay />

			<Content className="absolute flex flex-col justify-between items-center w-80 h-80 text-center m-auto bottom-0 right-0 left-0 top-0 shadow-popover bg-popover z-20 rounded-xl no-transition">
				<Close
					className="absolute justify-center items-center w-7 h-7 right-1 top-1 cursor-pointer z-10 bg-none border-none rounded-full font-secondary tracking-wider text-base leading-none hover:opacity-5 focus:opacity-5"
					title={t("tooltips.closeShareScreen")}
					onPointerUp={() =>
						closePopover(server?.close)
					}
					// zIndex: 155,
				>
					<CloseIcon className="fill-accent" />
				</Close>

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
			</Content>
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
	Array.from(filesToShare, (path) => (
		<li
			class="list-item relative mx-3 list-decimal-zero text-start font-primary tracking-wider text-lg text-normal font-medium overflow-ellipsis whitespace-nowrap marker:text-accent marker:font-normal"
		>
			{getBasename(path)}
		</li>
	));

/////////////////////////////////////////

async function makeQrcode(url: QRCodeURL): Promise<void> {
	dbg(`Making QR Code for "${url}"`);

	const canvasElement = document.getElementById(qrID) as HTMLCanvasElement;

	assert(canvasElement, "There is no canvas element!");

	await toCanvas(canvasElement, url, { errorCorrectionLevel: "H", width: 300 });
}
