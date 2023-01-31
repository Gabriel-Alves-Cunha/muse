import type { Path, Media } from "types/generalTypes";

import { IoMdMusicalNote as MusicNote } from "react-icons/io";

import { ControlsAndSeeker } from "./ControlsAndSeeker";
import { ImgWithFallback } from "../ImgWithFallback";
import { Header } from "./Header";

export const Player = ({ media, path }: PlayerProps) => (
	<>
		<Header media={media} path={path} />

		<div className="media-player-img">
			<ImgWithFallback
				Fallback={<MusicNote size={30} />}
				mediaImg={media?.image}
				mediaPath={path}
			/>
		</div>

		<div className="media-info">
			<span className="text-xl font-medium">{media?.title}</span>

			<span className="text-sm font-normal">{media?.artist}</span>
		</div>

		<ControlsAndSeeker isThereAMedia={Boolean(path)} />
	</>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type PlayerProps = {
	media: Media | undefined;
	path: Path;
};
