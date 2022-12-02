import type { Component } from "solid-js";

import { Reload } from "./Reload";
import { SortBy } from "./SortBy";
import { Clean } from "./Clean";

export const GroupedButton: Component<Buttons> = (props) => {
	return (
		<div class="flex">
			{props.reload && <Reload />}

			{props.sortBy && <SortBy />}

			{props.clean && <Clean />}
		</div>
	);
};

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
// Types:

type Buttons = {
	reload?: boolean;
	sortBy?: boolean;
	clean?: boolean;
};
