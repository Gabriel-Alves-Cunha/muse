import type { Media, Path } from "@common/@types/generalTypes";

import { MdOutlineImageSearch as SearchImage } from "react-icons/md";
import { type RefObject, type ChangeEvent, useEffect, useRef } from "react";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as Close } from "react-icons/md";
import { Dialog } from "@radix-ui/react-dialog";

import { dbg, separatedByCommaOrSemiColorOrSpace } from "@common/utils";
import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { errorToast, successToast } from "@styles/global";
import { sendMsgToBackend } from "@common/crossCommunication";
import { areArraysEqualByValue } from "@utils/array";
import { prettyBytes } from "@common/prettyBytes";
import { deleteMedia } from "@utils/media";
import { capitalize } from "@utils/utils";
import { Button } from "@components/Button";
import {
	ReactToElectronMessageEnum,
	MetadataToChange,
} from "@common/@types/electron-window";

import {
	DialogTriggerToRemoveMedia,
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
// Main function:

export function MediaOptionsModal({ media, path }: Props) {
	const contentWrapperRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const imageButtonRef = useRef<HTMLButtonElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const imageFilePathRef = useRef("");

	const openNativeUI_ChooseFiles = () => imageInputRef.current?.click();

	function handleSelectedFile(
		{ target: { files } }: ChangeEvent<HTMLInputElement>,
	) {
		if (!imageButtonRef.current || !imageInputRef.current || !files?.length)
			return;

		const [file] = files;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		imageFilePathRef.current = file!.webkitRelativePath;

		// Change button color to indicate that selection was successfull:
		imageButtonRef.current.classList.add("file-present");
	}

	useEffect(() => {
		function changeMediaMetadataOnEnter({ key }: KeyboardEvent) {
			if (key === "Enter")
				changeMediaMetadata(
					contentWrapperRef,
					closeButtonRef,
					imageFilePathRef.current,
					path,
					media,
				);
		}

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
					{option === "image" ?
						// handle file input for image
						(<Button
							onClick={openNativeUI_ChooseFiles}
							className="notransition"
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
							Select an image
						</Button>) :
						(
							<Input
								placeholder={option === "lyrics" ? "Paste lyrics here" : ""}
								readOnly={!isChangeable(option)}
								defaultValue={format(value)}
								id={option}
							/>
						)}
				</Fieldset>
			))}

			<FlexRow>
				<Dialog modal>
					<DialogTriggerToRemoveMedia className="notransition">
						Delete media
						<Remove />
					</DialogTriggerToRemoveMedia>

					<DeleteMediaDialogContent
						handleMediaDeletion={() =>
							handleMediaDeletion(closeButtonRef, path)}
					/>
				</Dialog>

				<CloseDialog
					onClick={() =>
						changeMediaMetadata(
							contentWrapperRef,
							closeButtonRef,
							imageFilePathRef.current,
							path,
							media,
						)}
					id="save-changes"
				>
					Save changes
				</CloseDialog>
			</FlexRow>
		</StyledDialogContent>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
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
	imageFilePath: Readonly<Path>,
	mediaPath: Readonly<Path>,
	media: Readonly<Media>,
): void {
	if (!contentWrapperRef.current || !closeButtonRef.current)
		return;

	try {
		const hasAnythingChanged = changeMetadataIfAllowed(
			contentWrapperRef,
			imageFilePath,
			mediaPath,
			media,
		);
		closeEverything(closeButtonRef);

		hasAnythingChanged && successToast("New media metadata has been saved.");
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
	imageFilePath: Readonly<Path>,
	mediaPath: Readonly<Path>,
	media: Readonly<Media>,
): boolean {
	if (!contentWrapper.current) return false;

	const thingsToChange: MetadataToChange = [];

	if (imageFilePath)
		thingsToChange.push({ newValue: imageFilePath, whatToChange: "imageURL" });

	// This shit is to get all the inputs:
	for (const children of contentWrapper.current.children)
		for (const element of children.children)
			if (element instanceof HTMLInputElement && !element.disabled) {
				if (!isChangeable(element.id)) continue;

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
						if (areArraysEqualByValue(newValueAsArray, oldValue))
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

/////////////////////////////////////////////

const options = (
	{ duration, artist, album, genres, title, size, image, lyrics }: Media,
) => ({ duration, size, artist, genres, title, album, lyrics, image });

/////////////////////////////////////////////

// Translating to the names that our API that changes
// the metadata recognizes (on "main/preload/media/mutate-metadata.ts"):
const allowedOptionToChange = Object.freeze(
	{
		artist: "albumArtists",
		image: "imageURL",
		lyrics: "lyrics",
		genres: "genres",
		album: "album",
		title: "title",
	} as const,
);

/////////////////////////////////////////////

const isChangeable = (option: string): option is ChangeOptions =>
	Object.keys(allowedOptionToChange).includes(option);

/////////////////////////////////////////////

const closeEverything = (
	element: Readonly<RefObject<HTMLButtonElement>>,
): void => element.current?.click();

/////////////////////////////////////////////

const format = (
	value: string | readonly string[] | number | undefined,
): undefined | string | number => {
	if (value instanceof Array)
		return value.join(", ");

	if (typeof value === "number")
		return prettyBytes(value);

	return value;
};

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
