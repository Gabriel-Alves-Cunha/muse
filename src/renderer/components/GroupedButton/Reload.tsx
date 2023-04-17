import { MdAutorenew as ReloadIcon } from "react-icons/md";

import { selectT, useTranslator } from "@i18n";
import { ButtonOfGroup } from "./ButtonOfGroup";
import {
	searchLocalComputerForMedias,
	selectIsLoadingMedias,
	usePlaylists,
} from "@contexts/playlists";

export function Reload(): JSX.Element {
	const isLoadingMedias = usePlaylists(selectIsLoadingMedias);
	const t = useTranslator(selectT);

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
