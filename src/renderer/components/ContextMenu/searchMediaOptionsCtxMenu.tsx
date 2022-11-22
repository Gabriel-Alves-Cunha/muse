import { BsShareFill as Share } from "react-icons/bs";
import { FiTrash as Trash } from "react-icons/fi";
import { Dialog, Trigger } from "@radix-ui/react-dialog";

import { deleteMedias, searchForLyrics } from "./mediaOptionsCtxMenu";
import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { getSearcher } from "@components/SearchMedia/helper";
import { setSettings } from "@contexts/settings";
import { Translator } from "@components/I18n";
import { Item } from "./Item";
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
				className="group unset-all relative flex items-center w-[calc(100%-35px)] h-6 cursor-pointer border-none py-0 px-1 pl-6 rounded-sm text-ctx-menu-item font-secondary tracking-wide leading-none select-none ctx-trigger"
				disabled={isAllDisabled}
			>
				<>
					<Translator path="ctxMenus.deleteMedia" />

					<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
						<Trash />
					</div>
				</>
			</Trigger>

			<DeleteMediaDialogContent handleMediaDeletion={deleteMedias} />
		</Dialog>

		<Item onSelect={shareMedias} disabled={isAllDisabled}>
			<Translator path="ctxMenus.shareMedia" />

			<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
				<Share />
			</div>
		</Item>

		<Item onSelect={selectAllMediasOnSearchResult} disabled={isAllDisabled}>
			<Translator path="ctxMenus.selectAllMedias" />

			<div className="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
				Ctrl+A
			</div>
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
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Props = Readonly<{ isAllDisabled: boolean }>;
