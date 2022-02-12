import type { ChangeOptionsToSend, ChangeOptions } from "../Change";
import type { Dispatch, SetStateAction } from "react";
import type { Media } from "@common/@types/typesAndEnums";

import { TrashIcon as Remove } from "@radix-ui/react-icons";
import { useState } from "react";
import Popup from "reactjs-popup";

import { usePlaylists } from "@contexts";
import { overlayStyle } from "../";
import { capitalize } from "@utils/utils";
import {
	allowedOptionToChange,
	isChangeable,
	options,
	Change,
} from "../Change";

import { Confirm, Option, OptionsModalWrapper } from "./styles";

const { getState: getPlaylistsState } = usePlaylists;

export function MediaOptionsModal({
	media,
	setShowPopup,
}: {
	media: Media;
	setShowPopup: Dispatch<SetStateAction<Media | undefined>>;
}) {
	const [whatToChange, setWhatToChange] = useState<WhatToChange>();
	const [showConfirm, setShowConfirm] = useState(false);

	if (!media) return null;

	const changePropsIfAllowed = (option: string, value: unknown) =>
		isChangeable(option) &&
		setWhatToChange({
			whatToChangeToSend: allowedOptionToChange[option],
			current: value as string,
			whatToChange: option,
		});

	function deleteMedia() {
		return async () => {
			try {
				await getPlaylistsState().deleteMedia(media);
			} catch (error) {
				console.error(error);
			} finally {
				setShowPopup(undefined);
			}
		};
	}

	return (
		<OptionsModalWrapper>
			{Object.entries(options(media)).map(([option, value]) => (
				<Option
					onClick={() => changePropsIfAllowed(option, value)}
					className={isChangeable(option) ? "hoverable" : ""}
					key={option}
				>
					{capitalize(option)}:&nbsp;&nbsp;<span>{value}</span>
				</Option>
			))}

			<Option onClick={() => setShowConfirm(true)} className="rm" key="rm">
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

type WhatToChange = Readonly<{
	whatToChangeToSend: ChangeOptionsToSend;
	whatToChange: ChangeOptions;
	current: string;
}>;
