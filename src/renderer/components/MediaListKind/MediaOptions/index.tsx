import type { MetadataToChange } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/generalTypes";

import { type RefObject, type ChangeEvent, useEffect, useRef } from "react";
import { MdOutlineImageSearch as SearchImage } from "react-icons/md";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as Close } from "react-icons/md";
import { Dialog } from "@radix-ui/react-dialog";

import { dbg, separatedByCommaOrSemiColorOrSpace } from "@common/utils";
import { ReactToElectronMessageEnum } from "@common/enums";
import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { errorToast, successToast } from "@styles/global";
import { areArraysEqualByValue } from "@utils/array";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { sendMsgToBackend } from "@common/crossCommunication";
import { t, Translator } from "@components/I18n";
import { prettyBytes } from "@common/prettyBytes";
import { deleteMedia } from "@utils/media";
import { Button } from "@components/Button";

import {
	DialogTriggerToRemoveMedia,
	StyledDialogContent,
	StyledDescription,
	TextAreaInput,
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
		if (
			imageButtonRef.current === null || imageInputRef.current === null ||
			files === null ||
			files.length === 0
		)
			return;

		const [file] = files;

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		imageFilePathRef.current = file!.webkitRelativePath;

		dbg("imageFilePath =", imageFilePathRef.current);

		// Change button color to indicate that selection was successfull:
		imageButtonRef.current.classList.add("file-present");
	}

	useEffect(() => {
		function changeMediaMetadataOnEnter(event: KeyboardEvent) {
			if (event.key === "Enter" && isAModifierKeyPressed(event) === false)
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
			<StyledTitle>
				<Translator path="dialogs.mediaOptions.title" />
			</StyledTitle>

			<StyledDescription>
				<Translator path="dialogs.mediaOptions.description" />
			</StyledDescription>

			<CloseDialog
				aria-label={t("tooltips.closeDialog")}
				title={t("tooltips.closeDialog")}
				ref={closeButtonRef}
				id="close-icon"
			>
				<Close />
			</CloseDialog>

			{Object.entries(options(media)).map(([option, value]) => (
				<Fieldset key={option}>
					<Label htmlFor={option}>
						<Translator path={`labels.${option as Options}`} />
					</Label>

					{option === "image" ?
						/////////////////////////////////////////////
						/////////////////////////////////////////////
						// Handle file input for image:
						(<Button
							onPointerUp={openNativeUI_ChooseFiles}
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

							<Translator path="buttons.selectImg" />
						</Button>) :
						/////////////////////////////////////////////
						/////////////////////////////////////////////
						// Handle text input with line feeds:
						option === "lyrics" ?
						<TextAreaInput defaultValue={format(value)} id={option} /> :
						(
							<Input
								readOnly={isChangeable(option) === false}
								defaultValue={format(value)}
								id={option}
							/>
						)}
				</Fieldset>
			))}

			<FlexRow>
				<Dialog modal>
					<DialogTriggerToRemoveMedia className="notransition">
						<Translator path="buttons.deleteMedia" />

						<Remove />
					</DialogTriggerToRemoveMedia>

					<DeleteMediaDialogContent
						handleMediaDeletion={() =>
							handleMediaDeletion(closeButtonRef, path)}
					/>
				</Dialog>

				<CloseDialog
					onPointerUp={() =>
						changeMediaMetadata(
							contentWrapperRef,
							closeButtonRef,
							imageFilePathRef.current,
							path,
							media,
						)}
					id="save-changes"
				>
					<Translator path="buttons.saveChanges" />
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
	if (closeButtonRef.current === null) return;

	closeEverything(closeButtonRef.current);

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
	if (contentWrapperRef.current === null || closeButtonRef.current === null)
		return;

	try {
		const hasAnythingChanged = changeMetadataIfAllowed(
			contentWrapperRef.current,
			imageFilePath,
			mediaPath,
			media,
		);
		closeEverything(closeButtonRef.current);

		if (hasAnythingChanged === true)
			successToast(t("toasts.mediaMetadataSaved"));
	} catch (error) {
		console.error(error);

		errorToast(t("toasts.mediaMetadataNotSaved"));
	}
}

/////////////////////////////////////////////

function changeMetadataIfAllowed(
	contentWrapper: Readonly<HTMLDivElement>,
	imageFilePath: Readonly<Path>,
	mediaPath: Readonly<Path>,
	media: Readonly<Media>,
): Readonly<boolean> {
	const thingsToChange: MetadataToChange = [];

	if (imageFilePath.length > 0)
		thingsToChange.push({ whatToChange: "imageURL", newValue: imageFilePath });

	// This shit is to get all the inputs:
	for (const children of contentWrapper.children)
		for (const element of children.children)
			if (
				(element instanceof HTMLInputElement ||
					element instanceof HTMLTextAreaElement) && element.disabled === false
			) {
				if (isChangeable(element.id) === false) continue;

				const id = element.id as ChangeOptions;
				const newValue = element.value.trim();

				Object.entries(media).forEach(([key, oldValue]) => {
					// If `oldValue` is falsy AND `newValue` is
					// empty, there's nothing to do, so just return:
					if (
						key !== id || oldValue === newValue ||
						(!oldValue && newValue === "")
					)
						return;

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
								`Values of "${id}" are equal, not gonna change anything:`,
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
) => ({ size, duration, title, album, artist, genres, lyrics, image } as const);

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

const closeEverything = (element: HTMLButtonElement): void => element.click();

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

type Options = keyof ReturnType<typeof options>;

/////////////////////////////////////////////

type Props = Readonly<{ media: Media; path: Path; }>;
