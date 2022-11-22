import type { AllowedMedias } from "@common/utils";
import type { Path } from "@common/@types/generalTypes";

import { MdSwapHoriz as ConvertIcon } from "react-icons/md";
import { type ChangeEvent, useRef } from "react";
import { batch, observable } from "@legendapp/state";
import { useObserveEffect } from "@legendapp/state/react";

import { t, Translator } from "@components/I18n";
import { MainArea } from "@components/MainArea";
import { useTitle } from "@hooks/useTitle";
import { Button } from "@components/Button";
import {
	type ConvertInfo,
	newConvertions,
} from "@components/Converting/helper";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

const convertStates = observable<ConvertStates>({
	selectedFiles: new Map(),
	toExtension: "mp3",
});

////////////////////////////////////////////////

function handleSelectedFiles({
	target: { files },
}: ChangeEvent<HTMLInputElement>): void {
	if (!files?.length) return;

	batch(() => {
		for (const file of files)
			convertStates.selectedFiles.set(file.webkitRelativePath, {
				toExtension: convertStates.toExtension.peek(),
			});
	});
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Convert() {
	const inputRef = useRef<HTMLInputElement>(null);

	useTitle(t("titles.convert"));

	////////////////////////////////////////////////

	////////////////////////////////////////////////

	const openNativeUI_ChooseFiles = () => inputRef.current?.click();

	////////////////////////////////////////////////

	// Start converting
	useObserveEffect(() => {
		// If there are selected files, convert them:
		if (!(convertStates.selectedFiles.size > 0)) return;

		// To start convert, add to the convertInfoList:
		newConvertions.set(convertStates.selectedFiles);

		convertStates.selectedFiles.clear();
	});

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

type ConvertStates = {
	selectedFiles: Map<Path, ConvertInfo>;
	toExtension: AllowedMedias;
};
