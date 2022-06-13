import type { AllowedMedias } from "@common/utils";
import type { Path } from "@common/@types/generalTypes";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { SiConvertio as ConvertIcon } from "react-icons/si";

import { MainArea } from "@components/MainArea";
import {
	type ConvertInfo,
	useNewConvertions,
} from "@modules/Converting/helper";

import { OpenFilePickerButton, Box } from "./styles";

export function Convert() {
	const [selectedMedias, setSelectedMedias] = useState<[Path, ConvertInfo][]>(
		[],
	);
	const [toExtension] = useState<AllowedMedias>("mp3");
	const inputRef = useRef<HTMLInputElement>(null);

	function handleSelectedFiles(
		{ target: { files } }: ChangeEvent<HTMLInputElement>,
	) {
		if (!files?.length) return;

		setSelectedMedias(
			[...files].map(
				file => [file.path, { canStartConvert: true, toExtension }]
			),
		);
	}

	const openChooseFilesNativeUI = () => inputRef.current?.click();

	// Start converting
	useEffect(() => {
		// If there are selected files, convert them:
		if (selectedMedias.length > 0) {
			// To start convert, add to the convertInfoList:
			useNewConvertions.setState({ newConvertions: new Map(selectedMedias) });

			setSelectedMedias([]);
		}
	}, [toExtension, selectedMedias]);

	return (
		<MainArea>
			<Box>
				<OpenFilePickerButton
					onClick={openChooseFilesNativeUI}
					className="notransition"
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
				</OpenFilePickerButton>
			</Box>
		</MainArea>
	);
}
