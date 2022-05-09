import type { State, StateCreator } from "zustand";
import type { ConvertInfo } from "@common/@types/typesAndEnums";

import { MdCompareArrows as Convert } from "react-icons/md";
import { useEffect, useState } from "react";
import create from "zustand";

import { useConvertingList, createNewConvert, Popup } from "./helper";
import { PopoverRoot, PopoverContent, Tooltip } from "@components";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
// This `constRefToEmptyArray` prevents an infinite loop:
import { constRefToEmptyArray } from "@utils/array";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@styles/global";

import { StyledPopoverTrigger, Wrapper } from "../Downloading/styles";
import { PopoverAnchor } from "./styles";

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

export function Converting() {
	const [isOpen, setIsOpen] = useState(false);
	const convertInfoList = useConvertInfoList();
	const convertingList = useConvertingList();

	const toggleIsOpen = (newIsOpen: boolean) => setIsOpen(newIsOpen);

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
			<PopoverRoot open={isOpen} onOpenChange={toggleIsOpen}>
				<Tooltip text="Show all converting medias" side="right">
					<StyledPopoverTrigger
						className={
							(convertingList.length ? "has-items " : "") +
							(isOpen ? "active" : "")
						}
					>
						<i data-length={convertingList.length}></i>

						<Convert size={20} />
					</StyledPopoverTrigger>
				</Tooltip>

				<PopoverAnchor />

				<PopoverContent
					size={
						convertingList.length === 0
							? "nothingFoundForConvertionsOrDownloads"
							: "convertionsOrDownloads"
					}
				>
					<Popup />
				</PopoverContent>
			</PopoverRoot>
		</Wrapper>
	);
}

type ConvertInfoList = readonly ConvertInfo[];

Converting.whyDidYouRender = {
	customName: "Converting",
};
