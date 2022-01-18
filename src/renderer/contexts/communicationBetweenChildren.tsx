import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { ReactNode } from "react";
import type { Path } from "@common/@types/types";

import { createContext, useContext, useEffect, useState } from "react";

import { assertUnreachable } from "@utils/utils";
import { dbg } from "@common/utils";
const {
	notificationApi: { receiveMsgFromElectron },
} = electron;

const Comm_Context = createContext({} as Comm_ContextProps);

function Comm_Provider({ children }: { children: ReactNode }) {
	const [downloadValues, setDownloadValues] = useState(defaultDownloadValues);
	const [convertValues, setConvertValues] = useState<ConvertValues[]>([]);

	function sendMsg(action: Action) {
		const { type } = action;

		switch (type) {
			case "startDownload": {
				setDownloadValues({
					imageURL: action.value.imageURL,
					title: action.value.title,
					canStartDownload: true,
					url: action.value.url,
				});

				break;
			}

			case "resetDownloadValues": {
				setDownloadValues(defaultDownloadValues);

				break;
			}

			case "resetConvertValues": {
				setConvertValues([]);

				break;
			}

			case "startConvert": {
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
				assertUnreachable(type);
				break;
			}
		}
	}

	const handleDownloadMedia = (value: DownloadValues) =>
		sendMsg({ type: "startDownload", value });

	useEffect(() => {
		receiveMsgFromElectron(object => {
			dbg(
				"Received 'async-msg' from Electron on React side.\nObject =",
				object,
			);

			switch (object.type) {
				case "download media": {
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

const defaultDownloadValues: DownloadValues = {
	canStartDownload: false,
	imageURL: "",
	title: "",
	url: "",
};

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
	| Readonly<{ type: "startConvert"; value: readonly ConvertValues[] }>
	| Readonly<{ type: "startDownload"; value: DownloadValues }>
	| Readonly<{ type: "resetDownloadValues" }>
	| Readonly<{ type: "resetConvertValues" }>;
