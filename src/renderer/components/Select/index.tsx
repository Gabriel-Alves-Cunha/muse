import { Root, Value } from "@radix-ui/react-select";

import { assertUnreachable } from "@utils/utils";
import { HeaderButtons } from "./HeaderButtons";

import { Content, Trigger } from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Enums:

export enum ContentEnum {
	HEADER_BUTTONS,
}

const { HEADER_BUTTONS } = ContentEnum;

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
		<Trigger
			className={triggerClassName}
			data-place="bottom"
			data-tip={tooltip}
		>
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
		setValue: (value: Options) => void;
		triggerClassName?: string;
		children: React.ReactNode;
		content?: ContentEnum;
		triggerTitle?: string;
		tooltip: string;
		value: Options;
	}
>;
