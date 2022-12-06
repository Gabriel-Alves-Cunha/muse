import type { ValuesOf } from "@common/@types/utils";

import { type Component, type JSX, Match, Switch } from "solid-js";

import { SelectOrderOptions } from "./SelectOrderOptions";

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
	<>
		<button
			class={`relative flex justify-center items-center cursor-pointer bg-none border-none ${props.triggerClass}`}
			title={props.tooltip}
			type="button"
		>
			<p class="pl-6 text-ctx-menu-item font-secondary leading-6 text-xs">
				{props.triggerTitle}
			</p>

			{props.children}
		</button>

		<select
			class="select-content no-transition p-1"
			onInput={props.setValue}
			value={props.value}
		>
			<Switch>
				<Match
					when={props.content === contentOfSelectEnum.GROUPED_BUTTON_SORT_BY}
				>
					<SelectOrderOptions />
				</Match>
			</Switch>
		</select>
	</>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props<T = unknown> = {
	content: ValuesOf<typeof contentOfSelectEnum>;
	setValue(value: T): void;
	children: JSX.Element;
	triggerClass?: string;
	triggerTitle?: string;
	tooltip: string;
	value: string;
};
