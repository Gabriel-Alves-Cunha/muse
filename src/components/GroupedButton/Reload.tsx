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

export function Reload() {
	const isLoadingMedias = usePlaylists(isLoadingMediasSelector);
	const { t } = useTranslation();

	return (
		<ButtonOfGroup
			onPointerUp={searchLocalComputerForMedias}
			title={t("tooltips.reloadAllMedias")}
		>
			<ReloadIcon
				data-animate-spin={isLoadingMedias}
				className="fill-white"
				size={17}
			/>
		</ButtonOfGroup>
	);
}
