import { MdCompareArrows as Convert } from "react-icons/md";
import { useEffect, useState } from "react";

import { PopoverRoot, PopoverContent } from "@components/Popover";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { useConvertingList } from "@contexts/convertList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@styles/global";
import {
	useConvertInfoList,
	setConvertInfoList,
	createNewConvert,
	Popup,
} from "./helper";

import { StyledPopoverTrigger } from "../Downloading/styles";
import { PopoverAnchor } from "./styles";

export function Converting() {
	const convertingListSize = useConvertingList().convertingList.size;
	const { convertInfoList } = useConvertInfoList();
	const [isOpen, setIsOpen] = useState(false);

	const toggleIsOpen = (newIsOpen: boolean) => setIsOpen(newIsOpen);

	useEffect(() => {
		console.log("inside Converting useEffect");

		convertInfoList.forEach((convertInfo, path) => {
			if (convertInfo.canStartConvert)
				try {
					const electronPort = createNewConvert(convertInfo, path);

					// Sending port so we can communicate with electron:
					sendMsgToBackend(
						{ type: ReactToElectronMessageEnum.CONVERT_MEDIA },
						electronPort,
					);
				} catch (error) {
					errorToast(
						`There was an error trying to convert "${path}"! Please, try again later.`,
					);

					console.error(error);
				}
		});

		// In here, we've already handled all the files, so we can clear the list:
		if (convertInfoList.size !== 0) {
			convertInfoList.clear();
			setConvertInfoList({ convertInfoList });
		}
	}, [convertInfoList]);

	return (
		<PopoverRoot open={isOpen} onOpenChange={toggleIsOpen}>
			<StyledPopoverTrigger
				className={convertingListSize ? "has-items " : ""}
				data-tooltip="Show all converting medias"
				tooltip-side="right"
			>
				<p data-length={convertingListSize}></p>

				<Convert size={20} />
			</StyledPopoverTrigger>

			<PopoverAnchor />

			<PopoverContent
				size={convertingListSize === 0 ?
					"nothing-found-for-convertions-or-downloads" :
					"convertions-or-downloads"}
				alignOffset={14}
			>
				<Popup />
			</PopoverContent>
		</PopoverRoot>
	);
}
