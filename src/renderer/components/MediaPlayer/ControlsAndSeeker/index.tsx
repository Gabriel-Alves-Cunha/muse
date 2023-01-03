import {
	MdRepeatOne as RepeatOne,
	MdShuffleOn as RandomOn,
	MdShuffle as RandomOff,
	MdRepeat as Repeat,
} from "react-icons/md";

import { type Audio, Controls } from "./Controls";
import { CircleIconButton } from "@components/CircleIconButton";
import { useTranslation } from "@i18n";
import { SeekerWrapper } from "../Seeker";
import {
	toggleLoopMedia,
	usePlayOptions,
	toggleRandom,
} from "@contexts/usePlayOptions";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export function ControlsAndSeeker({ audio }: RefToAudio) {
	const { isRandom, loopThisMedia } = usePlayOptions();
	const { t } = useTranslation();

	const isThereAMedia = !audio?.src;

	return (
		<div className="absolute flex flex-col bottom-10 w-full">
			<SeekerWrapper audio={audio} />

			<div className="flex justify-between items-center mt-[10%]">
				<CircleIconButton
					title={t("tooltips.toggleLoopThisMedia")}
					onPointerUp={toggleLoopMedia}
					disabled={isThereAMedia}
				>
					{loopThisMedia ? <RepeatOne size="18" /> : <Repeat size="18" />}
				</CircleIconButton>

				<Controls audio={audio} isDisabled={isThereAMedia} />

				<CircleIconButton
					title={t("tooltips.toggleRandom")}
					onPointerUp={toggleRandom}
					disabled={isThereAMedia}
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

export type RefToAudio = {
	audio: Audio;
};
