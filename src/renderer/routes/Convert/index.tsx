import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { Path } from "@common/@types/typesAndEnums";

import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { MsgBetweenChildrenEnum, sendMsg } from "@contexts";

import { MainAreaExtended } from "./styles";

export function Convert() {
	const [selectedExtensionToBeConvertedTo] =
		useState<ExtensionToBeConvertedTo>("mp3");
	const [selectedMediasPath, setSelectedMediasPath] = useState<Path[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	function handleSelectedFiles(e: ChangeEvent<HTMLInputElement>) {
		const files = e.target.files;
		if (!files) return;

		const paths: Path[] = [];
		for (const file of files) paths.push(file.path);

		setSelectedMediasPath(paths);
	}

	useEffect(() => {
		function convertTo() {
			const values = selectedMediasPath.map(path => ({
				toExtension: selectedExtensionToBeConvertedTo,
				canStartConvert: true,
				path,
			}));

			sendMsg({ type: MsgBetweenChildrenEnum.START_CONVERT, values });

			setSelectedMediasPath([]);
		}

		// If there is selected files, convert them:
		if (selectedMediasPath.length > 0) convertTo();
	}, [selectedExtensionToBeConvertedTo, selectedMediasPath]);

	const handleClick = () => inputRef.current?.click();

	return (
		<MainAreaExtended>
			<div onClick={handleClick}>
				<input
					onInput={handleSelectedFiles}
					accept="video/*,audio/*"
					ref={inputRef}
					type="file"
					multiple
				/>
				Select a media
			</div>
		</MainAreaExtended>
	);
}
