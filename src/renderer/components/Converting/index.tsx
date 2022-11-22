import { useObserveEffect, useSelector } from "@legendapp/state/react";
import { MdCompareArrows as Convert } from "react-icons/md";
import { useState } from "react";
import { Trigger } from "@radix-ui/react-popover";

import { newConvertions, createNewConvertion, Popup } from "./helper";
import { PopoverRoot, PopoverContent } from "@components/Popover";
import { reactToElectronMessage } from "@common/enums";
import { sendMsgToBackend } from "@common/crossCommunication";
import { convertingList } from "@contexts/convertList";
import { errorToast } from "@components/toasts";
import { t } from "@components/I18n";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Converting() {
	const convertingListSize = useSelector(() => convertingList.size);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);

	useObserveEffect(() => {
		for (const [path, newConvertion] of newConvertions.get())
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

		// In here, we've already handled all the files,
		// so we can clear the list;
		// We need the check to prevent an infinite loop.
		if (newConvertions.peek().size !== 0) newConvertions.clear();
	});

	return (
		<PopoverRoot modal open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
			<Trigger
				className={`${
					convertingListSize.get() > 0 ? "has-items" : ""
				} relative flex justify-center items-center w-11 h-11 bg-none border-none text-base group`}
				title={t("tooltips.showAllConvertingMedias")}
			>
				<span data-length={convertingListSize} />

				<Convert className="w-5 h-5 text-icon-deactivated group-hover:text-icon-active group-focus:text-icon-active" />
			</Trigger>

			<PopoverContent
				size={
					convertingListSize.get() === 0
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
