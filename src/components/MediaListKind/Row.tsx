import type { DateAsNumber, Media, Path } from "@renderer/common/@types/generalTypes";

import { memo, Suspense, lazy, useState } from "react";
import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdAudiotrack as MusicNote } from "react-icons/md";

import { getCurrentPlaying, playThisMedia } from "@contexts/useCurrentPlaying";
import { ImgWithFallback } from "../ImgWithFallback";
import { useTranslation } from "@i18n";
import { CenteredModal } from "../CenteredModal";
import { getFromList } from "./states";
import {
	getAllSelectedMedias,
	toggleSelectedMedia,
} from "@contexts/useAllSelectedMedias";

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
	console.log("TODO: make sure this works");

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

const Row = memo<RowProps>(
	({ media, path }) => {
		const [isOpen, setIsOpen] = useState(false);
		const { t } = useTranslation();

		return (
			<div
				data-is-selected-row={getAllSelectedMedias().has(path)}
				data-is-playing-row={getCurrentPlaying().path === path}
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
