import type { InputChangeEvent } from "@common/@types/solid-js-helpers";
import type { MetadataToChange } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/generalTypes";

import { useI18n } from "@solid-primitives/i18n";
import { Portal } from "solid-js/web";
import {
	type Component,
	createSignal,
	onCleanup,
	onMount,
	Switch,
	Match,
	Setter,
} from "solid-js";

import { separatedByCommaOrSemiColonOrSpace } from "@common/utils";
import { errorToast, successToast } from "../toasts";
import { reactToElectronMessage } from "@common/enums";
import { areArraysEqualByValue } from "@utils/array";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { BlurOverlay, Overlay } from "@components/BlurOverlay";
import { DeleteMediaDialog } from "../DeleteMediaDialog";
import { sendMsgToBackend } from "@common/crossCommunication";
import { prettyBytes } from "@common/prettyBytes";
import { deleteFile } from "@utils/deleteFile";
import { log, error } from "@utils/log";
import { SearchIcon } from "@icons/SearchIcon";
import { TrashIcon } from "@icons/TrashIcon";
import { FlexRow } from "../FlexRow";
import { Button } from "../Button";
import { Dialog } from "../Dialog";
import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

let closeButtonRef: HTMLButtonElement | undefined;
let imageButtonRef: HTMLButtonElement | undefined;
let imageInputRef: HTMLInputElement | undefined;
let formRef: HTMLFormElement | undefined;

const openNativeUI_ChooseFiles = (): void => imageInputRef?.click();

