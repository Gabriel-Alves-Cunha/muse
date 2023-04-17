import type { Path, Media } from "@common/@types/GeneralTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { Suspense, useState } from "react";

import { selectT, useTranslator } from "@i18n";
import { allSelectedMediasRef } from "@contexts/allSelectedMedias";
import { MediaOptionsModal } from "../MediaListKind/MediaOptionsModal";
import { ImgWithFallback } from "../ImgWithFallback";
import { CenteredModal } from "../CenteredModal";
import { unDiacritic } from "@contexts/playlists";
import {
	useCurrentPlaying,
	playThisMedia,
	selectPath,
} from "@contexts/currentPlaying";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function MediaSearchRow({
	highlight,
	media,
	path,
}: MediaSearchRowProps): JSX.Element {
	const [isMediaOptionsModalOpen, setIsMediaOptionsModalOpen] = useState(false);
	const currentPlayingPath = useCurrentPlaying(selectPath);
	const allSelectedMedias = allSelectedMediasRef().current;
	const t = useTranslator(selectT);

	const index = unDiacritic(media.title).indexOf(highlight);

	return (
		<div
			data-is-selected-row={allSelectedMedias.has(path)}
			data-is-playing-row={currentPlayingPath === path}
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

type MediaSearchRowProps = Readonly<{
	highlight: string;
	media: Media;
	path: Path;
}>;
