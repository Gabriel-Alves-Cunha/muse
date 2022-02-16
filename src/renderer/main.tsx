// import "./wdyr"; // <-- Has to be the first import.

import { StrictMode } from "react";
import { render } from "react-dom";
import PrettyError from "pretty-error";

import { _runtimeGlobalsChecker_ } from "@common/seeLeakedVariables";
import { App } from "./App";

// instantiate PrettyError, which can then be used to render error objects
// eslint-disable-next-line no-var
var prettyError = new PrettyError();
prettyError.start();
// PrettyError.start() modifies the stack traces of all errors thrown anywhere in your code, so it could potentially break packages that rely on node's original stack traces. I've only encountered this problem once, and it was with BlueBird when Promise.longStackTraces() was on.

// In order to avoid this problem, it's better to not use PrettyError.start() and instead, manually catch errors and render them with PrettyError:

globalThis.runtimeGlobalsChecker = _runtimeGlobalsChecker_();

render(
	<StrictMode>
		<App />
	</StrictMode>,
	document.getElementById("root"),
);
