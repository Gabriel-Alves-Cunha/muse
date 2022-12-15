import type { ValuesOf } from "@common/@types/utils";
import type {
	DateAsNumber,
	Media,
	Path,
	ID,
} from "@common/@types/generalTypes";

import { Dialog, DialogPortal, Overlay } from "@radix-ui/react-dialog";
import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo } from "react";
import create from "zustand";

import { getCurrentPlaying, playThisMedia } from "@contexts/useCurrentPlaying";
import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { useTranslation } from "@i18n";
import { DialogTrigger } from "@components/DialogTrigger";
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

export const setIsCtxMenuOpen = (isCtxMenuOpen: boolean) =>
	useIsCtxMenuOpen.setState({ isCtxMenuOpen });

/////////////////////////////////////////
/////////////////////////////////////////

export const selectMediaByPointerEvent = (
	e: React.PointerEvent<HTMLSpanElement>,
): void => {
	// TODO: see if this selector still works.
	const mediaClickedMediaPath = (e.nativeEvent.target as HTMLElement)
		.closest<HTMLDivElement>(".row-wrapper")
		?.getAttribute("data-path");

	if (!mediaClickedMediaPath) return log("No 'data-path' found!");

	addToAllSelectedMedias(mediaClickedMediaPath);
};

/////////////////////////////////////////

export const rightClick = 2;
export const leftClick = 0;

const selectOrPlayMedia = (
	e: React.PointerEvent<HTMLButtonElement>,
	mediaPath: Path,
): void => {
	if (e.button !== leftClick || !e.ctrlKey) {
		const { fromList, homeList, isHome } = getFromList();
		const list = isHome ? homeList : fromList;

		return playThisMedia(mediaPath, list);
	}

	toggleSelectedMedia(mediaPath);
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const Row = memo(
	function Row({ media, id }: RowProps) {
		const { t } = useTranslation();

		return (
			<div
				className={`${getAllSelectedMedias().has(id) ? "selected " : ""}${
					getCurrentPlaying().id === id ? "playing" : ""
				} row-wrapper`}
				data-id={id}
			>
				<button
					className="relative flex justify-center items-center h-full w-[90%] cursor-pointer bg-none border-none"
					onPointerUp={(e) => selectOrPlayMedia(e, id)}
					title={t("tooltips.playThisMedia")}
				>
					<div className="flex justify-center items-center h-11 w-11 min-w-[44px] border-none rounded-xl [&_svg]:text-icon-deactivated">
						<ImgWithFallback
							Fallback={<MusicNote size="1.4rem" />}
							mediaImg={media.image}
							mediaID={id}
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

						<MediaOptionsModal media={media} path={id} />
					</DialogPortal>
				</Dialog>
			</div>
		);
	},
	(prev, next) => prev.id === next.id,
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

export const computeItemKey = (
	_index: number,
	[id]: [ID, Media, DateAsNumber],
): ID => id;

/////////////////////////////////////////

export const computeHistoryItemKey = (
	_index: number,
	[id, , date]: [ID, Media, DateAsNumber],
): `${ID}•${DateAsNumber}` => `${id}•${date}`;

/////////////////////////////////////////

export const itemContent = (
	_index: number,
	[id, media]: [ID, Media, DateAsNumber],
) => <Row media={media} id={id} />;

/////////////////////////////////////////

export const reloadWindow = (): void =>
	notify(electronIpcMainProcessNotification.RELOAD_WINDOW);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type RowProps = { media: Media; id: ID };

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
