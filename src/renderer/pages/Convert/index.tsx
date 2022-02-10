import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { Path } from "@common/@types/typesAndEnums";

import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { Type, sendMsg } from "@contexts/communicationBetweenChildren/helpers";

import { Wrapper } from "./styles";

export function Convert() {
	const [selectedExtensionToBeConvertedTo] =
		useState<ExtensionToBeConvertedTo>("mp3");
	const [selectedMediasPath, setSelectedMediasPath] = useState<Path[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	function convertTo() {
		const value = selectedMediasPath.map(path => ({
			toExtension: selectedExtensionToBeConvertedTo,
			canStartConvert: true,
			path,
		}));

		sendMsg({ type: Type.START_CONVERT, value });

		setSelectedMediasPath([]);
	}

	function handleSelectedFiles(e: ChangeEvent<HTMLInputElement>) {
		const files = e.target.files;
		if (!files) return;

		const paths: Path[] = [];
		for (const file of files) paths.push(file.path);

		setSelectedMediasPath(paths);
	}

	useEffect(() => {
		if (selectedMediasPath[0]) convertTo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedMediasPath]);

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
