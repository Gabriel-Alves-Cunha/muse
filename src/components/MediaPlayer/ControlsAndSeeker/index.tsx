import {
	MdRepeatOne as RepeatOne,
	MdShuffleOn as RandomOn,
	MdShuffle as RandomOff,
	MdRepeat as Repeat,
} from "react-icons/md";

import { CircleIconButton } from "@components/CircleIconButton";
import { useTranslation } from "@i18n";
import { SeekerWrapper } from "../Seeker";
import { Controls } from "./Controls";
import {
	toggleLoopMedia,
	usePlayOptions,
	toggleIsRandom,
} from "@contexts/usePlayOptions";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ControlsAndSeeker({ isThereAMedia }: Props) {
	const { isRandom, loopThisMedia } = usePlayOptions();
	const { t } = useTranslation();

	return (
		<div className="media-player-seeker">
			<SeekerWrapper isThereAMedia={isThereAMedia} />

			<div>
				<CircleIconButton
					title={t("tooltips.toggleLoopThisMedia")}
					onPointerUp={toggleLoopMedia}
					disabled={!isThereAMedia}
				>
					{loopThisMedia ? <RepeatOne size="18" /> : <Repeat size="18" />}
				</CircleIconButton>

				<Controls isThereAMedia={isThereAMedia} />

				<CircleIconButton
					title={t("tooltips.toggleRandom")}
					onPointerUp={toggleIsRandom}
					disabled={!isThereAMedia}
				>
					{isRandom ? <RandomOn size="18" /> : <RandomOff size="18" />}
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
