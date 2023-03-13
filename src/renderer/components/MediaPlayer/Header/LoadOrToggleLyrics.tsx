import type { Path } from "@common/@types/GeneralTypes";

import { BsJournalText as LyricsPresent } from "react-icons/bs";
import { BsJournal as NoLyrics } from "react-icons/bs";
import { useSnapshot } from "valtio";
import { useState } from "react";

import { flipMediaPlayerCard, searchAndOpenLyrics } from "../Lyrics";
import { CircleIconButton } from "@components/CircleIconButton";
import { translation } from "@i18n";
import { RingLoader } from "@components/RingLoader";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export const openLyrics = true;

export function LoadOrToggleLyrics({ lyrics, path }: Props) {
	const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
	const t = useSnapshot(translation).t;

	async function loadAndOrToggleLyrics(): Promise<void> {
		if (lyrics) return flipMediaPlayerCard();

		setIsLoadingLyrics(true);
		await searchAndOpenLyrics(path, openLyrics);
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

type Props = {
	lyrics: string | undefined;
	path: Path;
};
