import { Reload } from "./Reload";
import { SortBy } from "./SortBy";
import { Clean } from "./Clean";

export function GroupedButton(buttons: Buttons) {
	return (
		<div className="first:rounded-l-xl last:rounded-r-xl only:rounded-full">
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

type Buttons = Readonly<
	{ reload?: boolean; sortBy?: boolean; clean?: boolean; }
>;
