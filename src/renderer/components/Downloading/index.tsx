import type { ValuesOf } from "@common/@types/utils";

import { MdDownloading as DownloadingIcon } from "react-icons/md";
import { useSnapshot } from "valtio";

import { NavbarPopoverButtons } from "../Navbar/NavbarPopoverButtons";
import { downloadingList } from "@contexts/downloadList";
import { ProgressStatus } from "@common/enums";
import { translation } from "@i18n";
import { Popup } from "./Popup";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function Downloading() {
	const downloadingListAccessor = useSnapshot(downloadingList);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

	return (
		<NavbarPopoverButtons
			tooltip={t("tooltips.showAllDownloadingMedias")}
			size={downloadingListAccessor.size}
			Icon={DownloadingIcon}
		>
			<Popup />
		</NavbarPopoverButtons>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type MediaBeingDownloaded = {
	status: ValuesOf<typeof ProgressStatus>;
	percentage: number;
	port: MessagePort;
	imageURL: string;
	title: string;
};
