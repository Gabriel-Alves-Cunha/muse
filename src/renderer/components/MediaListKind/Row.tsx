import type {
	DateAsNumber,
	Media,
	Path,
	ID,
} from "@common/@types/generalTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo, Suspense, lazy } from "react";

import { getCurrentPlaying, playThisMedia } from "@contexts/useCurrentPlaying";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { useTranslation } from "@i18n";
import { getFromList } from "./states";
import {
	getAllSelectedMedias,
	toggleSelectedMedia,
} from "@contexts/useAllSelectedMedias";
import {
	CenteredModalContent,
	CenteredModalTrigger,
} from "@components/CenteredModal";

const MediaOptionsModal = lazy(() => import("./MediaOptionsModal"));

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const mediaOptionsModalId = "media-options-modal";

export const rightClick = 2;
export const leftClick = 0;

function selectOrPlayMedia(
	e: React.PointerEvent<HTMLButtonElement>,
	mediaPath: Path,
): void {
	if (e.button !== leftClick || !e.ctrlKey) {
		const { fromList, homeList, isHome } = getFromList();
		const list = isHome ? homeList : fromList;

		return playThisMedia(mediaPath, list);
	}

	toggleSelectedMedia(mediaPath);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

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

				<>
					<CenteredModalTrigger
						htmlTargetName={mediaOptionsModalId}
						labelClassName="modal-trigger"
						labelProps={{ title: t("tooltips.openMediaOptions") }}
					>
						<Dots size={17} />
					</CenteredModalTrigger>

					<CenteredModalContent
						className="grid center max-w-md min-w-[300px] p-8 bg-dialog"
						htmlFor={mediaOptionsModalId}
					>
						<Suspense>
							<MediaOptionsModal media={media} path={id} />
						</Suspense>
					</CenteredModalContent>
				</>
			</div>
		);
	},
	(prev, next) => prev.id === next.id,
);

/////////////////////////////////////////////

export const itemContent = (
	_index: number,
	[id, media]: [ID, Media, DateAsNumber],
) => <Row media={media} id={id} />;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type RowProps = { media: Media; id: ID };
