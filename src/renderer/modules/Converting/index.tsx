import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { Path, ConvertValues } from "@common/@types/typesAndEnums";
import type { ProgressProps } from "@components/Progress";

import { useEffect, useRef, useState } from "react";
import { MdCompareArrows as Convert } from "react-icons/md";
import { AiOutlineClose as Cancel } from "react-icons/ai";
import { toast } from "react-toastify";
import create from "zustand";

import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { assertUnreachable } from "@utils/utils";
import { useOnClickOutside } from "@hooks";
import { remove, replace } from "@utils/array";
import { ProgressStatus } from "@common/@types/typesAndEnums";
import { usePlaylists } from "@contexts";
import { getBasename } from "@common/utils";
import { prettyBytes } from "@common/prettyBytes";

import { Trigger, Wrapper, Popup, Title } from "../Downloading/styles";
import { ConvertionProgress } from "./styles";

const useConvertList = create<
	Readonly<{ convertList: readonly MediaBeingConverted[] }>
>(() => ({
	convertList: [],
}));

export const useConvertValues = create<{
	convertValues: readonly ConvertValues[];
}>(() => ({
	convertValues: [],
}));

// This prevents an infinite loop:
const constRefToEmptyArray = Object.freeze([]);

const { setState: setConvertValues } = useConvertValues;

export function Converting() {
	const [showPopup, setShowPopup] = useState(false);
	const { convertValues } = useConvertValues();

	const popupRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(popupRef, () => setShowPopup(false));

	useEffect(() => {
		convertValues.forEach(convertValue => {
			if (convertValue.canStartConvert)
				try {
					const electronPort = createNewConvert(convertValue);

					// Sending port so we can communicate with electron:
					window.postMessage(ReactToElectronMessageEnum.CONVERT_MEDIA, "*", [
						electronPort,
					]);
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
			<Trigger
				onClick={() => setShowPopup(prev => !prev)}
				className={showPopup ? "active" : ""}
			>
				<Convert size="20" />
			</Trigger>

			{showPopup && <Popup_ />}
		</Wrapper>
	);
}

const Popup_ = () => {
	const { convertList } = useConvertList();

	return (
		<Popup>
			{convertList.map(m => (
				<ConvertBox mediaBeingConverted={m} key={m.path} />
			))}
		</Popup>
	);
};

const ConvertBox = ({
	mediaBeingConverted,
}: {
	mediaBeingConverted: MediaBeingConverted;
}) => (
	<div>
		<Title>
			<p>
				{getBasename(mediaBeingConverted.path) +
					"." +
					mediaBeingConverted.toExtension}
			</p>

			<span>
				<Cancel
					onClick={() =>
						cancelDownloadAndOrRemoveItFromList(mediaBeingConverted.path)
					}
					color="#777"
					size={13}
				/>
			</span>
		</Title>

		<ConvertionProgress>
			<table>
				<tbody>
					<tr>
						<td>Seconds/size converted:</td>
						<td>{format(mediaBeingConverted.timeConverted)}s</td>
						<td>&nbsp;{prettyBytes(mediaBeingConverted.sizeConverted)}</td>
					</tr>
				</tbody>
			</table>
		</ConvertionProgress>
	</div>
);

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const { setState: setConvertList, getState: getConvertList } = useConvertList;
const { getState: getPlaylistsFunctions } = usePlaylists;

function createNewConvert(convertValues: ConvertValues): MessagePort {
	{
		const indexIfThereIsOneAlready = getConvertList().convertList.findIndex(
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

			console.error(info, getConvertList().convertList);
			throw new Error(info);
		}
	}

	// MessageChannels are lightweight, it's cheap to create
	// a new one for each request.
	const { port1: myPort, port2: electronPort } = new MessageChannel();

	const convertStatus: MediaBeingConverted = {
		toExtension: convertValues.toExtension,
		status: ProgressStatus.ACTIVE,
		isConverting: true,
		timeConverted: "",
		path: convertValues.path,
		sizeConverted: 0,
		port: myPort,
	};

	setConvertList({
		convertList: [...getConvertList().convertList, convertStatus],
	});

	myPort.postMessage({
		toExtension: convertStatus.toExtension,
		path: convertStatus.path,
		// ^ On every `postMessage` you have to send the path (as an ID)!
		canStartConvert: true,
	});

	myPort.onmessage = ({ data }: { data: Partial<MediaBeingConverted> }) => {
		// dbg("myPort msg received =", data);
		const convertList = getConvertList().convertList;

		const index = convertList.findIndex(c => c.path === data.path);

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

				(async () =>
					await getPlaylistsFunctions().searchLocalComputerForMedias(true))();
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

	return electronPort;
}

function cancelDownloadAndOrRemoveItFromList(mediaPath: string) {
	const convertList = getConvertList().convertList;

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
		convertList: remove(getConvertList().convertList, mediaBeingConvertedIndex),
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
