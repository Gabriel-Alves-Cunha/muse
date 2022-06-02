import type { ProgressProps } from "@components/Progress";
import type { Path } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";
import create from "zustand";

import { errorToast, infoToast, successToast } from "@styles/global";
import { convertingList, setConvertingList } from "@contexts/convertList";
import { type AllowedMedias, getBasename } from "@common/utils";
import { TitleAndCancelWrapper, Content } from "../Downloading/styles";
import { assertUnreachable } from "@utils/utils";
import { ProgressStatus } from "@common/enums";
import { prettyBytes } from "@common/prettyBytes";
import { dbg } from "@common/utils";

import { ConvertionProgress } from "./styles";
import { TooltipButton } from "@components/TooltipButton";

export const useConvertInfoList = create<ConvertInfoList>(() => new Map());
export const { setState: setConvertInfoList, getState: convertInfoList } =
	useConvertInfoList;

export function Popup() {
	const convertingList_ = convertingList();

	const convertBoxes = () => {
		const list = [];

		for (const [path, media] of convertingList_)
			list.push(
				<ConvertBox mediaBeingConverted={media} key={path} path={path} />,
			);

		return list;
	};

	return (
		<>
			{convertingList_.size > 0 ? (
				convertBoxes()
			) : (
				<p>No conversions in progress!</p>
			)}
		</>
	);
}

export const ConvertBox = ({
	mediaBeingConverted: { toExtension, timeConverted, sizeConverted },
	path,
}: ConvertBoxProps) => (
	<Content>
		<TitleAndCancelWrapper>
			<p>{getBasename(path) + "." + toExtension}</p>

			<TooltipButton
				onClick={() => cancelDownloadAndOrRemoveItFromList(path)}
				tooltip="Cancel conversion"
				tooltip-side="right"
			>
				<Cancel size={12} />
			</TooltipButton>
		</TitleAndCancelWrapper>

		<ConvertionProgress>
			Seconds/size converted:
			<div>{format(timeConverted)}s</div>
			<div>{prettyBytes(sizeConverted)}</div>
		</ConvertionProgress>
	</Content>
);

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

export function createNewConvert(
	convertInfo: ConvertInfo,
	path: Path,
): MessagePort {
	const convertingList_ = convertingList();

	dbg("Trying to create a new conversion...", { convertingList_ });

	if (convertingList_.has(path)) {
		const info = `There is already one convert of "${path}"!`;

		infoToast(info);

		console.error(info, convertingList_);
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

	setConvertingList(convertingList_.set(path, convertStatus));

	// On every `postMessage` you have to send the path (as an ID)!
	myPort.postMessage({
		toExtension: convertStatus.toExtension,
		canStartConvert: true,
		path,
	});

	myPort.onmessage = ({ data }: { data: Partial<MediaBeingConverted> }) => {
		const convertingList_ = convertingList();

		dbg(`Received a message from Electron on port for "${path}":`, {
			convertingList_,
			data,
		});

		// Assert that the download exists:
		if (!convertingList_.has(path))
			return console.error(
				"Received a message from Electron but the path is not in the list!",
			);

		setConvertingList(
			convertingList_.set(path, {
				...convertStatus,
				...data,
			}),
		);

		switch (data.status) {
			case ProgressStatus.FAILED: {
				// @ts-ignore ^ In this case, `data` include an `error: Error` key.
				console.assert(data.error, "data.error should exist!");
				console.error((data as typeof data & { error: Error }).error);

				errorToast(`Download of "${path}" failed!`);

				cancelDownloadAndOrRemoveItFromList(path);
				break;
			}

			case ProgressStatus.SUCCESS: {
				successToast(`Download of "${path}" succeded!`);

				cancelDownloadAndOrRemoveItFromList(path);
				break;
			}

			case ProgressStatus.CANCEL: {
				infoToast(`Download of "${path}" was cancelled!`);

				cancelDownloadAndOrRemoveItFromList(path);
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

const cancelDownloadAndOrRemoveItFromList = (path: string) => {
	const convertingList_ = convertingList();

	const mediaBeingConverted = convertingList_.get(path);

	if (!mediaBeingConverted)
		return console.error(
			`There should be a conversion with path "${path}"!\nconvertList =`,
			convertingList_,
		);

	// Cancel conversion
	if (mediaBeingConverted.isConverting)
		mediaBeingConverted.port.postMessage({
			destroy: true,
			path,
		});

	convertingList_.delete(path);
	setConvertingList(convertingList_);
};

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
	path: Path;
}>;

type ConvertInfo = Readonly<{
	toExtension: AllowedMedias;
	canStartConvert: boolean;
}>;

type ConvertInfoList = Map<Path, ConvertInfo>;
