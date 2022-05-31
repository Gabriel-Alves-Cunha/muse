import { MdCompareArrows as Convert } from "react-icons/md";
import { useEffect, useState } from "react";

import { PopoverRoot, PopoverContent } from "@components/Popover";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
// This `constRefToEmptyArray` prevents an infinite loop:
// import { constRefToEmptyArray } from "@utils/array";
import { useConvertingList } from "@contexts/convertList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@styles/global";
import { dbg } from "@common/utils";
import {
	useConvertInfoList,
	setConvertInfoList,
	createNewConvert,
	Popup,
} from "./helper";

import { StyledPopoverTrigger, Wrapper } from "../Downloading/styles";
import { PopoverAnchor } from "./styles";

export function Converting() {
	const [isOpen, setIsOpen] = useState(false);
	const convertingListSize = useConvertingList().size;
	const convertInfoList = useConvertInfoList();

	const toggleIsOpen = (newIsOpen: boolean) => setIsOpen(newIsOpen);

	useEffect(() => {
		dbg("on converting list useEffect");

		convertInfoList.forEach((convertInfo, path) => {
			if (convertInfo.canStartConvert)
				try {
					const electronPort = createNewConvert(convertInfo, path);

					// Sending port so we can communicate with electron:
					sendMsgToBackend(
						{
							type: ReactToElectronMessageEnum.CONVERT_MEDIA,
						},
						electronPort,
					);
				} catch (error) {
					errorToast(
						`There was an error trying to download "${path}"! Please, try again later.`,
					);

					console.error(error);
				}
		});

		// Once all downloads are handled, we can remove the values from the list,
		// this also prevents an infinite loop (when it reaches the end, the comparison
		// will be true because of the const reference to the empty array):
		convertInfoList.clear();
		setConvertInfoList(convertInfoList);
	}, [convertInfoList]);

	return (
		<Wrapper>
			<PopoverRoot open={isOpen} onOpenChange={toggleIsOpen}>
				<StyledPopoverTrigger
					className={
						(convertingListSize ? "has-items " : "") + (isOpen ? "active" : "")
					}
					data-tooltip="Show all converting medias"
					tooltip-side="right"
				>
					<i data-length={convertingListSize}></i>

					<Convert size={20} />
				</StyledPopoverTrigger>

				<PopoverAnchor />

				<PopoverContent
					size={
						convertingListSize === 0
							? "nothing-found-for-convertions-or-downloads"
							: "convertions-or-downloads"
					}
				>
					<Popup />
				</PopoverContent>
			</PopoverRoot>
		</Wrapper>
	);
}
