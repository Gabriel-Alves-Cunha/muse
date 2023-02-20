import { MdCompareArrows as ConvertIcon } from "react-icons/md";
import { useSnapshot } from "valtio";

import { NavbarPopoverButtons } from "../Navbar/NavbarPopoverButtons";
import { convertingList } from "@contexts/convertList";
import { translation } from "@i18n";
import { Popup } from "./Popup";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export function Converting() {
	const convertingListAccessor = useSnapshot(convertingList);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

	return (
		<NavbarPopoverButtons
			tooltip={t("tooltips.showAllConvertingMedias")}
			size={convertingListAccessor.size}
			Icon={ConvertIcon}
		>
			<Popup />
		</NavbarPopoverButtons>
	);
}
