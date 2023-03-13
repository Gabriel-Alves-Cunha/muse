import type { Path, Media } from "@common/@types/GeneralTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { Suspense, useState } from "react";
import { useSnapshot } from "valtio";

import { currentPlaying, playThisMedia } from "@contexts/currentPlaying";
import { MediaOptionsModal } from "../MediaListKind/MediaOptionsModal";
import { allSelectedMedias } from "@contexts/allSelectedMedias";
import { ImgWithFallback } from "../ImgWithFallback";
import { CenteredModal } from "../CenteredModal";
import { translation } from "@i18n";
import { unDiacritic } from "@contexts/playlists";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function MediaSearchRow({
	highlight,
	media,
	path,
}: MediaSearchRowProps) {
	const [isMediaOptionsModalOpen, setIsMediaOptionsModalOpen] = useState(false);
	const t = useSnapshot(translation).t;

	const index = unDiacritic(media.title).indexOf(highlight);

	return (
		<div
			data-is-selected-row={allSelectedMedias.has(path)}
			data-is-playing-row={currentPlaying.path === path}
			className="media-search-row"
			data-path={path}
		>
			<button
				onPointerUp={() => playThisMedia(path)}
				title={t("tooltips.playThisMedia")}
			>
				<div>
					<ImgWithFallback mediaImg={media.image} mediaPath={path} />
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
					onPointerUp={() => setIsMediaOptionsModalOpen(true)}
					title={t("tooltips.openMediaOptions")}
					className="icon-circle-modal-trigger"
				>
					<Dots size={17} />
				</button>

				<CenteredModal
					className="grid max-w-md min-w-[300px] p-8 bg-dialog"
					setIsOpen={setIsMediaOptionsModalOpen}
					isOpen={isMediaOptionsModalOpen}
				>
					<Suspense>
						<MediaOptionsModal
							setIsOpen={setIsMediaOptionsModalOpen}
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
