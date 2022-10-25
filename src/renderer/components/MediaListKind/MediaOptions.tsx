import type { MetadataToChange } from "@common/@types/electron-window";
import type { Media, Path } from "@common/@types/generalTypes";

import { type RefObject, type ChangeEvent, useEffect, useRef } from "react";
import { MdOutlineImageSearch as SearchImage } from "react-icons/md";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as CloseIcon } from "react-icons/md";
import {
	Description,
	Content,
	Trigger,
	Dialog,
	Title,
	Close,
} from "@radix-ui/react-dialog";

import { separatedByCommaOrSemiColorOrSpace } from "@common/utils";
import { DeleteMediaDialogContent } from "@components/DeleteMediaDialog";
import { errorToast, successToast } from "@components/toasts";
import { ReactToElectronMessage } from "@common/enums";
import { areArraysEqualByValue } from "@utils/array";
import { isAModifierKeyPressed } from "@utils/keyboard";
import { sendMsgToBackend } from "@common/crossCommunication";
import { t, Translator } from "@components/I18n";
import { prettyBytes } from "@common/prettyBytes";
import { emptyString } from "@common/empty";
import { deleteMedia } from "@utils/media";
import { FlexRow } from "@components/FlexRow";
import { Button } from "@components/Button/Button";
import { dbg } from "@common/debug";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Main function:

export function MediaOptionsModal({ media, path }: Props) {
	const contentWrapperRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);
	const imageButtonRef = useRef<HTMLButtonElement>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);
	const imageFilePathRef = useRef(emptyString);

	const openNativeUI_ChooseFiles = () => imageInputRef.current?.click();

	function handleSelectedFile(
		{ target: { files } }: ChangeEvent<HTMLInputElement>,
	) {
		if (
			imageButtonRef.current === null ||
			imageInputRef.current === null ||
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
		<Content
			className="unset-all fixed grid center max-w-md min-w-[300px] p-8 bg-dialog z-20 rounded"
			ref={contentWrapperRef}
		>
			<Title className="unset-all font-primary tracking-wide text-2xl text-normal font-medium">
				<Translator path="dialogs.mediaOptions.title" />
			</Title>

			<Description className="mt-3 mx-0 mb-5 font-secondary text-gray tracking-wide text-base">
				<Translator path="dialogs.mediaOptions.description" />
			</Description>

			<Close
				// outline: "initial"; h-9; rounded
				className="unset-all flex justify-center items-center h-6 cursor-pointer py-0 px-4 border-none whitespace-nowrap font-secondary tracking-wider font-semibold absolute right-2 top-2 rounded-full hover:bg-icon-button-hovered focus:bg-icon-button-hovered"
				title={t("tooltips.closeDialog")}
				ref={closeButtonRef}
			>
				<CloseIcon className="fill-accent-light" />
			</Close>

			{Object.entries(options(media)).map(([option, value]) => (
				<fieldset
					className="unset-all flex items-center h-9 gap-5 mb-4"
					key={option}
				>
					<label
						className="flex w-24 text-accent-light font-secondary tracking-wide text-right font-medium text-base"
						htmlFor={option}
					>
						<Translator path={`labels.${option as Options}`} />
					</label>

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
						(
							<textarea
								className="unset-all box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input rounded-xl p-3 whitespace-nowrap text-input font-secondary font-medium leading-none transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
								defaultValue={format(value)}
								id={option}
							/>
						) :
						(
							<input
								className="unset-all box-border inline-flex flex-1 justify-center items-center w-full h-9 border-2 border-solid border-input py-0 px-3 rounded-xl whitespace-nowrap text-input font-secondary tracking-wider text-base font-medium transition-border hover:border-active focus:border-active read-only:text-accent-light read-only:border-none"
								readOnly={isChangeable(option) === false}
								defaultValue={format(value)}
								id={option}
							/>
						)}
				</fieldset>
			))}

			<FlexRow>
				<Dialog modal>
					{/* line-height: 35px; // same as height */}
					<Trigger className="flex justify-between items-center max-h-9 gap-4 cursor-pointer bg-[#bb2b2e] py-0 px-4 border-none rounded tracking-wider text-white font-semibold leading-9 hover:bg-[#821e20] focus:bg-[#821e20] no-transition">
						<Translator path="buttons.deleteMedia" />

						<Remove />
					</Trigger>

					<DeleteMediaDialogContent
						handleMediaDeletion={() =>
							handleMediaDeletion(closeButtonRef, path)}
					/>
				</Dialog>

				<Close
					className="unset-all flex justify-center items-center h-6 cursor-pointer py-0 px-4 border-none whitespace-nowrap font-secondary tracking-wider font-semibold bg-[#ddf4e5] text-[#2c6e4f] hover:bg-[#c6dbce] focus:bg-[#c6dbce]"
					onPointerUp={() =>
						changeMediaMetadata(
							contentWrapperRef,
							closeButtonRef,
							imageFilePathRef.current,
							path,
							media,
						)}
				>
					<Translator path="buttons.saveChanges" />
				</Close>
			</FlexRow>
		</Content>
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
						key !== id ||
						oldValue === newValue ||
						(!oldValue && newValue === emptyString)
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
			type: ReactToElectronMessage.WRITE_TAG,
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
