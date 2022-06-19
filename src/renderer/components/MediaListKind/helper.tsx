import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { BsThreeDotsVertical as Dots } from "react-icons/bs";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { subscribeWithSelector } from "zustand/middleware";
import { memo, useRef } from "react";
import { Dialog, Portal } from "@radix-ui/react-dialog";
import create from "zustand";

import { ElectronIpcMainProcessNotificationEnum } from "@common/@types/electron-window";
import { MediaOptionsModal } from "./MediaOptions";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { playThisMedia } from "@contexts/mediaHandler/useCurrentPlaying";
import { DialogTrigger } from "@components/Dialog";
import { PlaylistList } from "@contexts/mediaHandler/usePlaylists";
import { emptySet } from "@utils/map-set";

import { RowWrapper, SubTitle, Title, Info, Img, PlayButton } from "./styles";
import { StyledOverlay } from "./MediaOptions/styles";

const notify =
	electron.notificationApi.sendNotificationToElectronIpcMainProcess;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const useAllSelectedMedias = create<
	Readonly<{ allSelectedMedias: ReadonlySet<Path>; }>
>()(
	subscribeWithSelector(() => ({
		allSelectedMedias: emptySet as ReadonlySet<Path>,
	})),
);
export const {
	setState: setAllSelectedMedias,
	getState: getAllSelectedMedias,
} = useAllSelectedMedias;

if (!import.meta.vitest)
	useAllSelectedMedias.subscribe(
		({ allSelectedMedias }) => allSelectedMedias,
		function removeSelectedClassName() {
			const { allSelectedMedias } = getAllSelectedMedias();

			// if size is 0, then remove all selected classes:
			if (allSelectedMedias.size === 0) {
				document.querySelectorAll(`.${RowWrapper.className}`).forEach(item =>
					item.classList.remove("selected")
				);
			}
		},
	);

export const useFromList = create<FromList>(() => ({
	homeList: PlaylistList.MAIN_LIST,
	fromList: PlaylistList.FAVORITES,
	isHome: true,
}));
export const { getState: getFromList, setState: setFromList } = useFromList;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

function selectOrPlayMedia(
	e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
	mediaRowRef: React.RefObject<HTMLDivElement>,
	path: Path,
) {
	const goPlayMedia = toggleMediaSelectIfCtrlPlusLeftClick(
		e,
		mediaRowRef,
		path,
	);

	if (goPlayMedia) {
		const { fromList, homeList, isHome } = getFromList();
		const list = isHome ? homeList : fromList;

		playThisMedia(path, list);
	}
}

const Row = memo(
	({ media, path }: RowProps) => {
		const mediaRowRef = useRef<HTMLDivElement>(null);
		const overlayRef = useRef<HTMLDivElement>(null);

		return (
			<RowWrapper data-path={path} ref={mediaRowRef}>
				<PlayButton
					onClick={e => selectOrPlayMedia(e, mediaRowRef, path)}
					data-tip="Play this media"
				>
					<Img>
						<ImgWithFallback
							Fallback={<MusicNote size="1.4rem" />}
							mediaImg={media.img}
							mediaPath={path}
						/>
					</Img>

					<Info>
						<Title>{media.title}</Title>
						<SubTitle className="row">{media.duration}</SubTitle>
					</Info>
				</PlayButton>

				<Dialog modal>
					<DialogTrigger data-tip="Open media options">
						<Dots />
					</DialogTrigger>

					<Portal>
						<StyledOverlay ref={overlayRef}>
							<MediaOptionsModal media={media} path={path} />
						</StyledOverlay>
					</Portal>
				</Dialog>
			</RowWrapper>
		);
	},
	(prev, next) =>
		prev.media.title === next.media.title &&
		prev.media.duration === next.media.duration,
);
Row.displayName = "Row";

const className = `.${RowWrapper.className}`;
export function selectMediaOrMedias(e: React.MouseEvent<HTMLSpanElement>) {
	const { allSelectedMedias } = getAllSelectedMedias();

	const itemClicked = (e.nativeEvent.target as HTMLElement).closest(
		className,
	) as HTMLDivElement;

	const areThereOtherSelectedMedias = allSelectedMedias.size > 0;

	const allMediaPaths: string[] = [];

	if (areThereOtherSelectedMedias) {
		const allSelectedMediasElements = document.querySelectorAll(".selected");

		allSelectedMediasElements.forEach(element => {
			const path = element.getAttribute("data-path");

			path && allMediaPaths.push(path);
		});
	}

	const itemClickedMediaPath = itemClicked.getAttribute("data-path") ?? "";

	allMediaPaths.push(itemClickedMediaPath);

	// Clear all selected medias:
	// const allMedias = document.querySelectorAll(className);
	// allMedias.forEach(media => media.classList.remove("selected"));
	// allSelectedMedias.clear();

	// Add className "selected" to the clicked media:
	itemClicked.classList.add("selected");

	// Add media to the set:
	setAllSelectedMedias(({ allSelectedMedias }) => ({
		allSelectedMedias: new Set(allSelectedMedias).add(itemClickedMediaPath),
	}));
}

const leftClick = 0;
const toggleMediaSelectIfCtrlPlusLeftClick = (
	e: Readonly<React.MouseEvent<HTMLButtonElement, MouseEvent>>,
	mediaRowRef: Readonly<React.RefObject<HTMLDivElement>>,
	mediaPath: Readonly<Path>,
): Readonly<boolean> => {
	if (e.button !== leftClick || !e.ctrlKey || !mediaRowRef.current) return true;

	const { allSelectedMedias } = getAllSelectedMedias();

	const rowElement = mediaRowRef.current;

	if (allSelectedMedias.has(mediaPath)) {
		// Remove className "selected":
		rowElement.classList.remove("selected");

		// Remove media from the set:
		const newSet = new Set(allSelectedMedias);
		newSet.delete(mediaPath);
		setAllSelectedMedias({ allSelectedMedias: newSet });
	} else {
		// Add className "selected":
		rowElement.classList.add("selected");

		// Add media to the set:
		setAllSelectedMedias(({ allSelectedMedias }) => ({
			allSelectedMedias: new Set(allSelectedMedias).add(mediaPath),
		}));
	}

	return false;
};

export const computeItemKey = (
	_index: number,
	[path]: [Path, Media, DateAsNumber],
) => path;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const computeHistoryItemKey = (
	_index: number,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	[path, _, date]: [Path, Media, DateAsNumber],
) => path + date;
export const itemContent = (
	_index: number,
	[path, media]: [Path, Media, DateAsNumber],
) => <Row media={media} path={path} />;

export const reloadWindow = (): void =>
	notify(ElectronIpcMainProcessNotificationEnum.RELOAD_WINDOW);

type RowProps = Readonly<{ media: Media; path: Path; }>;

type FromList = Readonly<
	{
		fromList: Exclude<
			PlaylistList,
			PlaylistList.MAIN_LIST | PlaylistList.SORTED_BY_DATE
		>;
		homeList: Extract<
			PlaylistList,
			PlaylistList.MAIN_LIST | PlaylistList.SORTED_BY_DATE
		>;
		isHome: boolean;
	}
>;
