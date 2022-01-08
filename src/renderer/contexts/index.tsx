import type { ReactNode } from "react";

import { MediaHandler_Provider } from "./mediaHandler";
import { Comm_Provider } from "./communicationBetweenChildren";
import { Page_Provider } from "./page";

export function Contexts({ children }: { children: ReactNode }) {
	return (
		<MediaHandler_Provider>
			<Comm_Provider>
				<Page_Provider>
					<>{children}</>
				</Page_Provider>
			</Comm_Provider>
		</MediaHandler_Provider>
	);
}
