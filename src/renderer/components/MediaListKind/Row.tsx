import type { Media, Path } from "@common/@types/GeneralTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo, Suspense, useState } from "react";

import { playThisMedia, getCurrentPlaying } from "@contexts/currentPlaying";
import { getListTypeToDisplay } from "./states";
import { MediaOptionsModal } from "./MediaOptionsModal";
import { ImgWithFallback } from "../ImgWithFallback";
import { CenteredModal } from "../CenteredModal";
import { t } from "@i18n";
import {
	getAllSelectedMedias,
	toggleSelectedMedia,
} from "@contexts/allSelectedMedias";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const RIGHT_CLICK = 2;
export const LEFT_CLICK = 0;

// First to receive event.
function selectOrPlayMedia(
	e: React.PointerEvent<HTMLButtonElement>,
	mediaPath: Path,
): void {
	const listTypeToDisplay = getListTypeToDisplay().current;
	const isNotClickForCtxMenu = e.button === LEFT_CLICK;

	if (isNotClickForCtxMenu)
		if (!e.ctrlKey) {
			// Ctrl also selects a media!
			playThisMedia(mediaPath, listTypeToDisplay);

			return;
		}

	toggleSelectedMedia(mediaPath);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

const fallbackImg = <MusicNote size="1.4rem" />;

const Row = memo<RowProps>(
	({ media, path }) => {
		const [isOpen, setIsOpen] = useState(false);

		return (
			<div
				data-is-selected-row={getAllSelectedMedias().has(path)}
				data-is-playing-row={getCurrentPlaying().path === path}
				data-path={path}
				data-row-wrapper
			>
				<button
					onPointerUp={(e) => selectOrPlayMedia(e, path)}
					title={t("tooltips.playThisMedia")}
					type="button"
				>
					<div className="row-img">
						<ImgWithFallback
							Fallback={fallbackImg}
							mediaImg={media.image}
							mediaPath={path}
						/>
					</div>

					<div className="row-info">
						<p>{media.title}</p>

						<p>
							{media.duration}
							&nbsp;&nbsp;&nbsp;{media.artist && "|"}&nbsp;&nbsp;&nbsp;
							{media.artist}
						</p>
					</div>
				</button>

				<>
					<button
						title={t("tooltips.openMediaOptions")}
						className="icon-circle-modal-trigger"
						onPointerUp={() => setIsOpen(true)}
						type="button"
					>
						<Dots size={17} />
					</button>

					<CenteredModal
						className="media-options-modal"
						setIsOpen={setIsOpen}
						isOpen={isOpen}
					>
						<Suspense>
							<MediaOptionsModal
								setIsOpen={setIsOpen}
								media={media}
								path={path}
							/>
						</Suspense>
					</CenteredModal>
				</>
			</div>
		);
	},
	(prev, next) => prev.media.lastModified === next.media.lastModified,
);

Row.displayName = "Row";

/////////////////////////////////////////////

export const ItemContent = (
	_index: number,
	[path, media]: [Path, Media],
): JSX.Element => <Row media={media} path={path} />;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type RowProps = { media: Media; path: Path };
