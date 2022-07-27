import type { Media, Mutable, Path } from "@common/@types/generalTypes";

import create from "zustand";

import { time } from "@utils/utils";
import {
	PlaylistActions,
	setPlaylists,
	usePlaylists,
	mainList,
	WhatToDo,
} from "./usePlaylists";

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////

export const useAllSelectedMedias = create<{ medias: readonly Path[]; }>(
	() => ({ medias: [] })
);

export const allSelectedMedias = () => useAllSelectedMedias.getState().medias;
export const setAllSelectedMedias = (medias: Path[]) =>
	useAllSelectedMedias.setState({ medias });

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
// Handle media selection:

// Every the mainList (sortedByName) changes,
// update `allSelectedMedias`:
if (!import.meta.vitest)
	usePlaylists.subscribe(
		({ sortedByName }) => sortedByName,
		function updateAllSelectedMedias() {
			time(() =>
			{
				setAllSelectedMedias(
					Array.from(mainList()).filter(([, { isSelected }]) => isSelected).map(
						([path]) =>
							path
					),
				);
			}, "updateAllSelectedMedias");
		},
	);

///////////////////////////////////////////////////

export function toggleSelectedMedia(media: Media, mediaPath: Path): void {
	time(
		() =>
			allSelectedMedias().includes(mediaPath) ?
				removeFromAllSelectedMedias(media, mediaPath) :
				addToAllSelectedMedias(media, mediaPath),
		"toggleSelectedMedia",
	);
}

///////////////////////////////////////////////////

export function addToAllSelectedMedias(newMedia: Media, mediaPath: Path): void {
	time(
		() =>
			setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
				newMedia: { ...newMedia, isSelected: true },
				type: WhatToDo.UPDATE_MAIN_LIST,
				path: mediaPath,
			}),
		"addToAllSelectedMedias",
	);
}

///////////////////////////////////////////////////

export function removeFromAllSelectedMedias(
	newMedia: Media,
	mediaPath: Path,
): void {
	time(
		() =>
			setPlaylists({
				whatToDo: PlaylistActions.REFRESH_ONE_MEDIA_BY_PATH,
				newMedia: { ...newMedia, isSelected: false },
				type: WhatToDo.UPDATE_MAIN_LIST,
				path: mediaPath,
			}),
		"removeFromAllSelectedMedias",
	);
}

///////////////////////////////////////////////////

export function deselectAllMedias() {
	time(() => {
		if (allSelectedMedias().length === 0) return;

		const newMediasList = mainList() as Map<Path, Mutable<Media>>;

		newMediasList.forEach((media, path) =>
			newMediasList.set(path, { ...media, isSelected: false })
		);

		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: WhatToDo.UPDATE_MAIN_LIST,
			list: newMediasList,
		});
	}, "deselectAllMedias");
}

///////////////////////////////////////////////////

export function selectAllMedias() {
	time(() => {
		const newMediasList = mainList() as Map<Path, Mutable<Media>>;

		if (allSelectedMedias().length === newMediasList.size) return;

		newMediasList.forEach((media, path) =>
			newMediasList.set(path, { ...media, isSelected: true })
		);

		setPlaylists({
			whatToDo: PlaylistActions.REPLACE_ENTIRE_LIST,
			type: WhatToDo.UPDATE_MAIN_LIST,
			list: newMediasList,
		});
	}, "selectAllMedias");
}
