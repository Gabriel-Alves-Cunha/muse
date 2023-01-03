import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { isAModifierKeyPressed } from "@utils/keyboard";

export const BaseInput = ({
	LeftIcon = <SearchIcon />,
	RightSlot,
	onEscape,
	label,
	...props
}: Props) => (
	<div className="base-input">
		{LeftIcon}

		<label>{label}</label>

		<input
			onKeyUp={(e) => {
				if (e.key === "Escape" && !isAModifierKeyPressed(e)) {
					// Close SearchMediaPopover on "Escape":
					onEscape?.();
				} else if (e.ctrlKey && e.key === "a") {
					// Select all text on "Ctrl + a":
					(e.target as HTMLInputElement).select();
				}
			}}
			type="text"
			{...props}
		/>

		{RightSlot}
	</div>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

interface Props
	extends React.DetailedHTMLProps<
		React.InputHTMLAttributes<HTMLInputElement>,
		HTMLInputElement
	> {
	RightSlot?: JSX.Element;
	LeftIcon?: JSX.Element;
	onEscape?(): void;
	label: string;
}
