import { MdAutorenew as ReloadIcon } from "react-icons/md";

import { t } from "@components/I18n";
import {
	searchLocalComputerForMedias,
	usePlaylists,
} from "@contexts/usePlaylists";

import { ButtonOfGroup } from "./ButtonOfGroup";

const isLoadingMediasSelector = (
	state: ReturnType<typeof usePlaylists.getState>,
) => state.isLoadingMedias;

// export function Reload({ className }: Props) {
// 	const isLoadingMedias = usePlaylists(isLoadingMediasSelector);
//
// 	return (
// 		<ButtonFromGroup
// 			className={"reload " + className + (isLoadingMedias ? " reloading" : "")}
// 			aria-label={t("tooltips.reloadAllMedias")}
// 			onPointerUp={searchLocalComputerForMedias}
// 			title={t("tooltips.reloadAllMedias")}
// 		>
// 			<ReloadIcon size={17} />
// 		</ButtonFromGroup>
// 	);
// }

export function Reload({ className }: Props) {
	const isLoadingMedias = usePlaylists(isLoadingMediasSelector);

	return (
		<ButtonOfGroup
			className={"reload " + className + (isLoadingMedias ? " reloading" : "")}
			onPointerUp={searchLocalComputerForMedias}
			title={t("tooltips.reloadAllMedias")}
		>
			<ReloadIcon size={17} />
		</ButtonOfGroup>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<{ className?: string; }>;
