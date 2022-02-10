import type { ChangeOptions } from "../Change";
import type { Media } from "@common/@types/typesAndEnums";

import { TrashIcon as Remove } from "@radix-ui/react-icons";
import { useState } from "react";
import Popup from "reactjs-popup";

import { isChangeable, options, Change } from "../Change";
import { usePlaylists } from "@contexts";
import { overlayStyle } from "../";
import { capitalize } from "@utils/utils";

import { Confirm, Option, OptionsModalWrapper } from "./styles";

export function MediaOptionsModal({ media }: { media: Media }) {
	const { deleteMedia } = usePlaylists();

	const [whatToChange, setWhatToChange] = useState<WhatToChange>();
	const [showConfirm, setShowConfirm] = useState(false);

	const changePropsIfAllowed = (option: string, value: unknown) =>
		isChangeable(option) &&
		setWhatToChange({ whatToChange: option, current: value as string });

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
					<span onClick={async () => await deleteMedia(media)} className="yes">
						Yes
					</span>
					<span className="no" onClick={() => setShowConfirm(false)}>
						No
					</span>
				</Confirm>
			</Popup>

			<Popup
				onClose={() => setWhatToChange(undefined)}
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

type WhatToChange = Readonly<{ whatToChange: ChangeOptions; current: string }>;
