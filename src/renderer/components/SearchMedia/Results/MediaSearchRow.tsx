import type { ID, Media } from "@common/@types/generalTypes";

import { Dialog, DialogPortal, Overlay } from "@radix-ui/react-dialog";
import { HiOutlineDotsVertical as Dots } from "react-icons/hi";
import { MdMusicNote as MusicNote } from "react-icons/md";

import { MediaOptionsModal } from "@components/MediaListKind/MediaOptionsModal";
import { ImgWithFallback } from "@components/ImgWithFallback";
import { useTranslation } from "@i18n";
import { DialogTrigger } from "@components/DialogTrigger";
import { playThisMedia } from "@contexts/useCurrentPlaying";
import { unDiacritic } from "@contexts/usePlaylists";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const MediaSearchRow = ({
	highlight,
	media,
	id,
}: MediaSearchRowProps) => {
	const { t } = useTranslation();

	const index = unDiacritic(media.title).indexOf(highlight);

	return (
		<div
			className="unset-all box-border relative flex justify-start items-center w-[98%] h-16 left-2 transition-none rounded-md transition-shadow "
			data-id={id}
		>
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
				<div className="flex flex-col items-start justify-center flex-1 m-1 overflow-hidden">
					<p className="pl-1 overflow-ellipsis text-alternative whitespace-nowrap font-secondary tracking-wide text-left text-base font-medium">
						{media.title.slice(0, index)}

						<span className="bg-highlight text-white">
							{media.title.slice(index, index + highlight.length)}
						</span>

						{media.title.slice(index + highlight.length)}
					</p>
				</div>
			</button>

			<Dialog modal>
				<DialogTrigger tooltip={t("tooltips.openMediaOptions")}>
					<Dots size={17} />
				</DialogTrigger>

				<DialogPortal>
					<Overlay className="fixed grid place-items-center bottom-0 right-0 left-0 top-0 blur-sm bg-opacity-10 overflow-y-auto z-20 animation-overlay-show" />

					<MediaOptionsModal media={media} path={id} />
				</DialogPortal>
			</Dialog>
		</div>
	);
};

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type MediaSearchRowProps = {
	highlight: string;
	media: Media;
	id: ID;
};
