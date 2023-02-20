import type { AllowedMedias } from "@common/utils";
import type { ConvertInfo } from "@components/Converting/helper";

import { MdSwapHoriz as ConvertIcon } from "react-icons/md";
import { useRef, useState } from "react";
import { useSnapshot } from "valtio";

import { createNewConvertion } from "@components/Converting/helper";
import { translation } from "@i18n";
import { MainArea } from "@components/MainArea";
import { Button } from "@components/Button";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export function Convert() {
	const [toExtension] = useState<AllowedMedias>("mp3");
	const inputRef = useRef<HTMLInputElement>(null);
	const translationAccessor = useSnapshot(translation);
	const t = translationAccessor.t;

	const openNativeUI_ChooseFiles = () => inputRef.current?.click();

	////////////////////////////////////////////////

	return (
		<MainArea className="flex justify-center items-center">
			<Button onPointerUp={openNativeUI_ChooseFiles} variant="circle">
				<ConvertIcon size={18} />

				<input
					onChange={(e) => handleSelectedFiles(e, toExtension)}
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
) {
	if (!files?.length) return;

	for (const file of files) {
		const convertInfo: ConvertInfo = { toExtension };
		const path = file.webkitRelativePath;

		createNewConvertion(convertInfo, path);
	}
}
