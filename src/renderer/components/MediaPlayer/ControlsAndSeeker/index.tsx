import { useSnapshot } from "valtio";
import {
	MdRepeatOne as RepeatOne,
	MdShuffleOn as RandomOn,
	MdShuffle as RandomOff,
	MdRepeat as Repeat,
} from "react-icons/md";

import { CircleIconButton } from "@components/CircleIconButton";
import { SeekerWrapper } from "../Seeker";
import { translation } from "@i18n";
import { Controls } from "./Controls";
import {
	toggleLoopMedia,
	toggleRandom,
	playOptions,
} from "@contexts/playOptions";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ControlsAndSeeker({ isThereAMedia }: Props) {
	const playOptionsAccessor = useSnapshot(playOptions);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

	return (
		<div className="media-player-seeker">
			<SeekerWrapper isThereAMedia={isThereAMedia} />

			<div>
				<CircleIconButton
					title={t("tooltips.toggleLoopThisMedia")}
					onPointerUp={toggleLoopMedia}
					disabled={!isThereAMedia}
				>
					{playOptionsAccessor.loopThisMedia ? (
						<RepeatOne size="18" />
					) : (
						<Repeat size="18" />
					)}
				</CircleIconButton>

				<Controls isThereAMedia={isThereAMedia} />

				<CircleIconButton
					title={t("tooltips.toggleRandom")}
					onPointerUp={toggleRandom}
					disabled={!isThereAMedia}
				>
					{playOptionsAccessor.isRandom ? (
						<RandomOn size="18" />
					) : (
						<RandomOff size="18" />
					)}
				</CircleIconButton>
			</div>
		</div>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = {
	isThereAMedia: boolean;
};
