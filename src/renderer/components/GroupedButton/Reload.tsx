import { MdAutorenew as ReloadIcon } from "react-icons/md";

import { selectT, useTranslator } from "@i18n";
import { ButtonOfGroup } from "./ButtonOfGroup";
import {
	searchLocalComputerForMedias,
	useIsLoadingMedias,
} from "@contexts/playlists";

export function Reload(): JSX.Element {
	const isLoadingMedias = useIsLoadingMedias().current;
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
