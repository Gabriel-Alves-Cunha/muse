import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { _runtimeGlobalsChecker_ } from "@utils/seeLeakedVariables";
import { checkForUpdate } from "./utils/checkForUpdate";
import { App } from "./App";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

await checkForUpdate();

////////////////////////////////////////////////

if (isDev) {
	setTimeout(
		() => (globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_()),
		10_000,
	);

	// document.designMode = "on";
}

////////////////////////////////////////////////

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
