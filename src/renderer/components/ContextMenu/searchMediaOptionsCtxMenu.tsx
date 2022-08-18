import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Dialog } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { searchAndOpenLyrics } from "@components/MediaPlayer/Lyrics";
import { deleteMedias } from "./mediaOptionsCtxMenu";
import { setSettings } from "@contexts/settings";
import { getSearcher } from "@components/SearchMedia/helper";
import { getMainList } from "@contexts/usePlaylists";
import { openLyrics } from "@components/MediaPlayer/Header";
import { Translator } from "@components/I18n";
import {
	setAllSelectedMedias,
	getAllSelectedMedias,
} from "@contexts/useAllSelectedMedias";

import { RightSlot, Item, TriggerToDeleteMedia } from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const SearchMediaOptionsCtxMenu = ({ isAllDisabled }: Props) => (
	<>
		<Dialog modal>
			<TriggerToDeleteMedia disabled={isAllDisabled}>
				<>
					<Translator path="ctxMenus.deleteMedia" />

					<RightSlot>
						<Trash />
					</RightSlot>
				</>
			</TriggerToDeleteMedia>

			<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
		</Dialog>

		<Item onSelect={shareMedias} disabled={isAllDisabled}>
			<Translator path="ctxMenus.shareMedia" />

			<RightSlot>
				<Share />
			</RightSlot>
		</Item>

		<Item onSelect={selectAllMediasOnSearchResult} disabled={isAllDisabled}>
			<Translator path="ctxMenus.selectAllMedias" />

			<RightSlot>Ctrl+A</RightSlot>
		</Item>

		<Item onSelect={searchForLyrics} disabled={isAllDisabled}>
			<Translator path="ctxMenus.searchForLyrics" />
		</Item>
	</>
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export const shareMedias = () =>
	setSettings({ filesToShare: getAllSelectedMedias() });

/////////////////////////////////////////////

function selectAllMediasOnSearchResult(): void {
	const paths = getSearcher().results.map(([path]) => path);
	setAllSelectedMedias(new Set(paths));
}

/////////////////////////////////////////////

function searchForLyrics(): void {
	const allMedias = getMainList();

	getAllSelectedMedias().forEach(async path => {
		const media = allMedias.get(path);

		await searchAndOpenLyrics(media, path, !openLyrics);
	});
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<{ isAllDisabled: boolean; }>;
