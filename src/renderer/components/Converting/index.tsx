import type { Path } from "@common/@types/generalTypes";

import { type Component, createEffect, createSignal } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { useI18n } from "@solid-primitives/i18n";

import { type ConvertInfo, createNewConvertion, Popup } from "./helper";
import { reactToElectronMessage } from "@common/enums";
import { sendMsgToBackend } from "@common/crossCommunication";
import { convertingList } from "@contexts/convertList";
import { errorToast } from "../toasts";
import { SwapIcon } from "@icons/SwapIcon";
import { Dialog } from "../Dialog";
import { error } from "@utils/log";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const newConvertions = new ReactiveMap<Path, ConvertInfo>();

export const Converting: Component = () => {
	const [isPopoverOpen, setIsPopoverOpen] = createSignal(false);
	const convertingListSize = () => convertingList.size;
	const [t] = useI18n();

	createEffect(
		() => {
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
		},
		{ defer: true },
	);

	return (
		<>
			<button
				class="relative flex justify-center items-center w-11 h-11 bg-none border-none text-base group"
				classList={{ "has-items": convertingListSize() > 0 }}
				onPointerUp={() => setIsPopoverOpen((prev) => !prev)}
				title={t("tooltips.showAllConvertingMedias")}
				type="button"
			>
				<span data-length={convertingListSize()} />

				<SwapIcon class="w-5 h-5 text-icon-deactivated group-hover:text-icon-active group-focus:text-icon-active" />
			</button>

			<Dialog
				class={`${
					convertingListSize() === 0
						? "nothing-found-for-convertions-or-downloads"
						: "convertions-or-downloads"
				}`}
				setIsOpen={setIsPopoverOpen}
				isOpen={isPopoverOpen()}
				modal
			>
				<Popup />
			</Dialog>
		</>
	);
};
