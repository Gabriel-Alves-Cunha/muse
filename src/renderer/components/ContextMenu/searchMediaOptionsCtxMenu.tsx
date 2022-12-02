import type { Component } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { searchAndOpenLyrics } from "../MediaPlayer/Lyrics";
import { DeleteMediaDialog } from "../DeleteMediaDialog";
import { deleteMedias } from "./mediaOptionsCtxMenu";
import { getSearcher } from "../SearchMedia/helper";
import { getMainList } from "@contexts/usePlaylists";
import { setSettings } from "@contexts/settings";
import { openLyrics } from "../MediaPlayer/Header";
import { TrashIcon } from "@icons/TrashIcon";
import { ShareIcon } from "@icons/ShareIcon";
import { Dialog } from "../Dialog";
import { Item } from "./Item";
import {
	setAllSelectedMedias,
	getAllSelectedMedias,
} from "@contexts/useAllSelectedMedias";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const SearchMediaOptionsCtxMenu: Component<Props> = (props) => {
	const [t] = useI18n();

	return (
		<>
			<>
				<Trigger
					class="group unset-all relative flex items-center w-[calc(100%-35px)] h-6 cursor-pointer border-none py-0 px-1 pl-6 rounded-sm text-ctx-menu-item font-secondary tracking-wide leading-none select-none ctx-trigger"
					disabled={props.isAllDisabled}
				>
					<>
						{t("ctxMenus.deleteMedia")}

						<div class="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
							<TrashIcon />
						</div>
					</>
				</Trigger>

				<Dialog.Content modal>
					<DeleteMediaDialog handleMediaDeletion={deleteMedias} />
				</Dialog.Content>
			</>

			<Item onSelect={shareMedias} disabled={props.isAllDisabled}>
				{t("ctxMenus.shareMedia")}

				<div class="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					<ShareIcon />
				</div>
			</Item>

			<Item
				onSelect={selectAllMediasOnSearchResult}
				disabled={props.isAllDisabled}
			>
				{t("ctxMenus.selectAllMedias")}

				<div class="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					Ctrl+A
				</div>
			</Item>

			<Item onSelect={searchForLyrics} disabled={props.isAllDisabled}>
				{t("ctxMenus.searchForLyrics")}
			</Item>
		</>
	);
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export const shareMedias = () =>
	setSettings({ filesToShare: getAllSelectedMedias() });

/////////////////////////////////////////////

const selectAllMediasOnSearchResult = (): void => {
	const paths = getSearcher().results.map(([path]) => path);
	setAllSelectedMedias(new Set(paths));
};

/////////////////////////////////////////////

export const searchForLyrics = async (): Promise<void> => {
	const allMedias = getMainList();

	for (const path of getAllSelectedMedias()) {
		const media = allMedias.get(path);

		await searchAndOpenLyrics(media, path, !openLyrics);
	}
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = { isAllDisabled: boolean };
