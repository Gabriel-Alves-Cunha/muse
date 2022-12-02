import type { Component, JSX } from "solid-js";

import { CheckMarkIcon } from "@icons/CheckMarkIcon";

export const SelectItem: Component<Props> = (props) => {
	return (
		<option class={`select-item ${props.class ?? ""}`} {...props}>
			<div class="absolute inline-flex justify-center items-center w-6 left-0">
				<CheckMarkIcon class="bg-transparent" />
			</div>

			<p>{props.title}</p>
		</option>
	);
};

interface Props extends JSX.OptionHTMLAttributes<HTMLOptionElement> {}
