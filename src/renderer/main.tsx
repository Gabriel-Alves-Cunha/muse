import { StrictMode } from "react";
import { render } from "react-dom";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { App } from "./App";

globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_();

render(
	<StrictMode>
		<App />
	</StrictMode>,
	document.getElementById("root"),
);
