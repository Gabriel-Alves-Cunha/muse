import type { InputChangeEvent } from "@common/@types/solid-js-helpers";
import type { AllowedMedias } from "@common/utils";
import type { Path } from "@common/@types/generalTypes";

import { type Component, createEffect, createSignal } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { MainArea } from "@components/MainArea";
import { emptyMap } from "@common/empty";
import { SwapIcon } from "@icons/SwapIcon";
import { Button } from "@components/Button";
import {
	type ConvertInfo,
	useNewConvertions,
} from "@components/Converting/helper";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const Convert: Component = () => {
	const [selectedFiles, setSelectedFiles] =
		createSignal<SelectedFiles>(emptyMap);
	const [toExtension] = createSignal<AllowedMedias>("mp3");
	const [t] = useI18n();

	let inputRef: HTMLInputElement | undefined;

	////////////////////////////////////////////////

	function handleSelectedFiles({ currentTarget: { files } }: InputChangeEvent) {
		if (!files?.length) return;

		const map: Map<Path, ConvertInfo> = new Map();

		for (const file of files)
			map.set(file.webkitRelativePath, { toExtension: toExtension() });

		setSelectedFiles(map);
	}

	////////////////////////////////////////////////

	const openNativeUI_ChooseFiles = () => inputRef?.click();

	////////////////////////////////////////////////

	// Start converting
	createEffect(() => {
		// If there are selected files, convert them:
		if (!(selectedFiles().size > 0)) return;

		// To start convert, add to the convertInfoList:
		useNewConvertions.setState({ newConvertions: selectedFiles() });

		setSelectedFiles(emptyMap);
	});

	////////////////////////////////////////////////

	return (
		<MainArea>
			<div class="flex justify-center items-center ">
				<Button
					onPointerUp={openNativeUI_ChooseFiles}
					class="no-transition"
					variant="circle"
				>
					<SwapIcon class="w-4 h-4" />

					<input
						ref={inputRef as HTMLInputElement}
						onChange={handleSelectedFiles}
						accept="video/*,audio/*"
						class="hidden"
						type="file"
						multiple
					/>

					{t("buttons.convert")}
				</Button>
			</div>
		</MainArea>
	);
};

export default Convert;

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Types:

type SelectedFiles = ReadonlyMap<Path, ConvertInfo>;
