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

export const ContentOfSelectEnum = {
	HEADER_BUTTONS: 1,
} as const;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const Select = (
	{
		content = ContentOfSelectEnum.HEADER_BUTTONS,
		triggerClassName = "",
		triggerTitle = "",
		children,
		setValue,
		tooltip,
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
			<Value>{triggerTitle}</Value>

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
	content: ValuesOf<typeof ContentOfSelectEnum>,
) {
	switch (content) {
		// case FULL_EXAMPLE:
		// 	return <FullExampleSelectButton />;

		case ContentOfSelectEnum.HEADER_BUTTONS:
			return <HeaderButtons />;

		default:
			return assertUnreachable(content);
	}
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props = Readonly<
	{
		content?: ValuesOf<typeof ContentOfSelectEnum>;
		triggerClassName: string | undefined;
		setValue: (value: string) => void;
		children: React.ReactNode;
		triggerTitle?: string;
		tooltip: string;
		value: string;
	}
>;

// export const Label = styled(RadixLabel, {
// 	pl: 25,
//
// 	c: "$ctx-menu-text",
// 	ff: "$secondary",
// 	lh: 25,
// 	fs: 12,
// });
