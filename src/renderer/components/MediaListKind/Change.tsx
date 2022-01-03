import type { DefaultLists } from "@contexts/mediaListHelper";
import type { Media, Path } from "@common/@types/types";

import { useState } from "react";

const { writeTags } = electron.media;

import { InputWrapper } from "./styles";

export function Change({
	setWhatToChange,
	whatToChange,
	mediaPath,
}: {
	setWhatToChange: React.Dispatch<
		React.SetStateAction<
			| {
					whatToChange: ChangeOptions;
					current: string;
			  }
			| undefined
		>
	>;
	whatToChange: {
		whatToChange: ChangeOptions;
		current: string;
	};
	mediaPath: Path;
}) {
	const [value, setValue] = useState(() => whatToChange.current);

	const writeChange = async (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && value) {
			setWhatToChange(undefined);

			// TODO: send to run this elsewhere outside this react component
			await writeTags(mediaPath, {
				[whatToChange.whatToChange]: value.trim(),
			});
		}
	};

	return (
		<InputWrapper>
			<input
				onChange={(e) => setValue(e.target.value)}
				onKeyPress={writeChange}
				autoCapitalize="on"
				autoComplete="off"
				autoCorrect="on"
				value={value}
				type="text"
				required
			/>
		</InputWrapper>
	);
}

export type ChangeOptions = typeof allowedOptionToChange[number];

export type MediaListKindProps = Readonly<{
	mediaType: DefaultLists;
}>;

export const options = (media: Media) =>
	({
		duration: media.duration,
		artist: media.artist,
		genres: media.genres,
		title: media.title,
		album: media.album,
		path: media.path,
		size: media.size,
	} as const);

const allowedOptionToChange: Readonly<
	Array<keyof Parameters<typeof writeTags>[1]>
> = ["imageURL", "genres", "artist", "album", "title"];

export const isChangeable = (option: string): option is ChangeOptions =>
	allowedOptionToChange.some((opt) => opt === option);
