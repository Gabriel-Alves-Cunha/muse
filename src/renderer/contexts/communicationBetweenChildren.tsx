import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { ReactNode } from "react";
import type { Path } from "@common/@types/typesAndEnums";

import { createContext, useContext, useEffect, useState } from "react";

import { assertUnreachable } from "@utils/utils";
import { TypeOfMsgObject } from "@common/@types/typesAndEnums";
import { dbg } from "@common/utils";
const {
	notificationApi: { receiveMsgFromElectron },
} = electron;

const Comm_Context = createContext({} as Comm_ContextProps);

function Comm_Provider({ children }: { children: ReactNode }) {
	const [downloadValues, setDownloadValues] = useState(defaultDownloadValues);
	const [convertValues, setConvertValues] = useState<ConvertValues[]>([]);

	function sendMsg(action: Action) {
		switch (action.type) {
			case Type.START_DOWNLOAD: {
				setDownloadValues({
					imageURL: action.value.imageURL,
					title: action.value.title,
					canStartDownload: true,
					url: action.value.url,
				});

				break;
			}

			case Type.RESET_DOWNLOAD_VALUES: {
				setDownloadValues(defaultDownloadValues);
				break;
			}

			case Type.RESET_CONVERT_VALUES: {
				setConvertValues([]);
				break;
			}

			case Type.START_CONVERT: {
				setConvertValues(
					action.value.map(values => ({
						toExtension: values.toExtension,
						canStartConvert: true,
						path: values.path,
					})),
				);
				break;
			}

			default: {
				assertUnreachable(action);
				break;
			}
		}
	}

	const handleDownloadMedia = (value: DownloadValues) =>
		sendMsg({ type: Type.START_DOWNLOAD, value });

	useEffect(() => {
		receiveMsgFromElectron(object => {
			dbg(
				"Received 'async-msg' from Electron on React side.\nObject =",
				object,
			);

			switch (object.type) {
				case TypeOfMsgObject.DOWNLOAD_MEDIA: {
					handleDownloadMedia(object.params);
					break;
				}

				default: {
					console.error(
						"This 'async-msg' event has no receiver function!\nobject =",
						object,
					);
					break;
				}
			}
		});
	}, []);

	return (
		<Comm_Context.Provider
			value={{ values: { downloadValues, convertValues }, sendMsg }}
		>
			{children}
		</Comm_Context.Provider>
	);
}

const useInterComm = () => {
	const context = useContext(Comm_Context);

	if (!context)
		throw new Error("`useComm` must be used within a `<Comm_Provider>`");

	return context;
};

export { useInterComm, Comm_Provider };

Comm_Provider.whyDidYouRender = {
	customName: "Comm_Provider",
	logOnDifferentValues: false,
};

const defaultDownloadValues: DownloadValues = Object.freeze({
	canStartDownload: false,
	imageURL: "",
	title: "",
	url: "",
});

export type ConvertValues = Readonly<{
	toExtension: ExtensionToBeConvertedTo;
	canStartConvert: boolean;
	path: Path;
}>;

type Comm_ContextProps = Readonly<{
	values: {
		convertValues: readonly ConvertValues[];
		downloadValues: DownloadValues;
	};
	sendMsg(action: Action): void;
}>;

export type DownloadValues = Readonly<{
	canStartDownload: boolean;
	imageURL: string;
	title: string;
	url: string;
}>;

type Action =
	| Readonly<{ type: Type.START_CONVERT; value: readonly ConvertValues[] }>
	| Readonly<{ type: Type.START_DOWNLOAD; value: DownloadValues }>
	| Readonly<{ type: Type.RESET_DOWNLOAD_VALUES }>
	| Readonly<{ type: Type.RESET_CONVERT_VALUES }>;

export enum Type {
	RESET_DOWNLOAD_VALUES,
	RESET_CONVERT_VALUES,
	START_DOWNLOAD,
	START_CONVERT,
}
