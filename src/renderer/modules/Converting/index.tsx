import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { Mutable, Path } from "@common/@types/typesAndEnums";

import { useEffect, useReducer, useRef } from "react";
import { AiOutlineClose as Cancel } from "react-icons/ai";
import { toast } from "react-toastify";
import create from "zustand";

import { type ProgressProps, Status, icon } from "@components/Progress";
import { reaplyOrderedIndex } from "@contexts/mediaHandler/usePlaylistsHelper";
import { assertUnreachable } from "@utils/utils";
import { useOnClickOutside } from "@hooks";
import { remove, replace } from "@utils/array";
import { usePlaylists } from "@contexts/mediaHandler/usePlaylists";
import { getBasename } from "@common/utils";
import { prettyBytes } from "@common/prettyBytes";
import {
	useConvertValues,
	Type as MsgType,
	ConvertValues,
	sendMsg,
} from "@contexts/communicationBetweenChildren/helpers";

import { Circle, Popup, Progress, Title } from "./styles";

const useConvertList = create<{ convertList: MediaBeingConverted[] }>(() => ({
	convertList: [],
}));

const { getState: getConvertValues } = useConvertValues;
const { setState: setConvertList } = useConvertList;
const { getState: getPlaylists } = usePlaylists;

function useConverting() {
	const { searchLocalComputerForMedias } = getPlaylists();
	const { convertList } = useConvertList();
	const convertValues = getConvertValues().convertValues;

	function createNewConvert(values: ConvertValues): MessagePort {
		const indexIfThereIsOneAlready = convertList.findIndex(
			({ path }) => path === values.path,
		);
		if (indexIfThereIsOneAlready !== -1) {
			const info = `There is already one convert of "${values.path}"!`;

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

		// MessageChannels are lightweight, it's cheap to create
		// a new one for each request.
		const { port1: myPort, port2: electronPort } = new MessageChannel();

		const convertStatus: MediaBeingConverted = {
			toExtension: values.toExtension,
			index: convertList.length,
			status: Status.ACTIVE,
			isConverting: true,
			timeConverted: "",
			path: values.path,
			sizeConverted: 0,
			port: myPort,
		};

		setConvertList({ convertList: [...convertList, convertStatus] });

		myPort.postMessage({
			toExtension: convertStatus.toExtension,
			path: convertStatus.path,
			// ^ On every `postMessage` you have to send the path (as an ID)!
			canStartConvert: true,
		});

		myPort.onmessage = ({ data }: { data: Partial<MediaBeingConverted> }) => {
			// dbg("myPort msg received =", data);
			setConvertList({
				convertList: replace(convertList, convertStatus.index, {
					...convertStatus,
					...data,
				}) as Mutable<MediaBeingConverted[]>,
			});

			switch (data.status) {
				case Status.FAIL: {
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

				case Status.SUCCESS: {
					toast.success(`Download of "${convertStatus.path}" succeded!`, {
						hideProgressBar: false,
						position: "top-right",
						progress: undefined,
						closeOnClick: true,
						pauseOnHover: true,
						autoClose: 5000,
						draggable: true,
					});

					(async () => await searchLocalComputerForMedias(true))();
					break;
				}

				case Status.CANCEL: {
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

				case Status.ACTIVE:
					break;

				case undefined:
					break;

				case Status.CONVERT:
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

	function cancelDownloadAndOrRemoveItFromList(path_: string) {
		const index = convertList.findIndex(({ path }) => path === path_);
		if (index === -1) {
			console.error(
				`There should be a download with path "${path_}"!\nconvertList =`,
				convertList,
			);
			return;
		}

		const convert = convertList[index];

		if (convert.isConverting)
			convert.port.postMessage({ destroy: true, path: convert.path });

		setConvertList({
			convertList: reaplyOrderedIndex(remove(convertList, index)),
		});
	}

	useEffect(() => {
		convertValues.forEach(convertValue => {
			if (convertValue.canStartConvert) {
				try {
					const electronPort = createNewConvert(convertValue);

					// Sending port so we can communicate with electron:
					window.postMessage("convert media", "*", [electronPort]);
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
			}
		});

		// This way to prevent infinite updates:
		if (convertValues[0]) sendMsg({ type: MsgType.RESET_CONVERT_VALUES });
		// We have to do this to reset downloadValues ^
		// so that it is ready for a new media convertion!

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [convertValues]);

	return [convertList, cancelDownloadAndOrRemoveItFromList] as const;
}

export function Converting() {
	const [convertList, cancelDownloadAndOrRemoveItFromList] = useConverting();
	const [showPopup, toggleShowPopup] = useReducer(prev => !prev, false);
	const popupRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(popupRef, () => toggleShowPopup());

	return convertList.length > 0 ? (
		<>
			<Circle onClick={toggleShowPopup}>{icon(Status.CONVERT)}</Circle>

			{showPopup && (
				<Popup ref={popupRef}>
					{convertList.map(convert => (
						<div key={convert.path}>
							<Title>
								<p>{getBasename(convert.path) + "." + convert.toExtension}</p>

								<span>
									<Cancel
										onClick={() =>
											cancelDownloadAndOrRemoveItFromList(convert.path)
										}
										color="#777"
										size={13}
									/>
								</span>
							</Title>

							<Progress>
								<table>
									<tbody>
										<tr>
											<td>Seconds/size converted:</td>
											<td>{format(convert.timeConverted)}s</td>
											<td>&nbsp;{prettyBytes(convert.sizeConverted)}</td>
										</tr>
									</tbody>
								</table>
							</Progress>
						</div>
					))}
				</Popup>
			)}
		</>
	) : null;
}

const format = (str: string) => str.slice(0, str.lastIndexOf("."));

type MediaBeingConverted = Readonly<{
	toExtension: ExtensionToBeConvertedTo;
	status: ProgressProps["status"];
	sizeConverted: number;
	timeConverted: string;
	isConverting: boolean;
	port: MessagePort;
	index: number;
	path: Path;
}>;
