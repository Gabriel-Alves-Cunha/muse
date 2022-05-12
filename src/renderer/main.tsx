import "./wdyr"; // <--- Has to be first import!

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { LogLevel } from "react-virtuoso";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { isDevelopment } from "@common/utils";
import { App } from "./App";

globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_();

// @ts-ignore Setting Virtuoso log level
if (isDevelopment) globalThis.VIRTUOSO_LOG_LEVEL = LogLevel.DEBUG;

const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
	<StrictMode>
		<App />
	</StrictMode>
);
