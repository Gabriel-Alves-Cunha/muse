import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { isDevelopment } from "@common/utils";
import { App } from "./App";

import { font_1, font_2, font_3, font_4 } from "./assets";

// Doing this shit to make sure that the fonts are loaded before the app starts,
// cause Vite does not want to bundle the fonts if I don't call them in the app:
console.log({ font_1, font_2, font_3, font_4 });

if (isDevelopment) {
	globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_();

	// import { LogLevel } from "react-virtuoso";
	// // @ts-ignore Setting Virtuoso log level
	// globalThis.VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG;
}

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
