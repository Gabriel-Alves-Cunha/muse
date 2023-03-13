import { MdAutorenew as ReloadIcon } from "react-icons/md";
import { useSnapshot } from "valtio";

import { searchLocalComputerForMedias, playlists } from "@contexts/playlists";
import { ButtonOfGroup } from "./ButtonOfGroup";
import { translation } from "@i18n";

export function Reload() {
	const playlistsAccessor = useSnapshot(playlists);
	const t = useSnapshot(translation).t;

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
