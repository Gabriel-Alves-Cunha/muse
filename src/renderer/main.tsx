import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { App } from "./App";
import "./i18n"; // Import translations on app root.

if (isDev) {
	globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_();

	// document.designMode = "on";
}

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

const container = document.getElementById("root") as HTMLDivElement;
const root = createRoot(container);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////
// Global types:

declare global {
	// eslint-disable-next-line no-var
	var isDev: boolean;
}
