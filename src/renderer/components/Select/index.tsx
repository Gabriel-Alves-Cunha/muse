import { Root, Value } from "@radix-ui/react-select";

import { assertUnreachable } from "@utils/utils";
import { HeaderButtons } from "./HeaderButtons";

import { Content, Trigger } from "./styles";

export enum ContentEnum {
	HEADER_BUTTONS,
}

const { HEADER_BUTTONS } = ContentEnum;

export function Select<Options extends string>({
	"data-tooltip": dataTooltip,
	content = HEADER_BUTTONS,
	triggerClassName = "",
	triggerTitle = "",
	children,
	setValue,
	value,
}: Props<Options>) {
	return (
		<Root value={value} onValueChange={setValue}>
			<Trigger className={triggerClassName} data-tooltip={dataTooltip}>
				<Value>{triggerTitle}</Value>
				{children}
			</Trigger>

			<Content>{contentToShow(content)}</Content>
		</Root>
	);
}

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

type Props<Options extends string> = {
	setValue: (value: Options) => void;
	triggerClassName?: string;
	children: React.ReactNode;
	"data-tooltip": string;
	content?: ContentEnum;
	triggerTitle?: string;
	value: Options;
};
