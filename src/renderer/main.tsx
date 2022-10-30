import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { App } from "./App";
import "./i18n"; // Import translations on app root.

// @ts-ignore => isDev is a globally defined boolean.
if (isDev) {
	globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_();

	// @ts-ignore => Setting Virtuoso log level
	// globalThis.VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG;

	// document.designMode = "on";
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
