import type { ID, Media } from "@common/@types/generalTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdMusicNote as MusicNote } from "react-icons/md";
import { Suspense, lazy, useState } from "react";

import { ImgWithFallback } from "../ImgWithFallback";
import { useTranslation } from "@i18n";
import { playThisMedia } from "@contexts/useCurrentPlaying";
import { CenteredModal } from "../CenteredModal";
import { unDiacritic } from "@contexts/usePlaylists";

const MediaOptionsModal = lazy(
	() => import("../MediaListKind/MediaOptionsModal"),
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function MediaSearchRow({ highlight, media, id }: MediaSearchRowProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { t } = useTranslation();

	const index = unDiacritic(media.title).indexOf(highlight);

	return (
		<div className="media-search-row" data-id={id}>
			<button
				onPointerUp={() => playThisMedia(id)}
				title={t("tooltips.playThisMedia")}
			>
				<div>
					<ImgWithFallback
						Fallback={<MusicNote size={13} />}
						mediaImg={media.image}
						mediaID={id}
					/>
				</div>

				<div className="highlight">
					<p>
						{media.title.slice(0, index)}

						<span>{media.title.slice(index, index + highlight.length)}</span>

						{media.title.slice(index + highlight.length)}
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
					className="grid center max-w-md min-w-[300px] p-8 bg-dialog"
					isOpen={isOpen}
				>
					<Suspense>
						<MediaOptionsModal setIsOpen={setIsOpen} media={media} path={id} />
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
	id: ID;
};
