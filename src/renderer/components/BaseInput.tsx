import { AiOutlineSearch as SearchIcon } from "react-icons/ai";
import { useRef, useEffect, useState } from "react";

import { isAModifierKeyPressed } from "@utils/keyboard";

export function BaseInput({ label, RightSlot, onKeyUp, ...props }: Props) {
	const [isInputOnFocus, setIsInputOnFocus] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	/////////////////////////////////////////

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
		<div className="search-media">
			<SearchIcon className="w-5 h-5 text-alternative cursor-default mx-3 duration-100" />

			<label className="absolute flex items-center h-9 left-[2.7rem] bottom-0 right-0 top-0 p-0 text-placeholder whitespace-nowrap font-secondary tracking-wider font-normal text-base cursor-default pointer-events-none">
				{label}
			</label>

			<input
				// flex: 1 === occupy all remaining width
				className="flex items-center flex-1 h-9 whitespace-nowrap text-input font-primary cursor-text tracking-wider text-base font-medium outline-none bg-transparent border-none select-all"
				ref={inputRef}
				type="text"
				{...props}
			/>

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
