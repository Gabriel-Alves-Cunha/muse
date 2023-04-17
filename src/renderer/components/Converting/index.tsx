import { MdCompareArrows as ConvertIcon } from "react-icons/md";

import { selectT, useTranslator } from "@i18n";
import { NavbarPopoverButtons } from "../Navbar/NavbarPopoverButtons";
import { convertingListRef } from "@contexts/convertList";
import { Popup } from "./Popup";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Converting(): JSX.Element {
	const convertingList = convertingListRef().current;
	const t = useTranslator(selectT);

	return (
		<NavbarPopoverButtons
			tooltip={t("tooltips.showAllConvertingMedias")}
			size={convertingList.size}
			Icon={ConvertIcon}
		>
			<Popup />
		</NavbarPopoverButtons>
	);
}
