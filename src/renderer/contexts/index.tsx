import type { ReactNode } from "react";

import { MediaHandler_Provider } from "./mediaHandler";
import { Comm_Provider } from "./communicationBetweenChildren";

export function Contexts({ children }: { children: ReactNode }) {
	return (
		<MediaHandler_Provider>
			<Comm_Provider>
				<>{children}</>
			</Comm_Provider>
		</MediaHandler_Provider>
	);
}
