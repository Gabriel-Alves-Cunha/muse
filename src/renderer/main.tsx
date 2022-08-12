import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { dbg, isDev } from "@common/utils";
// import { LogLevel } from "react-virtuoso";
import { App } from "./App";
import "./i18n"; // Import translations on app root.

import { font_1, font_2, font_3, font_4 } from "./assets";

////////////////////////////////////////////////
////////////////////////////////////////////////
////////////////////////////////////////////////

// Doing this shit to make sure that the fonts are loaded before the app starts,
// cause Vite doesn't want to bundle the fonts if I don't call them in the app:
dbg({ font_1, font_2, font_3, font_4 });

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
