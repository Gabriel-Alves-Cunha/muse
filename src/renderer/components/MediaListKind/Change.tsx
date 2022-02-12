import type { Dispatch, SetStateAction, KeyboardEvent } from "react";
import type { DefaultLists } from "@contexts";
import type { Media, Path } from "@common/@types/typesAndEnums";

import { useState } from "react";

import { InputWrapper } from "./styles";
import { dbg } from "@common/utils";

export function Change({ setWhatToChange, whatToChange, mediaPath }: Props) {
	const [value, setValue] = useState(() => whatToChange.current);

	const writeChange = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && value) {
			setWhatToChange(undefined);

			const msg = {
				details: [mediaPath, whatToChange.whatToChangeToSend, value.trim()],
				type: "write tag",
			};

			if (window.twoWayComm_React_Electron) {
				dbg("Posting message:", msg);
				window.twoWayComm_React_Electron.postMessage(msg);
			} else console.error("There is no 'window.twoWayComm_React_Electron'!");
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

export const options = ({
	duration,
	artist,
	album,
	genres,
	title,
	size,
	path,
}: Media) =>
	({
		duration,
		artist,
		genres,
		title,
		album,
		path,
		size,
	} as const);

export const allowedOptionToChange = {
	artist: "albumArtists",
	imageURL: "imageURL",
	genres: "genres",
	album: "album",
	title: "title",
} as const;

export const isChangeable = (option: string): option is ChangeOptions =>
	Object.keys(allowedOptionToChange).some(opt => opt === option);

type Keys = keyof typeof allowedOptionToChange;
export type ChangeOptionsToSend = typeof allowedOptionToChange[Keys];
export type ChangeOptions = keyof typeof allowedOptionToChange;

export type MediaListKindProps = Readonly<{
	mediaType: DefaultLists;
}>;

type Props = {
	setWhatToChange: Dispatch<
		SetStateAction<
			| {
					whatToChangeToSend: ChangeOptionsToSend;
					whatToChange: ChangeOptions;
					current: string;
			  }
			| undefined
		>
	>;
	whatToChange: {
		whatToChangeToSend: ChangeOptionsToSend;
		whatToChange: ChangeOptions;
		current: string;
	};
	mediaPath: Path;
};
