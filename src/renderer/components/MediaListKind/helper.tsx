import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";
import type { ValuesOf } from "@common/@types/utils";

import { Dialog, DialogPortal, Overlay } from "@radix-ui/react-dialog";
import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo } from "react";
import create from "zustand";

import {
	electronIpcMainProcessNotification,
	playlistList,
} from "@common/enums";
import { getCurrentPlaying, playThisMedia } from "@contexts/useCurrentPlaying";
import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { DialogTrigger } from "@components/DialogTrigger";
import { t } from "@components/I18n";
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

export function selectMediaByPointerEvent(
	e: React.PointerEvent<HTMLSpanElement>,
): void {
	// TODO: see if this selector still works.
	const mediaClickedMediaPath = (e.nativeEvent.target as HTMLElement)
		.closest<HTMLDivElement>(".row-wrapper")
		?.getAttribute("data-path");

	if (!mediaClickedMediaPath) return console.info("No 'data-path' found!");

	addToAllSelectedMedias(mediaClickedMediaPath);
}

/////////////////////////////////////////

export const rightClick = 2;
export const leftClick = 0;

function selectOrPlayMedia(
	e: React.PointerEvent<HTMLButtonElement>,
	mediaPath: Path,
): void {
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

const Row = memo(
	({ media, path }: RowProps) => (
		<div
			className={`${
				getAllSelectedMedias().has(path) === true ? "selected " : ""
			}${getCurrentPlaying().path === path ? "playing " : ""}row-wrapper`}
			data-path={path}
		>
			<button
				className="relative flex justify-center items-center h-full w-[90%] cursor-pointer bg-none border-none"
				onPointerUp={(e) => selectOrPlayMedia(e, path)}
				title={t("tooltips.playThisMedia")}
			>
				<div className="flex justify-center items-center h-11 w-11 min-w-[44px] border-none rounded-xl [&_svg]:text-icon-deactivated">
					<ImgWithFallback
						Fallback={<MusicNote size="1.4rem" />}
						mediaImg={media.image}
						mediaPath={path}
					/>
				</div>

				<div className="flex flex-col justify-center items-start w-[95%] h-[95%] overflow-hidden gap-2 pl-5">
					<p className="text-alternative font-secondary tracking-wider font-medium overflow-ellipsis overflow-hidden">
						{media.title}
					</p>

					<p className="font-primary tracking-wide text-sm font-medium text-muted">
						{media.duration}
						&emsp;|&emsp;
						{media.artist}
					</p>
				</div>
			</button>

			<Dialog modal>
				<DialogTrigger tooltip={t("tooltips.openMediaOptions")}>
					<Dots size={17} />
				</DialogTrigger>

				<DialogPortal>
					{/* backdropFilter: blur(2px); */}
					<Overlay className="fixed grid place-items-center bottom-0 right-0 left-0 top-0 blur-sm bg-opacity-10 overflow-y-auto z-20 animation-overlay-show" />

					<MediaOptionsModal media={media} path={path} />
				</DialogPortal>
			</Dialog>
		</div>
	),
	(prev, next) =>
		prev.media.title === next.media.title &&
		prev.media.artist === next.media.artist &&
		prev.media.duration === next.media.duration,
);
Row.displayName = "Row";

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

type RowProps = Readonly<{ media: Media; path: Path }>;

/////////////////////////////////////////////

type PlaylistList = ValuesOf<typeof playlistList>;

type FromList = Readonly<{
	fromList: Exclude<
		PlaylistList,
		typeof playlistList.mainList | typeof playlistList.sortedByDate
	>;
	homeList: Extract<
		PlaylistList,
		typeof playlistList.mainList | typeof playlistList.sortedByDate
	>;
	isHome: boolean;
}>;
