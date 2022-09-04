import { Root, Value } from "@radix-ui/react-select";

import { assertUnreachable } from "@utils/utils";
import { HeaderButtons } from "./HeaderButtons";

import { Content, Trigger } from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Enums:

export enum ContentOfSelectEnum {
	HEADER_BUTTONS,
}

const { HEADER_BUTTONS } = ContentOfSelectEnum;

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

export const Select = <Options extends string>(
	{
		content = HEADER_BUTTONS,
		triggerClassName = "",
		triggerTitle = "",
		children,
		setValue,
		tooltip,
		value,
	}: Props<Options>,
) => (
	<Root value={value} onValueChange={setValue}>
		<Trigger className={triggerClassName} aria-label={tooltip} title={tooltip}>
			<Value>{triggerTitle}</Value>

			{children}
		</Trigger>

		<Content>{contentToShow(content)}</Content>
	</Root>
);

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Helper function:

function contentToShow<Options extends string>(
	content: NonNullable<Props<Options>["content"]>,
) {
	switch (content) {
		// case FULL_EXAMPLE:
		// 	return <FullExampleSelectButton />;

		case HEADER_BUTTONS:
			return <HeaderButtons />;

		default:
			return assertUnreachable(content);
	}
}

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Types:

type Props<Options extends string> = Readonly<
	{
		triggerClassName: string | undefined;
		setValue: (value: Options) => void;
		content?: ContentOfSelectEnum;
		children: React.ReactNode;
		triggerTitle?: string;
		tooltip: string;
		value: Options;
	}
>;
