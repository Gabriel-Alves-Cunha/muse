import type { Component, JSX } from "solid-js";

import { SearchIcon } from "@icons/SearchIcon";

export const BaseInput: Component<Props> = (props) => {
	return (
		<div class="relative flex justify-start items-center w-80 h-10 border-2 border-solid border-input cursor-default rounded-xl bg-none transition-all ease-out duration-200 search-media">
			<SearchIcon class="w-5 h-5 text-alternative cursor-default mx-3 duration-100" />

			<label class="absolute flex items-center h-9 left-[2.7rem] bottom-0 right-0 top-0 p-0 text-placeholder whitespace-nowrap font-secondary tracking-wider font-normal text-base cursor-default pointer-events-none">
				{props.label}
			</label>

			<input
				// flex: 1 === occupy all remaining width
				class="flex items-center flex-1 h-9 whitespace-nowrap text-input font-primary cursor-text tracking-wider text-base font-medium outline-none bg-transparent border-none"
				autofocus
				{...props}
			/>

			{props.RightSlot && props.RightSlot}
		</div>
	);
};

interface Props extends JSX.InputHTMLAttributes<HTMLInputElement> {
	RightSlot?: JSX.Element | null | undefined;
	label: string;
}
