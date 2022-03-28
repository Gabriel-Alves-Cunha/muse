import type { Media } from "@common/@types/typesAndEnums";

import { type Dispatch, type SetStateAction, useState } from "react";
import { MdOutlineDelete as Remove } from "react-icons/md";
import Popup from "reactjs-popup";

import { usePlaylists } from "@contexts";
import { overlayStyle } from "../";
import { capitalize } from "@utils/utils";
import {
	type ChangeOptionsToSend,
	type ChangeOptions,
	allowedOptionToChange,
	isChangeable,
	Change,
} from "./Change";

import { Confirm, Option, OptionsModalWrapper } from "./styles";
import { dbg } from "@common/utils";

const { getState: getPlaylistsState } = usePlaylists;

export function MediaOptionsModal({
	media,
	setShowPopup,
}: {
	setShowPopup: Dispatch<SetStateAction<Media | undefined>>;
	media: Media;
}) {
	const [whatToChange, setWhatToChange] = useState<WhatToChange>();
	const [showConfirm, setShowConfirm] = useState(false);

	if (!media) return null;

	const changePropsIfAllowed = (option: string, value: string) =>
		isChangeable(option) &&
		setWhatToChange({
			whatToSend: allowedOptionToChange[option],
			whatToChange: option,
			current: value,
		});

	const deleteMedia = () => async () => {
		try {
			dbg("Deleting media", media);
			await getPlaylistsState().deleteMedia(media);
		} catch (error) {
			console.error(error);
		} finally {
			setShowPopup(undefined);
		}
	};

	return (
		<OptionsModalWrapper>
			{Object.entries(options(media)).map(([option, value]) => (
				<Option
					onClick={() => changePropsIfAllowed(option, value as string)}
					className={isChangeable(option) ? "hoverable" : ""}
					key={option}
				>
					{capitalize(option)}:&nbsp;&nbsp;<span>{value}</span>
				</Option>
			))}

			<Option onClick={() => setShowConfirm(true)} className="rm">
				Remove
				<Remove />
			</Option>

			<Popup
				onClose={() => setShowConfirm(false)}
				{...{ overlayStyle }}
				defaultOpen={false}
				open={showConfirm}
				closeOnEscape
				lockScroll
				nested
			>
				<Confirm>
					<p>Are you sure you want to delete this media from your computer?</p>
					<Remove />
					<span onClick={deleteMedia} className="yes">
						Yes
					</span>
					<span className="no" onClick={() => setShowConfirm(false)}>
						No
					</span>
				</Confirm>
			</Popup>

			<Popup
				onClose={() => {
					setWhatToChange(undefined);
					setShowPopup(undefined);
				}}
				open={Boolean(whatToChange)}
				position="center center"
				{...{ overlayStyle }}
				defaultOpen={false}
				closeOnEscape
				lockScroll
				nested
			>
				<Change
					setWhatToChange={setWhatToChange}
					// eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
					whatToChange={whatToChange!}
					mediaPath={media.path}
				/>
			</Popup>
		</OptionsModalWrapper>
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
	({
		duration,
		artist,
		genres,
		title,
		album,
		path,
		size,
	} as const);

export type WhatToChange = Readonly<{
	whatToSend: ChangeOptionsToSend;
	whatToChange: ChangeOptions;
	current: string;
}>;
