import { MdCompareArrows as Convert } from "react-icons/md";
import { useEffect, useState } from "react";
import { Trigger } from "@radix-ui/react-popover";

import { useNewConvertions, createNewConvertion, Popup } from "./helper";
import { PopoverRoot, PopoverContent } from "@components/Popover";
import { reactToElectronMessage } from "@common/enums";
import { useConvertingList } from "@contexts/convertList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "@components/toasts";
import { emptyMap } from "@common/empty";
import { t } from "@components/I18n";

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
		for (const [path, newConvertion] of newConvertions) {
			try {
				const electronPort = createNewConvertion(newConvertion, path);

				// Sending port so we can communicate with electron:
				sendMsgToBackend(
					{ type: reactToElectronMessage.CONVERT_MEDIA },
					electronPort,
				);
			} catch (error) {
				errorToast(
					`${t("toasts.conversionError.beforePath")}"${path}"${t(
						"toasts.conversionError.afterPath",
					)}`,
				);

				console.error(error);
			}
		}

		// In here, we've already handled all the files,
		// so we can clear the list;
		// We need the check to prevent an infinite loop.
		if (newConvertions.size !== 0)
			useNewConvertions.setState({ newConvertions: emptyMap });
	}, [newConvertions]);

	return (
		<PopoverRoot modal open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			<Trigger
				className={`${
					convertingListSize > 0 ? "has-items" : ""
				} relative flex justify-center items-center w-11 h-11 bg-none border-none text-base group`}
				title={t("tooltips.showAllConvertingMedias")}
			>
				<span data-length={convertingListSize} />

				<Convert className="w-5 h-5 text-icon-deactivated group-hover:text-icon-active group-focus:text-icon-active" />
			</Trigger>

			<PopoverContent
				size={
					convertingListSize === 0
						? "nothing-found-for-convertions-or-downloads"
						: "convertions-or-downloads"
				}
				side="right"
				align="end"
			>
				<Popup />
			</PopoverContent>
		</PopoverRoot>
	);
}
