import type { AllowedMedias } from "@common/utils";
import type { Path } from "@common/@types/generalTypes";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { SiConvertio as ConvertIcon } from "react-icons/si";

import { MainArea } from "@components/MainArea";
import {
	useNewConvertions,
	type ConvertInfo,
} from "@components/Converting/helper";

import { Box } from "./styles";
import { Button } from "@components/Button";

export function Convert() {
	const [selectedMedias, setSelectedMedias] = useState<[Path, ConvertInfo][]>(
		[]
	);
	const [toExtension] = useState<AllowedMedias>("mp3");
	const inputRef = useRef<HTMLInputElement>(null);

	function handleSelectedFiles({
		target: { files },
	}: ChangeEvent<HTMLInputElement>) {
		if (!files?.length) return;

		setSelectedMedias(
			[...files].map(file => [
				file.path,
				{ canStartConvert: true, toExtension },
			])
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
				<Button
					onClick={openChooseFilesNativeUI}
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
