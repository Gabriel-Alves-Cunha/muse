import type { MetadataToChange } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/generalTypes";

import { separatedByCommaOrSemiColorOrSpace } from "@common/utils";
import { errorToast, successToast } from "../../toasts";
import { ReactToElectronMessage } from "@common/enums";
import { areArraysEqualByValue } from "@utils/array";
import { sendMsgToBackend } from "@common/crossCommunication";
import { useTranslation } from "@i18n";
import { prettyBytes } from "@common/prettyBytes";
import { deleteFile } from "@utils/deleteFile";
import { log, error } from "@common/log";
import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export function handleMediaDeletion(
	closeButtonRef: React.RefObject<HTMLLabelElement>,
	mediaPath: Path,
): void {
	if (!closeButtonRef.current) return;

	closeEverything(closeButtonRef.current);

	deleteFile(mediaPath).then();
}

/////////////////////////////////////////////

export function changeMediaMetadata(
	closeButtonRef: React.RefObject<HTMLLabelElement>,
	imageFilePath: Path,
	mediaPath: Path,
	media: Media,
): void {
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
}

/////////////////////////////////////////////

export function changeMetadataIfAllowed(
	imageFilePath: Path,
	mediaPath: Path,
	media: Media,
): HasAnythingChanged {
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
			type: ReactToElectronMessage.WRITE_TAG,
			thingsToChange,
			mediaPath,
		});

	return isThereAnythingToChange;
}

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
// 						(!oldValue && newValue === "")
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

export const visibleData = ({
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

export const isChangeable = (option: string): option is ChangeOptions =>
	option in translatedOptionsToSend;

/////////////////////////////////////////////

const closeEverything = (element: HTMLLabelElement): void => element.click();

/////////////////////////////////////////////

export function format(
	value: string | readonly string[] | number | undefined,
): undefined | string | number {
	if (value instanceof Array) return value.join(", ");

	if (typeof value === "number") return prettyBytes(value);

	return value;
}

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

type HasAnythingChanged = boolean;

/////////////////////////////////////////////
