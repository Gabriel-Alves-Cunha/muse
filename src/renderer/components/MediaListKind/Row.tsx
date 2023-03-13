import type { DateAsNumber, Media, Path } from "@common/@types/GeneralTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { memo, Suspense, useState } from "react";

import { currentPlaying, playThisMedia } from "@contexts/currentPlaying";
import { MediaOptionsModal } from "./MediaOptionsModal";
import { ImgWithFallback } from "../ImgWithFallback";
import { CenteredModal } from "../CenteredModal";
import { translation } from "@i18n";
import { fromList } from "./states";
import {
	toggleSelectedMedia,
	allSelectedMedias,
} from "@contexts/allSelectedMedias";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const rightClick = 2;
export const leftClick = 0;

// First to receive event.
function selectOrPlayMedia(
	e: React.PointerEvent<HTMLButtonElement>,
	mediaPath: Path,
): void {
	const isNotClickForCtxMenu = e.button === leftClick;

	if (isNotClickForCtxMenu)
		if (!e.ctrlKey) {
			// Ctrl also selects a media!
			const { curr, homeList, isHome } = fromList;
			const list = isHome ? homeList : curr;

			return playThisMedia(mediaPath, list);
		}

	toggleSelectedMedia(mediaPath);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

const fallbackImg = <MusicNote size="1.4rem" />;
const { t } = translation;

const Row = memo<RowProps>(
	({ media, path }) => {
		const [isOpen, setIsOpen] = useState(false);

		return (
			<div
				data-is-selected-row={allSelectedMedias.has(path)}
				data-is-playing-row={currentPlaying.path === path}
				data-path={path}
				data-row-wrapper
			>
				<button
					onPointerUp={(e) => selectOrPlayMedia(e, path)}
					title={t("tooltips.playThisMedia")}
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

							{media.artist && `&emsp;|&emsp;${media.artist}`}
						</p>
					</div>
				</button>

				<>
					<button
						title={t("tooltips.openMediaOptions")}
						className="icon-circle-modal-trigger"
						onPointerUp={() => setIsOpen(true)}
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

/////////////////////////////////////////////

export const itemContent = (
	_index: number,
	[path, media]: [Path, Media, DateAsNumber],
) => <Row media={media} path={path} />;

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type RowProps = { media: Media; path: Path };
