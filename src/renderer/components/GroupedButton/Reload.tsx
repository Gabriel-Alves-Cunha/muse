import { MdAutorenew as ReloadIcon } from "react-icons/md";

import { useTranslation } from "@i18n";
import { ButtonOfGroup } from "./ButtonOfGroup";
import {
	searchLocalComputerForMedias,
	usePlaylists,
} from "@contexts/usePlaylists";

const isLoadingMediasSelector = (
	state: ReturnType<typeof usePlaylists.getState>,
) => state.isLoadingMedias;

export const Reload = () => {
	const isLoadingMedias = usePlaylists(isLoadingMediasSelector);
	const { t } = useTranslation();

	return (
		<ButtonOfGroup
			className={isLoadingMedias ? "animate-spin" : ""}
			onPointerUp={searchLocalComputerForMedias}
			title={t("tooltips.reloadAllMedias")}
		>
			<ReloadIcon size={17} className="fill-white" />
		</ButtonOfGroup>
	);
};
