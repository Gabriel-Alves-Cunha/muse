import type { Path } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";
import create from "zustand";

import { type AllowedMedias, getBasename, formatDuration } from "@common/utils";
import { errorToast, infoToast, successToast } from "@styles/global";
import { progressIcons, type ProgressProps } from "@components/Progress";
import { assertUnreachable } from "@utils/utils";
import { ProgressStatus } from "@common/enums";
import { prettyBytes } from "@common/prettyBytes";
import { emptyMap } from "@utils/map-set";
import { dbg } from "@common/utils";
import {
	cancelConvertionAndOrRemoveItFromList,
	handleSingleItemDeleteAnimation,
} from "@components/Downloading/helper";
import {
	getConvertingList,
	setConvertingList,
	useConvertingList,
} from "@contexts/convertList";

import { CancelButton, ConvertionProgress } from "./styles";
import {
	TitleAndCancelWrapper,
	CleanAllDoneButton,
	ItemWrapper,
} from "../Downloading/styles";

export const useNewConvertions = create<NewConvertions>(() => ({
	newConvertions: emptyMap,
}));

export function Popup() {
	const { convertingList } = useConvertingList();

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
				/>
			);
			++convertionIndex;
		}

		return list;
	}

	return (
		<>
			{convertingList.size > 0 ? (
				<>
					<CleanAllDoneButton onClick={cleanAllDoneConvertions}>
						Clean finished
					</CleanAllDoneButton>

					{convertBoxes()}
				</>
			) : (
				<p>No conversions in progress!</p>
			)}
		</>
	);
}

function cleanAllDoneConvertions(): void {
	getConvertingList().convertingList.forEach((download, url) => {
		if (
			download.status !==
				ProgressStatus.WAITING_FOR_CONFIRMATION_FROM_ELECTRON &&
			download.status !== ProgressStatus.ACTIVE
		)
			cancelConvertionAndOrRemoveItFromList(url);
	});
}

export const ConvertBox = ({
	mediaBeingConverted: { toExtension, timeConverted, sizeConverted, status },
	convertionIndex,
	path,
}: ConvertBoxProps) => (
	<ItemWrapper className="item">
		<TitleAndCancelWrapper>
			<p>{getBasename(path) + "." + toExtension}</p>

			<CancelButton
				onClick={e =>
					handleSingleItemDeleteAnimation(e, convertionIndex, false, path)
				}
				data-tip="Cancel conversion"
				className="notransition"
			>
				<Cancel size={12} />
			</CancelButton>
		</TitleAndCancelWrapper>

		<ConvertionProgress>
			Converted: {formatDuration(timeConverted)} s /{" "}
			{prettyBytes(sizeConverted)}
			<span>{progressIcons.get(status)}</span>
		</ConvertionProgress>
	</ItemWrapper>
);

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

export function createNewConvertion(
	convertInfo: Readonly<ConvertInfo>,
	path: Readonly<Path>
): Readonly<MessagePort> {
	const { convertingList } = getConvertingList();

	dbg("Trying to create a new conversion...", { convertingList });

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
		timeConverted: 0,
		sizeConverted: 0,
		port: myPort,
	};

	setConvertingList({
		convertingList: new Map(convertingList).set(path, convertStatus),
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
				"Received a message from Electron but the path is not in the list!"
			);

		setConvertingList({
			convertingList: new Map(convertingList).set(path, {
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

export const handleOnClose = () => dbg("Closing ports (react port).");

export type MediaBeingConverted = Readonly<{
	status: ProgressProps["status"];
	toExtension: AllowedMedias;
	sizeConverted: number;
	timeConverted: number;
	isConverting: boolean;
	port: MessagePort;
}>;

type ConvertBoxProps = Readonly<{
	mediaBeingConverted: MediaBeingConverted;
	convertionIndex: number;
	path: Path;
}>;

export type ConvertInfo = Readonly<{
	toExtension: AllowedMedias;
	canStartConvert: boolean;
}>;

type NewConvertions = Readonly<{
	newConvertions: ReadonlyMap<Path, ConvertInfo>;
}>;
