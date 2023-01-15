import { AiOutlineSearch as SearchIcon } from "react-icons/ai";

import { isAModifierKeyPressed } from "@utils/keyboard";

export const BaseInput = ({
	LeftIcon = <SearchIcon />,
	RightSlot,
	onEscape,
	label,
	...props
}: Props) => (
	<div data-base-input>
		{LeftIcon}

		<label>{label}</label>

		<input onKeyUp={(e) => handleKeyUp(e, onEscape)} type="text" {...props} />

		{RightSlot}
	</div>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper function:

function handleKeyUp(
	event: React.KeyboardEvent<HTMLInputElement>,
	onEscape?: () => void,
): void {
	if (event.key === "Escape" && !isAModifierKeyPressed(event)) {
		// Close SearchMediaPopover on "Escape":
		onEscape?.();
	} else if (event.ctrlKey && event.key === "a") {
		// Select all text on "Ctrl + a":
		(event.target as HTMLInputElement)?.select();
	}
}

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
