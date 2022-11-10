import { BsShareFill as ShareIcon } from "react-icons/bs";
import { FiTrash as TrashIcon } from "react-icons/fi";
import { Dialog, Trigger } from "@radix-ui/react-dialog";

import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { CtxMenuItemRightSlot } from "./CtxMenuItemRightSlot";
import { searchAndOpenLyrics } from "@components/MediaPlayer/Lyrics";
import { deleteMedias } from "./mediaOptionsCtxMenu";
import { getSearcher } from "@components/SearchMedia/helper";
import { getMainList } from "@contexts/usePlaylists";
import { setSettings } from "@contexts/settings";
import { openLyrics } from "@components/MediaPlayer/Header";
import { Translator } from "@components/I18n";
import { CtxMenuItem } from "./CtxMenuItem";
import {
	setAllSelectedMedias,
	getAllSelectedMedias,
} from "@contexts/useAllSelectedMedias";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export const SearchMediaOptionsCtxMenu = ({ isAllDisabled }: Props) => (
	<>
		<Dialog modal>
			<Trigger
				className="group ctx-trigger"
				disabled={isAllDisabled}
			>
				<Translator path="ctxMenus.deleteMedia" />

				<CtxMenuItemRightSlot>
					<TrashIcon />
				</CtxMenuItemRightSlot>
			</Trigger>

			<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
		</Dialog>

		<CtxMenuItem onSelect={shareMedias} disabled={isAllDisabled}>
			<Translator path="ctxMenus.shareMedia" />

			<CtxMenuItemRightSlot>
				<ShareIcon />
			</CtxMenuItemRightSlot>
		</CtxMenuItem>

		<CtxMenuItem onSelect={selectAllMediasOnSearchResult} disabled={isAllDisabled}>
			<Translator path="ctxMenus.selectAllMedias" />

			<CtxMenuItemRightSlot>
				Ctrl+A
			</CtxMenuItemRightSlot>
		</CtxMenuItem>

		<CtxMenuItem onSelect={searchForLyrics} disabled={isAllDisabled}>
			<Translator path="ctxMenus.searchForLyrics" />
		</CtxMenuItem>
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
