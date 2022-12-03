import { Component, createSignal } from "solid-js";

import { useI18n } from "@solid-primitives/i18n";

import { searchForLyrics, shareMedias } from "./searchMediaOptionsCtxMenu";
import { DeleteMediaDialog } from "../DeleteMediaDialog";
import { deleteFile } from "@utils/deleteFile";
import { TrashIcon } from "@icons/TrashIcon";
import { ShareIcon } from "@icons/ShareIcon";
import { Item } from "./Item";
import {
	getAllSelectedMedias,
	selectAllMedias,
} from "@contexts/useAllSelectedMedias";

export const MediaOptionsCtxMenu: Component = () => {
	const [isDeletMediaDialogOpen, setIsDeletMediaDialogOpen] =
		createSignal(false);
	// If there is no media selected, disable:
	const isDisabled = getAllSelectedMedias().size === 0;
	const [t] = useI18n();

	return (
		<>
			<Item onSelect={shareMedias} disabled={isDisabled}>
				{t("ctxMenus.deleteMedia")}

				<div class="ml-auto pl-5 text-ctx-menu font-secondary tracking-wide text-base leading-none group-focus:text-ctx-menu-item-focus group-disabled:text-disabled">
					<TrashIcon />
				</div>

				<DeleteMediaDialog
					onOpenChange={setIsDeletMediaDialogOpen}
					handleMediaDeletion={deleteMedias}
					isOpen={isDeletMediaDialogOpen()}
				/>
			</Item>

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

export const deleteMedias = async (): Promise<void> => {
	const promises = Array.from(getAllSelectedMedias(), (path) =>
		deleteFile(path),
	);

	await Promise.allSettled(promises);
};
