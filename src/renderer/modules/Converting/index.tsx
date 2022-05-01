import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { Path, ConvertValues } from "@common/@types/typesAndEnums";
import type { ProgressProps } from "@components/Progress";

import { useEffect, useRef, useState } from "react";
import { MdCompareArrows as Convert } from "react-icons/md";
import { AiOutlineClose as Cancel } from "react-icons/ai";
import { toast } from "react-toastify";
import create from "zustand";

import { searchLocalComputerForMedias } from "@contexts";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { assertUnreachable } from "@utils/utils";
import { useOnClickOutside } from "@hooks";
import { sendMsgToBackend } from "@common/crossCommunication";
import { remove, replace } from "@utils/array";
import { ProgressStatus } from "@common/@types/typesAndEnums";
import { getBasename } from "@common/utils";
import { prettyBytes } from "@common/prettyBytes";
import { Tooltip } from "@components";

import { ConvertionProgress } from "./styles";
import {
	TitleAndCancelWrapper,
	Content,
	Trigger,
	Wrapper,
	Popup,
} from "../Downloading/styles";

// const { port1: testPort } = new MessageChannel();
// const testConvertingMedia: MediaBeingConverted = Object.freeze({
// 	status: ProgressStatus.ACTIVE,
// 	path: "/test/fake/path",
// 	timeConverted: "01:20",
// 	sizeConverted: 1000,
// 	isConverting: true,
// 	toExtension: "mp3",
// 	percentage: 50,
// 	port: testPort,
// } as const);

const useConvertList = create<PopupProps>(() => ({
	convertList: [], //new Array(10).fill(testConvertingMedia),
}));

export const useConvertValues = create<{
	convertValues: readonly ConvertValues[];
}>(() => ({
	convertValues: [],
}));

// This prevents an infinite loop:
const constRefToEmptyArray = Object.freeze([]);

export const { setState: setConvertValues } = useConvertValues;

export function Converting() {
	const [showPopup, setShowPopup] = useState(false);
	const { convertValues } = useConvertValues();
	const { convertList } = useConvertList();

	const popupRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(popupRef, () => setShowPopup(false));

	useEffect(() => {
		convertValues.forEach(convertValue => {
			if (convertValue.canStartConvert)
				try {
					const electronPort = createNewConvert(convertValue);

					// Sending port so we can communicate with electron:
					sendMsgToBackend(
						{
							type: ReactToElectronMessageEnum.CONVERT_MEDIA,
						},
						electronPort,
					);
				} catch (error) {
					toast.error(
						`There was an error trying to download "${convertValue.path}"! Please, try again later.`,
						{
							hideProgressBar: false,
							position: "top-right",
							progress: undefined,
							closeOnClick: true,
							pauseOnHover: true,
							autoClose: 5000,
							draggable: true,
						},
					);
				}
		});

		// Once all downloads are handled, we can remove the values from the list:
		setConvertValues({ convertValues: constRefToEmptyArray });
	}, [convertValues]);

	useEffect(() => {
		const handleEscKey = ({ key }: KeyboardEvent) =>
			key === "Escape" && setShowPopup(false);

		window.addEventListener("keydown", handleEscKey);

		return () => window.removeEventListener("keydown", handleEscKey);
	}, []);

	return (
		<Wrapper ref={popupRef}>
			<Tooltip text="Show all converting medias" arrow={false} side="right">
				<Trigger
					onClick={() => setShowPopup(prev => !prev)}
					className={
						(convertList.length ? "has-downloads " : "") +
						(showPopup ? "active" : "")
					}
				>
					<i data-length={convertList.length}></i>
					<Convert size={20} />
				</Trigger>
			</Tooltip>

			{showPopup && <Popup_ convertList={convertList} />}
		</Wrapper>
	);
}

const Popup_ = ({ convertList }: PopupProps) => (
	<Popup>
		{convertList.length > 0 ? (
			convertList.map(m => <ConvertBox mediaBeingConverted={m} key={m.path} />)
		) : (
			<p>No conversions in progress!</p>
		)}
	</Popup>
);

const ConvertBox = ({ mediaBeingConverted }: ConvertBoxProps) => (
	<Content>
		<TitleAndCancelWrapper>
			<p>
				{getBasename(mediaBeingConverted.path) +
					"." +
					mediaBeingConverted.toExtension}
			</p>

			<Tooltip text="Cancel conversion" side="right">
				<button
					onClick={() =>
						cancelDownloadAndOrRemoveItFromList(mediaBeingConverted.path)
					}
				>
					<Cancel size={12} />
				</button>
			</Tooltip>
		</TitleAndCancelWrapper>

		<ConvertionProgress>
			Seconds/size converted:
			<div>{format(mediaBeingConverted.timeConverted)}s</div>
			<div>{prettyBytes(mediaBeingConverted.sizeConverted)}</div>
		</ConvertionProgress>
	</Content>
);

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const { setState: setConvertList, getState: getConvertList } = useConvertList;

