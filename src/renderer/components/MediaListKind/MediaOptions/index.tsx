import type { MsgObject } from "@common/@types/electron-window";
import type { Media } from "@common/@types/typesAndEnums";

import { useCallback, useEffect, useRef } from "react";
import { MdOutlineDelete as Remove } from "react-icons/md";
import { MdClose as Close } from "react-icons/md";
import { Dialog } from "@radix-ui/react-dialog";

import { NotificationEnum } from "@common/@types/typesAndEnums";
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

const allowedOptionToChange = Object.freeze({
	artist: "albumArtists",
	imageURL: "imageURL",
	genres: "genres",
	album: "album",
	title: "title",
} as const);

const isChangeable = (option: string): option is ChangeOptions =>
	Object.keys(allowedOptionToChange).some(opt => opt === option);

export function MediaOptionsModal({ media }: { media: Media }) {
	const contentWrapperRef = useRef<HTMLDivElement>(null);

	const changePropsIfAllowed = useCallback(() => {
		if (contentWrapperRef.current)
			for (const children of contentWrapperRef.current.children) {
				for (const element of children.children)
					if (element instanceof HTMLInputElement && !element.disabled) {
						const id = element.id as ChangeOptions;
						const value = element.value.trim();

						Object.entries(media).forEach(([key, value_]) => {
							if (key === id && value_ !== value) {
								// If `value_` is undefined AND `value` is empty, there's nothing to do, so just return:
								if (value_ === undefined && value === "") return;

								// We need to handle the case where the key is an array, as in "genres":
								if (Array.isArray(value_)) {
									const valueAsArray = value.split(",").map(v => v.trim());

									// If valueAsArray is `[""]`, then we need to remove the empty string:
									if (valueAsArray.length === 1 && valueAsArray[0] === "")
										valueAsArray.pop();

									// If both arrays are equal, we don't need to change anything:
									if (
										valueAsArray.length === value_.length &&
										valueAsArray.every(v => value_.includes(v))
									)
										return;
									else console.log({ value, value_, valueAsArray });

									// If they are different, the writeTag() function will handle splitting the string, so just continue the rest of the function.
								}
								console.log({ id, value, key, value_ });

								const whatToSend: ChangeOptionsToSend =
									allowedOptionToChange[id];

								const msg: MsgObject = {
									type: NotificationEnum.WRITE_TAG,
									details: {
										mediaPath: media.path,
										whatToSend,
										value,
									},
								};

								window.twoWayComm_React_Electron
									? window.twoWayComm_React_Electron.postMessage(msg)
									: console.error(
											"There is no 'window.twoWayComm_React_Electron'!",
									  );
							}
						});

						handleCloseAll();
					}
			}
	}, [media]);

	const handleCloseAll = () => {
		console.log("handleCloseAll");
	};

	const deleteMedia = () => async () => {
		dbg("Deleting media", media);
		await getPlaylistsFunctions().deleteMedia(media);

		// TODO: handle close all.
	};

	useEffect(() => {
		const handleKeyUp = ({ key }: KeyboardEvent) =>
			key === "Enter" && changePropsIfAllowed();

		window.addEventListener("keyup", handleKeyUp);

		return () => window.removeEventListener("keyup", handleKeyUp);
	}, [changePropsIfAllowed]);

	return (
		<StyledContent ref={contentWrapperRef}>
			<StyledTitle>Edit/See media information</StyledTitle>

			<StyledDescription>
				Make changes to your media&apos;s metadata here. Click save when
				you&apos;re done.
			</StyledDescription>

			<CloseIcon>
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

						<ButtonToClose onClick={deleteMedia} id="delete-media">
							Confirm
						</ButtonToClose>

						<ButtonToClose id="cancel">Cancel</ButtonToClose>
					</StyledContent>
				</Dialog>

				<ButtonToClose onClick={changePropsIfAllowed} id="save-changes">
					Save changes
				</ButtonToClose>
			</Flex>
		</StyledContent>
	);
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

export type WhatToChange = Readonly<{
	whatToSend: ChangeOptionsToSend;
	whatToChange: ChangeOptions;
	current: string;
}>;

type Keys = keyof typeof allowedOptionToChange;
type ChangeOptions = keyof typeof allowedOptionToChange;
type ChangeOptionsToSend = typeof allowedOptionToChange[Keys];
