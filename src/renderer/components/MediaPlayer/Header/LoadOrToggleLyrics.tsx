import type { Path } from "@common/@types/GeneralTypes";

import { useState } from "react";
import {
	BsJournalText as LyricsPresent,
	BsJournal as NoLyrics,
} from "react-icons/bs";

import { flipMediaPlayerCard, searchAndOpenLyrics } from "../Lyrics";
import { selectT, useTranslator } from "@i18n";
import { CircleIconButton } from "@components/CircleIconButton";
import { RingLoader } from "@components/RingLoader";

///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

export const OPEN_LYRICS = true;

export function LoadOrToggleLyrics({ lyrics, path }: Props): JSX.Element {
	const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
	const t = useTranslator(selectT);

	async function loadAndOrToggleLyrics(): Promise<void> {
		if (lyrics) return flipMediaPlayerCard();

		setIsLoadingLyrics(true);
		await searchAndOpenLyrics(path, OPEN_LYRICS);
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

type Props = Readonly<{
	lyrics: string | undefined;
	path: Path;
}>;
