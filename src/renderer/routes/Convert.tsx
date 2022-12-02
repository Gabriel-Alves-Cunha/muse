import type { AllowedMedias } from "@common/utils";
import type { Path } from "@common/@types/generalTypes";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { MdSwapHoriz as ConvertIcon } from "react-icons/md";

import { t, Translator } from "@components/I18n";
import { MainArea } from "@components/MainArea";
import { useTitle } from "@hooks/useTitle";
import { emptyMap } from "@common/empty";
import { Button } from "@components/Button";
import {
	type ConvertInfo,
	useNewConvertions,
} from "@components/Converting/helper";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Convert() {
	const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>(emptyMap);
	const [toExtension] = useState<AllowedMedias>("mp3");
	const inputRef = useRef<HTMLInputElement>(null);
	useTitle(t("titles.convert"));

	////////////////////////////////////////////////

	function handleSelectedFiles({
		target: { files },
	}: ChangeEvent<HTMLInputElement>) {
		if (!files?.length) return;

		const map: Map<Path, ConvertInfo> = new Map();

		for (const file of files) map.set(file.webkitRelativePath, { toExtension });

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

	////////////////////////////////////////////////

	return (
		<MainArea>
			<div className="flex justify-center items-center ">
				<Button
					onPointerUp={openNativeUI_ChooseFiles}
					className="no-transition"
					variant="circle"
				>
					<ConvertIcon size={18} />

					<input
						onChange={handleSelectedFiles}
						accept="video/*,audio/*"
						className="hidden"
						ref={inputRef}
						type="file"
						multiple
					/>

					<Translator path="buttons.convert" />
				</Button>
			</div>
		</MainArea>
	);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

type SelectedFiles = ReadonlyMap<Path, ConvertInfo>;