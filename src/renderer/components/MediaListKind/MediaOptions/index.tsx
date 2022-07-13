import type { Media, Path } from "@common/@types/generalTypes";

import { type RefObject, useEffect, useRef } from "react";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as Close } from "react-icons/md";
import { Dialog } from "@radix-ui/react-dialog";

import { dbg, separatedByCommaOrSemiColorOrSpace } from "@common/utils";
import { errorToast, successToast } from "@styles/global";
import { sendMsgToBackend } from "@common/crossCommunication";
import { deleteMedia } from "@utils/media";
import { capitalize } from "@utils/utils";
import {
	ReactToElectronMessageEnum,
	MetadataToChange,
} from "@common/@types/electron-window";

import {
	DialogTriggerToRemoveMedia,
	StyledDialogBlurOverlay,
	StyledDialogContent,
	StyledDescription,
	StyledTitle,
	CloseDialog,
	Fieldset,
	FlexRow,
	Input,
	Label,
} from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

const warningSvg = new URL(
	"../../../assets/icons/warning.svg",
	import.meta.url,
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function MediaOptionsModal({ media, path }: Props) {
	const contentWrapperRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		// TODO: change this cause if you open the popover by pressing
		// "Enter", it will just open and close it!
		function handleKeyUp({ key }: KeyboardEvent) {
			if (key === "Enter")
				changeMediaMetadata(contentWrapperRef, closeButtonRef, path, media);
		}

		document.addEventListener("keyup", handleKeyUp);

		return () => document.removeEventListener("keyup", handleKeyUp);
	}, [media, path]);

	return (
		<StyledDialogContent ref={contentWrapperRef}>
			<StyledTitle>Edit/See media information</StyledTitle>

			<StyledDescription>
				Make changes to your media&apos;s metadata here. Click save when
				you&apos;re done.
			</StyledDescription>

			<CloseDialog ref={closeButtonRef} data-tip="Close dialog" id="close-icon">
				<Close />
			</CloseDialog>

			{Object.entries(options(media)).map(([option, value]) => (
				<Fieldset key={option}>
					<Label htmlFor={option}>{capitalize(option)}</Label>
					<Input
						readOnly={!isChangeable(option)}
						defaultValue={format(value)}
						id={option}
					/>
				</Fieldset>
			))}

			<FlexRow>
				<Dialog modal>
					<DialogTriggerToRemoveMedia data-tip="Close delete's dialog">
						Delete media
						<Remove />
					</DialogTriggerToRemoveMedia>

					<StyledDialogBlurOverlay />

					<StyledDialogContent className="delete-media">
						<StyledTitle className="subtitle">
							Are you sure you want to delete this media from your computer?
						</StyledTitle>

						<FlexRow>
							<img src={warningSvg.href} alt="Warning sign." id="warning" />

							<CloseDialog
								onClick={() => handleMediaDeletion(closeButtonRef, path)}
								className="delete-media"
							>
								Confirm
							</CloseDialog>

							<CloseDialog id="cancel">Cancel</CloseDialog>
						</FlexRow>
					</StyledDialogContent>
				</Dialog>

				<CloseDialog
					onClick={() =>
						changeMediaMetadata(contentWrapperRef, closeButtonRef, path, media)}
					id="save-changes"
				>
					Save changes
				</CloseDialog>
			</FlexRow>
		</StyledDialogContent>
	);
}

/////////////////////////////////////////////
// Helper functions:

async function handleMediaDeletion(
	closeButtonRef: Readonly<RefObject<HTMLButtonElement>>,
	mediaPath: Readonly<Path>,
): Promise<void> {
	if (!closeButtonRef.current) return;

	closeEverything(closeButtonRef);

	await deleteMedia(mediaPath);
}

/////////////////////////////////////////////

