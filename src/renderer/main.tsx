import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { App } from "./App";

globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_();

// import { isDevelopment } from "@common/utils";
// import { LogLevel } from "react-virtuoso";
// // @ts-ignore Setting Virtuoso log level
// if (isDevelopment) globalThis.VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG;

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
	<StrictMode>
		<App />
	</StrictMode>,
);
