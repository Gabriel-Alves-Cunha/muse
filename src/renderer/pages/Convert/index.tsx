import type { ExtensionToBeConvertedTo } from "@common/@types/electron-window";
import type { Path } from "@common/@types/types";

import { useEffect, useRef, useState } from "react";

import { useInterComm } from "@contexts/communicationBetweenChildren";

import { Wrapper } from "./styles";

export function Convert() {
	const [selectedExtensionToBeConvertedTo, setExtensionToBeConvertedTo] =
		useState<ExtensionToBeConvertedTo>("mp3");
	const [selectedMediasPath, setSelectedMediasPath] = useState<Path[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const { sendMsg } = useInterComm();

	function convertTo() {
		const value = selectedMediasPath.map((path) => ({
			toExtension: selectedExtensionToBeConvertedTo,
			canStartConvert: true,
			path,
		}));

		sendMsg({ type: "startConvert", value });

		setSelectedMediasPath([]);
	}

	function handleSelectedFiles(e: React.ChangeEvent<HTMLInputElement>) {
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