function changeMediaMetadata(
	contentWrapperRef: Readonly<RefObject<HTMLDivElement>>,
	closeButtonRef: Readonly<RefObject<HTMLButtonElement>>,
	mediaPath: Readonly<Path>,
	media: Readonly<Media>,
): void {
	if (!contentWrapperRef.current || !closeButtonRef.current)
		return;

	try {
		changeMetadataIfAllowed(contentWrapperRef, mediaPath, media);
		closeEverything(closeButtonRef);

		successToast("New media metadata has been saved.");
	} catch (error) {
		console.error(error);

		errorToast(
			"Unable to save new metadata. See console by pressing Ctrl+Shift+i.",
		);
	}
}

/////////////////////////////////////////////

function changeMetadataIfAllowed(
	contentWrapper: Readonly<RefObject<HTMLDivElement>>,
	mediaPath: Readonly<Path>,
	media: Readonly<Media>,
): void {
	if (!contentWrapper.current) return;

	const thingsToChange: MetadataToChange = [];

	// This shit is to get the inputs:
	for (const children of contentWrapper.current.children)
		for (const element of children.children)
			if (element instanceof HTMLInputElement && !element.disabled) {
				const id = element.id as ChangeOptions;
				const newValue = element.value.trim();

				Object.entries(media).forEach(([key, oldValue]) => {
					if (key !== id) return;
					if (oldValue === newValue) return;
					// If `oldValue` is falsy AND `newValue` is
					// empty, there's nothing to do, so just return:
					if (!oldValue && newValue === "") return;

					// We need to handle the case where the key is an array, as in "genres":
					if (oldValue instanceof Array) {
						const newValueAsArray: string[] = newValue
							.split(separatedByCommaOrSemiColorOrSpace)
							.map(v => v.trim())
							.filter(Boolean);

						// If newValueAsArray is `[""]`, then we need to remove the empty string:
						if (newValueAsArray.length === 1 && newValueAsArray[0] === "")
							newValueAsArray.pop();

						// If both arrays are equal by values, we don't need to change anything:
						if (
							newValueAsArray.length === oldValue.length &&
							newValueAsArray.every(v => oldValue.includes(v))
						)
							return console.log(
								"Values are equal, not gonna change anything:",
								{ newValueAsArray, oldValue },
							);

						dbg("Changing metadata from client side (oldValue is an array):", {
							newValueAsArray,
							oldValue,
							newValue,
							key,
							id,
						});
					}

					const whatToChange: ChangeOptionsToSend = allowedOptionToChange[id];

					dbg("Changing metadata from client side:", {
						whatToChange,
						newValue,
						oldValue,
						key,
						id,
					});

					thingsToChange.push({ whatToChange, newValue });
				});
			}

	// Send message to Electron to execute the function writeTag() in the main process:
	if (thingsToChange.length > 0)
		sendMsgToBackend({
			type: ReactToElectronMessageEnum.WRITE_TAG,
			thingsToChange,
			mediaPath,
		});
}

/////////////////////////////////////////////

const options = ({ duration, artist, album, genres, title, size }: Media) => ({
	duration,
	artist,
	genres,
	title,
	album,
	size,
});

/////////////////////////////////////////////

// Translating to the names that the library that changes
// the metadata recognizes:
const allowedOptionToChange = Object.freeze(
	{
		artist: "albumArtists",
		imageURL: "imageURL",
		genres: "genres",
		album: "album",
		title: "title",
	} as const,
);

const isChangeable = (option: string): option is ChangeOptions =>
	Object.keys(allowedOptionToChange).includes(option);

/////////////////////////////////////////////

const closeEverything = (
	element: Readonly<RefObject<HTMLButtonElement>>,
): void => element.current?.click();

/////////////////////////////////////////////

const format = (
	value: string | readonly string[] | undefined,
): string | undefined => (value instanceof Array ? value.join(", ") : value);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

export type WhatToChange = Readonly<
	{
		whatToSend: ChangeOptionsToSend;
		whatToChange: ChangeOptions;
		current: string;
	}
>;

/////////////////////////////////////////////

export type ChangeOptionsToSend = typeof allowedOptionToChange[ChangeOptions];

type ChangeOptions = keyof typeof allowedOptionToChange;

/////////////////////////////////////////////

type Props = Readonly<{ media: Media; path: Path; }>;
