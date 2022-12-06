import type { InputChangeEvent } from "@common/@types/solid-js-helpers";
import type { AllowedMedias } from "@common/utils";
import type { ConvertInfo } from "@components/Converting/helper";
import type { Path } from "@common/@types/generalTypes";

import { type Component, createEffect, createSignal, batch } from "solid-js";
import { ReactiveMap } from "@solid-primitives/map";
import { useI18n } from "@solid-primitives/i18n";

import { newConvertions } from "@components/Converting";
import { MainArea } from "@components/MainArea";
import { SwapIcon } from "@icons/SwapIcon";
import { Button } from "@components/Button";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Main function:

export const Convert: Component = () => {
	const selectedFiles = new ReactiveMap<Path, ConvertInfo>();
	const [toExtension] = createSignal<AllowedMedias>("mp3");
	const [t] = useI18n();

	let inputRef: HTMLInputElement | undefined;

	////////////////////////////////////////////////

	const handleSelectedFiles = ({
		currentTarget: { files },
	}: InputChangeEvent) => {
		if (!files?.length) return;

		batch(() => {
			for (const file of files)
				selectedFiles.set(file.webkitRelativePath, {
					toExtension: toExtension(),
				});
		});
	};

	////////////////////////////////////////////////

	const openNativeUI_ChooseFiles = () => inputRef?.click();

	////////////////////////////////////////////////

	// Start converting
	createEffect(() => {
		// If there are selected files, convert them:
		if (!(selectedFiles.size > 0)) return;

		// To start convert, add to the convertInfoList:
		batch(() => {
			for (const [path, convertInfo] of selectedFiles)
				newConvertions.set(path, convertInfo);

			selectedFiles.clear();
		});
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
