import type { State, StateCreator } from "zustand";
import type { Path, ConvertInfo } from "@common/@types/typesAndEnums";
import type { ProgressProps } from "@components/Progress";

import { AiOutlineClose as Cancel } from "react-icons/ai";
import create from "zustand";

import { errorToast, infoToast, successToast } from "@styles/global";
import { type AllowedMedias, getBasename } from "@common/utils";
import { assertUnreachable } from "@utils/utils";
import { remove, replace } from "@utils/array";
import { ProgressStatus } from "@common/@types/typesAndEnums";
import { prettyBytes } from "@common/prettyBytes";
import { Tooltip } from "@components";

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
		const loggedSet: typeof set = (...a) => {
			// console.log("previous:", ...(name ? [`${name}:`] : []), get());
			// console.log(a);
			// This true is to replace it instead of updating:
			set(a[0], true);
			// console.log("now:", ...(name ? [`${name}:`] : []), ...a, get());
			// console.log("isArray:", Array.isArray(get()));
		};

		store.setState = loggedSet;

		return fn(loggedSet, get, store);
	};

export const useConvertInfoList = create<ConvertInfoList>(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	fixBugThatSetsItToAnObject((_set, _get, _store) => [])
);
export const { setState: setConvertInfoList } = useConvertInfoList;

export const Popup = () => {
	const convertingList = useConvertingList();

	return (
		<>
			{convertingList.length > 0 ? (
				convertingList.map(m => (
					<ConvertBox mediaBeingConverted={m} key={m.path} />
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

export const useConvertingList = create<ConvertList>(
	() => []
	// new Array(10).fill(testConvertingMedia)
);
const { setState: setConvertingList, getState: getConvertingList } =
	useConvertingList;

export function createNewConvert(convertInfo: ConvertInfo): MessagePort {
	const convertingList = getConvertingList();

	{
		const indexIfThereIsOneAlready = convertingList.findIndex(
			c => c.path === convertInfo.path
		);
		if (indexIfThereIsOneAlready !== -1) {
			const info = `There is already one convert of "${convertInfo.path}"!`;

			infoToast(info);

			console.error(info, convertingList);
			throw new Error(info);
		}
	}

	// MessageChannels are lightweight, it's cheap to create
	// a new one for each request.
	const { port1: myPort, port2: electronPort } = new MessageChannel();

	const convertStatus: MediaBeingConverted = {
		toExtension: convertInfo.toExtension,
		status: ProgressStatus.ACTIVE,
		path: convertInfo.path,
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
		const convertingList = getConvertingList();

		// Assert that the download exists:
		const indexToSeeIfDownloadExists = convertingList.findIndex(
			d => d.path === convertStatus.path
		);
		const doesDownloadExists = indexToSeeIfDownloadExists !== -1;

		if (!doesDownloadExists) {
			console.warn(
				"Received a message from Electron but the path is not in the list",
				{ data, convertList: convertingList },
				"Creating it..."
			);

			setConvertingList([...convertingList, convertStatus]);
		}

		const index = doesDownloadExists
			? indexToSeeIfDownloadExists
			: convertingList.length;

		setConvertingList(
			replace(convertingList, index, {
				...convertStatus,
				...data, // new data will override old ones.
			})
		);

		switch (data.status) {
			case ProgressStatus.FAIL: {
				// @ts-ignore ^ In this case, `data` include an `error: Error` key.
				console.assert(data.error);
				console.error((data as typeof data & { error: Error }).error);

				errorToast(`Download of "${convertStatus.path}" failed!`);

				cancelDownloadAndOrRemoveItFromList(convertStatus.path);
				break;
			}

			case ProgressStatus.SUCCESS: {
				successToast(`Download of "${convertStatus.path}" succeded!`);

				cancelDownloadAndOrRemoveItFromList(convertStatus.path);
				break;
			}

			case ProgressStatus.CANCEL: {
				infoToast(`Download of "${convertStatus.path}" was cancelled!`);

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
	myPort.onclose = handleOnClose;

	myPort.start();

	return electronPort;
}

const cancelDownloadAndOrRemoveItFromList = (mediaPath: string) => {
	const convertingList = getConvertingList();

	const mediaBeingConvertedIndex = convertingList.findIndex(
		c => c.path === mediaPath
	);

	{
		if (mediaBeingConvertedIndex === -1)
			return console.error(
				`There should be a conversion with path "${mediaPath}"!\nconvertList =`,
				convertingList
			);
	}

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const mediaBeingConverted = convertingList[mediaBeingConvertedIndex]!;

	// Cancel conversion
	if (mediaBeingConverted.isConverting)
		mediaBeingConverted.port.postMessage({
			path: mediaBeingConverted.path,
			destroy: true,
		});

	setConvertingList(remove(convertingList, mediaBeingConvertedIndex));
};

const format = (str: string) => str.slice(0, str.lastIndexOf("."));

export const handleOnClose = () => console.log("Closing ports (react port).");

type MediaBeingConverted = Readonly<{
	status: ProgressProps["status"];
	toExtension: AllowedMedias;
	sizeConverted: number;
	timeConverted: string;
	isConverting: boolean;
	port: MessagePort;
	path: Path;
}>;

type ConvertList = readonly MediaBeingConverted[];

type ConvertBoxProps = Readonly<{
	mediaBeingConverted: MediaBeingConverted;
}>;

type ConvertInfoList = readonly ConvertInfo[];
