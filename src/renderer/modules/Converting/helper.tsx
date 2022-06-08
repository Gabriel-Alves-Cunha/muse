import type { ProgressProps } from "@components/Progress";
import type { Path } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";
import create from "zustand";

import { getConvertingList, setConvertingList } from "@contexts/convertList";
import { errorToast, infoToast, successToast } from "@styles/global";
import { type AllowedMedias, getBasename } from "@common/utils";
import { assertUnreachable } from "@utils/utils";
import { ProgressStatus } from "@common/enums";
import { TooltipButton } from "@components/TooltipButton";
import { prettyBytes } from "@common/prettyBytes";
import { dbg } from "@common/utils";
import {
	cancelConvertionAndOrRemoveItFromList,
	handleDeleteAnimation,
} from "@modules/Downloading/helper";

import { TitleAndCancelWrapper, ItemWrapper } from "../Downloading/styles";
import { ConvertionProgress } from "./styles";

export const useConvertInfoList = create<ConvertInfoList>(() => ({
	convertInfoList: new Map(),
}));
export const { setState: setConvertInfoList, getState: getConvertInfoList } =
	useConvertInfoList;

export function Popup() {
	const { convertingList } = getConvertingList();

	function convertBoxes(): JSX.Element[] {
		const list = [];

		let convertionIndex = 0;
		for (const [path, media] of convertingList) {
			list.push(
				<ConvertBox
					convertionIndex={convertionIndex}
					mediaBeingConverted={media}
					path={path}
					key={path}
				/>,
			);
			++convertionIndex;
		}

		return list;
	}

	return (
		<>
			{convertingList.size > 0 ? (
				convertBoxes()
			) : (
				<p>No conversions in progress!</p>
			)}
		</>
	);
}

export const ConvertBox = ({
	mediaBeingConverted: { toExtension, timeConverted, sizeConverted },
	convertionIndex,
	path,
}: ConvertBoxProps) => (
	<ItemWrapper className="item">
		<TitleAndCancelWrapper>
			<p>{getBasename(path) + "." + toExtension}</p>

			<TooltipButton
				onClick={e => handleDeleteAnimation(e, convertionIndex, false, path)}
				tooltip="Cancel conversion"
				tooltip-side="left"
			>
				<Cancel size={12} className="notransition" />
			</TooltipButton>
		</TitleAndCancelWrapper>

		<ConvertionProgress>
			Seconds/size converted:
			<div>{format(timeConverted)}s</div>
			<div>{prettyBytes(sizeConverted)}</div>
		</ConvertionProgress>
	</ItemWrapper>
);

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

export function createNewConvert(
	convertInfo: ConvertInfo,
	path: Path,
): MessagePort {
	const { convertingList } = getConvertingList();

	dbg("Trying to create a new conversion...", {
		convertingList,
	});

	if (convertingList.has(path)) {
		const info = `There is already one convert of "${path}"!`;

		infoToast(info);

		console.error(info, convertingList);
		throw new Error(info);
	}

	// MessageChannels are lightweight, it's cheap to create
	// a new one for each request.
	const { port1: myPort, port2: electronPort } = new MessageChannel();

	const convertStatus: MediaBeingConverted = {
		status: ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON,
		toExtension: convertInfo.toExtension,
		isConverting: true,
		timeConverted: "",
		sizeConverted: 0,
		port: myPort,
	};

	setConvertingList({
		convertingList: convertingList.set(path, convertStatus),
	});

	// On every `postMessage` you have to send the path (as an ID)!
	myPort.postMessage({
		toExtension: convertStatus.toExtension,
		canStartConvert: true,
		path,
	});

	myPort.onmessage = ({ data }: { data: Partial<MediaBeingConverted> }) => {
		const { convertingList } = getConvertingList();

		dbg(`Received a message from Electron on port for "${path}":`, {
			convertingList,
			data,
		});

		// Assert that the download exists:
		if (!convertingList.has(path))
			return console.error(
				"Received a message from Electron but the path is not in the list!",
			);

		setConvertingList({
			convertingList: convertingList.set(path, {
				...convertStatus,
				...data,
			}),
		});

		switch (data.status) {
			case ProgressStatus.FAILED: {
				// @ts-ignore ^ In this case, `data` include an `error: Error` key.
				console.assert(data.error, "data.error should exist!");
				console.error((data as typeof data & { error: Error }).error);

				errorToast(`Download of "${path}" failed!`);

				cancelConvertionAndOrRemoveItFromList(path);
				break;
			}

			case ProgressStatus.SUCCESS: {
				successToast(`Download of "${path}" succeded!`);

				cancelConvertionAndOrRemoveItFromList(path);
				break;
			}

			case ProgressStatus.CANCEL: {
				infoToast(`Download of "${path}" was cancelled!`);

				cancelConvertionAndOrRemoveItFromList(path);
				break;
			}

			case ProgressStatus.ACTIVE:
				break;

			case undefined:
				break;

			case ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON:
				break;

			default:
				assertUnreachable(data.status);
				break;
		}
	};

	myPort.addEventListener("close", handleOnClose);

	myPort.start();

	return electronPort;
}

const format = (str: string) => str.slice(0, str.lastIndexOf("."));

export const handleOnClose = () => dbg("Closing ports (react port).");

export type MediaBeingConverted = Readonly<{
	status: ProgressProps["status"];
	toExtension: AllowedMedias;
	sizeConverted: number;
	timeConverted: string;
	isConverting: boolean;
	port: MessagePort;
}>;

type ConvertBoxProps = Readonly<{
	mediaBeingConverted: MediaBeingConverted;
	convertionIndex: number;
	path: Path;
}>;

type ConvertInfo = Readonly<{
	toExtension: AllowedMedias;
	canStartConvert: boolean;
}>;

type ConvertInfoList = { convertInfoList: Map<Path, ConvertInfo> };
