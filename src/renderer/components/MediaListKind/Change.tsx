import type { Dispatch, SetStateAction, KeyboardEvent } from "react";
import type { DefaultLists } from "@contexts";
import type { Media, Path } from "@common/@types/typesAndEnums";
import type { WriteTag } from "@common/@types/electron-window";

import { useState } from "react";

import { InputWrapper } from "./styles";

export function Change({ setWhatToChange, whatToChange, mediaPath }: Props) {
	const [value, setValue] = useState(() => whatToChange.current);

	const writeChange = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && value) {
			setWhatToChange(undefined);

			const event = new CustomEvent("write tag", {
				detail: { mediaPath, [whatToChange.whatToChange]: value.trim() },
			});
			window.twoWayComm_React_Electron?.dispatchEvent(event);
		}
	};

	return (
		<InputWrapper>
			<input
				onChange={e => setValue(e.target.value)}
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

const allowedOptionToChange: Readonly<Array<keyof WriteTag>> = [
	"imageURL",
	"genres",
	"artist",
	"album",
	"title",
];

export const isChangeable = (option: string): option is ChangeOptions =>
	allowedOptionToChange.some(opt => opt === option);

export type ChangeOptions = typeof allowedOptionToChange[number];

export type MediaListKindProps = Readonly<{
	mediaType: DefaultLists;
}>;

type Props = {
	setWhatToChange: Dispatch<
		SetStateAction<
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
};
