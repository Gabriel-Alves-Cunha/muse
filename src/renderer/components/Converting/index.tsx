import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { ProgressProps } from "../Progress";
import type { Path } from "@common/@types/types";

import { useEffect, useReducer, useRef, useState } from "react";
import { AiOutlineClose as Cancel } from "react-icons/ai";
import { toast } from "react-toastify";

import { reaplyOrderedIndex } from "@renderer/contexts/mediaHandler/usePlaylistsHelper";
import { assertUnreachable } from "@utils/utils";
import { useOnClickOutside } from "@hooks";
import { useMediaHandler } from "@renderer/contexts/mediaHandler";
import { remove, replace } from "@utils/array";
import { getBasename } from "@common/utils";
import { prettyBytes } from "@common/prettyBytes";
import { icon } from "../Progress";
import {
	ConvertValues,
	useInterComm,
} from "@contexts/communicationBetweenChildren";

import { Circle, Popup, Progress, Title } from "./styles";

export function Converting() {
	const {
		functions: { searchLocalComputerForMedias },
	} = useMediaHandler();
	const {
		values: { convertValues },
		sendMsg,
	} = useInterComm();

	const [showPopup, toggleShowPopup] = useReducer(prev => !prev, false);
	const popupRef = useRef<HTMLDivElement>(null);
	const [convertList, setConvertList] = useState(
		[] as readonly MediaBeingConverted[],
	);

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
			isConverting: true,
			timeConverted: "",
			path: values.path,
			sizeConverted: 0,
			status: "active",
			port: myPort,
		};

		setConvertList(prev => [...prev, convertStatus]);

		myPort.postMessage({
			toExtension: convertStatus.toExtension,
			path: convertStatus.path,
			// ^ On every `postMessage` you have to send the path (as an ID)!
			canStartConvert: true,
		});

		myPort.onmessage = ({ data }: { data: Partial<MediaBeingConverted> }) => {
			// dbg("myPort msg received =", data);

			setConvertList(prev =>
				replace(prev, convertStatus.index, {
					...convertStatus,
					...data,
				}),
			);

			switch (data.status) {
				case "fail": {
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

				case "success": {
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

				case "cancel": {
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

				case "active":
					break;

				case undefined:
					break;

				default:
					assertUnreachable(data.status);
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

		setConvertList(prev => reaplyOrderedIndex(remove(prev, index)));
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
		if (convertValues[0]) sendMsg({ type: "resetConvertValues" });
		// We have to do this to reset downloadValues ^
		// so that it is ready for a new media convertion!

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [convertValues]);

	useOnClickOutside(popupRef, () => toggleShowPopup());

	return convertList.length > 0 ? (
		<>
			<Circle onClick={toggleShowPopup}>{icon("convert")}</Circle>

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
