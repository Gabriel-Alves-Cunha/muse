import type { DefaultLists } from "@contexts";
import type { WhatToChange } from ".";
import type { MsgObject } from "@common/@types/electron-window";

import {
	type SetStateAction,
	type KeyboardEvent,
	type Dispatch,
	useState,
} from "react";

import { type Path, NotificationEnum } from "@common/@types/typesAndEnums";

import { InputWrapper } from "../styles";

export function Change({ setWhatToChange, whatToChange, mediaPath }: Props) {
	const [value, setValue] = useState(whatToChange.current);

	const writeChange = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && value) {
			setWhatToChange(undefined);

			const msg: MsgObject = {
				type: NotificationEnum.WRITE_TAG,
				details: {
					whatToSend: whatToChange.whatToSend,
					value: value.trim(),
					mediaPath,
				},
			};

			window.twoWayComm_React_Electron
				? window.twoWayComm_React_Electron.postMessage(msg)
				: console.error("There is no 'window.twoWayComm_React_Electron'!");
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

export const allowedOptionToChange = Object.freeze({
	artist: "albumArtists",
	imageURL: "imageURL",
	genres: "genres",
	album: "album",
	title: "title",
} as const);

export const isChangeable = (option: string): option is ChangeOptions =>
	Object.keys(allowedOptionToChange).some(opt => opt === option);

type Keys = keyof typeof allowedOptionToChange;
export type ChangeOptionsToSend = typeof allowedOptionToChange[Keys];
export type ChangeOptions = keyof typeof allowedOptionToChange;

export type MediaListKindProps = Readonly<{
	playlistName: DefaultLists;
}>;

type Props = Readonly<{
	setWhatToChange: Dispatch<SetStateAction<WhatToChange | undefined>>;
	whatToChange: WhatToChange;
	mediaPath: Path;
}>;
