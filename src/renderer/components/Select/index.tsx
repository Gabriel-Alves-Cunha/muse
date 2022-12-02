import type { Component, JSX } from "solid-js";
import type { ValuesOf } from "@common/@types/utils";

import { SelectOrderOptions } from "./SelectOrderOptions";
import { assertUnreachable } from "@utils/utils";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Enums:

export const contentOfSelectEnum = {
	GROUPED_BUTTON_SORT_BY: 2,
} as const;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const Select: Component<Props> = (props) => (
	<select value={props.value} onChange={props.setValue}>
		<button
			class={`relative flex justify-center items-center cursor-pointer bg-none border-none ${props.triggerClass}`}
			title={props.tooltip}
		>
			<p class="pl-6 text-ctx-menu-item font-secondary leading-6 text-xs">
				{props.triggerTitle}
			</p>

			{props.children}
		</button>

		<div class="select-content no-transition p-1">
			{contentToShow(props.content)}
		</div>
	</select>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper function:

function contentToShow(content: ValuesOf<typeof contentOfSelectEnum>) {
	switch (content) {
		// case FULL_EXAMPLE:
		// 	return <FullExampleSelectButton />;

		case contentOfSelectEnum.GROUPED_BUTTON_SORT_BY:
			return <SelectOrderOptions />;

		default:
			return assertUnreachable(content);
	}
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props<T = unknown> = Readonly<{
	content: ValuesOf<typeof contentOfSelectEnum>;
	setValue(value: T): void;
	children: JSX.Element;
	triggerClass?: string;
	triggerTitle?: string;
	tooltip: string;
	value: string;
}>;
