import type { ID } from "@common/@types/generalTypes";

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

export function LoadOrToggleLyrics({ lyrics, id }: LoadOrToggleLyricsProps) {
	const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
	const { t } = useTranslation();

	async function loadAndOrToggleLyrics(): Promise<void> {
		if (lyrics) return flipMediaPlayerCard();

		setIsLoadingLyrics(true);
		await searchAndOpenLyrics(id, openLyrics);
		setIsLoadingLyrics(false);
	}

	return (
		<CircleIconButton
			title={t("tooltips.toggleOpenLyrics")}
			onPointerUp={loadAndOrToggleLyrics}
			disabled={!id}
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
	id: ID;
};
