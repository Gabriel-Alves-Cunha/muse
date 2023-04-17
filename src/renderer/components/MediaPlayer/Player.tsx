import type { Path, Media } from "@common/@types/GeneralTypes";

import { IoMdMusicalNote as MusicNote } from "react-icons/io";

import { ControlsAndSeeker } from "./ControlsAndSeeker";
import { ImgWithFallback } from "../ImgWithFallback";
import { Header } from "./Header";

export const Player = ({ media, path }: Props): JSX.Element => (
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

type Props = Readonly<{
	media: Media | undefined;
	path: Path;
}>;