export const MediaOptionsModal: Component<Props> = (props) => {
	const [isDeleteMediaModalOpen, setIsDeleteMediaModalOpen] =
		createSignal(false);
	const [imageFilePath, setImageFilePath] = createSignal("");
	const [t] = useI18n();

	const handleSelectedFile = ({
		currentTarget: { files },
	}: InputChangeEvent): void => {
		if (!(imageButtonRef && imageInputRef && files) || files.length === 0) {
			imageButtonRef?.classList.remove("file-present");

			return;
		}

		const [file] = files;

		setImageFilePath(file!.webkitRelativePath);

		dbg("imageFilePath =", imageFilePath());

		// Change button color to indicate that selection was successfull:
		imageButtonRef.classList.add("file-present");
	};

	const changeMediaMetadataOnEnter = (event: KeyboardEvent) =>
		event.key === "Enter" &&
		!isAModifierKeyPressed(event) &&
		changeMediaMetadata(imageFilePath(), props.path, props.media);

	onMount(() => document.addEventListener("keyup", changeMediaMetadataOnEnter));

	onCleanup(() =>
		document.removeEventListener("keyup", changeMediaMetadataOnEnter),
	);

	return (
		<Portal>
			<Dialog
				class="unset-all fixed grid center max-w-md min-w-[300px] p-8 bg-dialog z-20 rounded"
				setIsOpen={props.setIsOpen}
				isOpen={props.isOpen}
				modal
			>
				<Switch>
					<Match when={props.overlay === "blur"}>
						<BlurOverlay />
					</Match>

					<Match when={props.overlay === "dim"}>
						<Overlay />
					</Match>
				</Switch>

				<h1 class="unset-all font-primary tracking-wide text-2xl text-normal font-medium">
					{t("dialogs.mediaOptions.title")}
				</h1>

				<p class="mt-3 mx-0 mb-5 font-secondary text-gray tracking-wide text-base">
					{t("dialogs.mediaOptions.description")}
				</p>

				<form ref={formRef as HTMLFormElement}>
					{getOptionsAllowedToChange(props.media).map(([option, value]) => (
						<fieldset class="unset-all flex items-center h-9 gap-5 mb-4">
							<label
								class="flex w-24 text-accent-light font-secondary tracking-wide text-right font-medium text-base"
								html-for={option}
							>
								{t(`labels.${option}`)}
							</label>

							<Switch
								fallback={
									<input
										class="unset-all box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input py-0 px-3 rounded-xl whitespace-nowrap text-input font-secondary tracking-wider text-base font-medium transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
										readOnly={isChangeable(option) === false}
										default-value={format(value)}
										id={option}
									/>
								}
							>
								<Match when={option === "image"}>
									{/* Handle file input for image: */}
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
								</Match>

								<Match when={option === "lyrics"}>
									{/* // Handle text input with line feeds: */}
									<textarea
										class="unset-all box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input rounded-xl p-3 whitespace-nowrap text-input font-secondary font-medium leading-none transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
										default-value={format(value)}
										id={option}
									/>
								</Match>
							</Switch>
						</fieldset>
					))}
				</form>

				{/* line-height: 35px; // same as height */}
				<button
					class="flex justify-between items-center max-h-9 gap-4 cursor-pointer bg-[#bb2b2e] py-0 px-4 border-none rounded tracking-wider text-white font-semibold leading-9 hover:bg-[#821e20] focus:bg-[#821e20] no-transition"
					onPointerUp={() => setIsDeleteMediaModalOpen(true)}
					type="button"
				>
					{t("buttons.deleteMedia")}

					<TrashIcon />
				</button>

				<FlexRow>
					<DeleteMediaDialog
						handleMediaDeletion={() =>
							handleMediaDeletion(closeButtonRef, props.path)
						}
						setIsOpen={setIsDeleteMediaModalOpen}
						isOpen={isDeleteMediaModalOpen()}
					/>

					<button
						class="unset-all flex justify-center items-center h-6 cursor-pointer py-0 px-4 border-none whitespace-nowrap font-secondary tracking-wider font-semibold bg-[#ddf4e5] text-[#2c6e4f] hover:bg-[#c6dbce] focus:bg-[#c6dbce]"
						onPointerUp={() => {
							changeMediaMetadata(imageFilePath(), props.path, props.media);
							props.setIsOpen(false);
						}}
						type="button"
					>
						{t("buttons.saveChanges")}
					</button>
				</FlexRow>
			</Dialog>
		</Portal>
	);
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

function handleMediaDeletion(
	closeButtonRef: HTMLButtonElement | undefined,
	mediaPath: Path,
): void {
	if (!closeButtonRef) return;

	closeEverything(closeButtonRef);

	deleteFile(mediaPath).then();
}

/////////////////////////////////////////////

function changeMediaMetadata(
	imageFilePath: Path,
	mediaPath: Path,
	media: Media,
): void {
	if (!closeButtonRef) return;

	const [t] = useI18n();

	try {
		const hasAnythingChanged = changeMetadataIfAllowed(
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
	imageFilePath: Path,
	mediaPath: Path,
	media: Media,
): HasAnythingChanged {
	if (!formRef) return false;

	const thingsToChange: MetadataToChange = [];
	const formData = new FormData(formRef);

	for (const [field, rawNewValue] of formData.entries() as IterableIterator<
		[field: ChangeOptions, rawNewValue: string]
	>) {
		let newValue: string | string[] = rawNewValue.trim();
		const oldValue = media[field];

		// We need to handle the case where the key is an array, as in "genres":
		if (oldValue instanceof Array) {
			const newValueAsArray = newValue
				.split(separatedByCommaOrSemiColonOrSpace)
				.map((v) => v.trim())
				.filter(Boolean);

			// If newValueAsArray is `[""]`, then we need to remove the empty string:
			if (newValueAsArray.length === 1 && newValueAsArray[0] === "")
				newValueAsArray.pop();

			// If both arrays are equal by values, we don't need to change anything:
			if (areArraysEqualByValue(newValueAsArray, oldValue)) {
				log(`Values of "${field}" are equal, not gonna change anything:`, {
					newValueAsArray,
					oldValue,
				});
				continue;
			}

			newValue = newValueAsArray;
		}

		const whatToChange: ChangeOptionsToSend = translatedOptionsToSend[field];

		thingsToChange.push({ whatToChange, newValue });

		dbg("Changing metadata from client side:", {
			whatToChange,
			rawNewValue,
			newValue,
			oldValue,
		});
	}

	if (imageFilePath)
		thingsToChange.push({ whatToChange: "imageURL", newValue: imageFilePath });

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

const getOptionsAllowedToChange = ({
	artist,
	genres,
	lyrics,
	album,
	title,
	image,
}: Media) =>
	Object.entries({
		artist,
		genres,
		lyrics,
		album,
		title,
		image,
	}) as [ChangeOptions, string | readonly string[]][];

/////////////////////////////////////////////

// Translating to the names that our API that changes
// the metadata recognizes (on "main/preload/media/mutate-metadata.ts"):
const translatedOptionsToSend = {
	artist: "albumArtists",
	image: "imageURL",
	lyrics: "lyrics",
	genres: "genres",
	album: "album",
	title: "title",
} as const;

/////////////////////////////////////////////

const isChangeable = (option: string): option is ChangeOptions =>
	option in translatedOptionsToSend;

/////////////////////////////////////////////

const closeEverything = (closeButton: HTMLButtonElement): void =>
	closeButton.click();

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

export type ChangeOptionsToSend = typeof translatedOptionsToSend[ChangeOptions];

/////////////////////////////////////////////

type ChangeOptions = keyof typeof translatedOptionsToSend;

/////////////////////////////////////////////

type HasAnythingChanged = boolean;

/////////////////////////////////////////////

type Props = {
	setIsOpen: Setter<boolean>;
	overlay?: "blur" | "dim";
	isOpen: boolean;
	media: Media;
	path: Path;
};
