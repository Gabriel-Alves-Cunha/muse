import type { MetadataToChange } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/generalTypes";

import { MdOutlineImageSearch as SearchImage } from "react-icons/md";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as CloseIcon } from "react-icons/md";
import { useEffect, useRef } from "react";
import {
	Description,
	Content,
	Trigger,
	Dialog,
	Title,
	Close,
} from "@radix-ui/react-dialog";

import { separatedByCommaOrSemiColorOrSpace } from "@common/utils";
import { DeleteMediaDialogContent } from "../DeleteMediaDialog";
import { errorToast, successToast } from "../toasts";
import { reactToElectronMessage } from "@common/enums";
import { areArraysEqualByValue } from "@utils/array";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { sendMsgToBackend } from "@common/crossCommunication";
import { useTranslation } from "@i18n";
import { prettyBytes } from "@common/prettyBytes";
import { emptyString } from "@common/empty";
import { deleteFile } from "@utils/deleteFile";
import { log, error } from "@utils/log";
import { FlexRow } from "../FlexRow";
import { Button } from "../Button";
import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function MediaOptionsModal({ media, path }: Props) {
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const imageButtonRef = useRef<HTMLButtonElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const imageFilePathRef = useRef(emptyString);
	const { t } = useTranslation();

	const openNativeUI_ChooseFiles = () => imageInputRef.current?.click();

	const handleSelectedFile = ({
		target: { files },
	}: React.ChangeEvent<HTMLInputElement>) => {
		if (
			!(imageButtonRef.current && imageInputRef.current && files) ||
			files.length === 0
		)
			return;

		const [file] = files;

		imageFilePathRef.current = file!.webkitRelativePath;

		dbg("imageFilePath =", imageFilePathRef.current);

		// Change button color to indicate that selection was successfull:
		imageButtonRef.current.classList.add("file-present");
	};

	useEffect(() => {
		const changeMediaMetadataOnEnter = (event: KeyboardEvent) => {
			if (event.key === "Enter" && !isAModifierKeyPressed(event))
				changeMediaMetadata(
					closeButtonRef,
					imageFilePathRef.current,
					path,
					media,
				);
		};

		// This is because if you open the popover by pressing
		// "Enter", it will just open and close it!
		setTimeout(
			() => document.addEventListener("keyup", changeMediaMetadataOnEnter),
			500,
		);

		return () =>
			document.removeEventListener("keyup", changeMediaMetadataOnEnter);
	}, [media, path]);

	return (
		<Content className="unset-all fixed grid center max-w-md min-w-[300px] p-8 bg-dialog z-20 rounded">
			<Title className="unset-all font-primary tracking-wide text-2xl text-normal font-medium">
				{t("dialogs.mediaOptions.title")}
			</Title>

			<Description className="mt-3 mx-0 mb-5 font-secondary text-gray tracking-wide text-base">
				{t("dialogs.mediaOptions.description")}
			</Description>

			<Close
				// outline: "initial"; h-9; rounded
				className="unset-all flex justify-center items-center h-6 cursor-pointer py-0 px-4 border-none whitespace-nowrap font-secondary tracking-wider font-semibold absolute right-2 top-2 rounded-full hover:bg-icon-button-hovered focus:bg-icon-button-hovered"
				title={t("tooltips.closeDialog")}
				ref={closeButtonRef}
			>
				<CloseIcon className="fill-accent-light" />
			</Close>

			<form id="form">
				{Object.entries(optionsForUserToSee(media)).map(([option, value]) => (
					<fieldset
						className="unset-all flex items-center h-9 gap-5 mb-4"
						key={option}
					>
						<label
							className="flex w-24 text-accent-light font-secondary tracking-wide text-right font-medium text-base"
							htmlFor={option}
						>
							{t(`labels.${option as OptionsForUserToSee}`)}
						</label>

						{option === "image" ? (
							/////////////////////////////////////////////
							/////////////////////////////////////////////
							// Handle file input for image:
							<Button
								onPointerUp={openNativeUI_ChooseFiles}
								className="no-transition"
								ref={imageButtonRef}
								variant="input"
								id={option}
							>
								<SearchImage size={18} />

								<input
									onChange={handleSelectedFile}
									ref={imageInputRef}
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
								className="unset-all box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input rounded-xl p-3 whitespace-nowrap text-input font-secondary font-medium leading-none transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
								defaultValue={value}
								id={option}
							/>
						) : (
							<input
								className="unset-all box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input py-0 px-3 rounded-xl whitespace-nowrap text-input font-secondary tracking-wider text-base font-medium transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
								readOnly={!isChangeable(option)}
								defaultValue={format(value)}
								id={option}
							/>
						)}
					</fieldset>
				))}
			</form>

			<FlexRow>
				<Dialog modal>
					{/* line-height: 35px; // same as height */}
					<Trigger className="flex justify-between items-center max-h-9 gap-4 cursor-pointer bg-[#bb2b2e] py-0 px-4 border-none rounded tracking-wider text-white font-semibold leading-9 hover:bg-[#821e20] focus:bg-[#821e20] no-transition">
						{t("buttons.deleteMedia")}

						<Remove />
					</Trigger>

					<DeleteMediaDialogContent
						handleMediaDeletion={() =>
							handleMediaDeletion(closeButtonRef, path)
						}
					/>
				</Dialog>

				<Close
					className="unset-all flex justify-center items-center h-6 cursor-pointer py-0 px-4 border-none whitespace-nowrap font-secondary tracking-wider font-semibold bg-[#ddf4e5] text-[#2c6e4f] hover:bg-[#c6dbce] focus:bg-[#c6dbce]"
					onPointerUp={() =>
						changeMediaMetadata(
							closeButtonRef,
							imageFilePathRef.current,
							path,
							media,
						)
					}
				>
					{t("buttons.saveChanges")}
				</Close>
			</FlexRow>
		</Content>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

const handleMediaDeletion = (
	closeButtonRef: React.RefObject<HTMLButtonElement>,
	mediaPath: Path,
): void => {
	if (!closeButtonRef.current) return;

	closeEverything(closeButtonRef.current);

	deleteFile(mediaPath).then();
};

/////////////////////////////////////////////

const changeMediaMetadata = (
	closeButtonRef: React.RefObject<HTMLButtonElement>,
	imageFilePath: Path,
	mediaPath: Path,
	media: Media,
): void => {
	if (!closeButtonRef.current) return;

	const { t } = useTranslation();

	try {
		const hasAnythingChanged = changeMetadataIfAllowed(
			imageFilePath,
			mediaPath,
			media,
		);
		closeEverything(closeButtonRef.current);

		if (hasAnythingChanged) successToast(t("toasts.mediaMetadataSaved"));
	} catch (err) {
		error(err);

		errorToast(t("toasts.mediaMetadataNotSaved"));
	}
};

/////////////////////////////////////////////

const changeMetadataIfAllowed = (
	imageFilePath: Path,
	mediaPath: Path,
	media: Media,
): HasAnythingChanged => {
	const form = document.getElementById("form") as HTMLFormElement;

	if (!form) {
		error("No form found!");
		return false;
	}

	const thingsToChange: MetadataToChange = [];
	const formData = new FormData(form);

	for (const [field, rawNewValue] of formData.entries() as IterableIterator<
		[field: ChangeOptions, rawNewValue: string]
	>) {
		let newValue: string | string[] = rawNewValue.trim();
		const oldValue = media[field];

		// We need to handle the case where the key is an array, as in "genres":
		if (oldValue instanceof Array) {
			const newValueAsArray = newValue
				.split(separatedByCommaOrSemiColorOrSpace)
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
			field,
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
};

// function changeMetadataIfAllowed(
// 	contentWrapper: HTMLDivElement,
// 	imageFilePath: Path,
// 	mediaPath: Path,
// 	media: Media,
// ): boolean {
// 	const thingsToChange: MetadataToChange = [];
//
// 	if (imageFilePath.length > 0)
// 		thingsToChange.push({ whatToChange: "imageURL", newValue: imageFilePath });
//
// 	// This shit is to get all the inputs:
// 	for (const children of contentWrapper.children)
// 		for (const element of children.children)
// 			if (
// 				(element instanceof HTMLInputElement ||
// 					element instanceof HTMLTextAreaElement) &&
// 				element.disabled === false
// 			) {
// 				if (isChangeable(element.id) === false) continue;
//
// 				const id = element.id as ChangeOptions;
// 				const newValue = element.value.trim();
//
// 				for (const [key, oldValue] of Object.entries(media)) {
// 					// If `oldValue` is falsy AND `newValue` is
// 					// empty, there's nothing to do, so just return:
// 					if (
// 						key !== id ||
// 						oldValue === newValue ||
// 						(!oldValue && newValue === emptyString)
// 					)
// 						continue;
//
// 					// We need to handle the case where the key is an array, as in "genres":
// 					if (oldValue instanceof Array) {
// 						const newValueAsArray: string[] = newValue
// 							.split(separatedByCommaOrSemiColorOrSpace)
// 							.map((v) => v.trim())
// 							.filter(Boolean);
//
// 						// If newValueAsArray is `[""]`, then we need to remove the empty string:
// 						if (newValueAsArray.length === 1 && newValueAsArray[0] === "")
// 							newValueAsArray.pop();
//
// 						// If both arrays are equal by values, we don't need to change anything:
// 						if (areArraysEqualByValue(newValueAsArray, oldValue)) {
// 							log(`Values of "${id}" are equal, not gonna change anything:`, {
// 								newValueAsArray,
// 								oldValue,
// 							});
// 							continue;
// 						}
//
// 						dbg("Changing metadata from client side (oldValue is an array):", {
// 							newValueAsArray,
// 							oldValue,
// 							newValue,
// 							key,
// 							id,
// 						});
// 					}
//
// 					/////////////////////////////////////////////
// 					/////////////////////////////////////////////
//
// 					const whatToChange: ChangeOptionsToSend = allowedOptionToChange[id];
//
// 					dbg("Changing metadata from client side:", {
// 						whatToChange,
// 						newValue,
// 						oldValue,
// 						key,
// 						id,
// 					});
//
// 					thingsToChange.push({ whatToChange, newValue });
// 				}
// 			}
//
// 	const isThereAnythingToChange = thingsToChange.length > 0;
//
// 	// Send message to Electron to execute the function writeTag() in the main process:
// 	if (isThereAnythingToChange)
// 		sendMsgToBackend({
// 			type: reactToElectronMessage.WRITE_TAG,
// 			thingsToChange,
// 			mediaPath,
// 		});
//
// 	return isThereAnythingToChange;
// }

/////////////////////////////////////////////

const optionsForUserToSee = ({
	duration,
	artist,
	genres,
	lyrics,
	album,
	image,
	title,
	size,
}: Media) =>
	({ size, duration, title, album, artist, genres, lyrics, image }) as const;

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

export type ChangeOptionsToSend = typeof translatedOptionsToSend[ChangeOptions];

type ChangeOptions = keyof typeof translatedOptionsToSend;

/////////////////////////////////////////////

type OptionsForUserToSee = keyof ReturnType<typeof optionsForUserToSee>;

/////////////////////////////////////////////

type HasAnythingChanged = boolean;

/////////////////////////////////////////////

type Props = { media: Media; path: Path };
