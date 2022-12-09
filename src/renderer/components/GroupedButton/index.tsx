import { Reload } from "./Reload";
import { SortBy } from "./SortBy";
import { Clean } from "./Clean";

export function GroupedButton(buttons: Buttons) {
	return (
		<div className="flex">
			{buttons.reload && <Reload />}

			{buttons.sortBy && <SortBy />}

			{buttons.clean && <Clean />}
		</div>
	);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Buttons = {
	reload?: boolean;
	sortBy?: boolean;
	clean?: boolean;
};
