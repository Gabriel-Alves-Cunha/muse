import { MdCompareArrows as ConvertIcon } from "react-icons/md";
import { useEffect } from "react";

import { useNewConvertions, createNewConvertion } from "./helper";
import { ReactToElectronMessage } from "@common/enums";
import { NavbarPopoverButtons } from "../Navbar/NavbarPopoverButtons";
import { useConvertingList } from "@contexts/convertList";
import { sendMsgToBackend } from "@common/crossCommunication";
import { useTranslation } from "@i18n";
import { errorToast } from "../toasts";
import { emptyMap } from "@common/empty";
import { error } from "@common/log";
import { Popup } from "./Popup";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const convertingListSizeSelector = (
	state: ReturnType<typeof useConvertingList.getState>,
) => state.convertingList.size;

export function Converting() {
	const convertingListSize = useConvertingList(convertingListSizeSelector);
	const { newConvertions } = useNewConvertions();
	const { t } = useTranslation();

	useEffect(() => {
		for (const [path, newConvertion] of newConvertions)
			try {
				const electronPort = createNewConvertion(newConvertion, path);

				// Sending port so we can communicate with electron:
				sendMsgToBackend(
					{ type: ReactToElectronMessage.CONVERT_MEDIA },
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

		// In here, we've already handled all the files,
		// so we can clear the list;
		// We need the check to prevent an infinite loop.
		if (newConvertions.size !== 0)
			useNewConvertions.setState({ newConvertions: emptyMap });
	}, [newConvertions]);

	return (
		<NavbarPopoverButtons
			tooltip={t("tooltips.showAllConvertingMedias")}
			size={convertingListSize}
			Icon={ConvertIcon}
		>
			<Popup />
		</NavbarPopoverButtons>
	);
}
