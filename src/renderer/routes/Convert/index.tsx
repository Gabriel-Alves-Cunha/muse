import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { ChangeEvent } from "react";
import type { Path } from "@common/@types/typesAndEnums";

import { useEffect, useRef, useState } from "react";

import { MsgEnum, sendMsg } from "@contexts";

import { Wrapper } from "./styles";

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
			const value = selectedMediasPath.map(path => ({
				toExtension: selectedExtensionToBeConvertedTo,
				canStartConvert: true,
				path,
			}));

			sendMsg({ type: MsgEnum.START_CONVERT, value });

			setSelectedMediasPath([]);
		}

		if (selectedMediasPath[0]) convertTo();
	}, [selectedExtensionToBeConvertedTo, selectedMediasPath]);

	const handleClick = () => inputRef.current?.click();

	return (
		<Wrapper>
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
		</Wrapper>
	);
}

Convert.whyDidYouRender = {
	logOnDifferentValues: false,
	customName: "Convert",
};
