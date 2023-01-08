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
import { ImgWithFallback } from "../ImgWithFallback";
import { useTranslation } from "@i18n";
import { getFromList } from "./states";
import {
	getAllSelectedMedias,
	toggleSelectedMedia,
} from "@contexts/useAllSelectedMedias";
import { CenteredModalContent, CenteredModalTrigger } from "../CenteredModal";

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
				data-is-selected-row={getAllSelectedMedias().has(id)}
				data-is-playing-row={getCurrentPlaying().id === id}
				className="row-wrapper"
				data-id={id}
			>
				<button
					onPointerUp={(e) => selectOrPlayMedia(e, id)}
					title={t("tooltips.playThisMedia")}
				>
					<div className="row-img">
						<ImgWithFallback
							Fallback={<MusicNote size="1.4rem" />}
							mediaImg={media.image}
							mediaID={id}
						/>
					</div>

					<div className="row-info">
						<p>{media.title}</p>

						<p>
							{media.duration}

							{media.artist && `&emsp;|&emsp;${media.artist}`}
						</p>
					</div>
				</button>

				<>
					<CenteredModalTrigger
						labelProps={{ title: t("tooltips.openMediaOptions") }}
						labelClassName="icon-circle-modal-trigger"
						htmlTargetName={mediaOptionsModalId}
					>
						<Dots size={17} />
					</CenteredModalTrigger>

					<CenteredModalContent
						className="media-options-modal"
						htmlFor={mediaOptionsModalId}
						closeOnClickOutside
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
