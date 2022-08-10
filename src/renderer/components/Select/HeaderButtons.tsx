import { BsCheck2 as CheckIcon } from "react-icons/bs";
import { ItemText } from "@radix-ui/react-select";

import { Translator } from "@components/I18n";

import { Viewport, Item, ItemIndicator } from "./styles";

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

// The values have to follow `type SelectedList`!!
export const HeaderButtons = () => (
	<Viewport className="notransition">
		<Item value="Name">
			<ItemText>
				<Translator path="sortTypes.name" />
			</ItemText>

			<ItemIndicator>
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
