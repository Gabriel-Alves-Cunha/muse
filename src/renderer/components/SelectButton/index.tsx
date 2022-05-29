import { Root } from "@radix-ui/react-select";

import { assertUnreachable } from "@utils/utils";
import { HeaderButtons } from "./HeaderButtons";

import { Content, Box, Trigger } from "./styles";

export enum ContentEnum {
	HEADER_BUTTONS,
}

const { HEADER_BUTTONS } = ContentEnum;

export function Select<Options extends string>({
	content = HEADER_BUTTONS,
	children,
	setValue,
	value,
}: Props<Options>) {
	return (
		<Box>
			<Root value={value} onValueChange={setValue}>
				<Trigger>{children}</Trigger>

				<Content>{contentToShow(content)}</Content>
			</Root>
		</Box>
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
	children: React.ReactNode;
	content?: ContentEnum;
	value: Options;
};
