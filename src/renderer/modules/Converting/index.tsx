import type { ConvertInfo } from "@common/@types/typesAndEnums";

import { MdCompareArrows as Convert } from "react-icons/md";
import { useEffect, useState } from "react";
import useTilg from "tilg";
import create, { State, StateCreator } from "zustand";

import { Popover, PopoverContent, PopoverTrigger, Tooltip } from "@components";
import { useConvertingList, createNewConvert, Popup } from "./helper";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
// This `constRefToEmptyArray` prevents an infinite loop:
import { constRefToEmptyArray } from "@utils/array";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@styles/global";

import { TriggerButton, Wrapper } from "../Downloading/styles";

type LoggerImpl = <T extends State>(
	f: PopArgument<StateCreator<T, [], []>>,
	name?: string
) => PopArgument<StateCreator<T, [], []>>;

type PopArgument<T extends (...a: never[]) => unknown> = T extends (
	...a: [...infer A, infer _]
) => infer R
	? (...a: A) => R
	: never;

// TODO: see about a middleware that does: `store.setState = loggedSet;`
const logger: LoggerImpl = (fn, name) => (set, get, store) => {
	const loggedSet: typeof set = (...a) => {
		console.log("previous:", ...(name ? [`${name}:`] : []), get());
		console.log(a);
		set(a[0], true);
		console.log("now:", ...(name ? [`${name}:`] : []), ...a, get());
		console.log("isArray:", Array.isArray(get()));
	};

	store.setState = loggedSet;

	return fn(loggedSet, get, store);
};

const fixBugThatSetsItToAnObject = logger;

export const useConvertInfoList = create<ConvertInfoList>(
	fixBugThatSetsItToAnObject((set, get, store) => [], "convertInfoList")
);
export const { setState: setConvertInfoList } = useConvertInfoList;

export function Converting() {
	const [isOpen, setIsOpen] = useState(false);
	const convertInfoList = useConvertInfoList();
	const convertingList = useConvertingList();

	const toggleIsOpen = (isOpen: boolean) => setIsOpen(!isOpen);

	useTilg();

	useEffect(() => {
		convertInfoList.forEach(convertInfo => {
			if (convertInfo.canStartConvert)
				try {
					const electronPort = createNewConvert(convertInfo);

					// Sending port so we can communicate with electron:
					sendMsgToBackend(
						{
							type: ReactToElectronMessageEnum.CONVERT_MEDIA,
						},
						electronPort
					);
				} catch (error) {
					errorToast(
						`There was an error trying to download "${convertInfo.path}"! Please, try again later.`
					);

					console.error(error);
				}
		});

		// Once all downloads are handled, we can remove the values from the list,
		// this also prevents an infinite loop (when it reaches the end, the comparison
		// will be true because of the const reference to the empty array):
		setConvertInfoList(constRefToEmptyArray);
	}, [convertInfoList]);

	return (
		<Wrapper>
			<Popover open={isOpen} onOpenChange={toggleIsOpen}>
				<PopoverTrigger>
					<Tooltip text="Show all converting medias" arrow={false} side="right">
						<TriggerButton
							className={
								(convertingList.length ? "has-downloads " : "") +
								(isOpen ? "active" : "")
							}
						>
							<i data-length={convertingList.length}></i>

							<Convert size={20} />
						</TriggerButton>
					</Tooltip>
				</PopoverTrigger>

				<PopoverContent size="large">
					<Popup />
				</PopoverContent>
			</Popover>
		</Wrapper>
	);
}

type ConvertInfoList = readonly ConvertInfo[];

Converting.whyDidYouRender = {
	customName: "Converting",
};
