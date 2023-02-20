import { MdAutorenew as ReloadIcon } from "react-icons/md";
import { useSnapshot } from "valtio";

import { searchLocalComputerForMedias, playlists } from "@contexts/playlists";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { translation } from "@i18n";

export function Reload() {
	const translationAccessor = useSnapshot(translation);
	const playlistsAccessor = useSnapshot(playlists);
	const t = translationAccessor.t;

	return (
		<ButtonOfGroup
			onPointerUp={searchLocalComputerForMedias}
			title={t("tooltips.reloadAllMedias")}
		>
			<ReloadIcon
				data-animate-spin={playlistsAccessor.isLoadingMedias}
				className="fill-white"
				size={17}
			/>
		</ButtonOfGroup>
	);
}
