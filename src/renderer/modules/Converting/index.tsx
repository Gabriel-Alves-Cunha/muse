import { MdCompareArrows as Convert } from "react-icons/md";
import { useEffect, useState } from "react";

import { PopoverRoot, PopoverContent, Tooltip } from "@components";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
// This `constRefToEmptyArray` prevents an infinite loop:
import { constRefToEmptyArray } from "@utils/array";
import { useConvertingList } from "@contexts";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@styles/global";
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

Converting.whyDidYouRender = {
	customName: "Converting",
};
