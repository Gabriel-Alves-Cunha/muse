import type { ID, Media } from "@common/@types/generalTypes";

import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdMusicNote as MusicNote } from "react-icons/md";
import { Suspense, lazy } from "react";

import { ImgWithFallback } from "../ImgWithFallback";
import { useTranslation } from "@i18n";
import { playThisMedia } from "@contexts/useCurrentPlaying";
import { unDiacritic } from "@contexts/usePlaylists";
import {
	CenteredModalContent,
	CenteredModalTrigger,
} from "@components/CenteredModal";

const MediaOptionsModal = lazy(
	() => import("../MediaListKind/MediaOptionsModal"),
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

const mediaOptionsModalID_mediaSearchRow =
	"media-options-modal-media-search-row";

export function MediaSearchRow({ highlight, media, id }: MediaSearchRowProps) {
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

				{/* size: "calc(100% - 5px)" */}
				<div className="highlight">
					<p>
						{media.title.slice(0, index)}

						<span>{media.title.slice(index, index + highlight.length)}</span>

						{media.title.slice(index + highlight.length)}
					</p>
				</div>
			</button>

			<>
				<CenteredModalTrigger
					labelProps={{ title: t("tooltips.openMediaOptions") }}
					htmlTargetName={mediaOptionsModalID_mediaSearchRow}
					labelClassName="icon-circle-modal-trigger"
				>
					<Dots size={17} />
				</CenteredModalTrigger>

				<CenteredModalContent
					className="grid center max-w-md min-w-[300px] p-8 bg-dialog"
					htmlFor={mediaOptionsModalID_mediaSearchRow}
				>
					<Suspense>
						<MediaOptionsModal media={media} path={id} />
					</Suspense>
				</CenteredModalContent>
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
