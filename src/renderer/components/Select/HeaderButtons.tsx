import { BsCheck2 as CheckIcon } from "react-icons/bs";
import { ItemText } from "@radix-ui/react-select";

import { t } from "@components/I18n";

import { Viewport, Item, ItemIndicator } from "./styles";

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Constants:

const name = t("sortTypes.name");
const date = t("sortTypes.date");

/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
// Main function:

// The values have to follow `type SelectedList`!!
export const HeaderButtons = () => (
	<Viewport className="notransition">
		<Item value="Name">
			<ItemText>{name}</ItemText>

			<ItemIndicator>
				<CheckIcon />
			</ItemIndicator>
		</Item>

		<Item value="Date">
			<ItemText>{date}</ItemText>

			<ItemIndicator>
				<CheckIcon />
			</ItemIndicator>
		</Item>
	</Viewport>
);
