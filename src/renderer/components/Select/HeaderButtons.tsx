import { BsCheck2 as CheckIcon } from "react-icons/bs";
import { ItemText } from "@radix-ui/react-select";

import { Viewport, Item, ItemIndicator } from "./styles";

export const HeaderButtons = () => (
	<Viewport className="notransition">
		<Item value="Name">
			<ItemText>Name</ItemText>

			<ItemIndicator>
				<CheckIcon />
			</ItemIndicator>
		</Item>

		<Item value="Date">
			<ItemText>Date</ItemText>

			<ItemIndicator>
				<CheckIcon />
			</ItemIndicator>
		</Item>
	</Viewport>
);
