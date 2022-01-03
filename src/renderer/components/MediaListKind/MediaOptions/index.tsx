import type { ChangeOptions } from "../Change";
import type { Media } from "@common/@types/types";

import { FaTrash as Remove } from "react-icons/fa";
import { useState } from "react";
import Popup from "reactjs-popup";

import { isChangeable, options, Change } from "../Change";
import { overlayStyle } from "../index";
import { useMediaList } from "@contexts/mediaList";
import { capitalize } from "@utils/utils";

import { Confirm, Option, OptionsModalWrapper } from "./styles";

export function MediaOptionsModal({ media }: { media: Media }) {
	const {
		functions: { deleteMedia },
	} = useMediaList();

	const [whatToChange, setWhatToChange] = useState<WhatToChange>();
	const [showConfirm, setShowConfirm] = useState(false);

	const changePropsIfAllowed = (option: string, value: string) =>
		isChangeable(option) &&
		setWhatToChange({ whatToChange: option, current: value });

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

			<Option onClick={() => setShowConfirm(true)} className="rm" key="rm">
				Remove
				<Remove size={18} />
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
					<Remove size={20} />
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
