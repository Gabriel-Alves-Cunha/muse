import type { Path } from "@renderer/common/@types/generalTypes";

import { BsJournalText as LyricsPresent } from "react-icons/bs";
import { BsJournal as NoLyrics } from "react-icons/bs";
import { useState } from "react";

import { flipMediaPlayerCard, searchAndOpenLyrics } from "../Lyrics";
import { CircleIconButton } from "@components/CircleIconButton";
import { useTranslation } from "@i18n";
import { RingLoader } from "@components/RingLoader";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export const openLyrics = true;

export function LoadOrToggleLyrics({ lyrics, path }: LoadOrToggleLyricsProps) {
	const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
	const { t } = useTranslation();

	function loadAndOrToggleLyrics(): void {
		if (lyrics) return flipMediaPlayerCard();

		setIsLoadingLyrics(true);
		searchAndOpenLyrics(path, openLyrics).then();
		setIsLoadingLyrics(false);
	}

	return (
		<CircleIconButton
			title={t("tooltips.toggleOpenLyrics")}
			onPointerUp={loadAndOrToggleLyrics}
			disabled={!path}
		>
			{lyrics ? (
				<LyricsPresent size={16} />
			) : isLoadingLyrics ? (
				<RingLoader className="absolute" />
			) : (
				<NoLyrics size={16} />
			)}
		</CircleIconButton>
	);
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type LoadOrToggleLyricsProps = {
	lyrics: string | undefined;
	path: Path;
};
