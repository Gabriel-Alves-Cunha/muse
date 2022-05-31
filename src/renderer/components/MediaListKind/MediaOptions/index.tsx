import type { Media, Path } from "@common/@types/generalTypes";

import { type RefObject, useEffect, useRef } from "react";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as Close } from "react-icons/md";
import { Dialog } from "@radix-ui/react-dialog";

import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { errorToast, successToast } from "@styles/global";
import { sendMsgToBackend } from "@common/crossCommunication";
import { deleteMedia } from "@contexts/mediaHandler/usePlaylists";
import { capitalize } from "@utils/utils";
import { dbg } from "@common/utils";

import {
	TriggerToRemoveMedia,
	StyledDescription,
	StyledContent,
	StyledOverlay,
	StyledTitle,
	CloseDialog,
	Fieldset,
	FlexRow,
	Input,
	Label,
} from "./styles";

export function MediaOptionsModal({ media, path }: Props) {
	const contentWrapperRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const handleKeyUp = ({ key }: KeyboardEvent) =>
			key === "Enter" &&
			handleChange(contentWrapperRef, closeButtonRef, path, media);

		document.addEventListener("keyup", handleKeyUp);

		return () => document.removeEventListener("keyup", handleKeyUp);
	}, [media, path]);

	return (
		<StyledContent ref={contentWrapperRef}>
			<StyledTitle>Edit/See media information</StyledTitle>

			<StyledDescription>
				Make changes to your media&apos;s metadata here. Click save when
				you&apos;re done.
			</StyledDescription>

			<CloseDialog
				ref={closeButtonRef}
				data-tooltip="Close"
				className="tooltip"
				id="close-icon"
			>
				<Close />
			</CloseDialog>

			{Object.entries(options(media)).map(([option, value]) => (
				<Fieldset key={option}>
					<Label htmlFor={option}>{capitalize(option)}</Label>
					<Input
						readOnly={!isChangeable(option)}
						defaultValue={value}
						id={option}
					/>
				</Fieldset>
			))}

			<FlexRow>
				<Dialog modal>
					<TriggerToRemoveMedia>
						Delete media
						<Remove />
					</TriggerToRemoveMedia>

					<StyledOverlay />

					<StyledContent id="second">
						<StyledTitle>
							Are you sure you want to delete this media from your computer?
						</StyledTitle>

						<FlexRow>
							<CloseDialog
								onClick={() => handleMediaDeletion(closeButtonRef, path)}
								id="delete-media"
							>
								Confirm
							</CloseDialog>

							<CloseDialog id="cancel">Cancel</CloseDialog>
						</FlexRow>
					</StyledContent>
				</Dialog>

				<CloseDialog
					onClick={() =>
						handleChange(contentWrapperRef, closeButtonRef, path, media)
					}
					id="save-changes"
				>
					Save changes
				</CloseDialog>
			</FlexRow>
		</StyledContent>
	);
}

const handleMediaDeletion = async (
	closeButtonRef: RefObject<HTMLButtonElement>,
	mediaPath: Path,
) => {
	if (closeButtonRef.current)
		try {
			dbg("Deleting media...", mediaPath);
			await deleteMedia(mediaPath);

			closeEverything(closeButtonRef);

			successToast("Media has been successfully deleted.");
		} catch (error) {
			console.error(error);

			errorToast(
				"Unable to delete media. See console by pressing 'Ctrl' + 'Shift' + 'i'.",
			);
		}
};

const handleChange = (
	contentWrapperRef: RefObject<HTMLDivElement>,
	closeButtonRef: RefObject<HTMLButtonElement>,
	mediaPath: Path,
	media: Media,
) => {
	dbg("handleChange, MediaOptions.tsx");

	if (contentWrapperRef.current && closeButtonRef.current)
		try {
			changePropsIfAllowed(contentWrapperRef, mediaPath, media);
			closeEverything(closeButtonRef);

			successToast("New media metadata has been saved.");
		} catch (error) {
			console.error(error);

			errorToast(
				"Unable to save new metadata. See console by pressing 'Ctrl' + 'Shift' + 'i'.",
			);
		}
};

function changePropsIfAllowed(
	contentWrapper: RefObject<HTMLDivElement>,
	mediaPath: Path,
	media: Media,
) {
	if (contentWrapper.current)
		for (const children of contentWrapper.current.children)
			for (const element of children.children)
				if (element instanceof HTMLInputElement && !element.disabled) {
					const id = element.id as ChangeOptions;
					const newValue = element.value.trim();

					Object.entries(media).forEach(([key, oldValue]) => {
						if (key === id && oldValue !== newValue) {
							// If `oldValue` is undefined AND `newValue` is
							// empty, there's nothing to do, so just return:
							if (oldValue === undefined && newValue === "") return;

							// We need to handle the case where the key is an array, as in "genres":
							if (Array.isArray(oldValue)) {
								const newValueAsArray = newValue.split(",").map(v => v.trim());

								// If valueAsArray is `[""]`, then we need to remove the empty string:
								if (newValueAsArray.length === 1 && newValueAsArray[0] === "")
									newValueAsArray.pop();

								// If both arrays are equal by values, we don't need to change anything:
								if (
									newValueAsArray.length === oldValue.length &&
									newValueAsArray.every(v => oldValue.includes(v))
								)
									return;

								dbg({
									newValueAsArray,
									oldValue,
									newValue,
									key,
									id,
								});

								// If they are different, the writeTag() function will
								// handle splitting the string, so just continue the
								// rest of the function.
							}

							dbg({ id, newValue, key, oldValue });

							const whatToSend: ChangeOptionsToSend = allowedOptionToChange[id];

							// Send message to Electron to execute the function writeTag() in the main process:
							sendMsgToBackend({
								type: ReactToElectronMessageEnum.WRITE_TAG,
								params: {
									whatToChange: whatToSend,
									mediaPath,
									newValue,
								},
							});
						}
					});
				}
}

const options = ({ duration, artist, album, genres, title, size }: Media) => ({
	duration,
	artist,
	genres,
	title,
	album,
	size,
});

const allowedOptionToChange = Object.freeze({
	artist: "albumArtists",
	imageURL: "imageURL",
	genres: "genres",
	album: "album",
	title: "title",
} as const);

const isChangeable = (option: string): option is ChangeOptions =>
	Object.keys(allowedOptionToChange).includes(option);

const closeEverything = (element: RefObject<HTMLButtonElement>) =>
	element.current?.click();

export type WhatToChange = Readonly<{
	whatToSend: ChangeOptionsToSend;
	whatToChange: ChangeOptions;
	current: string;
}>;

export type ChangeOptionsToSend = typeof allowedOptionToChange[ChangeOptions];
type ChangeOptions = keyof typeof allowedOptionToChange;

type Props = Readonly<{
	media: Media;
	path: Path;
}>;
