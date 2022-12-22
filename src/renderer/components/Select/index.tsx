import type { ValuesOf } from "@common/@types/utils";

import {
	Viewport,
	Trigger,
	Content,
	Portal,
	Value,
	Root,
} from "@radix-ui/react-select";

import { SelectOrderOptions } from "./SelectOrderOptions";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const Select = ({
	triggerClassName = "",
	triggerTitle = "",
	children,
	setValue,
	tooltip,
	content,
	value,
}: Props) => (
	<Root value={value} onValueChange={setValue}>
		<Trigger
			className={`relative flex justify-center items-center cursor-pointer bg-none border-none ${triggerClassName}`}
			title={tooltip}
		>
			<Value className="pl-6 text-ctx-menu-item font-secondary leading-6 text-xs">
				{triggerTitle}
			</Value>

			{children}
		</Trigger>

		<Portal>
			<Content className="select-content">
				<Viewport className="no-transition p-1">
					{contentToShow(content)}
				</Viewport>
			</Content>
		</Portal>
	</Root>
);

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
// Helper function:

function contentToShow(content: ValuesOf<typeof contentOfSelectEnum>) {
	if (content === contentOfSelectEnum.GROUPED_BUTTON_SORT_BY)
		return <SelectOrderOptions />;

	return undefined;
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props<T = unknown> = {
	content: ValuesOf<typeof contentOfSelectEnum>;
	triggerClassName?: string;
	children: React.ReactNode;
	setValue(value: T): void;
	triggerTitle?: string;
	tooltip: string;
	value: string;
};
