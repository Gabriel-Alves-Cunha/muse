import type { AllowedMedias } from "@common/utils";
import type { Path } from "@common/@types/typesAndEnums";

import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { setConvertInfoList } from "@modules/Converting/helper";
import { MainArea } from "@components";

import { BorderedButton } from "./styles";

export function Convert() {
	const [selectedMediasPath, setSelectedMediasPath] = useState<readonly Path[]>(
		[],
	);
	const [toExtension] = useState<AllowedMedias>("mp3");
	const inputRef = useRef<HTMLInputElement>(null);

	function handleSelectedFiles(e: ChangeEvent<HTMLInputElement>) {
		const files = e.target.files;
		if (!files) return;

		const paths: Path[] = [];
		for (const file of files) paths.push(file.path);

		setSelectedMediasPath(paths);
	}

	useEffect(() => {
		const convertTo = () => {
			const convertInfo = selectedMediasPath.map(path => ({
				canStartConvert: true,
				toExtension,
				path,
			}));

			// Start convert:
			setConvertInfoList(convertInfo);

			setSelectedMediasPath([]);
		};

		// If there is selected files, convert them:
		if (selectedMediasPath.length > 0) convertTo();
	}, [toExtension, selectedMediasPath]);

	const handleClick = () => inputRef.current?.click();

	return (
		<MainArea>
			{/* TODO: see why this `handleClick`: */}
			<BorderedButton onClick={handleClick}>
				<input
					onInput={handleSelectedFiles}
					accept="video/*,audio/*"
					ref={inputRef}
					type="file"
					multiple
				/>
				Select media(s)
			</BorderedButton>
		</MainArea>
	);
}
