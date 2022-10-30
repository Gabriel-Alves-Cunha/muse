import { MdAutorenew as ReloadIcon } from "react-icons/md";

import { ButtonOfGroup } from "./ButtonOfGroup";
import { t } from "@components/I18n";
import {
	searchLocalComputerForMedias,
	usePlaylists,
} from "@contexts/usePlaylists";

const isLoadingMediasSelector = (
	state: ReturnType<typeof usePlaylists.getState>,
) => state.isLoadingMedias;

export function Reload() {
	const isLoadingMedias = usePlaylists(isLoadingMediasSelector);

	return (
		<ButtonOfGroup
			className={isLoadingMedias ? "animate-spin" : ""}
			onPointerUp={searchLocalComputerForMedias}
			title={t("tooltips.reloadAllMedias")}
		>
			<ReloadIcon size={17} />
		</ButtonOfGroup>
	);
}
