import type { ReactNode } from "react";

import { MediaList_Provider } from "./mediaList";
import { Comm_Provider } from "./communicationBetweenChildren";

export function Contexts({ children }: { children: ReactNode }) {
	return (
		<MediaList_Provider>
			<Comm_Provider>
				<>{children}</>
			</Comm_Provider>
		</MediaList_Provider>
	);
}
