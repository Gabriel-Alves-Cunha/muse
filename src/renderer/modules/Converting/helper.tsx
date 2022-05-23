import type { ProgressProps } from "@components/Progress";
import type { Path } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";
import create from "zustand";

import { errorToast, infoToast, successToast } from "@styles/global";
import { convertingList, setConvertingList } from "@contexts/convertList";
import { type AllowedMedias, getBasename } from "@common/utils";
import { assertUnreachable } from "@utils/utils";
import { ProgressStatus } from "@common/enums";
import { prettyBytes } from "@common/prettyBytes";
import { Tooltip } from "@components/Tooltip";
import { dbg } from "@common/utils";

import { TitleAndCancelWrapper, Content } from "../Downloading/styles";
import { ConvertionProgress } from "./styles";

export const useConvertInfoList = create<ConvertInfoList>(() => new Map());
export const { setState: setConvertInfoList, getState: convertInfoList } =
	useConvertInfoList;

export const Popup = () => {
	const convertingList_ = convertingList();

	return (
		<>
			{convertingList_.size > 0 ? (
				Array.from(convertingList_.entries()).map(([path, media]) => (
					<ConvertBox mediaBeingConverted={media} key={path} path={path} />
				))
			) : (
				<p>No conversions in progress!</p>
			)}
		</>
	);
};

export const ConvertBox = ({
	mediaBeingConverted: { toExtension, timeConverted, sizeConverted },
	path,
}: ConvertBoxProps) => (
	<Content>
		<TitleAndCancelWrapper>
			<p>{getBasename(path) + "." + toExtension}</p>

			<Tooltip text="Cancel conversion" side="right">
				<button onClick={() => cancelDownloadAndOrRemoveItFromList(path)}>
					<Cancel size={12} />
				</button>
			</Tooltip>
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
	path: Path
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

	myPort.postMessage({
		toExtension: convertStatus.toExtension,
		// ^ On every `postMessage` you have to send the path (as an ID)!
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
		if (!convertingList_.has(path)) {
			return console.error(
				"Received a message from Electron but the path is not in the list!"
			);
		}

		setConvertingList(
			convertingList_.set(path, {
				...convertStatus,
				...data,
			})
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

			default: {
				assertUnreachable(data.status);
				break;
			}
		}
	};

	// @ts-ignore: this DOES exists
	myPort.onclose = handleOnClose;

	myPort.start();

	return electronPort;
}

const cancelDownloadAndOrRemoveItFromList = (path: string) => {
	const convertingList_ = convertingList();

	const mediaBeingConverted = convertingList_.get(path);

	if (!mediaBeingConverted) {
		return console.error(
			`There should be a conversion with path "${path}"!\nconvertList =`,
			convertingList_
		);
	}

	// Cancel conversion
	if (mediaBeingConverted.isConverting) {
		mediaBeingConverted.port.postMessage({
			destroy: true,
			path,
		});
	}

	convertingList_.delete(path);
	setConvertingList(convertingList_);
};

const format = (str: string) => str.slice(0, str.lastIndexOf("."));

export const handleOnClose = () => console.log("Closing ports (react port).");

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
