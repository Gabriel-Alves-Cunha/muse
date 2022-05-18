import type { State, StateCreator } from "zustand";
import type { ProgressProps } from "@components/Progress";
import type { Path } from "@common/@types/generalTypes";

import { AiOutlineClose as Cancel } from "react-icons/ai";
import create from "zustand";

import { type AllowedMedias, getBasename, dbg } from "@common/utils";
import { errorToast, infoToast, successToast } from "@styles/global";
import { ConvertInfo, ProgressStatus } from "@common/enums";
import { assertUnreachable } from "@utils/utils";
import { convertingList } from "@contexts/convertList";
import { prettyBytes } from "@common/prettyBytes";
import { Tooltip } from "@components/Tooltip";

import { TitleAndCancelWrapper, Content } from "../Downloading/styles";
import { ConvertionProgress } from "./styles";

/**
 * I'm doing all this turnaround because for some reason
 * when I set `useConvertInfoList` to an empty array, it
 * changes it to an Object... I don't know why, maybe it
 * has something to do with the fact that the `set` fn
 * changes it partialy, so much so that the fix is just
 * `set(a[0], true);`, the `true` is to replace it instead
 * of updating.
 */
type BugFixImpl = <T extends State>(
	f: PopArgument<StateCreator<T, [], []>>,
	name?: string
) => PopArgument<StateCreator<T, [], []>>;

type PopArgument<T extends (...a: never[]) => unknown> = T extends (
	...a: [...infer A, infer _]
) => infer R
	? (...a: A) => R
	: never;

const fixBugThatSetsItToAnObject: BugFixImpl =
	(fn /*, name */) => (set, get, store) => {
		const fixedSetState: typeof set = (...a) => {
			// console.log("previous:", ...(name ? [`${name}:`] : []), get());
			// console.log(a);
			// This true is to replace it instead of updating:
			set(a[0], true);
			// console.log("now:", ...(name ? [`${name}:`] : []), ...a, get());
			// console.log("isArray:", Array.isArray(get()));
		};

		store.setState = fixedSetState;

		return fn(fixedSetState, get, store);
	};

export const useConvertInfoList = create<ConvertInfoList>(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	fixBugThatSetsItToAnObject((_set, _get, _store) => [])
);
export const { setState: setConvertInfoList } = useConvertInfoList;

export const Popup = () => {
	const convertingList_ = convertingList();

	return (
		<>
			{convertingList_.size > 0 ? (
				Array.from(convertingList_.entries()).map(([path, m]) => (
					<ConvertBox mediaBeingConverted={{ ...m, path }} key={path} />
				))
			) : (
				<p>No conversions in progress!</p>
			)}
		</>
	);
};

export const ConvertBox = ({
	mediaBeingConverted: { path, toExtension, timeConverted, sizeConverted },
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

export function createNewConvert(convertInfo: ConvertInfo): MessagePort {
	const convertingList_ = convertingList();

	dbg("Trying to create a new conversion...", { convertingList_ });

	if (convertingList_.has(convertInfo.path)) {
		const info = `There is already one convert of "${convertInfo.path}"!`;

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

	convertingList_.set(convertInfo.path, convertStatus);

	myPort.postMessage({
		toExtension: convertStatus.toExtension,
		path: convertInfo.path,
		// ^ On every `postMessage` you have to send the path (as an ID)!
		canStartConvert: true,
	});

	myPort.onmessage = ({ data }: { data: Partial<MediaBeingConverted> }) => {
		const convertingList_ = convertingList();

		dbg(`Received a message from Electron on port for "${convertInfo.path}":`, {
			convertingList_,
			data,
		});

		// Assert that the download exists:
		if (!convertingList_.has(convertInfo.path)) {
			return console.error(
				"Received a message from Electron but the path is not in the list!"
			);
		}

		convertingList_.set(convertInfo.path, {
			...convertStatus,
			...data,
		});

		switch (data.status) {
			case ProgressStatus.FAILED: {
				// @ts-ignore ^ In this case, `data` include an `error: Error` key.
				console.assert(data.error, "data.error should exist!");
				console.error((data as typeof data & { error: Error }).error);

				errorToast(`Download of "${convertInfo.path}" failed!`);

				cancelDownloadAndOrRemoveItFromList(convertInfo.path);
				break;
			}

			case ProgressStatus.SUCCESS: {
				successToast(`Download of "${convertInfo.path}" succeded!`);

				cancelDownloadAndOrRemoveItFromList(convertInfo.path);
				break;
			}

			case ProgressStatus.CANCEL: {
				infoToast(`Download of "${convertInfo.path}" was cancelled!`);

				cancelDownloadAndOrRemoveItFromList(convertInfo.path);
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
	mediaBeingConverted: MediaBeingConverted & { path: Path };
}>;

type ConvertInfoList = readonly ConvertInfo[];
