import { MdAutorenew as ReloadIcon } from "react-icons/md";

import {
	searchLocalComputerForMedias,
	usePlaylists,
} from "@contexts/mediaHandler/usePlaylists";

import { ButtonFromGroup } from "./styles";

export function Reload({ className }: Props) {
	const { isLoadingMedias } = usePlaylists();

	return (
		<ButtonFromGroup
			className={"reload " + className + (isLoadingMedias ? " reloading" : "")}
			onClick={searchLocalComputerForMedias}
			data-tip="Reload all medias"
			data-place="bottom"
		>
			<ReloadIcon size={17} />
		</ButtonFromGroup>
	);
}

type Props = { className?: string; };
