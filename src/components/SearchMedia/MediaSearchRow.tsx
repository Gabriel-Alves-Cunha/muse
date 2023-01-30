import type { Path, Media } from "@renderer/common/@types/generalTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdMusicNote as MusicNote } from "react-icons/md";
import { Suspense, lazy, useState } from "react";

import { getCurrentPlaying, playThisMedia } from "@contexts/useCurrentPlaying";
import { getAllSelectedMedias } from "@contexts/useAllSelectedMedias";
import { ImgWithFallback } from "../ImgWithFallback";
import { useTranslation } from "@i18n";
import { CenteredModal } from "../CenteredModal";
import { unDiacritic } from "@contexts/usePlaylists";

const MediaOptionsModal = lazy(
	() => import("../MediaListKind/MediaOptionsModal"),
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function MediaSearchRow({
	highlight,
	media,
	path,
}: MediaSearchRowProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useTranslation();

	const index = unDiacritic(media.title).indexOf(highlight);

	return (
		<div
			data-is-selected-row={getAllSelectedMedias().has(path)}
			data-is-playing-row={getCurrentPlaying().path === path}
			className="media-search-row"
			data-path={path}
		>
			<button
				onPointerUp={() => playThisMedia(path)}
				title={t("tooltips.playThisMedia")}
			>
				<div>
					<ImgWithFallback
						Fallback={<MusicNote size={17} />}
						mediaImg={media.image}
						mediaPath={path}
					/>
				</div>

				<div className="highlight">
					<p>
						{media.title.slice(0, index)}

						<span>{media.title.slice(index, index + highlight.length)}</span>

						{media.title.slice(index + highlight.length)}
					</p>

					<p>{media.artist}</p>
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
					className="grid max-w-md min-w-[300px] p-8 bg-dialog"
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
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type MediaSearchRowProps = {
	highlight: string;
	media: Media;
	path: Path;
};
