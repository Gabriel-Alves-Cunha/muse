import { Reload } from "./Reload";
import { SortBy } from "./SortBy";
import { Clean } from "./Clean";

export const GroupedButton = (buttons: Buttons) => (
	<div className="flex">
		{buttons.reload && <Reload />}

		{buttons.sortBy && <SortBy />}

		{buttons.clean && <Clean />}
	</div>
);

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Buttons = {
	reload?: boolean;
	sortBy?: boolean;
	clean?: boolean;
};
