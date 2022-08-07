import { MdAutorenew as ReloadIcon } from "react-icons/md";

import {
	searchLocalComputerForMedias,
	usePlaylists,
} from "@contexts/usePlaylists";

import { ButtonFromGroup } from "./styles";

export function Reload({ className }: Props) {
	const isLoadingMedias = usePlaylists(selector);

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

const selector = (state: ReturnType<typeof usePlaylists.getState>) =>
	state.isLoadingMedias;

/////////////////////////////////////////////
// Types:

type Props = Readonly<{ className?: string; }>;
