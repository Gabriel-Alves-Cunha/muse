import type { ValuesOf } from "@common/@types/utils";

import {
	Trigger,
	Content,
	Value,
	Root,
} from "@radix-ui/react-select";

import { assertUnreachable } from "@utils/utils";
import { HeaderButtons } from "./HeaderButtons";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Enums:

export const contentOfSelectEnum = {
	GROUPED_BUTTON_SORT_BY: 1,
} as const;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const Select = (
	{
		triggerClassName = "",
		triggerTitle = "",
		children,
		setValue,
		tooltip,
		content,
		value,
	}: Props,
) => (
	<Root value={value} onValueChange={setValue}>
		<Trigger
			className={triggerClassName +
				" relative justify-center items-center cursor-pointer bg-none border-none no-transition"}
			aria-label={tooltip}
			title={tooltip}
		>
			<Value className="pl-6 text-ctx-menu-item font-secondary leading-6 text-xs">
				{triggerTitle}
			</Value>

			{children}
		</Trigger>

		<Content className="bg-select overflow-hidden rounded-md z-50 shadow-md">
			{contentToShow(content)}
		</Content>
	</Root>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper function:

function contentToShow(
	content: ValuesOf<typeof contentOfSelectEnum>,
) {
	switch (content) {
		// case FULL_EXAMPLE:
		// 	return <FullExampleSelectButton />;

		case contentOfSelectEnum.GROUPED_BUTTON_SORT_BY:
			return <HeaderButtons />;

		default:
			return assertUnreachable(content);
	}
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props<T = unknown> = Readonly<
	{
		content: ValuesOf<typeof contentOfSelectEnum>;
		triggerClassName?: string;
		children: React.ReactNode;
		setValue(value: T): void;
		triggerTitle?: string;
		tooltip: string;
		value: string;
	}
>;
