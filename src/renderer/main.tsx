import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { App } from "./App";

if (isDev) {
	globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_();

	// @ts-ignore => Setting Virtuoso log level
	// globalThis.VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG;

	// document.designMode = "on";
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
