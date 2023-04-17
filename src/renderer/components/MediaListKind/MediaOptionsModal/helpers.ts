import type { MetadataToChange } from "@common/@types/ElectronApi";
import type { Media, Path } from "@common/@types/GeneralTypes";

import { separatedByCommaOrSemiColorOrSpace } from "@common/utils";
import { ReactToElectronMessageEnum } from "@common/enums";
import { errorToast, successToast } from "../../toasts";
import { areArraysEqualByValue } from "@utils/array";
import { sendMsgToBackend } from "@common/crossCommunication";
import { prettyBytes } from "@common/prettyBytes";
import { log, error } from "@common/log";
import { dbg } from "@common/debug";
import { t } from "@i18n";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Helper functions:

export function changeMediaMetadata(
	imageFilePath: Path,
	mediaPath: Path,
	media: Media,
): void {
	try {
		const isThereAnythingToChange = changeMetadataIfAllowed(
			imageFilePath,
			mediaPath,
			media,
		);

		if (isThereAnythingToChange) successToast(t("toasts.mediaMetadataSaved"));
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
): IsThereAnythingToChange {
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

		if (newValue === oldValue) {
			log(`Values of "${field}" are equal, not gonna change anything:`, {
				newValue,
				oldValue,
			});

			continue;
		}

		const whatToChange: ChangeOptionsToSend | undefined =
			translatedOptionsToSend[field];

		if (!whatToChange) continue;

		thingsToChange.push({ whatToChange, newValue });

		dbg("Changing metadata from client side:", {
			thingsToChange,
			whatToChange,
			rawNewValue,
			mediaPath,
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
			type: ReactToElectronMessageEnum.WRITE_TAG,
			thingsToChange,
			mediaPath,
		});

	return isThereAnythingToChange;
}

export const visibleData = ({
	duration,
	artist,
	genres,
	lyrics,
	album,
	image,
	title,
	size,
}: Media): [string, string | number | readonly string[]][] =>
	// The order here is the order that will appear:
	Object.entries({
		duration,
		size,
		artist,
		genres,
		title,
		album,
		lyrics,
		image,
	} satisfies VisibleData);

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

export type VisibleData = Readonly<{
	genres: readonly string[];
	duration: string;
	artist: string;
	lyrics: string;
	title: string;
	album: string;
	image: string;
	size: number;
}>;

/////////////////////////////////////////////

export type ChangeOptionsToSend = typeof translatedOptionsToSend[ChangeOptions];

type ChangeOptions = keyof typeof translatedOptionsToSend;

/////////////////////////////////////////////

type IsThereAnythingToChange = boolean;
