import type { ReactNode } from "react";

import { MediaHandler_Provider } from "./mediaHandler";

export function Contexts({ children }: { children: ReactNode }) {
	return (
		<MediaHandler_Provider>
			<>{children}</>
		</MediaHandler_Provider>
	);
}
