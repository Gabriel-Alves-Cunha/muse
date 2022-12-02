import type { Component } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { searchForLyrics, shareMedias } from "./searchMediaOptionsCtxMenu";
import { DeleteMediaDialog } from "../DeleteMediaDialog";
import { deleteFile } from "@utils/deleteFile";
import { TrashIcon } from "@icons/TrashIcon";
import { ShareIcon } from "@icons/ShareIcon";
import { Dialog } from "../Dialog";
import { Item } from "./Item";
import {
	getAllSelectedMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";

export const MediaOptionsCtxMenu: Component = () => {
	// If there is none selected, disable:
	const isDisabled = getAllSelectedMedias().size === 0;
	const [t] = useI18n();

	return (
		<>
			<>
				<Trigger
					aria-disabled={isDisabled}
					class="group unset-all relative flex items-center w-[calc(100%-35px)] h-6 cursor-pointer border-none py-0 px-1 pl-6 rounded-sm text-ctx-menu-item font-secondary tracking-wide leading-none select-none ctx-trigger"
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

			<Item onSelect={shareMedias} disabled={isDisabled}>
				{t("ctxMenus.shareMedia")}

				<div class="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					<ShareIcon />
				</div>
			</Item>

			<Item onSelect={selectAllMedias}>
				{t("ctxMenus.selectAllMedias")}

				<div class="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					Ctrl+A
				</div>
			</Item>

			<Item onSelect={searchForLyrics} disabled={isDisabled}>
				{t("ctxMenus.searchForLyrics")}
			</Item>
		</>
	);
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export async function deleteMedias(): Promise<void> {
	const promises = Array.from(getAllSelectedMedias(), (path) =>
		deleteFile(path),
	);

	await Promise.allSettled(promises);
}
