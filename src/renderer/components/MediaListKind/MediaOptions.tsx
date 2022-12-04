import type { InputChangeEvent } from "@common/@types/solid-js-helpers";
import type { MetadataToChange } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/generalTypes";

import { createSignal, onCleanup, onMount } from "solid-js";
import { useI18n } from "@solid-primitives/i18n";

import { separatedByCommaOrSemiColorOrSpace } from "@common/utils";
import { errorToast, successToast } from "../toasts";
import { reactToElectronMessage } from "@common/enums";
import { areArraysEqualByValue } from "@utils/array";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { DeleteMediaDialog } from "../DeleteMediaDialog";
import { sendMsgToBackend } from "@common/crossCommunication";
import { prettyBytes } from "@common/prettyBytes";
import { emptyString } from "@common/empty";
import { deleteFile } from "@utils/deleteFile";
import { log, error } from "@utils/log";
import { SearchIcon } from "@icons/SearchIcon";
import { CloseIcon } from "@icons/CloseIcon";
import { TrashIcon } from "@icons/TrashIcon";
import { FlexRow } from "../FlexRow";
import { Button } from "../Button";
import { Dialog } from "@components/Dialog";
import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function MediaOptionsModal({ media, path }: Props) {
	const [isDeleteMediaModalOpen, setIsDeleteMediaModalOpen] =
		createSignal(false);
	const [imageFilePath, setImageFilePath] = createSignal("");
	const [isOpen, setIsOpen] = createSignal(false);
	const [t] = useI18n();

	let contentWrapperRef: HTMLDialogElement | undefined;
	let closeButtonRef: HTMLButtonElement | undefined;
	let imageButtonRef: HTMLButtonElement | undefined;
	let imageInputRef: HTMLInputElement | undefined;

	const openNativeUI_ChooseFiles = () => imageInputRef?.click();

	function handleSelectedFile({ currentTarget: { files } }: InputChangeEvent) {
		if (!(imageButtonRef && imageInputRef && files) || files.length === 0)
			return;

		const [file] = files;

		setImageFilePath(file!.webkitRelativePath);

		dbg("imageFilePath =", imageFilePath());

		// Change button color to indicate that selection was successfull:
		imageButtonRef.classList.add("file-present");
	}

	const changeMediaMetadataOnEnter = (event: KeyboardEvent) =>
		event.key === "Enter" &&
		!isAModifierKeyPressed(event) &&
		contentWrapperRef &&
		closeButtonRef &&
		changeMediaMetadata(
			contentWrapperRef,
			closeButtonRef,
			imageFilePath(),
			path,
			media,
		);

	onMount(() => {
		// This is because if you open the popover by pressing
		// "Enter", it will just open and close it!
		setTimeout(
			() => document.addEventListener("keyup", changeMediaMetadataOnEnter),
			500,
		);
	});

	onCleanup(() =>
		document.removeEventListener("keyup", changeMediaMetadataOnEnter),
	);

	return (
		<Dialog.Content
			class="unset-all fixed grid center max-w-md min-w-[300px] p-8 bg-dialog z-20 rounded"
			ref={contentWrapperRef as HTMLDialogElement}
			onOpenChange={setIsOpen}
			isOpen={isOpen()}
		>
			<h1 class="unset-all font-primary tracking-wide text-2xl text-normal font-medium">
				{t("dialogs.mediaOptions.title")}
			</h1>

			<p class="mt-3 mx-0 mb-5 font-secondary text-gray tracking-wide text-base">
				{t("dialogs.mediaOptions.description")}
			</p>

			<Dialog.Close
				// outline: "initial"; h-9; rounded
				class="unset-all flex justify-center items-center h-6 cursor-pointer py-0 px-4 border-none whitespace-nowrap font-secondary tracking-wider font-semibold absolute right-2 top-2 rounded-full hover:bg-icon-button-hovered focus:bg-icon-button-hovered"
				ref={closeButtonRef as HTMLButtonElement}
				title={t("tooltips.closeDialog")}
			>
				<CloseIcon class="fill-accent-light" />
			</Dialog.Close>

			{Object.entries(options(media)).map(([option, value]) => (
				<fieldset class="unset-all flex items-center h-9 gap-5 mb-4">
					<label
						class="flex w-24 text-accent-light font-secondary tracking-wide text-right font-medium text-base"
						html-for={option}
					>
						{t(`labels.${option as Options}`)}
					</label>

					{option === "image" ? (
						/////////////////////////////////////////////
						/////////////////////////////////////////////
						// Handle file input for image:
						<Button
							ref={imageButtonRef as HTMLButtonElement}
							onPointerUp={openNativeUI_ChooseFiles}
							class="notransition"
							variant="input"
							id={option}
						>
							<SearchIcon class="w-5 h-5" />

							<input
								ref={imageInputRef as HTMLInputElement}
								onChange={handleSelectedFile}
								accept="image/*"
								type="file"
							/>

							{t("buttons.selectImg")}
						</Button>
					) : /////////////////////////////////////////////
					/////////////////////////////////////////////
					// Handle text input with line feeds:
					option === "lyrics" ? (
						<textarea
							class="unset-all box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input rounded-xl p-3 whitespace-nowrap text-input font-secondary font-medium leading-none transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
							default-value={format(value)}
							id={option}
						/>
					) : (
						<input
							class="unset-all box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input py-0 px-3 rounded-xl whitespace-nowrap text-input font-secondary tracking-wider text-base font-medium transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
							readOnly={isChangeable(option) === false}
							default-value={format(value)}
							id={option}
						/>
					)}
				</fieldset>
			))}

			{/* line-height: 35px; // same as height */}
			<button
				class="flex justify-between items-center max-h-9 gap-4 cursor-pointer bg-[#bb2b2e] py-0 px-4 border-none rounded tracking-wider text-white font-semibold leading-9 hover:bg-[#821e20] focus:bg-[#821e20] no-transition"
				onPointerUp={() => setIsOpen(true)}
				type="button"
			>
				{t("buttons.deleteMedia")}

				<TrashIcon />
			</button>

			<FlexRow>
				<DeleteMediaDialog
					handleMediaDeletion={() =>
						closeButtonRef && handleMediaDeletion(closeButtonRef, path)
					}
					onOpenChange={setIsDeleteMediaModalOpen}
					isOpen={isDeleteMediaModalOpen()}
				/>

				<Dialog.Close
					class="unset-all flex justify-center items-center h-6 cursor-pointer py-0 px-4 border-none whitespace-nowrap font-secondary tracking-wider font-semibold bg-[#ddf4e5] text-[#2c6e4f] hover:bg-[#c6dbce] focus:bg-[#c6dbce]"
					onPointerUp={() =>
						contentWrapperRef &&
						closeButtonRef &&
						changeMediaMetadata(
							contentWrapperRef,
							closeButtonRef,
							imageFilePath(),
							path,
							media,
						)
					}
				>
					{t("buttons.saveChanges")}
				</Dialog.Close>
			</FlexRow>
		</Dialog.Content>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

async function handleMediaDeletion(
	closeButtonRef: HTMLButtonElement,
	mediaPath: Path,
): Promise<void> {
	if (!closeButtonRef) return;

	closeEverything(closeButtonRef);

	await deleteFile(mediaPath);
}

/////////////////////////////////////////////

function changeMediaMetadata(
	contentWrapperRef: HTMLDialogElement,
	closeButtonRef: HTMLButtonElement,
	imageFilePath: Path,
	mediaPath: Path,
	media: Media,
): void {
	if (!(contentWrapperRef && closeButtonRef)) return;

	const [t] = useI18n();

	try {
		const hasAnythingChanged = changeMetadataIfAllowed(
			contentWrapperRef,
			imageFilePath,
			mediaPath,
			media,
		);
		closeEverything(closeButtonRef);

		if (hasAnythingChanged) successToast(t("toasts.mediaMetadataSaved"));
	} catch (err) {
		error(err);

		errorToast(t("toasts.mediaMetadataNotSaved"));
	}
}

/////////////////////////////////////////////

function changeMetadataIfAllowed(
	contentWrapper: HTMLDialogElement,
	imageFilePath: Path,
	mediaPath: Path,
	media: Media,
): boolean {
	// TODO: get from form!
	const thingsToChange: MetadataToChange = [];

	if (imageFilePath.length > 0)
		thingsToChange.push({ whatToChange: "imageURL", newValue: imageFilePath });

	// This shit is to get all the inputs:
	for (const children of contentWrapper.children)
		for (const element of children.children)
			if (
				(element instanceof HTMLInputElement ||
					element instanceof HTMLTextAreaElement) &&
				element.disabled === false
			) {
				if (isChangeable(element.id) === false) continue;

				const id = element.id as ChangeOptions;
				const newValue = element.value.trim();

				for (const [key, oldValue] of Object.entries(media)) {
					// If `oldValue` is falsy AND `newValue` is
					// empty, there's nothing to do, so just return:
					if (
						key !== id ||
						oldValue === newValue ||
						(!oldValue && newValue === emptyString)
					)
						continue;

					// We need to handle the case where the key is an array, as in "genres":
					if (oldValue instanceof Array) {
						const newValueAsArray: string[] = newValue
							.split(separatedByCommaOrSemiColorOrSpace)
							.map((v) => v.trim())
							.filter(Boolean);

						// If newValueAsArray is `[""]`, then we need to remove the empty string:
						if (newValueAsArray.length === 1 && newValueAsArray[0] === "")
							newValueAsArray.pop();

						// If both arrays are equal by values, we don't need to change anything:
						if (areArraysEqualByValue(newValueAsArray, oldValue)) {
							log(`Values of "${id}" are equal, not gonna change anything:`, {
								newValueAsArray,
								oldValue,
							});
							continue;
						}

						dbg("Changing metadata from client side (oldValue is an array):", {
							newValueAsArray,
							oldValue,
							newValue,
							key,
							id,
						});
					}

					/////////////////////////////////////////////
					/////////////////////////////////////////////

					const whatToChange: ChangeOptionsToSend = allowedOptionToChange[id];

					dbg("Changing metadata from client side:", {
						whatToChange,
						newValue,
						oldValue,
						key,
						id,
					});

					thingsToChange.push({ whatToChange, newValue });
				}
			}

	const isThereAnythingToChange = thingsToChange.length > 0;

	// Send message to Electron to execute the function writeTag() in the main process:
	if (isThereAnythingToChange)
		sendMsgToBackend({
			type: reactToElectronMessage.WRITE_TAG,
			thingsToChange,
			mediaPath,
		});

	return isThereAnythingToChange;
}

/////////////////////////////////////////////

const options = ({
	duration,
	artist,
	genres,
	lyrics,
	album,
	title,
	image,
	size,
}: Media) =>
	({ size, duration, title, album, artist, genres, lyrics, image }) as const;

/////////////////////////////////////////////

// Translating to the names that our API that changes
// the metadata recognizes (on "main/preload/media/mutate-metadata.ts"):
const allowedOptionToChange = {
	artist: "albumArtists",
	image: "imageURL",
	lyrics: "lyrics",
	genres: "genres",
	album: "album",
	title: "title",
} as const;

/////////////////////////////////////////////

const isChangeable = (option: string): option is ChangeOptions =>
	option in allowedOptionToChange;

/////////////////////////////////////////////

const closeEverything = (element: HTMLButtonElement): void => element.click();

/////////////////////////////////////////////

const format = (
	value: string | readonly string[] | number | undefined,
): undefined | string | number => {
	if (value instanceof Array) return value.join(", ");

	if (typeof value === "number") return prettyBytes(value);

	return value;
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type WhatToChange = {
	whatToSend: ChangeOptionsToSend;
	whatToChange: ChangeOptions;
	current: string;
};

/////////////////////////////////////////////

export type ChangeOptionsToSend = typeof allowedOptionToChange[ChangeOptions];

type ChangeOptions = keyof typeof allowedOptionToChange;

/////////////////////////////////////////////

type Options = keyof ReturnType<typeof options>;

/////////////////////////////////////////////

type Props = { media: Media; path: Path };
