import { MdCompareArrows as Convert } from "react-icons/md";
import { useEffect, useState } from "react";

import { useNewConvertions, createNewConvertion, Popup } from "./helper";
import { PopoverRoot, PopoverContent } from "@components/Popover";
import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { useConvertingList } from "@contexts/convertList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@styles/global";
import { emptyMap } from "@utils/map-set";
import { time } from "@utils/utils";

import { StyledPopoverTrigger } from "../Downloading/styles";
import { PopoverAnchor } from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const convertingListSizeSelector = (
	state: ReturnType<typeof useConvertingList.getState>,
) => state.convertingList.size;

export function Converting() {
	const convertingListSize = useConvertingList(convertingListSizeSelector);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const { newConvertions } = useNewConvertions();

	useEffect(() => {
		newConvertions.forEach((newConvertion, path) => {
			try {
				const electronPort = time(
					() => createNewConvertion(newConvertion, path),
					`createNewConvertion("${path}")`,
				);

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

		// In here, we've already handled all the files,
		// so we can clear the list;
		// We need the check to prevent an infinite loop.
		if (newConvertions.size !== 0)
			useNewConvertions.setState({ newConvertions: emptyMap });
	}, [newConvertions]);

	return (
		<PopoverRoot open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
				alignOffset={140}
			>
				<Popup />
			</PopoverContent>
		</PopoverRoot>
	);
}
