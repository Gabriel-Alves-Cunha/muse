import { MdCompareArrows as Convert } from "react-icons/md";
import { useEffect, useState } from "react";

import { useNewConvertions, createNewConvertion, Popup } from "./helper";
import { PopoverRoot, PopoverContent } from "@components/Popover";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { useConvertingList } from "@contexts/convertList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@styles/global";
import { emptyMap } from "@utils/map-set";

import { StyledPopoverTrigger } from "../Downloading/styles";
import { PopoverAnchor } from "./styles";

export function Converting() {
	const convertingListSize = useConvertingList().convertingList.size;
	const { newConvertions } = useNewConvertions();
	const [isOpen, setIsOpen] = useState(false);

	const toggleIsOpen = (newIsOpen: boolean) => setIsOpen(newIsOpen);

	useEffect(() => {
		newConvertions.forEach((newConvertion, path) => {
			console.log("inside forEach newConvertion:", { newConvertion, path });
			if (newConvertion.canStartConvert)
				try {
					const electronPort = createNewConvertion(newConvertion, path);

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
		if (newConvertions.size !== 0)
			useNewConvertions.setState({ newConvertions: emptyMap });
	}, [newConvertions]);

	return (
		<PopoverRoot open={isOpen} onOpenChange={toggleIsOpen}>
			<StyledPopoverTrigger
				className={convertingListSize ? "has-items " : ""}
				data-tip="Show all converting medias"
			>
				<span data-length={convertingListSize}></span>

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
