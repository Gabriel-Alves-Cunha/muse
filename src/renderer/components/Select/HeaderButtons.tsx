import { BsCheck2 as CheckIcon } from "react-icons/bs";
import {
	ItemIndicator,
	ItemText,
	Viewport,
	Item,
} from "@radix-ui/react-select";

import { Translator } from "@components/I18n";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

// The values have to follow `type SelectedList`!!
export const HeaderButtons = () => (
	<Viewport className="no-transition p-1">
		<Item
			className="unset-all relative flex items-center h-6 cursor-pointer rounded-sm text-ctx-menu-item font-secondary tracking-wide text-base leading-none select-none data-[disabled]:text-disabled pointer-events-none focus:text-ctx-menu-item-focus bg-ctx-menu-item-focus"
			value="Name"
		>
			<ItemText>
				<Translator path="sortTypes.name" />
			</ItemText>

			<ItemIndicator className="absolute inline-flex justify-center items-center w-6 left-0">
				<CheckIcon />
			</ItemIndicator>
		</Item>

		<Item value="Date">
			<ItemText>
				<Translator path="sortTypes.date" />
			</ItemText>

			<ItemIndicator>
				<CheckIcon />
			</ItemIndicator>
		</Item>
	</Viewport>
);
