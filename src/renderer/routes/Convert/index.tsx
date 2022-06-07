import type { AllowedMedias } from "@common/utils";
import type { Path } from "@common/@types/generalTypes";

import { type ChangeEvent, useEffect, useRef, useState } from "react";

import { MainArea } from "@components/MainArea";
import {
	setConvertInfoList,
	getConvertInfoList,
} from "@modules/Converting/helper";

import { BorderedButton } from "./styles";

export function Convert() {
	const [selectedMediasPath, setSelectedMediasPath] = useState<readonly Path[]>(
		[],
	);
	const [toExtension] = useState<AllowedMedias>("mp3");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSelectedFiles = ({
		target: { files },
	}: ChangeEvent<HTMLInputElement>) => {
		if (!files) return;

		const paths: Path[] = [];
		for (const file of files) paths.push(file.path);

		setSelectedMediasPath(paths);
	};

	const handleClick = () => inputRef.current?.click();

	useEffect(() => {
		const convertTo = () => {
			const convertInfoList_ = getConvertInfoList();

			selectedMediasPath.forEach(path =>
				convertInfoList_.set(path, {
					canStartConvert: true,
					toExtension,
				}),
			);

			// Start convert:
			setConvertInfoList(convertInfoList_);

			setSelectedMediasPath([]);
		};

		// If there is selected files, convert them:
		if (selectedMediasPath.length > 0) convertTo();
	}, [toExtension, selectedMediasPath]);

	return (
		<MainArea>
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
