import type { ID, Media } from "@common/@types/generalTypes";

import { IoMdMusicalNote as MusicNote } from "react-icons/io";

import { ControlsAndSeeker } from "./ControlsAndSeeker";
import { ImgWithFallback } from "../ImgWithFallback";
import { Header } from "./Header";

export const Player = ({ media, audio, id, isSeeking }: PlayerProps) => (
	<>
		<Header media={media} id={id} />

		<div className="aspect-square rounded-2xl flex items-center justify-center w-full shadow-reflect mt-[25%]">
			<ImgWithFallback
				Fallback={<MusicNote size={30} />}
				mediaImg={media?.image}
				mediaID={id}
			/>
		</div>

		<div className="flex flex-col justify-center items-center h-[10vh] w-full mt-[3vh]">
			<span
				className="flex justify-center items-center w-full text-icon-media-player flex-wrap font-secondary tracking-wide text-center overflow-y-hidden text-xl font-medium"
				id="title"
			>
				{media?.title}
			</span>

			<span
				className="flex justify-center items-center w-full text-icon-media-player flex-wrap font-secondary tracking-wide text-center overflow-y-hidden text-sm font-normal"
				id="subtitle"
			>
				{media?.artist}
			</span>
		</div>

		<ControlsAndSeeker audio={audio} isSeeking={isSeeking} />
	</>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type PlayerProps = {
	isSeeking: React.MutableRefObject<boolean>;
	audio: HTMLAudioElement | null;
	media: Media | undefined;
	id: ID;
};
