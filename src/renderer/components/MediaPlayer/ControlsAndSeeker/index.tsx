import {
	MdRepeatOne as RepeatOne,
	MdShuffleOn as RandomOn,
	MdShuffle as RandomOff,
	MdRepeat as RepeatAll,
} from "react-icons/md";

import { selectT, useTranslator } from "@i18n";
import { CircleIconButton } from "@components/CircleIconButton";
import { SeekerWrapper } from "../Seeker";
import { Controls } from "./Controls";
import {
	toggleLoopMedia,
	usePlayOptions,
	toggleRandom,
} from "@contexts/playOptions";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ControlsAndSeeker({ isThereAMedia }: Props): JSX.Element {
	const { isRandom, loopThisMedia } = usePlayOptions();
	const t = useTranslator(selectT);

	return (
		<div className="media-player-seeker">
			<SeekerWrapper isThereAMedia={isThereAMedia} />

			<div>
				<CircleIconButton
					title={t("tooltips.toggleLoopThisMedia")}
					onPointerUp={toggleLoopMedia}
					disabled={!isThereAMedia}
				>
					{loopThisMedia ? <RepeatOne size="18" /> : <RepeatAll size="18" />}
				</CircleIconButton>

				<Controls isThereAMedia={isThereAMedia} />

				<CircleIconButton
					title={t("tooltips.toggleRandom")}
					onPointerUp={toggleRandom}
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

type Props = Readonly<{
	isThereAMedia: boolean;
}>;
