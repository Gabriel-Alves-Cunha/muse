import { MdAutorenew as Reload } from "react-icons/md";
import { FiTrash as Clean } from "react-icons/fi";

import { styled } from "@styles/global";

import { ButtonGroup, GroupButtonProps } from "@components/ButtonGroup";
import { assertUnreachable } from "@utils/utils";
import {
	searchLocalComputerForMedias,
	cleanFavorites,
	PlaylistList,
	usePlaylists,
	cleanHistory,
} from "@contexts/mediaHandler/usePlaylists";

export enum HeaderButtonsEnum {
	RELOAD_BUTTON,
	FILTER_BY,
	CLEAN,
}

const { CLEAN, RELOAD_BUTTON, FILTER_BY } = HeaderButtonsEnum;

export function HeaderButtons({ buttons, list }: Props) {
	const { isLoadingMedias } = usePlaylists();

	return (
		<Wrapper>
			<ButtonGroup
				buttons={buttons.map((kind): GroupButtonProps => {
					switch (kind) {
						case RELOAD_BUTTON:
							return {
								className: isLoadingMedias ? "reloading" : "",
								onClick: searchLocalComputerForMedias,
								tooltip: "Reload all medias",
								icon: <Reload size={17} />,
							};

						case CLEAN:
							return {
								tooltip: "Clean list",
								// onClick={cleanHistory}
								onClick() {
									switch (list) {
										case PlaylistList.FAVORITES:
											cleanFavorites();
											break;

										case PlaylistList.HISTORY:
											cleanHistory();
											break;

										case PlaylistList.MAIN_LIST:
											break;

										case PlaylistList.SORTED_BY_DATE:
											break;

										case PlaylistList.SORTED_BY_NAME:
											break;

										default:
											assertUnreachable(list);
											break;
									}
								},
								icon: <Clean size={17} />,
							};

						case FILTER_BY:
							return {
								tooltip: "Filter by",
								// onClick: () => useFromList.se,
							};

						default:
							return assertUnreachable(kind);
					}
				})}
			/>
		</Wrapper>
	);
}

const Wrapper = styled("div", {
	position: "absolute",
});

type Props = {
	buttons: HeaderButtonsEnum[];
	list: PlaylistList;
};
