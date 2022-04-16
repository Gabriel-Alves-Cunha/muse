import type { Media } from "@common/@types/typesAndEnums";

import { type RefObject, useEffect, useRef } from "react";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as Close } from "react-icons/md";
import { Dialog } from "@radix-ui/react-dialog";
import { toast } from "react-toastify";

import { ReactToElectronMessageEnum } from "@common/@types/electron-window";
import { sendMsgToBackend } from "@common/crossCommunication";
import { usePlaylists } from "@contexts";
import { capitalize } from "@utils/utils";
import { dbg } from "@common/utils";

import {
	TriggerToRemoveMedia,
	StyledDescription,
	StyledContent,
	StyledOverlay,
	ButtonToClose,
	StyledTitle,
	CloseIcon,
	Fieldset,
	Input,
	Label,
	Flex,
} from "./styles";

const { getState: getPlaylistsFunctions } = usePlaylists;

export function MediaOptionsModal({ media }: { media: Media }) {
	const contentWrapperRef = useRef<HTMLDivElement>(null);
	const closeButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const handleKeyUp = ({ key }: KeyboardEvent) =>
			key === "Enter" && handleChange(contentWrapperRef, closeButtonRef, media);

		window.addEventListener("keyup", handleKeyUp);

		return () => window.removeEventListener("keyup", handleKeyUp);
	}, [media]);

	return (
		<StyledContent ref={contentWrapperRef}>
			<StyledTitle>Edit/See media information</StyledTitle>

			<StyledDescription>
				Make changes to your media&apos;s metadata here. Click save when
				you&apos;re done.
			</StyledDescription>

			<CloseIcon ref={closeButtonRef}>
				<Close />
			</CloseIcon>

			{Object.entries(options(media)).map(([option, value]) => (
				<Fieldset key={option}>
					<Label htmlFor={option}>{capitalize(option)}</Label>
					<Input
						disabled={!isChangeable(option)}
						defaultValue={value}
						id={option}
					/>
				</Fieldset>
			))}

			<Flex>
				<Dialog modal>
					<TriggerToRemoveMedia>
						Delete media
						<Remove />
					</TriggerToRemoveMedia>

					<StyledOverlay />

					<StyledContent>
						<StyledTitle>
							Are you sure you want to delete this media from your computer?
						</StyledTitle>

						<ButtonToClose
							onClick={() => deleteMedia(closeButtonRef, media)}
							id="delete-media"
						>
							Confirm
						</ButtonToClose>

						<ButtonToClose id="cancel">Cancel</ButtonToClose>
					</StyledContent>
				</Dialog>

				<ButtonToClose
					onClick={() => handleChange(contentWrapperRef, closeButtonRef, media)}
					id="save-changes"
				>
					Save changes
				</ButtonToClose>
			</Flex>
		</StyledContent>
	);
}

async function deleteMedia(
	closeButtonRef: RefObject<HTMLButtonElement>,
	media: Media,
) {
	if (closeButtonRef.current)
		try {
			dbg("Deleting media...", media);
			await getPlaylistsFunctions().deleteMedia(media);

			handleCloseAll(closeButtonRef);

			toast.success("Media has been successfully deleted.", {
				hideProgressBar: false,
				position: "top-right",
				progress: undefined,
				closeOnClick: true,
				pauseOnHover: true,
				autoClose: 5000,
				draggable: true,
			});
		} catch (error) {
			console.error(error);

			toast.error(
				"Unable to delete media. See console by pressing 'Ctrl' + 'Shift' + 'i'.",
				{
					hideProgressBar: false,
					position: "top-right",
					progress: undefined,
					closeOnClick: true,
					pauseOnHover: true,
					autoClose: 5000,
					draggable: true,
				},
			);
		}
}

function handleChange(
	contentWrapperRef: RefObject<HTMLDivElement>,
	closeButtonRef: RefObject<HTMLButtonElement>,
	media: Media,
) {
	if (contentWrapperRef.current && closeButtonRef.current)
		try {
			changePropsIfAllowed(contentWrapperRef, media);
			handleCloseAll(closeButtonRef);

			toast.success("New media metadata has been saved.", {
				hideProgressBar: false,
				position: "top-right",
				progress: undefined,
				closeOnClick: true,
				pauseOnHover: true,
				autoClose: 5000,
				draggable: true,
			});
		} catch (error) {
			console.error(error);

			toast.error(
				"Unable to save new metadata. See console by pressing 'Ctrl' + 'Shift' + 'i'.",
				{
					hideProgressBar: false,
					position: "top-right",
					progress: undefined,
					closeOnClick: true,
					pauseOnHover: true,
					autoClose: 5000,
					draggable: true,
				},
			);
		}
}

function changePropsIfAllowed(
	contentWrapper: RefObject<HTMLDivElement>,
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
									mediaPath: media.path,
									newValue,
								},
							});
						}
					});
				}
}

const options = ({
	duration,
	artist,
	album,
	genres,
	title,
	size,
	path,
}: Media) =>
	Object.freeze({
		duration,
		artist,
		genres,
		title,
		album,
		path,
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
	Object.keys(allowedOptionToChange).some(opt => opt === option);

const handleCloseAll = (element: RefObject<HTMLButtonElement>) =>
	element.current?.click();

export type WhatToChange = Readonly<{
	whatToSend: ChangeOptionsToSend;
	whatToChange: ChangeOptions;
	current: string;
}>;

type ChangeOptions = keyof typeof allowedOptionToChange;
export type ChangeOptionsToSend = typeof allowedOptionToChange[ChangeOptions];
