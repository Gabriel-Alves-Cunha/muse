import type { Media } from "@common/@types/typesAndEnums";

import { MdOutlineDelete as Remove } from "react-icons/md";
import { useEffect, useState } from "react";
import { MdClose as Close } from "react-icons/md";
import { Dialog } from "@radix-ui/react-dialog";

import { usePlaylists } from "@contexts";
import { capitalize } from "@utils/utils";
import { dbg } from "@common/utils";
import {
	type ChangeOptionsToSend,
	type ChangeOptions,
	allowedOptionToChange,
	isChangeable,
} from "./Change";

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

const { getState: getPlaylistsState } = usePlaylists;

export function MediaOptionsModal({ media }: { media: Media }) {
	const [whatToChange, setWhatToChange] = useState<WhatToChange>();

	const changePropsIfAllowed = () => {
		// isChangeable(option) &&
		// 	setWhatToChange({
		// 		whatToSend: allowedOptionToChange[option],
		// 		whatToChange: option,
		// 		current: value,
		// 	});
	};

	const deleteMedia = () => async () => {
		dbg("Deleting media", media);
		await getPlaylistsState().deleteMedia(media);

		// TODO: handle close all.
	};

	useEffect(() => {
		const handleKeyUp = ({ key }: KeyboardEvent) =>
			key === "Enter" && changePropsIfAllowed();

		window.addEventListener("keyup", handleKeyUp);

		return () => window.removeEventListener("keyup", handleKeyUp);
	}, []);

	return (
		<StyledContent>
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

	// 			<Change
	// 				setWhatToChange={setWhatToChange}
	// 				whatToChange={whatToChange!}
	// 				mediaPath={media.path}
	// 			/>
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
