import { MdCompareArrows as ConvertIcon } from "react-icons/md";
import { useEffect } from "react";

import { useNewConvertions, createNewConvertion } from "./helper";
import { createOrCancelConvert } from "@modules/media/convertToAudio";
import { NavbarPopoverButtons } from "../Navbar/NavbarPopoverButtons";
import { useConvertingList } from "@contexts/convertList";
import { useTranslation } from "@i18n";
import { errorToast } from "../toasts";
import { emptyMap } from "@utils/empty";
import { error } from "@utils/log";
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
				const downloaderPort = createNewConvertion(newConvertion, path);

				createOrCancelConvert({ downloaderPort, ...newConvertion, path });
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
