import { type Component, createEffect, createSignal } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { useNewConvertions, createNewConvertion, Popup } from "./helper";
import { PopoverRoot, PopoverContent } from "../Popover";
import { reactToElectronMessage } from "@common/enums";
import { useConvertingList } from "@contexts/convertList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { errorToast } from "../toasts";
import { SwapIcon } from "@icons/SwapIcon";
import { emptyMap } from "@common/empty";
import { error } from "@utils/log";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const Converting: Component = () => {
	const [isPopoverOpen, setIsPopoverOpen] = createSignal(false);
	const { newConvertions } = useNewConvertions();
	const convertingListSize = useConvertingList(
		(state) => state.convertingList.size,
	);
	const [t] = useI18n();

	createEffect(() => {
		for (const [path, newConvertion] of newConvertions) {
			try {
				const electronPort = createNewConvertion(newConvertion, path);

				// Sending port so we can communicate with electron:
				sendMsgToBackend(
					{ type: reactToElectronMessage.CONVERT_MEDIA },
					electronPort,
				);
			} catch (err) {
				errorToast(
					`${t("toasts.conversionError.beforePath")}"${path}"${t(
						"toasts.conversionError.afterPath",
					)}`,
				);

				error(err);
			}
		}

		// In here, we've already handled all the files,
		// so we can clear the list;
		// We need the check to prevent an infinite loop.
		if (newConvertions.size !== 0)
			useNewConvertions.setState({ newConvertions: emptyMap });
	});

	return (
		<>
			<Trigger
				class={`${
					convertingListSize > 0 ? "has-items" : ""
				} relative flex justify-center items-center w-11 h-11 bg-none border-none text-base group`}
				title={t("tooltips.showAllConvertingMedias")}
			>
				<span data-length={convertingListSize} />

				<SwapIcon class="w-5 h-5 text-icon-deactivated group-hover:text-icon-active group-focus:text-icon-active" />
			</Trigger>

			<PopoverRoot modal open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
		</>
	);
};
