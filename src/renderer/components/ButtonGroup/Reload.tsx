import { MdAutorenew as ReloadIcon } from "react-icons/md";

import { TooltipButton } from "@components/TooltipButton";
import {
	searchLocalComputerForMedias,
	usePlaylists,
} from "@contexts/mediaHandler/usePlaylists";

export function Reload({ className }: Props) {
	const { isLoadingMedias } = usePlaylists();

	return (
		<TooltipButton
			className={"reload " + className + (isLoadingMedias ? " reloading" : "")}
			onClick={searchLocalComputerForMedias}
			tooltip="Reaload all medias"
			type="button"
		>
			<ReloadIcon size={17} />
		</TooltipButton>
	);
}

type Props = { className?: string; };
