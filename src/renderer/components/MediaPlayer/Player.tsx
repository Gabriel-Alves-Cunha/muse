import type { ID, Media } from "@common/@types/generalTypes";

import { IoMdMusicalNote as MusicNote } from "react-icons/io";

import { ControlsAndSeeker } from "./ControlsAndSeeker";
import { ImgWithFallback } from "../ImgWithFallback";
import { Header } from "./Header";

export const Player = ({ media, id }: PlayerProps) => (
	<>
		<Header media={media} id={id} />

		<div className="media-player-img">
			<ImgWithFallback
				Fallback={<MusicNote size={30} />}
				mediaImg={media?.image}
				mediaID={id}
			/>
		</div>

		<div className="media-info">
			<span className="text-xl font-medium">{media?.title}</span>

			<span className="text-sm font-normal">{media?.artist}</span>
		</div>

		<ControlsAndSeeker isThereAMedia={Boolean(id)} />
	</>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type PlayerProps = {
	media: Media | undefined;
	id: ID;
};
