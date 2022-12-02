import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { Component, createSignal } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";
import { Portal } from "solid-js/web";
import create from "solid-zustand";

import { getCurrentPlaying, playThisMedia } from "@contexts/useCurrentPlaying";
import { MediaOptionsModal } from "./MediaOptions";
import { VerticalDotsIcon } from "@icons/VerticalDotsIcon";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { MusicNoteIcon } from "@icons/MusicNoteIcon";
import { BlurOverlay } from "@components/BlurOverlay";
import { Dialog } from "../Dialog";
import { log } from "@utils/log";
import {
	electronIpcMainProcessNotification,
	playlistList,
} from "@common/enums";
import {
	addToAllSelectedMedias,
	getAllSelectedMedias,
	toggleSelectedMedia,
} from "@contexts/useAllSelectedMedias";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const useFromList = create<FromList>(() => ({
	fromList: playlistList.favorites,
	homeList: playlistList.mainList,
	isHome: true,
}));

export const { getState: getFromList, setState: setFromList } = useFromList;

/////////////////////////////////////////

const useIsCtxMenuOpen = create(() => ({ isCtxMenuOpen: false }));

export const isCtxMenuOpen = () => useIsCtxMenuOpen.getState().isCtxMenuOpen;

export const setIsCtxMenuOpen = (bool: boolean) =>
	useIsCtxMenuOpen.setState({ isCtxMenuOpen: bool });

/////////////////////////////////////////
/////////////////////////////////////////

export function selectMediaByPointerEvent(e: PointerEvent): void {
	// TODO: see if this selector still works.
	const mediaClickedMediaPath = (e.target as HTMLElement)
		.closest<HTMLDivElement>(".row-wrapper")
		?.getAttribute("data-path");

	if (!mediaClickedMediaPath) return log("No 'data-path' found!");

	addToAllSelectedMedias(mediaClickedMediaPath);
}

/////////////////////////////////////////

export const rightClick = 2;
export const leftClick = 0;

function selectOrPlayMedia(e: PointerEvent, mediaPath: Path): void {
	if (e.button !== leftClick || e.ctrlKey === false) {
		const { fromList, homeList, isHome } = getFromList();
		const list = isHome === true ? homeList : fromList;

		return playThisMedia(mediaPath, list);
	}

	toggleSelectedMedia(mediaPath);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const Row: Component<RowProps> = (props) => {
	const [isMediaOptionsOpen, setIsMediaOptionsOpen] = createSignal(false);
	const [t] = useI18n();

	return (
		<div
			class={`${
				getAllSelectedMedias().has(props.path) === true ? "selected " : ""
			}${getCurrentPlaying().path === props.path ? "playing " : ""}row-wrapper`}
			data-path={props.path}
		>
			<button
				class="relative flex justify-center items-center h-full w-[90%] cursor-pointer bg-none border-none"
				onPointerUp={(e) => selectOrPlayMedia(e, props.path)}
				title={t("tooltips.playThisMedia")}
			>
				<div class="flex justify-center items-center h-11 w-11 min-w-[44px] border-none rounded-xl [&_svg]:text-icon-deactivated">
					<ImgWithFallback
						Fallback={<MusicNoteIcon class="w-5 h-5" />}
						mediaImg={props.media.image}
						mediaPath={props.path}
					/>
				</div>

				<div class="flex flex-col justify-center items-start w-[95%] h-[95%] overflow-hidden gap-2 pl-5">
					<p class="text-alternative font-secondary tracking-wider font-medium overflow-ellipsis overflow-hidden">
						{props.media.title}
					</p>

					<p class="font-primary tracking-wide text-sm font-medium text-muted">
						{props.media.duration}
						&emsp;|&emsp;
						{props.media.artist}
					</p>
				</div>
			</button>

			<button title={t("tooltips.openMediaOptions")}>
				<VerticalDotsIcon class="w-4 h-4" />
			</button>

			<Portal>
				<Dialog.Content
					onOpenChange={setIsMediaOptionsOpen}
					isOpen={isMediaOptionsOpen()}
					modal
				>
					<BlurOverlay />

					<MediaOptionsModal media={props.media} path={props.path} />
				</Dialog.Content>
			</Portal>
		</div>
	);
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const computeItemKey = (
	_index: number,
	[path]: [Path, Media, DateAsNumber],
): Path => path;

/////////////////////////////////////////

export const computeHistoryItemKey = (
	_index: number,
	[path, , date]: [Path, Media, DateAsNumber],
): `${Path}•${DateAsNumber}` => `${path}•${date}`;

/////////////////////////////////////////

export const itemContent = (
	_index: number,
	[path, media]: [Path, Media, DateAsNumber],
) => <Row media={media} path={path} />;

/////////////////////////////////////////

export const reloadWindow = (): void =>
	notify(electronIpcMainProcessNotification.RELOAD_WINDOW);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type RowProps = { media: Media; path: Path };

/////////////////////////////////////////////

type PlaylistList = ValuesOf<typeof playlistList>;

type FromList = {
	fromList: Exclude<
		PlaylistList,
		typeof playlistList.mainList | typeof playlistList.sortedByDate
	>;
	homeList: Extract<
		PlaylistList,
		typeof playlistList.mainList | typeof playlistList.sortedByDate
	>;
	isHome: boolean;
};