function createNewConvert(convertValues: ConvertValues): MessagePort {
	const { convertList } = getConvertList();
	{
		const indexIfThereIsOneAlready = convertList.findIndex(
			c => c.path === convertValues.path,
		);
		if (indexIfThereIsOneAlready !== -1) {
			const info = `There is already one convert of "${convertValues.path}"!`;

			toast.info(info, {
				hideProgressBar: false,
				position: "top-right",
				progress: undefined,
				closeOnClick: true,
				pauseOnHover: true,
				autoClose: 5000,
				draggable: true,
			});

			console.error(info, convertList);
			throw new Error(info);
		}
	}

	// MessageChannels are lightweight, it's cheap to create
	// a new one for each request.
	const { port1: myPort, port2: electronPort } = new MessageChannel();

	const convertStatus: MediaBeingConverted = {
		toExtension: convertValues.toExtension,
		status: ProgressStatus.ACTIVE,
		path: convertValues.path,
		isConverting: true,
		timeConverted: "",
		sizeConverted: 0,
		port: myPort,
	};

	myPort.postMessage({
		toExtension: convertStatus.toExtension,
		path: convertStatus.path,
		// ^ On every `postMessage` you have to send the path (as an ID)!
		canStartConvert: true,
	});

	myPort.onmessage = ({ data }: { data: Partial<MediaBeingConverted> }) => {
		const { convertList } = getConvertList();

		// Assert that the download exists:
		const indexToSeeIfDownloadExists = convertList.findIndex(
			d => d.path === convertStatus.path,
		);
		const doesDownloadExists = indexToSeeIfDownloadExists !== -1;

		if (!doesDownloadExists) {
			console.warn(
				"Received a message from Electron but the path is not in the list",
				{ data, convertList },
				"Creating it...",
			);

			setConvertList({
				convertList: [...convertList, convertStatus],
			});
		}

		const index = doesDownloadExists
			? indexToSeeIfDownloadExists
			: convertList.length;

		if (index === -1) {
			console.error("There is no convert with path =", data.path, convertList);
			return;
		}

		setConvertList({
			convertList: replace(convertList, index, {
				...convertStatus,
				...data, // new data will override old ones.
			}),
		});

		switch (data.status) {
			case ProgressStatus.FAIL: {
				// ^ In this case, `data` include an `error: Error` key.
				console.error((data as typeof data & { error: Error }).error);

				toast.error(`Download of "${convertStatus.path}" failed!`, {
					hideProgressBar: false,
					position: "top-right",
					progress: undefined,
					closeOnClick: true,
					pauseOnHover: true,
					autoClose: 5000,
					draggable: true,
				});

				cancelDownloadAndOrRemoveItFromList(convertStatus.path);
				break;
			}

			case ProgressStatus.SUCCESS: {
				toast.success(`Download of "${convertStatus.path}" succeded!`, {
					hideProgressBar: false,
					position: "top-right",
					progress: undefined,
					closeOnClick: true,
					pauseOnHover: true,
					autoClose: 5000,
					draggable: true,
				});

				cancelDownloadAndOrRemoveItFromList(convertStatus.path);
				(async () => await searchLocalComputerForMedias(true))();
				break;
			}

			case ProgressStatus.CANCEL: {
				toast.info(`Download of "${convertStatus.path}" was cancelled!`, {
					hideProgressBar: false,
					position: "top-right",
					progress: undefined,
					closeOnClick: true,
					pauseOnHover: true,
					autoClose: 5000,
					draggable: true,
				});

				cancelDownloadAndOrRemoveItFromList(convertStatus.path);
				break;
			}

			case ProgressStatus.ACTIVE:
				break;

			case undefined:
				break;

			case ProgressStatus.CONVERT:
				break;

			default: {
				assertUnreachable(data.status);
				break;
			}
		}
	};

	// @ts-ignore: this DOES exists
	myPort.onclose = () => console.log("Closing ports (myPort).");

	myPort.start();

	return electronPort;
}

function cancelDownloadAndOrRemoveItFromList(mediaPath: string) {
	const { convertList } = getConvertList();

	const mediaBeingConvertedIndex = convertList.findIndex(
		c => c.path === mediaPath,
	);
	if (mediaBeingConvertedIndex === -1)
		return console.error(
			`There should be a download with path "${mediaPath}"!\nconvertList =`,
			convertList,
		);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const mediaBeingConverted = convertList[mediaBeingConvertedIndex]!;

	if (mediaBeingConverted.isConverting)
		mediaBeingConverted.port.postMessage({
			path: mediaBeingConverted.path,
			destroy: true,
		});

	setConvertList({
		convertList: remove(convertList, mediaBeingConvertedIndex),
	});
}

const format = (str: string) => str.slice(0, str.lastIndexOf("."));

type MediaBeingConverted = Readonly<{
	toExtension: ExtensionToBeConvertedTo;
	status: ProgressProps["status"];
	sizeConverted: number;
	timeConverted: string;
	isConverting: boolean;
	port: MessagePort;
	path: Path;
}>;

type PopupProps = Readonly<{
	convertList: readonly MediaBeingConverted[];
}>;

type ConvertBoxProps = Readonly<{
	mediaBeingConverted: MediaBeingConverted;
}>;

Converting.whyDidYouRender = {
	logOnDifferentValues: true,
	customName: "Converting",
};
