import type { Path } from "@common/@types/generalTypes";

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

export function LoadOrToggleLyrics({ lyrics, path }: LoadOrToggleLyricsProps) {
	const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

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

type LoadOrToggleLyricsProps = {
	lyrics: string | undefined;
	path: Path;
};
