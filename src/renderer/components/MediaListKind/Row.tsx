import type { DateAsNumber, Media, Path } from "@common/@types/generalTypes";

import { memo, Suspense, lazy, useState } from "react";
import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdAudiotrack as MusicNote } from "react-icons/md";
import { useSnapshot } from "valtio";

import { currentPlaying, playThisMedia } from "@contexts/currentPlaying";
import { ImgWithFallback } from "../ImgWithFallback";
import { CenteredModal } from "../CenteredModal";
import { translation } from "@i18n";
import { fromList } from "./states";
import {
	toggleSelectedMedia,
	allSelectedMedias,
} from "@contexts/allSelectedMedias";

const MediaOptionsModal = lazy(() => import("./MediaOptionsModal"));

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////

export const rightClick = 2;
export const leftClick = 0;

function selectOrPlayMedia(
	e: React.PointerEvent<HTMLButtonElement>,
	mediaPath: Path,
): void {
	if (e.button !== leftClick || !e.ctrlKey) {
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

const Row = memo<RowProps>(
	({ media, path }) => {
		const translationAccessor = useSnapshot(translation);
		const [isOpen, setIsOpen] = useState(false);
		const t = translationAccessor.t;

		return (
			<div
				data-is-selected-row={allSelectedMedias.has(path)}
				data-is-playing-row={currentPlaying.path === path}
				data-row-wrapper
				data-path={path}
			>
				<button
					onPointerUp={(e) => selectOrPlayMedia(e, path)}
					title={t("tooltips.playThisMedia")}
				>
					<div className="row-img">
						<ImgWithFallback
							Fallback={<MusicNote size="1.4rem" />}
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
