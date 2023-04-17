import type { ValuesOf } from "@common/@types/Utils";

import { MdDownloading as DownloadingIcon } from "react-icons/md";

import { DownloadingList, downloadingListRef } from "@contexts/downloadList";
import { selectT, useTranslator } from "@i18n";
import { NavbarPopoverButtons } from "../Navbar/NavbarPopoverButtons";
import { ProgressStatusEnum } from "@common/enums";
import { Popup } from "./Popup";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

const selectDownloadingListSize = (state: DownloadingList): number =>
	state.current.size;

export function Downloading(): JSX.Element {
	const size = downloadingListRef(selectDownloadingListSize);
	const t = useTranslator(selectT);

	return (
		<NavbarPopoverButtons
			tooltip={t("tooltips.showAllDownloadingMedias")}
			Icon={DownloadingIcon}
			size={size}
		>
			<Popup />
		</NavbarPopoverButtons>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type MediaBeingDownloaded = Readonly<{
	status: ValuesOf<typeof ProgressStatusEnum>;
	percentage: number;
	port: MessagePort;
	imageURL: string;
	title: string;
}>;
