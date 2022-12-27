import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useRef, useEffect, useState } from "react";

import { isAModifierKeyPressed } from "@utils/keyboard";
import { useOnClickOutside } from "@hooks/useOnClickOutside";

export function BaseInput({ label, RightSlot, onKeyUp, ...props }: Props) {
	const [isInputOnFocus, setIsInputOnFocus] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const edgeRef = useRef<HTMLDivElement>(null);

	/////////////////////////////////////////

	useOnClickOutside(edgeRef, () => {});

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;

		input.addEventListener("focus", () => setIsInputOnFocus(true));
		input.addEventListener("blur", () => setIsInputOnFocus(false));
		input.addEventListener("keyup", (e) => {
			console.log("on input on keyup");

			if (e.key === "Escape" && !isAModifierKeyPressed(e)) {
				// Close SearchMediaPopover on "Escape":
				input.blur();
				onKeyUp?.(e as unknown as React.KeyboardEvent<HTMLInputElement>);
			} else if (e.ctrlKey && e.key === "a") {
				// Select all text on "Ctrl + a":
				input.select();
			}
		});
	}, []);

	/////////////////////////////////////////

	return (
		<div className="base-input" ref={edgeRef}>
			<SearchIcon />

			<label>{label}</label>

			<input ref={inputRef} type="text" {...props} />

			{!isInputOnFocus && RightSlot}
		</div>
	);
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
	readonly RightSlot?: JSX.Element;
	readonly label: string;
}
