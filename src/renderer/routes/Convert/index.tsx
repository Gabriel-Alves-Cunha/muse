import type { AllowedMedias } from "@common/utils";
import type { Path } from "@common/@types/generalTypes";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { SiConvertio as ConvertIcon } from "react-icons/si";

import { MainArea } from "@components/MainArea";
import { emptyMap } from "@utils/map-set";
import { Button } from "@components/Button";
import {
	useNewConvertions,
	type ConvertInfo,
} from "@components/Converting/helper";

import { Box } from "./styles";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Convert() {
	const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>(emptyMap);
	const [toExtension] = useState<AllowedMedias>("mp3");
	const inputRef = useRef<HTMLInputElement>(null);

	////////////////////////////////////////////////

	function handleSelectedFiles(
		{ target: { files } }: ChangeEvent<HTMLInputElement>,
	) {
		if (!files?.length) return;

		const map: Map<Path, ConvertInfo> = new Map();

		for (const file of files)
			map.set(file.webkitRelativePath, { toExtension });

		setSelectedFiles(map);
	}

	////////////////////////////////////////////////

	const openNativeUI_ChooseFiles = () => inputRef.current?.click();

	////////////////////////////////////////////////

	// Start converting
	useEffect(() => {
		// If there are selected files, convert them:
		if (!(selectedFiles.size > 0)) return;

		// To start convert, add to the convertInfoList:
		useNewConvertions.setState({ newConvertions: selectedFiles });

		setSelectedFiles(emptyMap);
	}, [toExtension, selectedFiles]);

	useEffect(() => {
		document.title = "Convert medias files to mp3";
	}, []);

	////////////////////////////////////////////////

	return (
		<MainArea>
			<Box>
				<Button
					onClick={openNativeUI_ChooseFiles}
					className="notransition"
					variant="large"
				>
					<ConvertIcon size={18} />
					<input
						onChange={handleSelectedFiles}
						accept="video/*,audio/*"
						ref={inputRef}
						type="file"
						multiple
					/>
					Select media(s) to convert
				</Button>
			</Box>
		</MainArea>
	);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

type SelectedFiles = ReadonlyMap<Path, ConvertInfo>;
