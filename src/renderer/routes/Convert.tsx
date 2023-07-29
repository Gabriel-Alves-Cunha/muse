import type { AllowedMedias } from "@common/utils";

import { MdSwapHoriz as ConvertIcon } from "react-icons/md";
import { useRef, useState } from "react";

import { selectT, useTranslator } from "@i18n";
import { MainArea } from "@components/MainArea";
import { Button } from "@components/Button";
import {
	type ConvertInfo,
	createNewConvertion,
} from "@components/Converting/helper";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Convert(): JSX.Element {
	const [toExtension] = useState<AllowedMedias>("mp3");
	const inputRef = useRef<HTMLInputElement>(null);
	const t = useTranslator(selectT);

	const openNativeUI_ChooseFiles = (): void => inputRef.current?.click();

	const handleSelectedFiles_ = (e: React.ChangeEvent<HTMLInputElement>): void =>
		handleSelectedFiles(e, toExtension);

	////////////////////////////////////////////////

	return (
		<MainArea className="flex justify-center items-center">
			<Button onPointerUp={openNativeUI_ChooseFiles} variant="circle">
				<ConvertIcon size={18} />

				<input
					onChange={handleSelectedFiles_}
					accept="video/*,audio/*"
					className="hidden"
					ref={inputRef}
					type="file"
					multiple
				/>

				{t("buttons.convert")}
			</Button>
		</MainArea>
	);
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Helper function:

function handleSelectedFiles(
	{ target: { files } }: React.ChangeEvent<HTMLInputElement>,
	toExtension: AllowedMedias,
): void {
	if (!files?.length) return;

	for (const file of files) {
		const convertInfo: ConvertInfo = { toExtension };
		const path = file.webkitRelativePath;

		createNewConvertion(convertInfo, path);
	}
}
